import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { verifyPin, generateReceiptRef, generateIdempotencyKey } from '@/lib/utils';

export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const payload = await verifyToken(auth.slice(7));
  if (!payload?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { pin, productId, idempotencyKey: clientIdempotency } = await req.json();
    if (!/^\d{6}$/.test(pin)) return NextResponse.json({ error: 'Invalid PIN' }, { status: 400 });

    const idempotencyKey = clientIdempotency || generateIdempotencyKey();
    
    // CHECK IDEMPOTENCY: Return existing transaction if same key already processed
    const [existing] = await sql`
      SELECT id, status, receipt_data FROM transactions 
      WHERE idempotency_key = ${idempotencyKey}
      LIMIT 1
    `;
    if (existing) {
      console.log(`Duplicate product purchase detected: idempotency_key=${idempotencyKey}`);
      const receipt = existing.receipt_data || {};
      return NextResponse.json({
        success: existing.status === 'success',
        message: existing.status === 'success' ? 'Purchase completed successfully' : 'Previous attempt failed',
        receipt,
      });
    }

    const [user] = await sql`SELECT id, pin_hash, wallet_balance, first_name, last_name, phone FROM users WHERE id = ${payload.userId as string} AND is_banned = FALSE`;
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const validPin = await verifyPin(pin, user.pin_hash);
    if (!validPin) return NextResponse.json({ error: 'Incorrect PIN' }, { status: 401 });

    const [product] = await sql`SELECT * FROM products WHERE id = ${productId} AND in_stock = TRUE`;
    if (!product) return NextResponse.json({ error: 'Product not available' }, { status: 404 });

    const price = parseFloat(product.price);
    const balance = parseFloat(user.wallet_balance);
    if (balance < price) return NextResponse.json({ error: `Insufficient balance. Need ₦${price.toLocaleString()}` }, { status: 400 });

    const receiptRef = generateReceiptRef();
    const receiptData = {
      ref: receiptRef, productId: product.id, productName: product.name,
      price, description: product.description, userName: `${user.first_name} ${user.last_name}`,
      userPhone: user.phone, date: new Date().toISOString(), type: 'product',
    };

    // Create pending transaction (handle race: unique idempotency_key)
    let txn: any;
    try {
      const [t] = await sql`
        INSERT INTO transactions (user_id, type, description, amount, status, product_id, product_name, receipt_data, idempotency_key)
        VALUES (${user.id}, 'product', ${`Purchase: ${product.name}`}, ${price}, 'pending', ${product.id}, ${product.name}, ${JSON.stringify(receiptData)}, ${idempotencyKey})
        RETURNING id
      `;
      txn = t;
    } catch (e: any) {
      // If unique violation on idempotency_key, another worker already created the txn
      if (e && (e.code === '23505' || String(e.message).includes('duplicate key') || String(e.message).includes('unique'))) {
        const [existingTxn] = await sql`
          SELECT id, status, receipt_data FROM transactions WHERE idempotency_key = ${idempotencyKey} LIMIT 1
        `;
        if (existingTxn) {
          console.log('Race detected on product purchase, returning existing transaction', idempotencyKey);
          const receipt = existingTxn.receipt_data || {};
          return NextResponse.json({
            success: existingTxn.status === 'success',
            message: existingTxn.status === 'success' ? 'Purchase completed successfully' : 'Previous attempt failed',
            receipt,
          });
        }
      }
      throw e;
    }

    // ATOMIC: Deduct balance only if sufficient, then mark success
    const [balanceUpdate] = await sql`
      UPDATE users SET wallet_balance = wallet_balance - ${price}, updated_at = NOW()
      WHERE id = ${user.id} AND wallet_balance >= ${price}
      RETURNING wallet_balance
    `;
    if (!balanceUpdate) {
      await sql`UPDATE transactions SET status = 'failed' WHERE id = ${txn.id}`;
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
    }

    await sql`
      UPDATE transactions SET status = 'success', receipt_data = ${JSON.stringify(receiptData)}
      WHERE id = ${txn.id}
    `;

    const updated = balanceUpdate;

    return NextResponse.json({
      success: true, receiptRef, transactionId: txn.id,
      newBalance: parseFloat(updated.wallet_balance), receipt: receiptData,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Purchase failed' }, { status: 500 });
  }
}

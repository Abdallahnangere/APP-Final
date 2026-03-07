import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { verifyPin, generateReceiptRef } from '@/lib/utils';

export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const payload = await verifyToken(auth.slice(7));
  if (!payload?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { pin, productId } = await req.json();
    if (!/^\d{6}$/.test(pin)) return NextResponse.json({ error: 'Invalid PIN' }, { status: 400 });

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

    await sql`UPDATE users SET wallet_balance = wallet_balance - ${price}, updated_at = NOW() WHERE id = ${user.id}`;
    const [txn] = await sql`
      INSERT INTO transactions (user_id, type, description, amount, status, product_id, product_name, receipt_data)
      VALUES (${user.id}, 'product', ${`Purchase: ${product.name}`}, ${price}, 'success', ${product.id}, ${product.name}, ${JSON.stringify(receiptData)})
      RETURNING id
    `;

    const [updated] = await sql`SELECT wallet_balance FROM users WHERE id = ${user.id}`;

    return NextResponse.json({
      success: true, receiptRef, transactionId: txn.id,
      newBalance: parseFloat(updated.wallet_balance), receipt: receiptData,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Purchase failed' }, { status: 500 });
  }
}

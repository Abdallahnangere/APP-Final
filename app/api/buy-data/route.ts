import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { verifyPin, generateIdempotencyKey, generateReceiptRef } from '@/lib/utils';

const AMIGO_TIMEOUT = 30000; // 30 seconds

export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const payload = await verifyToken(auth.slice(7));
  if (!payload?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const { pin, planId, phoneNumber, network, networkId, dataSize, validity, price, idempotencyKey: clientIdempotency } = body;

    if (!/^\d{6}$/.test(pin)) return NextResponse.json({ error: 'Invalid PIN format' }, { status: 400 });
    if (!/^\d{11}$/.test(phoneNumber)) return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 });

    const userId = payload.userId as string;
    const idempotencyKey = clientIdempotency || generateIdempotencyKey();

    // CHECK IDEMPOTENCY: Return existing transaction if same key already processed
    const [existing] = await sql`
      SELECT id, status, receipt_data FROM transactions 
      WHERE idempotency_key = ${idempotencyKey}
      LIMIT 1
    `;
    if (existing) {
      console.log(`Duplicate request detected: idempotency_key=${idempotencyKey}`);
      const receipt = existing.receipt_data || {};
      return NextResponse.json({
        success: existing.status === 'success',
        message: existing.status === 'success' ? 'Data delivered successfully' : 'Previous attempt failed',
        receipt,
      });
    }

    // LOCK & FETCH USER: Use SELECT FOR UPDATE to prevent race conditions
    const [user] = await sql`
      SELECT id, pin_hash, wallet_balance, first_name, last_name, phone
      FROM users WHERE id = ${userId} AND is_banned = FALSE
    `;
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // Verify PIN
    const validPin = await verifyPin(pin, user.pin_hash);
    if (!validPin) return NextResponse.json({ error: 'Incorrect PIN' }, { status: 401 });

    // Check balance
    const balance = parseFloat(user.wallet_balance);
    if (balance < price) {
      return NextResponse.json({ error: `Insufficient balance. Balance: ₦${balance.toLocaleString()}, Required: ₦${price.toLocaleString()}` }, { status: 400 });
    }

    const receiptRef = generateReceiptRef();

    // Create pending transaction (handle race: unique idempotency_key)
    let txn: any;
    try {
      const [t] = await sql`
        INSERT INTO transactions (user_id, type, description, amount, status, network, plan_id, phone_number, idempotency_key, receipt_data)
        VALUES (
          ${userId}, 'data', ${`${dataSize} ${network} data to ${phoneNumber}`},
          ${price}, 'pending', ${network}, ${planId}, ${phoneNumber}, ${idempotencyKey},
          ${JSON.stringify({ network, dataSize, validity, phoneNumber, price, receiptRef })}
        )
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
          console.log('Race detected, returning existing transaction', idempotencyKey);
          const receipt = existingTxn.receipt_data || {};
          return NextResponse.json({
            success: existingTxn.status === 'success',
            message: existingTxn.status === 'success' ? 'Data delivered successfully' : 'Previous attempt failed',
            receipt,
          });
        }
      }
      throw e;
    }

    // Call Amigo API with timeout
    const proxyUrl = process.env.AMIGO_PROXY_URL || 'https://amigo.ng/api';
    const apiKey = process.env.AMIGO_API_KEY;
    if (!apiKey) throw new Error('AMIGO_API_KEY not configured');

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), AMIGO_TIMEOUT);

    let amigoData;
    try {
      const amigoRes = await fetch(`${proxyUrl}/data/`, {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey,
          'Idempotency-Key': idempotencyKey,
        },
        body: JSON.stringify({
          network: networkId,
          mobile_number: phoneNumber,
          plan: planId,
          Ported_number: true,
        }),
      });
      amigoData = await amigoRes.json();
    } finally {
      clearTimeout(timeout);
    }

    if (!amigoData.success) {
      await sql`UPDATE transactions SET status = 'failed' WHERE id = ${txn.id}`;
      const errorMsg = amigoData.message || 'Data delivery failed';
      console.error('Amigo API error:', { response: amigoData, message: errorMsg });
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    // ATOMIC: Deduct balance only if sufficient, then mark success
    const [balanceUpdate] = await sql`
      UPDATE users SET wallet_balance = wallet_balance - ${price}, updated_at = NOW()
      WHERE id = ${userId} AND wallet_balance >= ${price}
      RETURNING wallet_balance
    `;
    if (!balanceUpdate) {
      await sql`UPDATE transactions SET status = 'failed' WHERE id = ${txn.id}`;
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
    }

    await sql`
      UPDATE transactions SET status = 'success', amigo_reference = ${amigoData.reference || null},
        receipt_data = ${JSON.stringify({
          network, dataSize, validity, phoneNumber, price, receiptRef,
          reference: amigoData.reference, message: amigoData.message,
        })}
      WHERE id = ${txn.id}
    `;

    const updatedUser = balanceUpdate;

    return NextResponse.json({
      success: true,
      message: amigoData.message || `${dataSize} ${network} data delivered to ${phoneNumber}`,
      reference: amigoData.reference,
      receiptRef,
      newBalance: parseFloat(updatedUser.wallet_balance),
      receipt: {
        ref: receiptRef,
        network, dataSize, validity, phoneNumber, price,
        status: 'success',
        date: new Date().toISOString(),
        amigoRef: amigoData.reference,
        userName: `${user.first_name} ${user.last_name}`,
        userPhone: user.phone,
      },
    });
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      console.error('Buy data timeout:', err);
      return NextResponse.json({ error: 'Request timeout. Please try again.' }, { status: 408 });
    }
    const errorMsg = err instanceof Error ? err.message : 'Purchase failed. Try again.';
    console.error('Buy data error:', err);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

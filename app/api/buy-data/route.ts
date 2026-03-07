import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { verifyPin, generateIdempotencyKey, generateReceiptRef } from '@/lib/utils';

export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const payload = await verifyToken(auth.slice(7));
  if (!payload?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { pin, planId, phoneNumber, network, networkId, dataSize, validity, price } = await req.json();

    if (!/^\d{6}$/.test(pin)) return NextResponse.json({ error: 'Invalid PIN format' }, { status: 400 });
    if (!/^\d{11}$/.test(phoneNumber)) return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 });

    // Fetch user
    const [user] = await sql`
      SELECT id, pin_hash, wallet_balance, first_name, last_name, phone
      FROM users WHERE id = ${payload.userId as string} AND is_banned = FALSE
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

    // Generate idempotency key
    const idempotencyKey = generateIdempotencyKey();
    const receiptRef = generateReceiptRef();

    // Create pending transaction
    const [txn] = await sql`
      INSERT INTO transactions (user_id, type, description, amount, status, network, plan_id, phone_number, idempotency_key, receipt_data)
      VALUES (
        ${user.id}, 'data', ${`${dataSize} ${network} data to ${phoneNumber}`},
        ${price}, 'pending', ${network}, ${planId}, ${phoneNumber}, ${idempotencyKey},
        ${JSON.stringify({ network, dataSize, validity, phoneNumber, price, receiptRef })}
      )
      RETURNING id
    `;

    // Call Amigo API directly (same as admin console does)
    const proxyUrl = process.env.AMIGO_PROXY_URL || 'https://amigo.ng/api';
    const apiKey = process.env.AMIGO_API_KEY;
    if (!apiKey) throw new Error('AMIGO_API_KEY not configured');

    const amigoRes = await fetch(`${proxyUrl}/data/`, {
      method: 'POST',
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

    const amigoData = await amigoRes.json();
    if (!amigoData.success) {
      await sql`UPDATE transactions SET status = 'failed' WHERE id = ${txn.id}`;
      const errorMsg = amigoData.message || 'Data delivery failed';
      console.error('Amigo API error:', { response: amigoData, message: errorMsg });
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    // Deduct balance and mark success
    await sql`
      UPDATE users SET wallet_balance = wallet_balance - ${price}, updated_at = NOW()
      WHERE id = ${user.id}
    `;
    await sql`
      UPDATE transactions SET status = 'success', amigo_reference = ${amigoData.reference || null},
        receipt_data = ${JSON.stringify({
          network, dataSize, validity, phoneNumber, price, receiptRef,
          reference: amigoData.reference, message: amigoData.message,
        })}
      WHERE id = ${txn.id}
    `;

    const [updatedUser] = await sql`SELECT wallet_balance FROM users WHERE id = ${user.id}`;

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
    const errorMsg = err instanceof Error ? err.message : 'Purchase failed. Try again.';
    console.error('Buy data error:', err);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

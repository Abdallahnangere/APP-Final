import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { verifyPin, generateReceiptRef } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const payload = await verifyToken(auth.slice(7));
  if (!payload?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const activations = await sql`
    SELECT id, serial_number, front_image_url, back_image_url, status, amount, admin_note, created_at
    FROM sim_activations WHERE user_id = ${payload.userId as string} ORDER BY created_at DESC
  `;
  return NextResponse.json(activations);
}

export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const payload = await verifyToken(auth.slice(7));
  if (!payload?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { pin, serialNumber, frontImageUrl, backImageUrl } = await req.json();
    const ACTIVATION_COST = 5000;

    if (!/^\d{6}$/.test(pin)) return NextResponse.json({ error: 'Invalid PIN' }, { status: 400 });

    const [user] = await sql`SELECT id, pin_hash, wallet_balance, first_name, last_name FROM users WHERE id = ${payload.userId as string}`;
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const validPin = await verifyPin(pin, user.pin_hash);
    if (!validPin) return NextResponse.json({ error: 'Incorrect PIN' }, { status: 401 });

    const balance = parseFloat(user.wallet_balance);
    if (balance < ACTIVATION_COST) return NextResponse.json({ error: 'Insufficient balance. Need ₦5,000' }, { status: 400 });

    await sql`UPDATE users SET wallet_balance = wallet_balance - ${ACTIVATION_COST}, updated_at = NOW() WHERE id = ${user.id}`;
    const [activation] = await sql`
      INSERT INTO sim_activations (user_id, serial_number, front_image_url, back_image_url, amount, status)
      VALUES (${user.id}, ${serialNumber}, ${frontImageUrl || null}, ${backImageUrl || null}, ${ACTIVATION_COST}, 'under_review')
      RETURNING id
    `;
    const ref = generateReceiptRef();
    await sql`
      INSERT INTO transactions (user_id, type, description, amount, status, receipt_data)
      VALUES (${user.id}, 'sim_activation', 'Airtel SIM Remote Activation', ${ACTIVATION_COST}, 'success',
        ${JSON.stringify({ ref, serialNumber, type: 'sim_activation', date: new Date().toISOString() })})
    `;

    const [updated] = await sql`SELECT wallet_balance FROM users WHERE id = ${user.id}`;
    return NextResponse.json({ success: true, activationId: activation.id, newBalance: parseFloat(updated.wallet_balance) });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Activation request failed' }, { status: 500 });
  }
}

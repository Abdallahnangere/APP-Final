import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { verifyAdminToken } from '@/lib/auth';

async function auth(req: NextRequest) {
  const h = req.headers.get('authorization');
  return h?.startsWith('Bearer ') && await verifyAdminToken(h.slice(7));
}

export async function POST(req: NextRequest) {
  if (!await auth(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { userId, action, amount, note } = await req.json();
  
  if (!['credit', 'debit'].includes(action)) return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  if (!amount || amount <= 0) return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });

  if (action === 'debit') {
    const [u] = await sql`SELECT wallet_balance FROM users WHERE id = ${userId}`;
    if (parseFloat(u.wallet_balance) < amount) return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
    await sql`UPDATE users SET wallet_balance = wallet_balance - ${amount}, updated_at = NOW() WHERE id = ${userId}`;
  } else {
    await sql`UPDATE users SET wallet_balance = wallet_balance + ${amount}, updated_at = NOW() WHERE id = ${userId}`;
  }

  await sql`
    INSERT INTO transactions (user_id, type, description, amount, status)
    VALUES (${userId}, ${action === 'credit' ? 'admin_credit' : 'admin_debit'}, ${note || `Admin ${action}`}, ${amount}, 'success')
  `;

  const [updated] = await sql`SELECT wallet_balance FROM users WHERE id = ${userId}`;
  return NextResponse.json({ success: true, newBalance: parseFloat(updated.wallet_balance) });
}

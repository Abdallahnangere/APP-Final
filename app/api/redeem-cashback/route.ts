import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const payload = await verifyToken(auth.slice(7));
  if (!payload?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const amount = Number(body.amount);
    if (!amount || amount <= 0) return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });

    const userId = payload.userId as string;
    const [user] = await sql`SELECT id, cashback_balance FROM users WHERE id = ${userId} AND is_banned = FALSE`;
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const cashbackBalance = parseFloat(user.cashback_balance);
    if (cashbackBalance < amount) return NextResponse.json({ error: 'Insufficient cashback balance' }, { status: 400 });

    const [updated] = await sql`
      UPDATE users
      SET cashback_balance = cashback_balance - ${amount},
          wallet_balance = wallet_balance + ${amount},
          updated_at = NOW()
      WHERE id = ${userId} AND cashback_balance >= ${amount}
      RETURNING wallet_balance, cashback_balance
    `;

    if (!updated) return NextResponse.json({ error: 'Insufficient cashback balance' }, { status: 400 });

    await sql`
      INSERT INTO transactions (user_id, type, description, amount, status)
      VALUES (
        ${userId},
        'cashback_redemption',
        'Cashback Redeemed to Main Balance',
        ${amount},
        'success'
      )
    `;

    return NextResponse.json({
      success: true,
      amount,
      newBalance: parseFloat(updated.wallet_balance),
      newCashbackBalance: parseFloat(updated.cashback_balance),
      message: `₦${amount.toLocaleString('en-NG')} moved to main balance`,
    });
  } catch (err) {
    console.error('Redeem cashback error:', err);
    return NextResponse.json({ error: 'Failed to redeem cashback' }, { status: 500 });
  }
}

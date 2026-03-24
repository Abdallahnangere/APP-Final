import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { verifyAdminToken } from '@/lib/auth';
import { ensureEarnSchema } from '@/lib/earn';

export const dynamic = 'force-dynamic';

async function auth(req: NextRequest) {
  const h = req.headers.get('authorization');
  return h?.startsWith('Bearer ') && await verifyAdminToken(h.slice(7));
}

export async function GET(req: NextRequest) {
  if (!await auth(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  await ensureEarnSchema();

  const { searchParams } = new URL(req.url);
  const filter = String(searchParams.get('filter') || 'all').trim().toLowerCase();

  const withdrawals = filter === 'all'
    ? await sql`
        SELECT w.*, u.first_name, u.last_name, u.phone
        FROM withdrawals w
        JOIN users u ON u.id = w.user_id
        ORDER BY w.created_at DESC
        LIMIT 200
      `
    : await sql`
        SELECT w.*, u.first_name, u.last_name, u.phone
        FROM withdrawals w
        JOIN users u ON u.id = w.user_id
        WHERE w.status = ${filter}
        ORDER BY w.created_at DESC
        LIMIT 200
      `;

  const [stats] = await sql`
    SELECT
      COUNT(*) FILTER (WHERE status = 'pending') AS pending_count,
      COUNT(*) FILTER (WHERE status = 'paid') AS paid_count,
      COUNT(*) FILTER (WHERE status = 'rejected') AS rejected_count,
      COALESCE(SUM(amount) FILTER (WHERE status = 'pending'), 0) AS pending_amount
    FROM withdrawals
  `;

  return NextResponse.json({
    withdrawals: withdrawals.map((item) => ({
      id: String(item.id),
      userId: String(item.user_id),
      transactionId: item.transaction_id ? String(item.transaction_id) : null,
      amount: parseFloat(item.amount),
      bankCode: String(item.bank_code || ''),
      bankName: String(item.bank_name || ''),
      accountNumber: String(item.account_number || ''),
      accountName: String(item.account_name || ''),
      status: String(item.status || 'pending'),
      payoutReference: item.payout_reference || null,
      adminNote: item.admin_note || null,
      paidAt: item.paid_at || null,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
      firstName: String(item.first_name || ''),
      lastName: String(item.last_name || ''),
      phone: String(item.phone || ''),
    })),
    stats: {
      pendingCount: Number(stats?.pending_count || 0),
      paidCount: Number(stats?.paid_count || 0),
      rejectedCount: Number(stats?.rejected_count || 0),
      pendingAmount: parseFloat(stats?.pending_amount || 0),
    },
  });
}

export async function PATCH(req: NextRequest) {
  if (!await auth(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  await ensureEarnSchema();

  try {
    const { withdrawalId, action, adminNote, payoutReference } = await req.json();
    if (!withdrawalId || !['mark-paid', 'reject'].includes(String(action || ''))) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const [withdrawal] = await sql`
      SELECT * FROM withdrawals WHERE id = ${String(withdrawalId)} LIMIT 1
    `;

    if (!withdrawal) return NextResponse.json({ error: 'Withdrawal not found' }, { status: 404 });
    if (String(withdrawal.status) !== 'pending') {
      return NextResponse.json({ error: 'This withdrawal has already been processed' }, { status: 400 });
    }

    if (action === 'mark-paid') {
      const [updated] = await sql`
        UPDATE withdrawals
        SET status = 'paid',
            admin_note = ${adminNote || null},
            payout_reference = ${payoutReference || null},
            paid_at = NOW(),
            updated_at = NOW()
        WHERE id = ${String(withdrawalId)} AND status = 'pending'
        RETURNING *
      `;

      if (!updated) {
        return NextResponse.json({ error: 'Withdrawal has already been processed' }, { status: 400 });
      }

      if (updated.transaction_id) {
        await sql`
          UPDATE transactions
          SET status = 'success',
              description = ${`Referral withdrawal paid to ${updated.bank_name}`}
          WHERE id = ${updated.transaction_id as string}
        `;
      }

      return NextResponse.json({ success: true, status: 'paid' });
    }

    const [updated] = await sql`
      UPDATE withdrawals
      SET status = 'rejected',
          admin_note = ${adminNote || null},
          updated_at = NOW()
      WHERE id = ${String(withdrawalId)} AND status = 'pending'
      RETURNING *
    `;

    if (!updated) {
      return NextResponse.json({ error: 'Withdrawal has already been processed' }, { status: 400 });
    }

    await sql`
      UPDATE users
      SET referral_balance = COALESCE(referral_balance, 0) + ${updated.amount},
          referral_bonus = COALESCE(referral_bonus, 0) + ${updated.amount},
          updated_at = NOW()
      WHERE id = ${updated.user_id as string}
    `;

    if (updated.transaction_id) {
      await sql`
        UPDATE transactions
        SET status = 'failed',
            description = ${`Rejected withdrawal to ${updated.bank_name}`}
        WHERE id = ${updated.transaction_id as string}
      `;
    }

    return NextResponse.json({ success: true, status: 'rejected' });
  } catch (err) {
    console.error('Admin withdrawal update error:', err);
    return NextResponse.json({ error: 'Failed to update withdrawal' }, { status: 500 });
  }
}
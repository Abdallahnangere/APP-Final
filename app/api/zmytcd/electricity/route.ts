import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAdminToken } from '@/lib/auth';
import { ensureElectricitySchema } from '@/lib/electricity';

export const dynamic = 'force-dynamic';

async function isAuthed(req: NextRequest) {
  const h = req.headers.get('authorization');
  return h?.startsWith('Bearer ') && await verifyAdminToken(h.slice(7));
}

export async function GET(req: NextRequest) {
  if (!await isAuthed(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  await ensureElectricitySchema();

  const { searchParams } = new URL(req.url);
  const status = (searchParams.get('status') || 'all').trim().toLowerCase();
  const meterType = (searchParams.get('meterType') || 'all').trim().toLowerCase();
  const disco = (searchParams.get('disco') || '').trim();
  const search = (searchParams.get('search') || '').trim();
  const from = (searchParams.get('from') || '').trim();
  const to = (searchParams.get('to') || '').trim();

  const where: string[] = [];
  const params: unknown[] = [];

  if (status && status !== 'all') {
    params.push(status);
    where.push(`e.status = $${params.length}`);
  }
  if (meterType && meterType !== 'all') {
    params.push(meterType);
    where.push(`e.meter_type = $${params.length}`);
  }
  if (disco) {
    params.push(disco);
    where.push(`e.disco_name = $${params.length}`);
  }
  if (search) {
    params.push(`%${search}%`);
    where.push(`(e.meter_number ILIKE $${params.length} OR u.first_name ILIKE $${params.length} OR u.last_name ILIKE $${params.length} OR u.phone ILIKE $${params.length})`);
  }
  if (from) {
    params.push(from);
    where.push(`e.created_at::date >= $${params.length}::date`);
  }
  if (to) {
    params.push(to);
    where.push(`e.created_at::date <= $${params.length}::date`);
  }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const rows = await db.query(
    `SELECT e.*, u.first_name, u.last_name, u.phone AS user_phone
     FROM electricity_transactions e
     JOIN users u ON u.id = e.user_id
     ${whereSql}
     ORDER BY e.created_at DESC
     LIMIT 400`,
    params,
  );

  const stats = await db.query(
    `SELECT
      COUNT(*) FILTER (WHERE created_at::date = CURRENT_DATE) AS today_count,
      COALESCE(SUM(total_amount) FILTER (WHERE created_at::date = CURRENT_DATE), 0) AS today_amount,
      COUNT(*) FILTER (WHERE created_at::date = CURRENT_DATE AND status = 'success') AS today_success,
      COUNT(*) FILTER (WHERE created_at::date = CURRENT_DATE AND status = 'failed') AS today_failed
    FROM electricity_transactions`,
  );

  const stat = stats.rows[0] || { today_count: 0, today_amount: 0, today_success: 0, today_failed: 0 };
  const todayCount = Number(stat.today_count || 0);
  const todaySuccess = Number(stat.today_success || 0);
  const successRate = todayCount > 0 ? Math.round((todaySuccess / todayCount) * 10000) / 100 : 0;

  return NextResponse.json({
    transactions: rows.rows.map((row) => ({
      id: String(row.id),
      transactionId: row.transaction_id ? String(row.transaction_id) : null,
      userId: String(row.user_id),
      userName: `${String(row.first_name || '')} ${String(row.last_name || '')}`.trim(),
      userPhone: String(row.user_phone || ''),
      discoName: String(row.disco_name || ''),
      discoCode: String(row.disco_code || ''),
      meterNumber: String(row.meter_number || ''),
      meterType: String(row.meter_type || ''),
      customerName: String(row.customer_name || ''),
      amount: Number(row.amount || 0),
      serviceCharge: Number(row.service_charge || 0),
      totalAmount: Number(row.total_amount || 0),
      token: row.token || null,
      units: row.units || null,
      status: String(row.status || 'pending'),
      flwReference: row.flw_reference || null,
      txReference: row.tx_reference || null,
      phoneNumber: row.phone_number || null,
      email: row.email || null,
      errorMessage: row.error_message || null,
      flwResponse: row.flw_response || null,
      refunded: Boolean(row.refunded),
      refundedAt: row.refunded_at || null,
      retryAttempts: Number(row.retry_attempts || 0),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    })),
    stats: {
      todayCount,
      todayAmount: Number(stat.today_amount || 0),
      successRate,
      failedCount: Number(stat.today_failed || 0),
    },
  });
}

export async function PATCH(req: NextRequest) {
  if (!await isAuthed(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  await ensureElectricitySchema();

  try {
    const body = await req.json() as { electricityId?: string; action?: string; adminNote?: string };
    if (!body.electricityId || body.action !== 'refund') {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const tx = await db.query(
      `SELECT id, user_id, transaction_id, status, refunded, total_amount
       FROM electricity_transactions
       WHERE id = $1
       LIMIT 1`,
      [body.electricityId],
    );
    const row = tx.rows[0] as Record<string, unknown> | undefined;
    if (!row) return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    if (String(row.status || '') !== 'failed') {
      return NextResponse.json({ error: 'Only failed transactions can be refunded' }, { status: 400 });
    }
    if (Boolean(row.refunded)) {
      return NextResponse.json({ error: 'Already refunded' }, { status: 400 });
    }

    await db.query(
      `UPDATE users
       SET wallet_balance = wallet_balance + $2,
           updated_at = NOW()
       WHERE id = $1`,
      [row.user_id, Number(row.total_amount || 0)],
    );

    await db.query(
      `UPDATE electricity_transactions
       SET refunded = TRUE,
           refunded_at = NOW(),
           updated_at = NOW(),
           error_message = COALESCE(error_message, '') || CASE WHEN $2::text = '' THEN '' ELSE (' | Admin note: ' || $2::text) END
       WHERE id = $1`,
      [body.electricityId, String(body.adminNote || '').trim()],
    );

    if (row.transaction_id) {
      await db.query(
        `UPDATE transactions
         SET receipt_data = COALESCE(receipt_data, '{}'::jsonb) || '{"refunded": true}'::jsonb
         WHERE id = $1`,
        [row.transaction_id],
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Admin electricity patch error:', err);
    return NextResponse.json({ error: 'Failed to update electricity transaction' }, { status: 500 });
  }
}

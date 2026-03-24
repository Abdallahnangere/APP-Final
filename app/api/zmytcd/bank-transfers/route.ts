import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAdminToken } from '@/lib/auth';
import { ensureBankTransferSchema, mapTransferStatus, normalizeTransferError } from '@/lib/bankTransfer';
import { initiateTransfer } from '@/lib/flutterwave';

export const dynamic = 'force-dynamic';

async function isAuthed(req: NextRequest) {
  const h = req.headers.get('authorization');
  return h?.startsWith('Bearer ') && await verifyAdminToken(h.slice(7));
}

export async function GET(req: NextRequest) {
  if (!await isAuthed(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  await ensureBankTransferSchema();

  const { searchParams } = new URL(req.url);
  const status = String(searchParams.get('status') || 'all').trim().toLowerCase();
  const bank = String(searchParams.get('bank') || '').trim();
  const search = String(searchParams.get('search') || '').trim();
  const from = String(searchParams.get('from') || '').trim();
  const to = String(searchParams.get('to') || '').trim();

  const where: string[] = [];
  const params: unknown[] = [];

  if (status !== 'all') {
    params.push(status);
    where.push(`b.status = $${params.length}`);
  }
  if (bank) {
    params.push(bank);
    where.push(`b.bank_name = $${params.length}`);
  }
  if (search) {
    params.push(`%${search}%`);
    where.push(`(
      b.account_number ILIKE $${params.length}
      OR b.account_name ILIKE $${params.length}
      OR u.first_name ILIKE $${params.length}
      OR u.last_name ILIKE $${params.length}
      OR u.phone ILIKE $${params.length}
    )`);
  }
  if (from) {
    params.push(from);
    where.push(`b.created_at::date >= $${params.length}::date`);
  }
  if (to) {
    params.push(to);
    where.push(`b.created_at::date <= $${params.length}::date`);
  }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const rows = await db.query(
    `SELECT b.*, u.first_name, u.last_name, u.phone AS user_phone
     FROM bank_transfers b
     JOIN users u ON u.id = b.user_id
     ${whereSql}
     ORDER BY b.created_at DESC
     LIMIT 400`,
    params,
  );

  const stats = await db.query(
    `SELECT
      COUNT(*) FILTER (WHERE created_at::date = CURRENT_DATE) AS today_count,
      COALESCE(SUM(amount) FILTER (WHERE created_at::date = CURRENT_DATE), 0) AS today_amount,
      COALESCE(SUM(service_charge) FILTER (WHERE created_at::date = CURRENT_DATE AND status = 'successful'), 0) AS service_charge_earned,
      COUNT(*) FILTER (WHERE created_at::date = CURRENT_DATE AND status = 'successful') AS today_success,
      COUNT(*) FILTER (WHERE created_at::date = CURRENT_DATE AND status = 'failed') AS today_failed
    FROM bank_transfers`,
  );

  const stat = stats.rows[0] || { today_count: 0, today_amount: 0, service_charge_earned: 0, today_success: 0, today_failed: 0 };
  const todayCount = Number(stat.today_count || 0);
  const successRate = todayCount ? Math.round((Number(stat.today_success || 0) / todayCount) * 10000) / 100 : 0;

  return NextResponse.json({
    transfers: rows.rows.map((r) => ({
      id: String(r.id),
      transactionId: r.transaction_id ? String(r.transaction_id) : null,
      userId: String(r.user_id),
      userName: `${String(r.first_name || '')} ${String(r.last_name || '')}`.trim(),
      userPhone: String(r.user_phone || ''),
      bankCode: String(r.bank_code || ''),
      bankName: String(r.bank_name || ''),
      accountNumber: String(r.account_number || ''),
      accountName: String(r.account_name || ''),
      amount: Number(r.amount || 0),
      serviceCharge: Number(r.service_charge || 0),
      totalDeducted: Number(r.total_deducted || 0),
      narration: String(r.narration || ''),
      status: String(r.status || 'pending'),
      flwTransferId: r.flw_transfer_id ? String(r.flw_transfer_id) : null,
      flwReference: r.flw_reference ? String(r.flw_reference) : null,
      txReference: String(r.tx_reference || ''),
      flwFee: Number(r.flw_fee || 0),
      flwResponse: r.flw_response || null,
      errorMessage: r.error_message ? String(r.error_message) : null,
      refundStatus: String(r.refund_status || 'none'),
      refundedAt: r.refunded_at || null,
      refundedBy: r.refunded_by ? String(r.refunded_by) : null,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
      completedAt: r.completed_at,
    })),
    stats: {
      todayCount,
      todayAmount: Number(stat.today_amount || 0),
      serviceChargeEarnedToday: Number(stat.service_charge_earned || 0),
      successRate,
      failedCount: Number(stat.today_failed || 0),
    },
  });
}

export async function PATCH(req: NextRequest) {
  if (!await isAuthed(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  await ensureBankTransferSchema();

  try {
    const body = await req.json() as { transferId?: string; action?: 'refund' | 'retry'; adminId?: string };
    if (!body.transferId || !body.action) return NextResponse.json({ error: 'Invalid request' }, { status: 400 });

    const transfer = await db.query(
      `SELECT * FROM bank_transfers WHERE id = $1 LIMIT 1`,
      [body.transferId],
    );
    const row = transfer.rows[0] as Record<string, unknown> | undefined;
    if (!row) return NextResponse.json({ error: 'Transfer not found' }, { status: 404 });

    if (body.action === 'refund') {
      if (String(row.refund_status || 'none') === 'refunded') {
        return NextResponse.json({ error: 'Already refunded' }, { status: 400 });
      }
      if (String(row.status || '') !== 'failed') {
        return NextResponse.json({ error: 'Only failed transfers can be refunded' }, { status: 400 });
      }

      await db.query(
        `UPDATE users
         SET wallet_balance = wallet_balance + $2,
             updated_at = NOW()
         WHERE id = $1`,
        [String(row.user_id), Number(row.total_deducted || 0)],
      );

      await db.query(
        `UPDATE bank_transfers
         SET refund_status = 'refunded',
             refunded_at = NOW(),
             refunded_by = $2,
             updated_at = NOW()
         WHERE id = $1`,
        [body.transferId, body.adminId || null],
      );

      if (row.transaction_id) {
        await db.query(
          `UPDATE transactions
           SET receipt_data = COALESCE(receipt_data, '{}'::jsonb) || '{"refunded": true}'::jsonb
           WHERE id = $1`,
          [String(row.transaction_id)],
        );
      }

      return NextResponse.json({ success: true, action: 'refund' });
    }

    if (String(row.refund_status || 'none') === 'refunded') {
      return NextResponse.json({ error: 'Cannot retry a refunded transfer' }, { status: 400 });
    }
    if (!['pending', 'failed'].includes(String(row.status || ''))) {
      return NextResponse.json({ error: 'Only pending or failed transfers can be retried' }, { status: 400 });
    }

    const flw = await initiateTransfer({
      accountBank: String(row.bank_code || ''),
      accountNumber: String(row.account_number || ''),
      amount: Number(row.amount || 0),
      narration: String(row.narration || 'Wallet transfer retry'),
      reference: String(row.tx_reference || ''),
    });

    const providerOk = String(flw?.status || '').toLowerCase() === 'success' && !!flw?.data;

    if (!providerOk) {
      const providerError = normalizeTransferError(flw?.message);
      await db.query(
        `UPDATE bank_transfers
         SET status = 'failed',
             error_message = $2,
             flw_response = $3::jsonb,
             updated_at = NOW(),
             completed_at = NOW()
         WHERE id = $1`,
        [body.transferId, providerError, JSON.stringify(flw || {})],
      );
      return NextResponse.json({ error: providerError }, { status: 400 });
    }

    const mapped = mapTransferStatus(flw.data.status);

    await db.query(
      `UPDATE bank_transfers
       SET status = $2,
           flw_transfer_id = $3,
           flw_reference = $4,
           flw_fee = $5,
           flw_response = $6::jsonb,
           error_message = NULL,
           updated_at = NOW(),
           completed_at = CASE WHEN $2 IN ('successful', 'failed') THEN NOW() ELSE completed_at END
       WHERE id = $1`,
      [
        body.transferId,
        mapped,
        flw.data.id ? String(flw.data.id) : null,
        flw.data.reference ? String(flw.data.reference) : String(row.tx_reference || ''),
        Number(flw.data.fee || 0),
        JSON.stringify(flw),
      ],
    );

    if (row.transaction_id) {
      await db.query(
        `UPDATE transactions
         SET status = $2,
             receipt_data = COALESCE(receipt_data, '{}'::jsonb) || $3::jsonb
         WHERE id = $1`,
        [
          String(row.transaction_id),
          mapped === 'successful' ? 'success' : mapped,
          JSON.stringify({ status: mapped }),
        ],
      );
    }

    return NextResponse.json({ success: true, action: 'retry', status: mapped });
  } catch (err) {
    console.error('Admin bank transfer patch error:', err);
    return NextResponse.json({ error: 'Failed to update transfer' }, { status: 500 });
  }
}

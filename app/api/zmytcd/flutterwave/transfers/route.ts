import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ensureAdminTransfersSchema } from '@/lib/flutterwaveAdmin';
import { getAdminPayload } from '../_shared';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const admin = await getAdminPayload(req);
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  await ensureAdminTransfersSchema();

  const { searchParams } = new URL(req.url);
  const from = String(searchParams.get('from') || '').trim();
  const to = String(searchParams.get('to') || '').trim();
  const status = String(searchParams.get('status') || 'all').trim().toLowerCase();
  const bank = String(searchParams.get('bank') || '').trim();
  const search = String(searchParams.get('search') || '').trim();
  const page = Math.max(1, Number(searchParams.get('page') || 1));
  const pageSize = Math.min(50, Math.max(5, Number(searchParams.get('pageSize') || 15)));
  const offset = (page - 1) * pageSize;

  const where: string[] = [];
  const params: unknown[] = [];

  if (from) {
    params.push(from);
    where.push(`created_at::date >= $${params.length}::date`);
  }
  if (to) {
    params.push(to);
    where.push(`created_at::date <= $${params.length}::date`);
  }
  if (status && status !== 'all') {
    params.push(status);
    where.push(`status = $${params.length}`);
  }
  if (bank) {
    params.push(bank);
    where.push(`bank_name = $${params.length}`);
  }
  if (search) {
    params.push(`%${search}%`);
    where.push(`(account_number ILIKE $${params.length} OR account_name ILIKE $${params.length})`);
  }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const totalResult = await db.query<{ total: string }>(
    `SELECT COUNT(*)::text AS total FROM admin_transfers ${whereSql}`,
    params,
  );
  const total = Number(totalResult.rows[0]?.total || 0);

  const listParams = [...params, pageSize, offset];

  const rows = await db.query(
    `SELECT *
     FROM admin_transfers
     ${whereSql}
     ORDER BY created_at DESC
     LIMIT $${listParams.length - 1}
     OFFSET $${listParams.length}`,
    listParams,
  );

  return NextResponse.json({
    page,
    pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
    transfers: rows.rows.map((row) => ({
      id: String(row.id),
      bankCode: String(row.bank_code || ''),
      bankName: String(row.bank_name || ''),
      accountNumber: String(row.account_number || ''),
      accountName: String(row.account_name || ''),
      amount: Number(row.amount || 0),
      transferFee: Number(row.transfer_fee || 0),
      totalDeducted: Number(row.total_deducted || 0),
      narration: row.narration ? String(row.narration) : '',
      status: String(row.status || 'pending'),
      flwTransferId: row.flw_transfer_id ? String(row.flw_transfer_id) : null,
      flwReference: row.flw_reference ? String(row.flw_reference) : null,
      txReference: String(row.tx_reference || ''),
      flwResponse: row.flw_response || null,
      errorMessage: row.error_message ? String(row.error_message) : null,
      adminUserId: row.admin_user_id ? String(row.admin_user_id) : null,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      completedAt: row.completed_at,
    })),
  });
}

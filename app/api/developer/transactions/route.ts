import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { requireAppUser } from '@/lib/developerAuth';

export async function GET(req: NextRequest) {
  const user = await requireAppUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!user.is_developer) return NextResponse.json({ error: 'Developer access required' }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const limit = Math.min(200, Math.max(1, Number(searchParams.get('limit') || 50)));

  const rows = await sql`
    SELECT
      d.id,
      d.transaction_id,
      d.status,
      d.phone_number,
      d.network,
      d.plan_code,
      d.developer_price,
      d.app_price,
      d.idempotency_key,
      d.amigo_reference,
      d.response_data,
      d.created_at,
      t.description,
      t.status AS transaction_status
    FROM developer_api_transactions d
    LEFT JOIN transactions t ON t.id = d.transaction_id
    WHERE d.user_id = ${user.id}
    ORDER BY d.created_at DESC
    LIMIT ${limit}
  `;

  return NextResponse.json({
    success: true,
    transactions: rows.map((r) => ({
      id: r.id,
      transactionId: r.transaction_id,
      status: r.status,
      transactionStatus: r.transaction_status,
      phoneNumber: r.phone_number,
      network: r.network,
      planCode: r.plan_code,
      appPrice: Number(r.app_price || 0),
      developerPrice: Number(r.developer_price || 0),
      idempotencyKey: r.idempotency_key,
      amigoReference: r.amigo_reference,
      message: r.response_data?.message || r.description || '',
      createdAt: r.created_at,
    })),
  });
}

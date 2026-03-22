import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { verifyToken } from '@/lib/auth';

async function ensureActivitySchema() {
  await sql`ALTER TABLE transactions ADD COLUMN IF NOT EXISTS idempotency_key TEXT`;
  await sql`ALTER TABLE transactions ADD COLUMN IF NOT EXISTS amigo_reference TEXT`;
  await sql`ALTER TABLE transactions ADD COLUMN IF NOT EXISTS receipt_data JSONB`;
  await sql`ALTER TABLE deposits ADD COLUMN IF NOT EXISTS flw_transaction_id TEXT`;
  await sql`ALTER TABLE deposits ADD COLUMN IF NOT EXISTS flw_ref TEXT`;
  await sql`ALTER TABLE deposits ADD COLUMN IF NOT EXISTS sender_name TEXT`;
  await sql`ALTER TABLE deposits ADD COLUMN IF NOT EXISTS narration TEXT`;
}

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const payload = await verifyToken(auth.slice(7));
  if (!payload?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get('limit') || '20');

  try {
    await ensureActivitySchema();

    const txns = await sql`
      SELECT id, type, description, amount, status, network, phone_number, product_name, amigo_reference, receipt_data, created_at
      FROM (
        SELECT id, type, description, amount, status, network, phone_number, product_name, amigo_reference, receipt_data, created_at
        FROM transactions
        WHERE user_id = ${payload.userId as string}
          AND type != 'api_data'

        UNION ALL

        SELECT
          d.id,
          'deposit' AS type,
          COALESCE(NULLIF(d.narration, ''), 'Wallet deposit') AS description,
          d.amount,
          COALESCE(d.status, 'success') AS status,
          NULL AS network,
          NULL AS phone_number,
          NULL AS product_name,
          d.flw_ref AS amigo_reference,
          jsonb_build_object(
            'ref', COALESCE(d.flw_ref, d.flw_transaction_id, d.id::text),
            'amount', d.amount,
            'date', d.created_at,
            'type', 'deposit',
            'productName', 'Wallet Deposit',
            'itemName', 'Wallet Deposit',
            'description', COALESCE(NULLIF(d.narration, ''), 'Wallet deposit'),
            'userName', COALESCE(d.sender_name, 'Bank Transfer'),
            'userPhone', '',
            'deliveryAddress', COALESCE(NULLIF(d.narration, ''), 'Flutterwave deposit')
          ) AS receipt_data,
          d.created_at
        FROM deposits d
        WHERE d.user_id = ${payload.userId as string}
          AND NOT EXISTS (
            SELECT 1 FROM transactions t
            WHERE t.user_id = d.user_id
              AND t.idempotency_key = ('deposit:' || COALESCE(d.flw_transaction_id, ''))
          )

        UNION ALL

        SELECT
          dat.id,
          'api_purchase' AS type,
          (dat.network || ' - ' || COALESCE(dp.data_size || ' (' || dp.validity || ')', dat.plan_code) || ' to ' || dat.phone_number) AS description,
          dat.developer_price AS amount,
          dat.status,
          dat.network,
          dat.phone_number,
          NULL AS product_name,
          dat.amigo_reference,
          jsonb_build_object(
            'ref', dat.id::text,
            'amount', dat.developer_price,
            'date', dat.created_at,
            'type', 'api_purchase',
            'productName', dat.network || ' - ' || COALESCE(dp.data_size || ' (' || dp.validity || ')', dat.plan_code),
            'itemName', COALESCE(dp.data_size || ' (' || dp.validity || ')', dat.plan_code),
            'description', dat.network || ' ' || COALESCE(dp.data_size || ' (' || dp.validity || ')', dat.plan_code) || ' to ' || dat.phone_number,
            'userName', 'API Call',
            'userPhone', dat.phone_number,
            'deliveryAddress', dat.phone_number,
            'endpoint', dat.endpoint,
            'idempotencyKey', dat.idempotency_key,
            'amigoRef', dat.amigo_reference
          ) AS receipt_data,
          dat.created_at
        FROM developer_api_transactions dat
        LEFT JOIN data_plans dp
          ON dp.network_id = split_part(dat.plan_code, '-', 1)::INT
         AND dp.plan_id = split_part(dat.plan_code, '-', 2)::INT
        WHERE dat.user_id = ${payload.userId as string}
      ) AS activity
      ORDER BY created_at DESC LIMIT ${limit}
    `;

    const response = NextResponse.json(txns.map(t => ({
      id: t.id, type: t.type, description: t.description,
      amount: parseFloat(t.amount), status: t.status,
      network: t.network, phoneNumber: t.phone_number,
      productName: t.product_name, amigoRef: t.amigo_reference,
      receipt: t.receipt_data, createdAt: t.created_at,
    })));
    response.headers.set('Cache-Control', 'no-store');
    return response;
  } catch (err) {
    // Fallback so users still see transfer/purchase history even if deposits/api merge fails.
    console.error('Transactions activity query failed, falling back to base transactions:', err);

    const txns = await sql`
      SELECT id, type, description, amount, status, network, phone_number, product_name, amigo_reference, receipt_data, created_at
      FROM transactions
      WHERE user_id = ${payload.userId as string}
      ORDER BY created_at DESC
      LIMIT ${limit}
    `;

    const response = NextResponse.json(txns.map(t => ({
      id: t.id, type: t.type, description: t.description,
      amount: parseFloat(t.amount), status: t.status,
      network: t.network, phoneNumber: t.phone_number,
      productName: t.product_name, amigoRef: t.amigo_reference,
      receipt: t.receipt_data, createdAt: t.created_at,
    })));
    response.headers.set('Cache-Control', 'no-store');
    return response;
  }
}

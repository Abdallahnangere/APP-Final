import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const payload = await verifyToken(auth.slice(7));
  if (!payload?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get('limit') || '20');

  const txns = await sql`
    SELECT id, type, description, amount, status, network, phone_number, product_name, amigo_reference, receipt_data, created_at
    FROM (
      SELECT id, type, description, amount, status, network, phone_number, product_name, amigo_reference, receipt_data, created_at
      FROM transactions
      WHERE user_id = ${payload.userId as string}

      UNION ALL

      SELECT
        d.id,
        'deposit' AS type,
        COALESCE(NULLIF(d.narration, ''), 'Wallet deposit') AS description,
        d.amount,
        d.status,
        NULL AS network,
        NULL AS phone_number,
        NULL AS product_name,
        d.flw_ref AS amigo_reference,
        jsonb_build_object(
          'ref', COALESCE(d.flw_ref, d.flw_transaction_id, d.id),
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
            AND t.idempotency_key = ('deposit:' || d.flw_transaction_id)
        )
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
}

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAdminToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

async function auth(req: NextRequest): Promise<boolean> {
  const h = req.headers.get('authorization');
  return Boolean(h?.startsWith('Bearer ')) && await verifyAdminToken((h as string).slice(7));
}

const FULFILLMENT_EXPR = `COALESCE(t.receipt_data->>'fulfillmentStatus', CASE WHEN t.status = 'success' THEN 'paid' WHEN t.status = 'pending' THEN 'payment_pending' ELSE 'payment_failed' END)`;

export async function GET(req: NextRequest) {
  try {
    if (!await auth(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const filter = req.nextUrl.searchParams.get('filter') || 'all';
    const search = (req.nextUrl.searchParams.get('search') || '').trim();

    const conditions: string[] = [`t.type = 'product'`];
    const params: unknown[] = [];

    if (filter !== 'all') {
      params.push(filter);
      conditions.push(`${FULFILLMENT_EXPR} = $${params.length}`);
    }

    if (search) {
      params.push(`%${search}%`);
      const refIdx = params.length;
      conditions.push(`(
        t.product_name ILIKE $${refIdx}
        OR u.first_name ILIKE $${refIdx}
        OR u.last_name ILIKE $${refIdx}
        OR u.phone ILIKE $${refIdx}
        OR COALESCE(t.receipt_data->>'ref', '') ILIKE $${refIdx}
        OR COALESCE(t.receipt_data->>'deliveryAddress', '') ILIKE $${refIdx}
      )`);
    }

    const whereClause = conditions.join(' AND ');

    const orders = await db.query(
      `SELECT
         t.id,
         t.user_id,
         t.product_id,
         t.product_name,
         t.amount,
         t.status AS payment_status,
         t.created_at,
         u.first_name,
         u.last_name,
         u.phone,
         t.receipt_data,
         COALESCE(t.receipt_data->>'deliveryAddress', 'Not provided') AS delivery_address,
         COALESCE(t.receipt_data->>'ref', '—') AS receipt_ref,
         ${FULFILLMENT_EXPR} AS fulfillment_status,
         COALESCE(t.receipt_data->>'trackingNumber', '') AS tracking_number,
         COALESCE(t.receipt_data->>'adminNote', '') AS admin_note,
         COALESCE(t.receipt_data->>'fulfillmentUpdatedAt', t.created_at::text) AS fulfillment_updated_at
       FROM transactions t
       JOIN users u ON u.id = t.user_id
       WHERE ${whereClause}
       ORDER BY t.created_at DESC
       LIMIT 250`,
      params,
    );

    const stats = await db.query(
      `SELECT
         COUNT(*) AS total,
         COUNT(*) FILTER (WHERE ${FULFILLMENT_EXPR} = 'paid') AS paid_count,
         COUNT(*) FILTER (WHERE ${FULFILLMENT_EXPR} = 'processing') AS processing_count,
         COUNT(*) FILTER (WHERE ${FULFILLMENT_EXPR} = 'shipped') AS shipped_count,
         COUNT(*) FILTER (WHERE ${FULFILLMENT_EXPR} = 'delivered') AS delivered_count
       FROM transactions t
       WHERE t.type = 'product'`
    );

    return NextResponse.json({ orders: orders.rows, stats: stats.rows[0] || {} });
  } catch (err) {
    console.error('Admin orders error:', err);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    if (!await auth(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json() as {
      orderId?: string;
      fulfillmentStatus?: string;
      trackingNumber?: string;
      adminNote?: string;
    };

    if (!body.orderId) {
      return NextResponse.json({ error: 'orderId is required' }, { status: 400 });
    }

    const patch: Record<string, string> = {};
    if (body.fulfillmentStatus) patch.fulfillmentStatus = body.fulfillmentStatus;
    if (body.trackingNumber !== undefined) patch.trackingNumber = body.trackingNumber.trim();
    if (body.adminNote !== undefined) patch.adminNote = body.adminNote.trim();
    patch.fulfillmentUpdatedAt = new Date().toISOString();

    await db.query(
      `UPDATE transactions
       SET receipt_data = COALESCE(receipt_data, '{}'::jsonb) || $2::jsonb
       WHERE id = $1 AND type = 'product'`,
      [body.orderId, JSON.stringify(patch)],
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Admin order update error:', err);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { verifyAdminToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

async function auth(req: NextRequest) {
  const h = req.headers.get('authorization');
  return h?.startsWith('Bearer ') && await verifyAdminToken(h.slice(7));
}

export async function GET(req: NextRequest) {
  if (!await auth(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const plans = await sql`SELECT * FROM data_plans ORDER BY network, selling_price ASC`;
  return NextResponse.json(plans);
}

export async function POST(req: NextRequest) {
  if (!await auth(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const body = await req.json();
  // Accept both snake_case and camelCase
  const network = body.network;
  const networkId = body.network_id || body.networkId;
  const planId = body.plan_id || body.planId;
  const dataSize = body.data_size || body.dataSize;
  const validity = body.validity;
  const sellingPrice = body.selling_price || body.sellingPrice;
  const costPrice = body.cost_price || body.costPrice || 0;

  const [plan] = await sql`
    INSERT INTO data_plans (network, network_id, plan_id, data_size, validity, selling_price, cost_price)
    VALUES (${network}, ${networkId}, ${planId}, ${dataSize}, ${validity}, ${sellingPrice}, ${costPrice})
    RETURNING *
  `;
  return NextResponse.json(plan);
}

export async function PATCH(req: NextRequest) {
  if (!await auth(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const body = await req.json();
  
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

  const sellingPrice = body.selling_price || body.sellingPrice;
  const costPrice = body.cost_price || body.costPrice;
  const dataSize = body.data_size || body.dataSize;
  const planId = body.plan_id || body.planId;
  const networkId = body.network_id || body.networkId;
  const isActive = body.is_active ?? body.isActive;

  await sql`
    UPDATE data_plans SET
      network = COALESCE(${body.network}, network),
      network_id = COALESCE(${networkId ?? null}, network_id),
      plan_id = COALESCE(${planId ?? null}, plan_id),
      data_size = COALESCE(${dataSize ?? null}, data_size),
      validity = COALESCE(${body.validity ?? null}, validity),
      selling_price = COALESCE(${sellingPrice ?? null}, selling_price),
      cost_price = COALESCE(${costPrice ?? null}, cost_price),
      is_active = COALESCE(${isActive ?? null}, is_active)
    WHERE id = ${id}
  `;
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  if (!await auth(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
  await sql`DELETE FROM data_plans WHERE id = ${id}`;
  return NextResponse.json({ success: true });
}

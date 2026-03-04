import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const network = searchParams.get('network');

  const plans = network
    ? await sql`SELECT id, network, network_id, plan_id, data_size, validity, selling_price FROM data_plans WHERE is_active = TRUE AND UPPER(network) = UPPER(${network}) ORDER BY selling_price ASC`
    : await sql`SELECT id, network, network_id, plan_id, data_size, validity, selling_price FROM data_plans WHERE is_active = TRUE ORDER BY network, selling_price ASC`;

  return NextResponse.json(plans.map(p => ({
    id: p.id,
    network: p.network,
    networkId: p.network_id,
    planId: p.plan_id,
    dataSize: p.data_size,
    validity: p.validity,
    price: parseFloat(p.selling_price),
  })));
}

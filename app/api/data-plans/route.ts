import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';

const PLAN_EFFICIENCY: Record<number, number> = {
  5000: 95.0,
  1001: 83.0,
  6666: 100.0,
  3333: 100.0,
  9999: 100.0,
  7777: 100.0,
  1110: 100.0,
  1515: 100.0,
  424: 100.0,
  379: 95.0,
  360: 86.0,
  218: 100.0,
  217: 95.0,
  206: 100.0,
  195: 100.0,
  196: 100.0,
  222: 100.0,
  512: 100.0,
  539: 100.0,
  400: 100.0,
  401: 100.0,
  532: 100.0,
  391: 100.0,
  392: 100.0,
  405: 100.0,
  404: 90.0,
};

function getEfficiencyLabel(percent: number): 'Excellent' | 'Good' | 'Fair' {
  if (percent >= 96) return 'Excellent';
  if (percent >= 90) return 'Good';
  return 'Fair';
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const network = searchParams.get('network');

  const plans = network
    ? await sql`SELECT id, network, network_id, plan_id, data_size, validity, selling_price FROM data_plans WHERE is_active = TRUE AND UPPER(network) = UPPER(${network}) ORDER BY selling_price ASC`
    : await sql`SELECT id, network, network_id, plan_id, data_size, validity, selling_price FROM data_plans WHERE is_active = TRUE ORDER BY network, selling_price ASC`;

  const response = NextResponse.json(plans.map(p => ({
    id: p.id,
    network: p.network,
    networkId: p.network_id,
    planId: p.plan_id,
    dataSize: p.data_size,
    validity: p.validity,
    price: parseFloat(p.selling_price),
    efficiencyPercent: PLAN_EFFICIENCY[p.plan_id] ?? 85,
    efficiencyLabel: getEfficiencyLabel(PLAN_EFFICIENCY[p.plan_id] ?? 85),
  })));
  response.headers.set('Cache-Control', 'public, max-age=0, must-revalidate');
  return response;
}

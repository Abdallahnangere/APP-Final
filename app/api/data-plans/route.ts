import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { fetchAmigoPlanEfficiency } from '@/lib/amigoEfficiency';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const network = searchParams.get('network');

  const plans = network
    ? await sql`SELECT id, network, network_id, plan_id, data_size, validity, selling_price FROM data_plans WHERE is_active = TRUE AND UPPER(network) = UPPER(${network}) ORDER BY selling_price ASC`
    : await sql`SELECT id, network, network_id, plan_id, data_size, validity, selling_price FROM data_plans WHERE is_active = TRUE ORDER BY network, selling_price ASC`;

  let efficiencyByPlanId: Record<number, { efficiencyPercent: number; efficiencyLabel: 'Excellent' | 'Good' | 'Fair' }> = {};
  try {
    efficiencyByPlanId = await fetchAmigoPlanEfficiency();
  } catch (error) {
    console.error('Failed to fetch plan efficiency from Amigo API:', error);
  }

  const response = NextResponse.json(plans.map(p => ({
    id: p.id,
    network: p.network,
    networkId: p.network_id,
    planId: p.plan_id,
    dataSize: p.data_size,
    validity: p.validity,
    price: parseFloat(p.selling_price),
    efficiencyPercent: efficiencyByPlanId[p.plan_id]?.efficiencyPercent,
    efficiencyLabel: efficiencyByPlanId[p.plan_id]?.efficiencyLabel,
  })));
  response.headers.set('Cache-Control', 'public, max-age=0, must-revalidate');
  return response;
}

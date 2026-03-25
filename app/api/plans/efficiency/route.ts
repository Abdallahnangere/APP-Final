import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { fetchAmigoPlanEfficiency, getEfficiencyLabelFromPercent } from '@/lib/amigoEfficiency';

// Convert data_size string to numeric GB
function parseDataCapacity(dataSize: string): number {
  const match = dataSize.match(/(\d+\.?\d*)\s*(MB|GB)/i);
  if (!match) return 0;
  const value = parseFloat(match[1]);
  const unit = match[2].toUpperCase();
  return unit === 'GB' ? value : value / 1024;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const networkIdParam = searchParams.get('network_id');
  const minEff = searchParams.get('min_eff');
  const networkId = networkIdParam ? Number(networkIdParam) : undefined;
  const minEffValue = minEff ? Number(minEff) : undefined;

  try {
    let plans = await sql`
      SELECT id, network, network_id, plan_id, data_size, validity, selling_price 
      FROM data_plans 
      WHERE is_active = TRUE
      ORDER BY network, selling_price ASC
    `;

    if (typeof networkId === 'number' && Number.isFinite(networkId)) {
      plans = plans.filter((p: any) => p.network_id === networkId);
    }

    const efficiencyByPlanId = await fetchAmigoPlanEfficiency({
      networkId: typeof networkId === 'number' && Number.isFinite(networkId) ? networkId : undefined,
      minEff: typeof minEffValue === 'number' && Number.isFinite(minEffValue) ? minEffValue : undefined,
    });

    const plansByNetwork: Record<string, any[]> = {};

    plans.forEach((plan: any) => {
      const livePoint = efficiencyByPlanId[plan.plan_id];
      if (!livePoint) return;

      const efficiencyPercent = livePoint.efficiencyPercent;
      const efficiencyLabel = livePoint.efficiencyLabel || getEfficiencyLabelFromPercent(efficiencyPercent);
      const dataCapacity = parseDataCapacity(plan.data_size);

      if (typeof minEffValue === 'number' && Number.isFinite(minEffValue) && efficiencyPercent < minEffValue) {
        return;
      }

      if (!plansByNetwork[plan.network]) {
        plansByNetwork[plan.network] = [];
      }

      plansByNetwork[plan.network].push({
        plan_id: plan.plan_id,
        data_capacity: dataCapacity,
        validity: parseInt(plan.validity) || 30,
        price: parseFloat(plan.selling_price),
        efficiency_percent: efficiencyPercent,
        efficiency_label: efficiencyLabel,
      });
    });

    const response = NextResponse.json({
      ok: true,
      ...plansByNetwork,
    });

    response.headers.set('Cache-Control', 'public, max-age=300, must-revalidate');
    return response;
  } catch (error) {
    console.error('Error fetching plan efficiency:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to fetch plan efficiency' },
      { status: 500 }
    );
  }
}

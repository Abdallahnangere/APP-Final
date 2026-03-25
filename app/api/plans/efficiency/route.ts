import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';

// Plan efficiency data mapping: plan_id -> efficiency_percent
const PLAN_EFFICIENCY: Record<number, number> = {
  // MTN (network_id = 1)
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

  // Glo (network_id = 2)
  218: 100.0,
  217: 95.0,
  206: 100.0,
  195: 100.0,
  196: 100.0,
  222: 100.0,
  512: 100.0,

  // Airtel (network_id = 4)
  539: 100.0,
  400: 100.0,
  401: 100.0,
  532: 100.0,
  391: 100.0,
  392: 100.0,
  405: 100.0,
  404: 90.0,
};

// Get efficiency label based on percentage
function getEfficiencyLabel(percent: number): string {
  if (percent >= 96) return 'Excellent';
  if (percent >= 90) return 'Good';
  return 'Fair';
}

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
  const networkId = searchParams.get('network_id');
  const minEff = searchParams.get('min_eff');

  try {
    // Fetch all active plans
    let plans = await sql`
      SELECT id, network, network_id, plan_id, data_size, validity, selling_price 
      FROM data_plans 
      WHERE is_active = TRUE
      ORDER BY network, selling_price ASC
    `;

    // Filter by network_id if provided
    if (networkId) {
      const nId = parseInt(networkId);
      plans = plans.filter((p: any) => p.network_id === nId);
    }

    // Map plans with efficiency data
    const plansByNetwork: Record<string, any[]> = {};

    plans.forEach((plan: any) => {
      const efficiencyPercent = PLAN_EFFICIENCY[plan.plan_id] ?? 85.0; // Default to 85% if not found
      const efficiencyLabel = getEfficiencyLabel(efficiencyPercent);
      const dataCapacity = parseDataCapacity(plan.data_size);

      // Filter by min_eff if provided
      if (minEff && efficiencyPercent < parseFloat(minEff)) {
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

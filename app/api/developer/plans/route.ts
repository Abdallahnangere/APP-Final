import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { requireAppUser } from '@/lib/developerAuth';

export async function GET(req: NextRequest) {
  const user = await requireAppUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!user.is_developer) return NextResponse.json({ error: 'Developer access required' }, { status: 403 });

  const discountPercent = Number(user.developer_discount_percent || 0);

  const plans = await sql`
    SELECT id, network, network_id, plan_id, data_size, validity, selling_price
    FROM data_plans
    WHERE is_active = TRUE
    ORDER BY network, selling_price ASC
  `;

  return NextResponse.json({
    success: true,
    discountPercent,
    plans: plans.map((p) => {
      const appPrice = Number(p.selling_price || 0);
      const developerPrice = Math.round((appPrice * (1 - discountPercent / 100)) * 100) / 100;
      return {
        id: p.id,
        code: `${p.network_id}-${p.plan_id}`,
        network: p.network,
        networkId: p.network_id,
        planId: p.plan_id,
        dataSize: p.data_size,
        validity: p.validity,
        appPrice,
        developerPrice,
      };
    }),
  });
}

import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { requireDeveloperByApiKey } from '@/lib/developerAuth';

export async function GET(req: NextRequest) {
  const auth = await requireDeveloperByApiKey(req);
  if (!auth) return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });

  const discountPercent = Number(auth.user.developer_discount_percent || 0);
  const plans = await sql`
    SELECT id, network, network_id, plan_id, data_size, validity, selling_price
    FROM data_plans
    WHERE is_active = TRUE
    ORDER BY network, selling_price ASC
  `;

  return NextResponse.json({
    success: true,
    discountPercent,
    docs: {
      purchaseEndpoint: '/api/v1/developer/purchase-data',
      authHeader: 'x-api-key: sm_live_... or Authorization: Bearer sm_live_...',
      payload: {
        phoneNumber: '08012345678',
        network: 'MTN',
        planCode: '1-123',
        idempotencyKey: 'your-unique-id-123',
      },
    },
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

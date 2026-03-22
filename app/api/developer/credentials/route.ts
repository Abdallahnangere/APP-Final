import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { createAndStoreDeveloperKey, getActiveDeveloperKeyFullValue, requireAppUser } from '@/lib/developerAuth';

export async function GET(req: NextRequest) {
  const user = await requireAppUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!user.is_developer) return NextResponse.json({ error: 'Developer access required' }, { status: 403 });

  let keys = await sql`
    SELECT id, key_prefix, key_last4, is_active, created_at, last_used_at
    FROM developer_api_keys
    WHERE user_id = ${user.id}
    ORDER BY created_at DESC
    LIMIT 20
  `;

  let activeApiKey = await getActiveDeveloperKeyFullValue(user.id);
  let autoReissued = false;

  // Backward compatibility: old keys were not stored encrypted, so reissue once.
  if (!activeApiKey) {
    const hasActive = keys.some((k) => Boolean(k.is_active));
    if (hasActive) {
      await sql`
        UPDATE developer_api_keys
        SET is_active = FALSE,
            revoked_at = NOW(),
            updated_at = NOW()
        WHERE user_id = ${user.id} AND is_active = TRUE
      `;
      const created = await createAndStoreDeveloperKey(user.id);
      activeApiKey = created.fullKey;
      autoReissued = true;
      keys = await sql`
        SELECT id, key_prefix, key_last4, is_active, created_at, last_used_at
        FROM developer_api_keys
        WHERE user_id = ${user.id}
        ORDER BY created_at DESC
        LIMIT 20
      `;
    }
  }

  return NextResponse.json({
    success: true,
    discountPercent: Number(user.developer_discount_percent || 0),
    baseUrl: process.env.NEXT_PUBLIC_APP_URL || 'https://www.saukimart.online',
    plansEndpoint: '/api/v1/developer/data-plans',
    purchaseEndpoint: '/api/v1/developer/purchase-data',
    activeApiKey,
    autoReissued,
    keys: keys.map((k) => ({
      id: k.id,
      prefix: k.key_prefix,
      last4: k.key_last4,
      isActive: k.is_active,
      createdAt: k.created_at,
      lastUsedAt: k.last_used_at,
      preview: `sm_live_${k.key_prefix}...${k.key_last4}`,
    })),
  });
}

export async function POST(req: NextRequest) {
  const user = await requireAppUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!user.is_developer) return NextResponse.json({ error: 'Developer access required' }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const action = String(body?.action || '').toLowerCase();

  if (action !== 'rotate') {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  }

  await sql`
    UPDATE developer_api_keys
    SET is_active = FALSE,
        revoked_at = NOW(),
        updated_at = NOW()
    WHERE user_id = ${user.id} AND is_active = TRUE
  `;

  const created = await createAndStoreDeveloperKey(user.id);

  return NextResponse.json({
    success: true,
    message: 'API key rotated successfully.',
    apiKey: created.fullKey,
    key: {
      id: created.id,
      prefix: created.keyPrefix,
      last4: created.keyLast4,
      preview: `sm_live_${created.keyPrefix}...${created.keyLast4}`,
      createdAt: created.createdAt,
    },
  });
}

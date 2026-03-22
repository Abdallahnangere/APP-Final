import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { createAndStoreDeveloperKey, requireAppUser } from '@/lib/developerAuth';

export async function POST(req: NextRequest) {
  try {
    const user = await requireAppUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.is_banned) return NextResponse.json({ error: 'Account suspended' }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const acceptTerms = body?.acceptTerms === true;
    const termsVersion = String(body?.termsVersion || 'v1.0').slice(0, 20);

    if (!acceptTerms) {
      return NextResponse.json({ error: 'Terms must be accepted' }, { status: 400 });
    }

    await sql`
      UPDATE users
      SET is_developer = TRUE,
          developer_terms_accepted_at = NOW(),
          developer_terms_version = ${termsVersion},
          updated_at = NOW()
      WHERE id = ${user.id}
    `;

    const activeKeys = await sql`
      SELECT id, key_prefix, key_last4, created_at, last_used_at
      FROM developer_api_keys
      WHERE user_id = ${user.id} AND is_active = TRUE
      ORDER BY created_at DESC
      LIMIT 1
    `;

    let apiKey: string | null = null;
    let keyPrefix: string | null = null;

    if (!activeKeys.length) {
      const created = await createAndStoreDeveloperKey(user.id);
      apiKey = created.fullKey;
      keyPrefix = created.keyPrefix;
    } else {
      keyPrefix = String(activeKeys[0].key_prefix || '');
    }

    return NextResponse.json({
      success: true,
      message: 'Developer mode enabled successfully',
      apiKey,
      keyPrefix,
      dashboard: {
        plansEndpoint: '/api/v1/developer/data-plans',
        purchaseEndpoint: '/api/v1/developer/purchase-data',
      },
    });
  } catch (err) {
    console.error('Developer upgrade error:', err);
    return NextResponse.json({ error: 'Failed to upgrade to developer' }, { status: 500 });
  }
}

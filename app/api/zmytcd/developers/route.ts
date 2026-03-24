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
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');

  if (userId) {
    const [developer] = await sql`
      SELECT
        u.id,
        u.first_name,
        u.last_name,
        u.phone,
        u.is_developer,
        u.developer_discount_percent,
        u.developer_terms_version,
        u.developer_terms_accepted_at,
        u.created_at,
        COALESCE((
          SELECT COUNT(*)::INT
          FROM developer_api_keys k
          WHERE k.user_id = u.id AND k.is_active = TRUE
        ), 0) AS active_keys,
        (
          SELECT MAX(k.last_used_at)
          FROM developer_api_keys k
          WHERE k.user_id = u.id
        ) AS last_used_at
      FROM users u
      WHERE u.id = ${userId}
      LIMIT 1
    `;

    if (!developer) return NextResponse.json({ error: 'Developer not found' }, { status: 404 });

    const keys = await sql`
      SELECT id, key_prefix, key_last4, is_active, created_at, last_used_at, revoked_at
      FROM developer_api_keys
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT 50
    `;

    const activity = await sql`
      SELECT id, status, endpoint, network, plan_code, phone_number, app_price, developer_price, amigo_reference, created_at
      FROM developer_api_transactions
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT 120
    `;

    const [stats] = await sql`
      SELECT
        COUNT(*)::INT AS total_requests,
        COALESCE(SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END), 0)::INT AS successful_requests,
        COALESCE(SUM(CASE WHEN status <> 'success' THEN 1 ELSE 0 END), 0)::INT AS failed_requests,
        COALESCE(SUM(CASE WHEN status = 'success' THEN developer_price ELSE 0 END), 0)::NUMERIC(14,2) AS total_developer_spend
      FROM developer_api_transactions
      WHERE user_id = ${userId}
    `;

    const response = NextResponse.json({ developer, keys, activity, stats: stats || {} });
    response.headers.set('Cache-Control', 'public, max-age=0, must-revalidate');
    return response;
  }

  const rows = await sql`
    SELECT
      u.id,
      u.first_name,
      u.last_name,
      u.phone,
      u.is_developer,
      u.developer_discount_percent,
      u.developer_terms_version,
      u.developer_terms_accepted_at,
      u.created_at,
      COALESCE((
        SELECT COUNT(*)::INT
        FROM developer_api_keys k
        WHERE k.user_id = u.id AND k.is_active = TRUE
      ), 0) AS active_keys,
      (
        SELECT MAX(k.last_used_at)
        FROM developer_api_keys k
        WHERE k.user_id = u.id
      ) AS last_used_at
    FROM users u
    WHERE u.is_developer = TRUE
    ORDER BY u.developer_terms_accepted_at DESC NULLS LAST, u.created_at DESC
    LIMIT 300
  `;

  const response = NextResponse.json(rows);
  response.headers.set('Cache-Control', 'public, max-age=0, must-revalidate');
  return response;
}

export async function POST(req: NextRequest) {
  if (!await auth(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();
  const userId = String(body?.userId || '').trim();
  const discountPercent = Number(body?.discountPercent ?? 8);
  const termsVersion = String(body?.termsVersion || 'v1.0').trim();

  if (!userId) return NextResponse.json({ error: 'userId is required' }, { status: 400 });
  if (!Number.isFinite(discountPercent) || discountPercent < 0 || discountPercent > 100) {
    return NextResponse.json({ error: 'discountPercent must be between 0 and 100' }, { status: 400 });
  }

  await sql`
    UPDATE users
    SET is_developer = TRUE,
        developer_discount_percent = ${discountPercent},
        developer_terms_version = COALESCE(NULLIF(${termsVersion}, ''), developer_terms_version, 'v1.0'),
        developer_terms_accepted_at = COALESCE(developer_terms_accepted_at, NOW()),
        updated_at = NOW()
    WHERE id = ${userId}
  `;

  return NextResponse.json({ success: true });
}

export async function PATCH(req: NextRequest) {
  if (!await auth(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();
  const userId = String(body?.userId || '').trim();
  const action = String(body?.action || '').trim();
  const keyId = String(body?.keyId || '').trim();
  const discountPercent = body?.discountPercent;
  const termsVersion = body?.termsVersion;

  if (!userId) return NextResponse.json({ error: 'userId is required' }, { status: 400 });

  if (action === 'demote') {
    await sql`
      UPDATE users
      SET is_developer = FALSE,
          updated_at = NOW()
      WHERE id = ${userId}
    `;
    return NextResponse.json({ success: true, action: 'demote' });
  }

  if (action === 'revoke-keys') {
    await sql`
      UPDATE developer_api_keys
      SET is_active = FALSE,
          revoked_at = NOW(),
          updated_at = NOW()
      WHERE user_id = ${userId} AND is_active = TRUE
    `;
    return NextResponse.json({ success: true, action: 'revoke-keys' });
  }

  if (action === 'revoke-key') {
    if (!keyId) return NextResponse.json({ error: 'keyId is required for revoke-key action' }, { status: 400 });
    await sql`
      UPDATE developer_api_keys
      SET is_active = FALSE,
          revoked_at = NOW(),
          updated_at = NOW()
      WHERE id = ${keyId} AND user_id = ${userId}
    `;
    return NextResponse.json({ success: true, action: 'revoke-key' });
  }

  const parsedDiscount = discountPercent === undefined ? null : Number(discountPercent);
  if (parsedDiscount !== null && (!Number.isFinite(parsedDiscount) || parsedDiscount < 0 || parsedDiscount > 100)) {
    return NextResponse.json({ error: 'discountPercent must be between 0 and 100' }, { status: 400 });
  }

  await sql`
    UPDATE users
    SET developer_discount_percent = COALESCE(${parsedDiscount}, developer_discount_percent),
        developer_terms_version = COALESCE(NULLIF(${String(termsVersion || '').trim()}, ''), developer_terms_version),
        updated_at = NOW()
    WHERE id = ${userId} AND is_developer = TRUE
  `;

  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  if (!await auth(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();
  const userId = String(body?.userId || '').trim();
  if (!userId) return NextResponse.json({ error: 'userId is required' }, { status: 400 });

  await sql`
    UPDATE users
    SET is_developer = FALSE,
        updated_at = NOW()
    WHERE id = ${userId}
  `;

  await sql`
    UPDATE developer_api_keys
    SET is_active = FALSE,
        revoked_at = NOW(),
        updated_at = NOW()
    WHERE user_id = ${userId} AND is_active = TRUE
  `;

  return NextResponse.json({ success: true });
}

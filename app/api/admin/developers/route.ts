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
  const discountPercent = body?.discountPercent;
  const termsVersion = body?.termsVersion;

  if (!userId) return NextResponse.json({ error: 'userId is required' }, { status: 400 });

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

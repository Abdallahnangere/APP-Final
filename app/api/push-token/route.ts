import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { verifyToken } from '@/lib/auth';

function getBearerToken(req: NextRequest): string | null {
  const auth = req.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) return null;
  return auth.slice(7);
}

export async function POST(req: NextRequest) {
  try {
    const bearer = getBearerToken(req);
    if (!bearer) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await verifyToken(bearer);
    if (!payload?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const token = String(body?.token || '').trim();
    const platform = String(body?.platform || 'android').trim().toLowerCase();
    const appVersion = body?.appVersion ? String(body.appVersion).trim() : null;

    if (!token || token.length < 20) {
      return NextResponse.json({ error: 'Invalid push token' }, { status: 400 });
    }

    await sql`
      CREATE TABLE IF NOT EXISTS user_push_tokens (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        token TEXT UNIQUE NOT NULL,
        platform TEXT DEFAULT 'android',
        app_version TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        last_seen_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    await sql`
      INSERT INTO user_push_tokens (user_id, token, platform, app_version, is_active, updated_at, last_seen_at)
      VALUES (${payload.userId as string}, ${token}, ${platform || 'android'}, ${appVersion}, TRUE, NOW(), NOW())
      ON CONFLICT (token) DO UPDATE
      SET user_id = EXCLUDED.user_id,
          platform = EXCLUDED.platform,
          app_version = EXCLUDED.app_version,
          is_active = TRUE,
          updated_at = NOW(),
          last_seen_at = NOW()
    `;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Push token registration failed:', err);
    return NextResponse.json({ error: 'Failed to register token' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const bearer = getBearerToken(req);
    if (!bearer) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await verifyToken(bearer);
    if (!payload?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const token = String(body?.token || '').trim();

    if (token) {
      await sql`
        UPDATE user_push_tokens
        SET is_active = FALSE, updated_at = NOW()
        WHERE user_id = ${payload.userId as string} AND token = ${token}
      `;
    } else {
      await sql`
        UPDATE user_push_tokens
        SET is_active = FALSE, updated_at = NOW()
        WHERE user_id = ${payload.userId as string}
      `;
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Push token delete failed:', err);
    return NextResponse.json({ error: 'Failed to remove token' }, { status: 500 });
  }
}

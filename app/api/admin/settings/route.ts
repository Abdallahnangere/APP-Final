import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { verifyAdminToken } from '@/lib/auth';

async function auth(req: NextRequest) {
  const h = req.headers.get('authorization');
  return h?.startsWith('Bearer ') && await verifyAdminToken(h.slice(7));
}

export async function GET(req: NextRequest) {
  if (!await auth(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const settings = await sql`SELECT key, value FROM site_settings`;
  const map: Record<string, string> = {};
  settings.forEach((s: Record<string,string>) => { map[s.key] = s.value; });
  // Also include webhook log
  const webhooks = await sql`SELECT id, event, payload, processed, created_at FROM webhooks_log ORDER BY created_at DESC LIMIT 50`;
  const response = NextResponse.json({ settings: map, webhooks });
  response.headers.set('Cache-Control', 'public, max-age=0, must-revalidate');
  return response;
}

export async function PATCH(req: NextRequest) {
  if (!await auth(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { key, value } = await req.json();
  await sql`INSERT INTO site_settings (key, value) VALUES (${key}, ${value}) ON CONFLICT (key) DO UPDATE SET value=${value}, updated_at=NOW()`;
  return NextResponse.json({ success: true });
}

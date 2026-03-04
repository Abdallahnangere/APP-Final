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
  const rows = await sql`SELECT * FROM broadcasts ORDER BY created_at DESC`;
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  if (!await auth(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { message } = await req.json();
  if (!message?.trim()) return NextResponse.json({ error: 'Message required' }, { status: 400 });
  const [b] = await sql`INSERT INTO broadcasts (message) VALUES (${message.trim()}) RETURNING *`;
  return NextResponse.json(b);
}

export async function PATCH(req: NextRequest) {
  if (!await auth(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { searchParams } = new URL(req.url);
  const qId = searchParams.get('id');
  const body = await req.json();
  const id = qId || body.id;
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
  const message = body.message;
  const isActive = body.isActive ?? body.is_active;
  await sql`UPDATE broadcasts SET message=COALESCE(${message??null},message), is_active=COALESCE(${isActive??null},is_active) WHERE id=${id}`;
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  if (!await auth(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { searchParams } = new URL(req.url);
  const qId = searchParams.get('id');
  if (!qId) {
    const body = await req.json().catch(() => ({}));
    const id = body.id;
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
    await sql`DELETE FROM broadcasts WHERE id=${id}`;
  } else {
    await sql`DELETE FROM broadcasts WHERE id=${qId}`;
  }
  return NextResponse.json({ success: true });
}

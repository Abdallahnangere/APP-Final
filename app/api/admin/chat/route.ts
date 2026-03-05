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
    const msgs = await sql`SELECT * FROM chats WHERE user_id=${userId} ORDER BY created_at ASC`;
    await sql`UPDATE chats SET is_read=TRUE WHERE user_id=${userId} AND sender='user'`;
    return NextResponse.json(msgs);
  }

  // Return all chat messages with user names joined
  const msgs = await sql`
    SELECT c.*, u.first_name, u.last_name, u.phone,
      (u.first_name || ' ' || u.last_name) as user_name
    FROM chats c
    LEFT JOIN users u ON c.user_id=u.id
    ORDER BY c.created_at DESC
  `;
  return NextResponse.json(msgs);
}

export async function POST(req: NextRequest) {
  if (!await auth(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { userId, message } = await req.json();
  if (!message?.trim()) return NextResponse.json({ error: 'Message required' }, { status: 400 });
  const [msg] = await sql`
    INSERT INTO chats (user_id, sender, message, is_read) VALUES (${userId}, 'admin', ${message.trim()}, TRUE)
    RETURNING *
  `;
  return NextResponse.json(msg);
}

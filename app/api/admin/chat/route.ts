import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { verifyAdminToken } from '@/lib/auth';

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
    const response = NextResponse.json(msgs);
    response.headers.set('Cache-Control', 'public, max-age=0, must-revalidate');
    return response;
  }

  // List all users with unread counts
  const users = await sql`
    SELECT u.id, u.first_name, u.last_name, u.phone,
      COUNT(c.id) FILTER (WHERE c.sender='user' AND c.is_read=FALSE) as unread,
      MAX(c.created_at) as last_message
    FROM users u LEFT JOIN chats c ON c.user_id=u.id
    GROUP BY u.id ORDER BY last_message DESC NULLS LAST
  `;
  const response = NextResponse.json(users);
  response.headers.set('Cache-Control', 'public, max-age=0, must-revalidate');
  return response;
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

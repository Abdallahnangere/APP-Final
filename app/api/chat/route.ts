import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const payload = await verifyToken(auth.slice(7));
  if (!payload?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Auto-delete chats older than 7 days
  await sql`DELETE FROM chats WHERE created_at < NOW() - INTERVAL '7 days'`;

  const messages = await sql`
    SELECT id, sender, message, is_read, created_at FROM chats
    WHERE user_id = ${payload.userId as string} ORDER BY created_at ASC
  `;
  // Mark admin messages as read
  await sql`UPDATE chats SET is_read = TRUE WHERE user_id = ${payload.userId as string} AND sender = 'admin'`;

  return NextResponse.json(messages);
}

export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const payload = await verifyToken(auth.slice(7));
  if (!payload?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { message } = await req.json();
  if (!message?.trim()) return NextResponse.json({ error: 'Message required' }, { status: 400 });

  const [msg] = await sql`
    INSERT INTO chats (user_id, sender, message) VALUES (${payload.userId as string}, 'user', ${message.trim()})
    RETURNING id, sender, message, created_at
  `;
  return NextResponse.json(msg);
}

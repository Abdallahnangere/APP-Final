import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { sessionId, sender, isTyping } = await req.json();

    if (!sessionId || !sender) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    await db.query(
      `INSERT INTO typing_indicators (session_id, sender, is_typing, updated_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (session_id, sender) 
       DO UPDATE SET is_typing = $3, updated_at = NOW()`,
      [sessionId, sender, isTyping]
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Typing indicator error:', err);
    return NextResponse.json({ error: 'Failed to update typing' }, { status: 500 });
  }
}

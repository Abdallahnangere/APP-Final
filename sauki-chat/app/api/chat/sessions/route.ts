import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST /api/chat/sessions — create a new session
export async function POST(req: NextRequest) {
  try {
    const { customerId, customerName } = await req.json();

    if (!customerId) {
      return NextResponse.json({ error: 'customerId is required' }, { status: 400 });
    }

    // Check if there's already an active session for this customer
    const existing = await db.query<{ id: string; status: string }>(
      `SELECT id, status FROM chat_sessions 
       WHERE customer_id = $1 AND status NOT IN ('resolved', 'flagged')
       ORDER BY started_at DESC LIMIT 1`,
      [customerId]
    );

    if (existing.rows.length > 0) {
      const session = await db.query(
        `SELECT * FROM chat_sessions WHERE id = $1`,
        [existing.rows[0].id]
      );
      return NextResponse.json({ session: session.rows[0], resumed: true });
    }

    // Create new session
    const result = await db.query(
      `INSERT INTO chat_sessions (customer_id, customer_name, status)
       VALUES ($1, $2, 'active')
       RETURNING *`,
      [customerId, customerName || 'Customer']
    );

    return NextResponse.json({ session: result.rows[0], resumed: false });
  } catch (err) {
    console.error('Session create error:', err);
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
  }
}

// GET /api/chat/sessions?sessionId=xxx — fetch a session
export async function GET(req: NextRequest) {
  try {
    const sessionId = req.nextUrl.searchParams.get('sessionId');
    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId required' }, { status: 400 });
    }

    const session = await db.query(
      `SELECT * FROM chat_sessions WHERE id = $1`,
      [sessionId]
    );

    if (!session.rows.length) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    const messages = await db.query(
      `SELECT * FROM chat_messages WHERE session_id = $1 ORDER BY created_at ASC`,
      [sessionId]
    );

    return NextResponse.json({
      session: session.rows[0],
      messages: messages.rows,
    });
  } catch (err) {
    console.error('Session fetch error:', err);
    return NextResponse.json({ error: 'Failed to fetch session' }, { status: 500 });
  }
}

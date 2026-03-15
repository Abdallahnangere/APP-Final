import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST /api/admin/intervene
// action: 'takeover' | 'resolve' | 'flag' | 'add_note' | 'send_message' | 'release'
export async function POST(req: NextRequest) {
  try {
    const { sessionId, action, payload, agentId } = await req.json();

    if (!sessionId || !action) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    switch (action) {
      case 'takeover': {
        await db.query(
          `UPDATE chat_sessions 
           SET agent_mode = true, agent_required = false, 
               status = 'agent_active', agent_id = $2
           WHERE id = $1`,
          [sessionId, agentId || 'admin']
        );
        // Add a system message visible to customer
        await db.query(
          `INSERT INTO chat_messages (session_id, sender, content, delivered, read)
           VALUES ($1, 'agent', $2, true, true)`,
          [sessionId, '🟢 A live agent has joined this conversation and will assist you now.']
        );
        break;
      }

      case 'release': {
        // Agent releases back to AI
        await db.query(
          `UPDATE chat_sessions 
           SET agent_mode = false, agent_required = false,
               status = 'active', agent_id = NULL
           WHERE id = $1`,
          [sessionId]
        );
        await db.query(
          `INSERT INTO chat_messages (session_id, sender, content, delivered, read)
           VALUES ($1, 'ai', $2, true, true)`,
          [sessionId, 'The agent has left. You can continue chatting and I\'ll be here to help! 👋']
        );
        break;
      }

      case 'resolve': {
        await db.query(
          `UPDATE chat_sessions 
           SET status = 'resolved', resolved_at = NOW(), agent_mode = false
           WHERE id = $1`,
          [sessionId]
        );
        await db.query(
          `INSERT INTO chat_messages (session_id, sender, content, delivered, read)
           VALUES ($1, 'agent', $2, true, true)`,
          [sessionId, '✅ This support session has been marked as resolved. Thank you for contacting Sauki Mart! If you need further assistance, feel free to start a new chat.']
        );
        break;
      }

      case 'flag': {
        await db.query(
          `UPDATE chat_sessions SET status = 'flagged' WHERE id = $1`,
          [sessionId]
        );
        break;
      }

      case 'add_note': {
        if (!payload?.note) {
          return NextResponse.json({ error: 'Note content required' }, { status: 400 });
        }
        const timestamp = new Date().toLocaleString('en-NG', { timeZone: 'Africa/Lagos' });
        const noteWithTimestamp = `[${timestamp}] ${payload.note}`;
        await db.query(
          `UPDATE chat_sessions 
           SET internal_notes = array_append(internal_notes, $2)
           WHERE id = $1`,
          [sessionId, noteWithTimestamp]
        );
        break;
      }

      case 'send_message': {
        if (!payload?.content) {
          return NextResponse.json({ error: 'Message content required' }, { status: 400 });
        }
        await db.query(
          `INSERT INTO chat_messages (session_id, sender, content, delivered, read)
           VALUES ($1, 'agent', $2, true, true)`,
          [sessionId, payload.content]
        );
        await db.query(
          `UPDATE chat_sessions 
           SET last_message = $1, last_message_at = NOW(), message_count = message_count + 1
           WHERE id = $2`,
          [payload.content, sessionId]
        );
        // Clear agent typing
        await db.query(
          `INSERT INTO typing_indicators (session_id, sender, is_typing, updated_at)
           VALUES ($1, 'agent', false, NOW())
           ON CONFLICT (session_id, sender) DO UPDATE SET is_typing = false, updated_at = NOW()`,
          [sessionId]
        );
        break;
      }

      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Admin intervene error:', err);
    return NextResponse.json({ error: 'Failed to perform action' }, { status: 500 });
  }
}

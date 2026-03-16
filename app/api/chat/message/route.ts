import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSaukiAIResponse, ChatHistoryItem } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const { sessionId, content, customerId } = await req.json();

    if (!sessionId || !content || !customerId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Fetch session
    const sessionResult = await db.query(
      `SELECT * FROM chat_sessions WHERE id = $1`,
      [sessionId]
    );

    if (!sessionResult.rows.length) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    const session = sessionResult.rows[0] as Record<string, unknown>;

    // Save customer message
    await db.query(
      `INSERT INTO chat_messages (session_id, sender, content, delivered, read)
       VALUES ($1, 'customer', $2, true, false)`,
      [sessionId, content]
    );

    // Update session last message
    await db.query(
      `UPDATE chat_sessions 
       SET last_message = $1, last_message_at = NOW(), message_count = message_count + 1
       WHERE id = $2`,
      [content, sessionId]
    );

    // Clear customer typing indicator
    await db.query(
      `INSERT INTO typing_indicators (session_id, sender, is_typing, updated_at)
       VALUES ($1, 'customer', false, NOW())
       ON CONFLICT (session_id, sender) DO UPDATE SET is_typing = false, updated_at = NOW()`,
      [sessionId]
    );

    // If agent is active or AI is escalated, don't run Gemini
    // Exception: customer types "hi sauki ai" to restart
    const isRestart = content.toLowerCase().includes('hi sauki ai');

    if (isRestart) {
      // Reset escalation flags
      await db.query(
        `UPDATE chat_sessions 
         SET agent_required = false, agent_mode = false, status = 'active'
         WHERE id = $1`,
        [sessionId]
      );
    } else if (session.agent_required || session.agent_mode) {
      // AI is silent — only agent can respond
      return NextResponse.json({ ok: true, aiSilent: true });
    }

    // Set AI typing indicator
    await db.query(
      `INSERT INTO typing_indicators (session_id, sender, is_typing, updated_at)
       VALUES ($1, 'ai', true, NOW())
       ON CONFLICT (session_id, sender) DO UPDATE SET is_typing = true, updated_at = NOW()`,
      [sessionId]
    );

    // Fetch conversation history for Gemini context
    const historyResult = await db.query<{
      sender: string;
      content: string;
    }>(
      `SELECT sender, content FROM chat_messages 
       WHERE session_id = $1 AND sender != 'agent'
       ORDER BY created_at ASC
       LIMIT 20`,
      [sessionId]
    );

    const history: ChatHistoryItem[] = historyResult.rows
      .slice(0, -1) // exclude the latest message we just inserted
      .map((msg) => ({
        role: msg.sender === 'customer' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      }));

    // Call Gemini
    const aiResult = await getSaukiAIResponse(history, content);

    // Clear AI typing indicator
    await db.query(
      `INSERT INTO typing_indicators (session_id, sender, is_typing, updated_at)
       VALUES ($1, 'ai', false, NOW())
       ON CONFLICT (session_id, sender) DO UPDATE SET is_typing = false, updated_at = NOW()`,
      [sessionId]
    );

    // Save AI response
    await db.query(
      `INSERT INTO chat_messages (session_id, sender, content, delivered, read)
       VALUES ($1, 'ai', $2, true, false)`,
      [sessionId, aiResult.text]
    );

    // Update session last message
    await db.query(
      `UPDATE chat_sessions 
       SET last_message = $1, last_message_at = NOW(), message_count = message_count + 1
       WHERE id = $2`,
      [aiResult.text, sessionId]
    );

    // Handle escalation
    if (aiResult.shouldEscalate) {
      await db.query(
        `UPDATE chat_sessions 
         SET agent_required = true, status = 'agent_required'
         WHERE id = $1`,
        [sessionId]
      );
    }

    return NextResponse.json({
      ok: true,
      escalated: aiResult.shouldEscalate,
    });
  } catch (err) {
    console.error('Message send error:', err);

    // Ensure typing indicator is cleared on error
    try {
      const { sessionId } = await req.json().catch(() => ({ sessionId: null }));
      if (sessionId) {
        await db.query(
          `UPDATE typing_indicators SET is_typing = false WHERE session_id = $1 AND sender = 'ai'`,
          [sessionId]
        );
      }
    } catch {}

    return NextResponse.json({ error: 'Failed to process message' }, { status: 500 });
  }
}

import { NextRequest } from 'next/server';
import { db } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get('sessionId');
  const lastId = req.nextUrl.searchParams.get('lastId') || null;

  if (!sessionId) {
    return new Response('sessionId required', { status: 400 });
  }

  const encoder = new TextEncoder();
  let closed = false;

  const stream = new ReadableStream({
    start(controller) {
      // Send initial ping to confirm connection
      controller.enqueue(encoder.encode('event: ping\ndata: connected\n\n'));

      let lastMessageId = lastId;

      const poll = async () => {
        if (closed) return;

        try {
          // Fetch new messages
          const messagesQuery = lastMessageId
            ? `SELECT * FROM chat_messages 
               WHERE session_id = $1 AND created_at > (
                 SELECT created_at FROM chat_messages WHERE id = $2
               )
               ORDER BY created_at ASC`
            : `SELECT * FROM chat_messages 
               WHERE session_id = $1 
               ORDER BY created_at ASC`;

          const params = lastMessageId ? [sessionId, lastMessageId] : [sessionId];
          const messages = await db.query(messagesQuery, params);

          if (messages.rows.length > 0) {
            lastMessageId = (messages.rows.at(-1) as Record<string, string>).id;
            const event = `event: messages\ndata: ${JSON.stringify(messages.rows)}\n\n`;
            controller.enqueue(encoder.encode(event));
          }

          // Fetch session state (for status banner updates)
          const session = await db.query(
            `SELECT status, agent_required, agent_mode FROM chat_sessions WHERE id = $1`,
            [sessionId]
          );
          if (session.rows.length > 0) {
            const sessionEvent = `event: session\ndata: ${JSON.stringify(session.rows[0])}\n\n`;
            controller.enqueue(encoder.encode(sessionEvent));
          }

          // Fetch typing indicators (expires after 3 seconds)
          const typing = await db.query(
            `SELECT sender, is_typing FROM typing_indicators 
             WHERE session_id = $1 AND updated_at > NOW() - INTERVAL '3 seconds'`,
            [sessionId]
          );
          const typingEvent = `event: typing\ndata: ${JSON.stringify(typing.rows)}\n\n`;
          controller.enqueue(encoder.encode(typingEvent));
        } catch (err) {
          console.error('SSE poll error:', err);
          if (!closed) controller.close();
          return;
        }

        if (!closed) setTimeout(poll, 1000);
      };

      poll();

      req.signal.addEventListener('abort', () => {
        closed = true;
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}

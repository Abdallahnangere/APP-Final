import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { verifyAdminToken } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');
  if (!token) return new Response('Forbidden', { status: 403 });
  const ok = await verifyAdminToken(token);
  if (!ok) return new Response('Forbidden', { status: 403 });

  const encoder = new TextEncoder();
  let closed = false;

  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode('event: ping\ndata: connected\n\n'));

      let lastPollTime = new Date(Date.now() - 2000).toISOString();

      const poll = async () => {
        if (closed) return;

        try {
          // Fetch all sessions with their latest state
          const sessions = await db.query(
            `SELECT 
               s.*,
               COUNT(m.id) FILTER (WHERE m.read = false AND m.sender = 'customer') AS unread_count
             FROM chat_sessions s
             LEFT JOIN chat_messages m ON m.session_id = s.id
             GROUP BY s.id
             ORDER BY 
               CASE s.status 
                 WHEN 'agent_required' THEN 1
                 WHEN 'agent_active' THEN 2
                 WHEN 'active' THEN 3
                 WHEN 'flagged' THEN 4
                 ELSE 5
               END,
               s.last_message_at DESC
             LIMIT 100`
          );

          const sessionsEvent = `event: sessions\ndata: ${JSON.stringify(sessions.rows)}\n\n`;
          controller.enqueue(encoder.encode(sessionsEvent));

          // Fetch new messages since last poll (for all sessions)
          const newMessages = await db.query(
            `SELECT * FROM chat_messages 
             WHERE created_at > $1
             ORDER BY created_at ASC`,
            [lastPollTime]
          );

          if (newMessages.rows.length > 0) {
            const msgsEvent = `event: new_messages\ndata: ${JSON.stringify(newMessages.rows)}\n\n`;
            controller.enqueue(encoder.encode(msgsEvent));
          }

          // Fetch all active typing indicators
          const typing = await db.query(
            `SELECT * FROM typing_indicators 
             WHERE is_typing = true 
             AND updated_at > NOW() - INTERVAL '3 seconds'`
          );
          if (typing.rows.length > 0) {
            const typingEvent = `event: typing\ndata: ${JSON.stringify(typing.rows)}\n\n`;
            controller.enqueue(encoder.encode(typingEvent));
          }

          lastPollTime = new Date().toISOString();
        } catch (err) {
          console.error('Admin SSE poll error:', err);
          if (!closed) controller.close();
          return;
        }

        if (!closed) setTimeout(poll, 1500);
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

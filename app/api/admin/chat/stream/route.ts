import { NextRequest } from 'next/server';
import sql from '@/lib/db';
import { verifyAdminToken } from '@/lib/auth';

async function loadSessions() {
  return sql`
    SELECT
      s.id,
      s.user_id,
      u.first_name,
      u.last_name,
      u.phone,
      s.status,
      s.agent_required,
      s.is_typing,
      s.last_activity,
      s.last_message,
      COUNT(c.id) FILTER (WHERE c.sender = 'user' AND (c.delivered_at IS NULL OR c.read_at IS NULL)) as unread_count,
      COUNT(c.id) FILTER (WHERE c.sender = 'user') as total_user_msgs
    FROM chat_sessions s
    JOIN users u ON u.id = s.user_id
    LEFT JOIN chats c ON c.session_id = s.id
    GROUP BY s.id, u.first_name, u.last_name, u.phone
    ORDER BY s.updated_at DESC
  `;
}

async function loadSessionDetails(sessionId: string) {
  const [session] = await sql`
    SELECT s.*, u.first_name, u.last_name, u.phone
    FROM chat_sessions s
    JOIN users u ON u.id = s.user_id
    WHERE s.id = ${sessionId}
    LIMIT 1
  `;

  if (!session) return null;

  const messages = await sql`
    SELECT id, sender, message, created_at, delivered_at, read_at
    FROM chats
    WHERE session_id = ${sessionId}
    ORDER BY created_at ASC
  `;

  const notes = await sql`
    SELECT id, created_by, note, created_at
    FROM chat_notes
    WHERE session_id = ${sessionId}
    ORDER BY created_at ASC
  `;

  return { session, messages, notes };
}

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');
  if (!token) return new Response('Forbidden', { status: 403 });
  const ok = await verifyAdminToken(token);
  if (!ok) return new Response('Forbidden', { status: 403 });

  const sessionId = req.nextUrl.searchParams.get('sessionId');

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(encoder.encode(`event: ${event}\n`));
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      // Initial payload
      const sessions = await loadSessions();
      send('sessions', sessions);

      if (sessionId) {
        const details = await loadSessionDetails(sessionId);
        if (details) send('session', details);
      }

      const interval = setInterval(async () => {
        try {
          const sessionsUpdate = await loadSessions();
          send('sessions', sessionsUpdate);

          if (sessionId) {
            const details = await loadSessionDetails(sessionId);
            if (details) send('session', details);
          }
        } catch (error) {
          // ignore failures
        }
      }, 2000);

      req.signal.addEventListener('abort', () => {
        clearInterval(interval);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}

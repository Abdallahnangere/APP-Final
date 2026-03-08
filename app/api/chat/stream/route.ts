import { NextRequest } from 'next/server';
import sql from '@/lib/db';
import { verifyToken } from '@/lib/auth';

function normalize(text: string) {
  return text.trim().toLowerCase();
}

async function getOrCreateSession(userId: string) {
  const [session] = await sql`
    SELECT * FROM chat_sessions
    WHERE user_id = ${userId}
    ORDER BY updated_at DESC
    LIMIT 1
  `;

  if (session) {
    await sql`
      UPDATE chat_sessions SET last_activity = NOW(), updated_at = NOW() WHERE id = ${session.id}
    `;
    return { ...session };
  }

  const [newSession] = await sql`
    INSERT INTO chat_sessions (user_id, last_activity, last_message) VALUES (${userId}, NOW(), '')
    RETURNING *
  `;
  return newSession;
}

async function fetchSessionMessages(sessionId: string, since?: Date) {
  if (since) {
    return sql`
      SELECT id, sender, message, created_at, delivered_at, read_at
      FROM chats
      WHERE session_id = ${sessionId} AND created_at > ${since}
      ORDER BY created_at ASC
    `;
  }
  return sql`
    SELECT id, sender, message, created_at, delivered_at, read_at
    FROM chats
    WHERE session_id = ${sessionId}
    ORDER BY created_at ASC
  `;
}

export async function GET(req: NextRequest) {
  // Allow token via query param for EventSource (no custom headers)
  const token = req.nextUrl.searchParams.get('token');
  if (!token) return new Response('Unauthorized', { status: 401 });

  const payload = await verifyToken(token);
  if (!payload?.userId) return new Response('Unauthorized', { status: 401 });

  const session = await getOrCreateSession(payload.userId as string);

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(encoder.encode(`event: ${event}\n`));
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      // Send initial payload
      const initialMessages = await fetchSessionMessages(session.id);
      send('init', { session, messages: initialMessages });

      let lastMessageTime = initialMessages.length
        ? new Date(initialMessages[initialMessages.length - 1].created_at)
        : new Date(0);

      const interval = setInterval(async () => {
        try {
          const [latestSession] = await sql`SELECT * FROM chat_sessions WHERE id = ${session.id}`;
          const newMessages = await fetchSessionMessages(session.id, lastMessageTime);

          if (newMessages.length) {
            lastMessageTime = new Date(newMessages[newMessages.length - 1].created_at);
            send('messages', newMessages);
          }

          if (latestSession) {
            const updatedAt = new Date(latestSession.updated_at);
            const currentAt = new Date(session.updated_at);
            if (updatedAt > currentAt) {
              Object.assign(session, latestSession);
              send('session', latestSession);
            }
          }
        } catch (error) {
          // ignore transient errors
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

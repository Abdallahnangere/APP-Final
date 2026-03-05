import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// Store active connections
const connections = new Map<string, WebSocket[]>();

export async function GET(req: NextRequest) {
  // WebSocket upgrade for real-time chat
  const upgrade = req.headers.get('upgrade');
  
  if (upgrade?.toLowerCase() !== 'websocket') {
    return NextResponse.json({ error: 'WebSocket required' }, { status: 400 });
  }

  const auth = req.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const payload = await verifyToken(auth.slice(7));
  if (!payload?.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Note: WebSocket support in Next.js requires Node.js 18+ and specific deployment setup
  // For now, we'll use Server-Sent Events as fallback
  return NextResponse.json({ 
    message: 'WebSocket endpoint. Use SSE or polling for real-time updates.' 
  });
}

// Server-Sent Events for real-time updates (fallback to WebSocket)
export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const payload = await verifyToken(auth.slice(7));
  if (!payload?.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { action, message } = await req.json();

    if (action === 'subscribe') {
      // Client subscribes to updates
      return new Response(
        new ReadableStream({
          async start(controller) {
            // Check for new messages periodically
            const checkInterval = setInterval(async () => {
              try {
                const messages = await sql`
                  SELECT id, sender, message, created_at FROM chats 
                  WHERE user_id = ${payload.userId as string}
                  ORDER BY created_at DESC LIMIT 10
                `;

                if (messages.length > 0) {
                  controller.enqueue(
                    `data: ${JSON.stringify({ type: 'messages', data: messages })}\n\n`
                  );
                }
              } catch (error) {
                console.error('SSE error:', error);
              }
            }, 2000); // Check every 2 seconds

            // Clean up on close
            return () => clearInterval(checkInterval);
          },
        }),
        {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
          },
        }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('WebSocket error:', error);
    return NextResponse.json({ error: 'WebSocket error' }, { status: 500 });
  }
}

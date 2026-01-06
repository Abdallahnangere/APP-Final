import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

type ClientsMap = Map<string, Set<WritableStreamDefaultWriter>>;

// In-memory store of SSE clients
const clients: ClientsMap = new Map();

export const GET = async (req: Request) => {
  const { searchParams } = new URL(req.url);
  const agentId = searchParams.get('agentId');

  if (!agentId) {
    return NextResponse.json({ error: 'agentId required' }, { status: 400 });
  }

  const stream = new ReadableStream({
    start(controller) {
      const writer = controller.getWriter();

      // Add this client to the map
      if (!clients.has(agentId)) clients.set(agentId, new Set());
      clients.get(agentId)?.add(writer);

      // Send initial balance immediately
      prisma.agent.findUnique({ where: { id: agentId } }).then(agent => {
        if (agent) {
          writer.write(encode(`data: ${JSON.stringify({ balance: agent.balance })}\n\n`));
        }
      });

      // Remove client when connection closes
      const interval = setInterval(() => {}, 1000); // keep stream alive
      return () => {
        clearInterval(interval);
        clients.get(agentId)?.delete(writer);
      };
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
};

// Helper to broadcast balance updates to a specific agent
export const sendBalanceUpdate = (agentId: string, balance: number) => {
  const agentClients = clients.get(agentId);
  if (!agentClients) return;

  const message = `data: ${JSON.stringify({ balance })}\n\n`;
  agentClients.forEach(writer => {
    try {
      writer.write(new TextEncoder().encode(message));
    } catch (err) {
      console.error('SSE write failed', err);
    }
  });
};

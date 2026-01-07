
import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const agentId = searchParams.get('agentId');

    if (!agentId) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    const agent = await prisma.agent.findUnique({ where: { id: agentId } });
    if (!agent) return NextResponse.json({ error: 'Agent not found' }, { status: 404 });

    // Cashback feature removed
    return NextResponse.json({ balance: agent.balance });
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching balance' }, { status: 500 });
  }
}

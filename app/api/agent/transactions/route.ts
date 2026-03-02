import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const agentId = req.nextUrl.searchParams.get('agentId');
  const phone   = req.nextUrl.searchParams.get('phone');
  const limit   = parseInt(req.nextUrl.searchParams.get('limit') || '30');
  const status  = req.nextUrl.searchParams.get('status');
  if (!agentId && !phone) return NextResponse.json({ message: 'agentId or phone required' }, { status: 400 });
  const agent = agentId
    ? { id: agentId }
    : await prisma.agent.findFirst({ where: { phone: phone! }, select: { id: true } });
  if (!agent) return NextResponse.json({ message: 'Agent not found' }, { status: 404 });
  const transactions = await prisma.transaction.findMany({
    where: { agentId: agent.id, ...(status ? { status } : {}) },
    orderBy: { createdAt: 'desc' },
    take: Math.min(limit, 200),
    include: { dataPlan: true, product: true },
  });
  return NextResponse.json({ transactions });
}

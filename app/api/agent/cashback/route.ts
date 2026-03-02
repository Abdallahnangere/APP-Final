import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const agentId = req.nextUrl.searchParams.get('agentId');
  const phone   = req.nextUrl.searchParams.get('phone');
  if (!agentId && !phone) return NextResponse.json({ message: 'agentId or phone required' }, { status: 400 });
  const agent = await prisma.agent.findFirst({
    where: agentId ? { id: agentId } : { phone: phone! },
    select: { id: true, cashbackBalance: true, totalCashbackEarned: true, cashbackRedeemed: true },
  });
  if (!agent) return NextResponse.json({ message: 'Agent not found' }, { status: 404 });
  const entries = await prisma.cashbackEntry.findMany({
    where: { agentId: agent.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
  return NextResponse.json({ cashbackBalance: agent.cashbackBalance, totalEarned: agent.totalCashbackEarned, redeemed: agent.cashbackRedeemed, entries });
}

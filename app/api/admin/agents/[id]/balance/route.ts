import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { verifyAdminPassword } from '@/lib/auth';
import { logger } from '@/lib/logger';

const Schema = z.object({ amount: z.number().positive(), type: z.enum(['credit','debit']), reason: z.string().optional() });

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  if (!verifyAdminPassword(req.headers.get('x-admin-password') || '')) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const parsed = Schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ message: 'Invalid' }, { status: 400 });
  const { amount, type, reason } = parsed.data;
  const agent = await prisma.agent.findUnique({ where: { id: params.id } });
  if (!agent) return NextResponse.json({ message: 'Agent not found' }, { status: 404 });
  if (type === 'debit' && agent.balance < amount) return NextResponse.json({ message: 'Insufficient balance' }, { status: 400 });
  const updated = await prisma.agent.update({
    where: { id: params.id },
    data: { balance: type === 'credit' ? { increment: amount } : { decrement: amount } },
    select: { balance: true, cashbackBalance: true },
  });
  logger.info('ADMIN', 'BALANCE_ADJUSTED', { agentId: params.id, type, amount, reason });
  return NextResponse.json({ success: true, agent: updated });
}

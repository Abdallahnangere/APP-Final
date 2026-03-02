import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { verifyAdminPassword } from '@/lib/auth';
import { logger } from '@/lib/logger';

const Schema = z.object({
  agentId: z.string().uuid(),
  amount: z.number().positive(),
  action: z.enum(['credit','debit']),
  password: z.string(),
  reason: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ message: 'Invalid' }, { status: 400 });
  if (!verifyAdminPassword(parsed.data.password)) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const { agentId, amount, action } = parsed.data;
  const agent = await prisma.agent.findUnique({ where: { id: agentId } });
  if (!agent) return NextResponse.json({ message: 'Agent not found' }, { status: 404 });
  if (action === 'debit' && agent.balance < amount) return NextResponse.json({ message: 'Insufficient balance' }, { status: 400 });
  const updated = await prisma.agent.update({
    where: { id: agentId },
    data: { balance: action === 'credit' ? { increment: amount } : { decrement: amount } },
  });
  logger.info('ADMIN', 'AGENT_FUND', { agentId, action, amount });
  return NextResponse.json({ success: true, newBalance: updated.balance });
}

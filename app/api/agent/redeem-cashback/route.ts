// app/api/agent/redeem-cashback/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { verifyPin, generateTxRef } from '@/lib/auth';
import { logger } from '@/lib/logger';

const Schema = z.object({
  agentPhone: z.string().regex(/^[0-9]{10,11}$/),
  pin: z.string().regex(/^[0-9]{4}$/),
  amount: z.number().positive(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = Schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ message: 'Invalid request' }, { status: 400 });

    const { agentPhone, pin, amount } = parsed.data;

    const agent = await prisma.agent.findUnique({ where: { phone: agentPhone } });
    if (!agent) return NextResponse.json({ message: 'Agent not found' }, { status: 404 });

    const pinValid = await verifyPin(pin, agent.pin);
    if (!pinValid) return NextResponse.json({ message: 'Invalid PIN' }, { status: 401 });

    if (agent.cashbackBalance < amount) {
      return NextResponse.json({ message: `Insufficient cashback. Available: ₦${agent.cashbackBalance.toFixed(2)}` }, { status: 400 });
    }

    const tx_ref = generateTxRef('WALLET');

    await prisma.$transaction([
      prisma.agent.update({
        where: { id: agent.id },
        data: {
          cashbackBalance: { decrement: amount },
          balance: { increment: amount },
          cashbackRedeemed: { increment: amount },
        },
      }),
      prisma.cashbackEntry.create({
        data: {
          agentId: agent.id,
          type: 'redeemed',
          amount,
          description: `Redeemed to wallet — ${tx_ref}`,
        },
      }),
      prisma.transaction.create({
        data: {
          tx_ref,
          type: 'wallet_funding',
          status: 'delivered',
          phone: agentPhone,
          amount,
          agentId: agent.id,
          cashbackProcessed: true,
        },
      }),
    ]);

    logger.info('CASHBACK', 'REDEEMED', { phone: agentPhone, amount });

    const updated = await prisma.agent.findUnique({
      where: { id: agent.id },
      select: { balance: true, cashbackBalance: true, cashbackRedeemed: true },
    });

    return NextResponse.json({ success: true, agent: updated, amountRedeemed: amount });
  } catch (err: any) {
    return NextResponse.json({ message: 'Redemption failed', error: err.message }, { status: 500 });
  }
}

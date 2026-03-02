// app/api/data/initiate-payment/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { initiateBankTransfer } from '@/lib/flutterwave';
import { generateTxRef } from '@/lib/auth';
import { logger } from '@/lib/logger';

const Schema = z.object({
  planId: z.string().uuid(),
  phone: z.string().regex(/^[0-9]{10,11}$/),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = Schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ message: 'Invalid request', errors: parsed.error.errors }, { status: 400 });

    const { planId, phone } = parsed.data;

    const plan = await prisma.dataPlan.findUnique({ where: { id: planId } });
    if (!plan) return NextResponse.json({ message: 'Data plan not found' }, { status: 404 });

    const tx_ref = generateTxRef('DATA');

    // Create pending transaction
    await prisma.transaction.create({
      data: {
        tx_ref,
        type: 'data',
        status: 'pending',
        phone,
        amount: plan.price,
        planId: plan.id,
        idempotencyKey: tx_ref,
      },
    });

    // Initiate Flutterwave bank transfer
    const flwResponse = await initiateBankTransfer({
      tx_ref,
      amount: plan.price,
      phone,
      narration: `${plan.network} ${plan.data} Data`,
      meta: { consumer_id: phone, plan_id: planId },
    });

    if (flwResponse?.status !== 'success') {
      await prisma.transaction.update({ where: { tx_ref }, data: { status: 'failed' } });
      return NextResponse.json({ message: 'Payment initiation failed' }, { status: 502 });
    }

    const auth = flwResponse.data?.meta?.authorization || {};
    logger.info('PAYMENT', 'PAYMENT_INITIATED', { tx_ref, phone, amount: plan.price });

    return NextResponse.json({
      success: true,
      tx_ref,
      bank: auth.transfer_bank,
      account_number: auth.transfer_account,
      account_name: 'SAUKI MART FLW',
      amount: plan.price,
      note: auth.transfer_note,
      plan: { network: plan.network, data: plan.data, validity: plan.validity },
    });
  } catch (err: any) {
    logger.error('PAYMENT', 'INITIATE_ERROR', { error: err.message });
    return NextResponse.json({ message: 'Payment initiation failed', error: err.message }, { status: 500 });
  }
}

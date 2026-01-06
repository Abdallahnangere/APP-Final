import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { callAmigoAPI, AMIGO_NETWORKS } from '../../../../lib/amigo';

export async function POST(req: Request) {
  const secret = process.env.FLUTTERWAVE_WEBHOOK_SECRET;
  const signature = req.headers.get('verif-hash');

  if (!secret || signature !== secret) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const event = body.event;
    const payload = body.data || body;

    if (!event || !event.toLowerCase().includes('completed')) {
      return NextResponse.json({ received: true });
    }

    const status = payload.status?.toLowerCase();
    if (!['successful', 'completed', 'success'].includes(status)) {
      return NextResponse.json({ received: true });
    }

    const flutterwaveId = Number(payload.id);
    if (!flutterwaveId) {
      console.error('[Webhook] ❌ Missing Flutterwave ID');
      return NextResponse.json({ received: true });
    }

    const amount = Number(payload.settlement_amount || payload.amount);
    if (amount <= 0) return NextResponse.json({ received: true });

    const account_number =
      payload.account_number ||
      payload.account?.account_number ||
      payload.destination?.account_number ||
      null;

    const reference =
      payload.tx_ref ||
      payload.txRef ||
      payload.reference ||
      flutterwaveId.toString();

    console.log(
      `[Webhook] 🔔 ${event} | ₦${amount} | Acc:${account_number ?? 'N/A'} | FLW_ID:${flutterwaveId}`
    );

    // ===================================================================
    // PATH 1 — WALLET FUNDING (VIRTUAL ACCOUNT)
    // ===================================================================
    if (account_number) {
      const agent = await prisma.agent.findFirst({
        where: { flwAccountNumber: String(account_number) }
      });

      if (!agent) {
        console.error(`[Webhook] 🚨 Unclaimed deposit for ${account_number}`);
        return NextResponse.json({ received: true });
      }

      const existing = await prisma.transaction.findUnique({
        where: { flutterwaveId }
      });

      if (existing) {
        console.log(`[Webhook] ♻️ Duplicate FLW_ID ${flutterwaveId}`);
        return NextResponse.json({ received: true });
      }

      await prisma.$transaction(async (tx) => {
        const freshAgent = await tx.agent.findUnique({
          where: { id: agent.id }
        });

        if (!freshAgent) throw new Error('Agent disappeared');

        const balanceBefore = freshAgent.balance;
        const balanceAfter = balanceBefore + amount;

        await tx.agent.update({
          where: { id: agent.id },
          data: { balance: balanceAfter }
        });

        await tx.walletLedger.create({
          data: {
            agentId: agent.id,
            direction: 'CREDIT',
            amount,
            balanceBefore,
            balanceAfter,
            reference,
            source: 'FLUTTERWAVE_VIRTUAL_ACCOUNT'
          }
        });

        await tx.transaction.create({
          data: {
            tx_ref: reference,
            flutterwaveId,
            type: 'wallet_funding',
            status: 'delivered',
            phone: agent.phone,
            amount,
            agentId: agent.id,
            paymentData: payload,
            idempotencyKey: `FLW-${flutterwaveId}`
          }
        });
      });

      return NextResponse.json({ received: true });
    }

    // ===================================================================
    // PATH 2 — CHECKOUT / DATA PURCHASE
    // ===================================================================
    const transaction = await prisma.transaction.findUnique({
      where: { tx_ref: reference }
    });

    if (!transaction) {
      return NextResponse.json({ received: true });
    }

    if (transaction.status === 'delivered') {
      return NextResponse.json({ received: true });
    }

    await prisma.transaction.update({
      where: { id: transaction.id },
      data: {
        status: 'paid',
        flutterwaveId,
        paymentData: payload
      }
    });

    if (transaction.type === 'data' && transaction.planId) {
      const plan = await prisma.dataPlan.findUnique({
        where: { id: transaction.planId }
      });

      if (plan) {
        const amigoRes = await callAmigoAPI(
          '/data/',
          {
            network: AMIGO_NETWORKS[plan.network],
            mobile_number: transaction.phone,
            plan: Number(plan.planId),
            Ported_number: true
          },
          reference
        );

        const success =
          amigoRes?.success &&
          ['successful', 'delivered'].includes(
            amigoRes.data?.status || amigoRes.data?.Status
          );

        if (success) {
          await prisma.transaction.update({
            where: { id: transaction.id },
            data: {
              status: 'delivered',
              deliveryData: amigoRes.data
            }
          });
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('[Webhook] 🔥 Fatal Error', err);
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}

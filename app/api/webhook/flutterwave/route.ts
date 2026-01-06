import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { callAmigoAPI, AMIGO_NETWORKS } from '../../../../lib/amigo';

export async function POST(req: Request) {
  const secret = process.env.FLUTTERWAVE_WEBHOOK_SECRET;
  const signature = req.headers.get('verif-hash');

  // 1️⃣ Validate signature
  if (secret && signature !== secret) {
    console.warn('[Webhook] ❌ Invalid signature', { secret, signature });
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  try {
    const body = await req.json();

    // 2️⃣ Log incoming webhook for debugging
    try {
      await prisma.webhookLog.create({ data: { source: 'flutterwave', payload: body as any } });

      // Auto-clean old logs (>50)
      const count = await prisma.webhookLog.count();
      if (count > 50) {
        const oldLogs = await prisma.webhookLog.findMany({
          orderBy: { createdAt: 'desc' },
          skip: 50,
          select: { id: true }
        });
        if (oldLogs.length > 0) {
          await prisma.webhookLog.deleteMany({ where: { id: { in: oldLogs.map(l => l.id) } } });
        }
      }
    } catch (e) {
      console.error("[Webhook] Logging failed", e);
    }

    // 3️⃣ Extract variables
    const payload = body.data || body;

    // Broad search for account number (multiple formats)
    const accountNumber =
      payload.account_number ||
      payload.account?.account_number ||
      payload.customer?.account_number ||
      payload.entity?.account_number;

    const status = (payload.status || '').toLowerCase();
    const reference = payload.txRef || payload.tx_ref || payload.reference || payload.flwRef || String(payload.id);
    const amount = payload.amount; // keep original type (number or decimal)

    console.log(`[Webhook] Processing Ref: ${reference}, Acc: ${accountNumber}, Status: ${status}, Amount: ${amount}`);

    // Relaxed status check
    const isSuccessful = ['successful', 'completed', 'success'].includes(status) || (payload.charge_type === 'bank_transfer' && amount > 0);
    if (!isSuccessful) return NextResponse.json({ received: true });

    // 4️⃣ CASE 1: Wallet Funding for Agents
    if (accountNumber) {
      const agent = await prisma.agent.findFirst({ where: { flwAccountNumber: accountNumber } });

      if (agent) {
        // Prevent duplicate funding
        const existingTx = await prisma.transaction.findFirst({ where: { tx_ref: reference } });
        if (existingTx) {
          console.log(`[Webhook] Duplicate funding prevented for Ref: ${reference}`);
          return NextResponse.json({ received: true });
        }

        console.log(`[Webhook] 🏦 Crediting Agent ${agent.phone} +${amount}`);

        // Atomic transaction: Credit balance + log transaction
        await prisma.$transaction([
          prisma.agent.update({
            where: { id: agent.id },
            data: { balance: { increment: amount } } // keep Decimal as-is
          }),
          prisma.transaction.create({
            data: {
              tx_ref: reference,
              type: 'wallet_funding',
              status: 'delivered',
              phone: agent.phone,
              amount: amount,
              agentId: agent.id,
              paymentData: payload as any,
              deliveryData: { method: 'Virtual Account Deposit', flw_id: payload.id }
            }
          })
        ]);

        console.log(`[Webhook] ✅ Wallet funded for Agent ${agent.id}`);
        return NextResponse.json({ received: true });
      }
    }

    // 5️⃣ CASE 2: Regular E-commerce / Data
    const transaction = await prisma.transaction.findFirst({ where: { tx_ref: reference } });
    if (!transaction) return NextResponse.json({ error: 'Tx not found' }, { status: 200 });
    if (['delivered', 'paid'].includes(transaction.status)) return NextResponse.json({ received: true });

    await prisma.transaction.update({ where: { id: transaction.id }, data: { status: 'paid', paymentData: payload as any } });

    // Auto-Fulfillment for Data Plans
    if (transaction.type === 'data' && transaction.planId) {
      const plan = await prisma.dataPlan.findUnique({ where: { id: transaction.planId } });

      if (plan) {
        const amigoRes = await callAmigoAPI(
          '/data/',
          { network: AMIGO_NETWORKS[plan.network], mobile_number: transaction.phone, plan: Number(plan.planId), Ported_number: true },
          reference
        );

        const isAmigoSuccess =
          amigoRes.success &&
          ['successful', 'delivered'].includes(amigoRes.data?.status || amigoRes.data?.Status) ||
          amigoRes.data?.success === true;

        if (isAmigoSuccess) {
          await prisma.transaction.update({ where: { id: transaction.id }, data: { status: 'delivered', deliveryData: amigoRes.data } });
          console.log(`[Webhook] ✅ Data delivered for Tx: ${transaction.id}`);
        } else {
          await prisma.transaction.update({ where: { id: transaction.id }, data: { deliveryData: { error: 'Auto-delivery failed', response: amigoRes.data } } });
          console.warn(`[Webhook] ⚠️ Auto-delivery failed for Tx: ${transaction.id}`);
        }
      }
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('[Webhook] 🔥 Error', error);
    return NextResponse.json({ error: 'Internal Error' }, { status: 200 });
  }
            }

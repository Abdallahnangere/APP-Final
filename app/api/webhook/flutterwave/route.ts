
import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { callAmigoAPI, AMIGO_NETWORKS } from '../../../../lib/amigo';

export async function POST(req: Request) {
  const secret = process.env.FLUTTERWAVE_WEBHOOK_SECRET;
  const signature = req.headers.get('verif-hash');

  if (secret && signature !== secret) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const payload = body.data || body; 
    const { status, account_number, amount } = payload; 
    const reference = payload.txRef || payload.tx_ref || payload.reference; 

    console.log(`[Webhook] 🔔 Received event. Status: ${status}, Acc: ${account_number}`);

    if (status !== 'successful' && status !== 'completed') {
        return NextResponse.json({ received: true });
    }

    // CASE 1: AGENT FUNDING (Virtual Account Deposit)
    // Detected by the presence of 'account_number' which FLW sends for virtual account credits
    if (account_number) {
        const agent = await prisma.agent.findFirst({
            where: { flwAccountNumber: account_number }
        });

        if (agent) {
            // 1. Idempotency Check: Prevent Double Crediting
            // If FLW sends the webhook twice, we must not credit the agent twice.
            const existingTx = await prisma.transaction.findFirst({
                where: { tx_ref: reference }
            });

            if (existingTx) {
                console.log(`[Webhook] 🛑 Duplicate funding event ignored: ${reference}`);
                return NextResponse.json({ received: true });
            }

            console.log(`[Webhook] 🏦 Funding Agent ${agent.phone} with ${amount}`);

            // 2. Atomic Transaction: Ensure Balance Update AND History Log happen together
            // If one fails, both fail. This prevents "Ghost Money" (balance update without record).
            await prisma.$transaction([
                prisma.agent.update({
                    where: { id: agent.id },
                    data: { balance: { increment: Number(amount) } }
                }),
                prisma.transaction.create({
                    data: {
                        tx_ref: reference || `FUND-${Date.now()}`,
                        type: 'wallet_funding', // Specific type for accounting
                        status: 'delivered',
                        phone: agent.phone,
                        amount: Number(amount),
                        agentId: agent.id,
                        paymentData: payload,
                        deliveryData: { method: 'Virtual Account Deposit' }
                    }
                })
            ]);

            return NextResponse.json({ received: true });
        }
    }

    // CASE 2: REGULAR PAYMENT (Ecommerce or Direct Data)
    const transaction = await prisma.transaction.findFirst({ 
        where: { tx_ref: reference } 
    });
    
    if (!transaction) {
        // If not found, it might be a funding event for a non-agent or untracked.
        // We return 200 to stop FLW from retrying indefinitely.
        return NextResponse.json({ error: 'Tx not found' }, { status: 200 });
    }

    if (transaction.status === 'delivered') {
        return NextResponse.json({ received: true });
    }

    // Mark as paid if not already
    if (transaction.status !== 'paid') {
        await prisma.transaction.update({
            where: { id: transaction.id },
            data: { 
                status: 'paid',
                paymentData: payload
            }
        });
    }

    // Auto-Fulfillment for Data Plans
    if (transaction.type === 'data' && transaction.planId) {
         const plan = await prisma.dataPlan.findUnique({ where: { id: transaction.planId } });
         
         if (plan) {
             const networkId = AMIGO_NETWORKS[plan.network];
             const amigoPayload = {
                 network: networkId,
                 mobile_number: transaction.phone,
                 plan: Number(plan.planId),
                 Ported_number: true
             };

             // Call Amigo API
             const amigoRes = await callAmigoAPI('/data/', amigoPayload, reference);
             
             // Check Amigo Response strictly
             const isSuccess = amigoRes.success && (
                amigoRes.data.success === true || 
                amigoRes.data.Status === 'successful' ||
                amigoRes.data.status === 'delivered' ||
                amigoRes.data.status === 'successful'
             );

             if (isSuccess) {
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

  } catch (error) {
      console.error('[Webhook] 🔥 Error', error);
      return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}

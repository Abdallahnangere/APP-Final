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

    // Destructure key fields
    const status = payload.status;
    const amount = Number(payload.amount);
    
    // Normalize Account Number: Ensure it is a String for comparison
    const account_number = payload.account_number ? String(payload.account_number) : null;
    
    // Get the Reference (FLW sends 'txRef' or 'tx_ref')
    const reference = payload.txRef || payload.tx_ref || payload.reference || payload.id?.toString();

    console.log(`[Webhook] 🔔 Event: ${status} | Amt: ${amount} | Acc: ${account_number} | Ref: ${reference}`);

    if (status !== 'successful' && status !== 'completed') {
        return NextResponse.json({ received: true });
    }

    // ==================================================================
    // PATH 1: WALLET FUNDING (Virtual Account Deposit)
    // Identified by the presence of 'account_number' in the payload
    // ==================================================================
    if (account_number) {
        // 1. Find the Agent who owns this Virtual Account
        const agent = await prisma.agent.findFirst({
            where: { flwAccountNumber: account_number }
        });

        if (!agent) {
            // Money received, but we don't know who owns this account number.
            // We return 200 to stop FLW from retrying, but we log strictly.
            console.error(`[Webhook] 🚨 UNCLAIMED DEPOSIT: No agent found for Account ${account_number}`);
            return NextResponse.json({ received: true }); 
        }

        // 2. Idempotency Check: Did we already credit this specific transaction ID?
        // We check if a transaction with this 'tx_ref' already exists.
        const existingTx = await prisma.transaction.findUnique({
            where: { tx_ref: reference }
        });

        if (existingTx) {
            console.log(`[Webhook] ♻️ Duplicate webhook for ref ${reference}. Already processed.`);
            return NextResponse.json({ received: true });
        }

        console.log(`[Webhook] 💰 Crediting Agent ${agent.phone} (+${amount})`);

        // 3. Process the Credit (Atomic Update)
        // We create the Transaction Record AND Update Balance simultaneously.
        await prisma.$transaction([
            // A. Update Agent Balance
            prisma.agent.update({
                where: { id: agent.id },
                data: { balance: { increment: amount } }
            }),
            // B. Create the Transaction Record (So we have history)
            prisma.transaction.create({
                data: {
                    tx_ref: reference,
                    type: 'wallet_funding',
                    status: 'delivered', // Delivered because money is in wallet
                    phone: agent.phone,
                    amount: amount,
                    agentId: agent.id,
                    paymentData: payload as any, // Save full webhook data for audit
                    deliveryData: { method: 'Virtual Account Deposit' },
                    idempotencyKey: reference // Ensure DB constraint prevents duplicates
                }
            })
        ]);

        return NextResponse.json({ received: true });
    }

    // ==================================================================
    // PATH 2: CHECKOUT / DATA PURCHASE (Initiated by App)
    // Identified by MISSING 'account_number' (Standard Checkout)
    // ==================================================================
    
    // In this case, the transaction MUST already exist in our DB (status: pending)
    const transaction = await prisma.transaction.findUnique({ 
        where: { tx_ref: reference } 
    });
    
    if (!transaction) {
        // This is rare. Could be a test webhook or a manual transfer we don't track.
        console.log(`[Webhook] ❓ Ref ${reference} not found in DB. Skipping.`);
        return NextResponse.json({ error: 'Tx not found' }, { status: 200 });
    }

    if (transaction.status === 'delivered' || transaction.status === 'paid') {
        return NextResponse.json({ received: true });
    }

    // Mark as paid
    if (transaction.status !== 'paid') {
        await prisma.transaction.update({
            where: { id: transaction.id },
            data: { 
                status: 'paid',
                paymentData: payload as any
            }
        });
    }

    // Trigger Auto-Fulfillment (e.g. Data Dispense)
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

             const amigoRes = await callAmigoAPI('/data/', amigoPayload, reference);
             
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
      console.error('[Webhook] 🔥 Error:', error);
      return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}

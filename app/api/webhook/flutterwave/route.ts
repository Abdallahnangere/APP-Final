
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
    
    // 1. DATA EXTRACTION
    const payload = body.data || body;
    
    // Log for debugging
    try {
        await prisma.webhookLog.create({
            data: { source: 'flutterwave', payload: body as any }
        });
        
        // Auto-clean old logs
        const count = await prisma.webhookLog.count();
        if (count > 50) {
            const oldLogs = await prisma.webhookLog.findMany({
                orderBy: { createdAt: 'desc' },
                skip: 50,
                select: { id: true }
            });
            if (oldLogs.length > 0) {
                await prisma.webhookLog.deleteMany({
                    where: { id: { in: oldLogs.map(l => l.id) } }
                });
            }
        }
    } catch (e) { console.error("Logging failed", e); }

    // 2. PARSING VARIABLES
    // Broad search for account number
    const accountNumber = payload.account_number || 
                          payload.account?.account_number || 
                          payload.customer?.account_number ||
                          payload.entity?.account_number; 

    const status = (payload.status || '').toLowerCase();
    
    // Reference fallback
    const reference = payload.txRef || payload.tx_ref || payload.reference || payload.flwRef || String(payload.id);
    const amount = Number(payload.amount);

    console.log(`[Webhook] Processing Ref: ${reference}, Acc: ${accountNumber}, Status: ${status}`);

    // Relaxed Status Check
    const isSuccessful = status === 'successful' || status === 'completed' || status === 'success' || (payload.charge_type === 'bank_transfer' && amount > 0);

    if (!isSuccessful) {
        return NextResponse.json({ received: true });
    }

    // CASE 1: AGENT FUNDING
    if (accountNumber) {
        const agent = await prisma.agent.findFirst({
            where: { flwAccountNumber: accountNumber }
        });

        if (agent) {
            // Check if we already credited this specific reference
            const existingTx = await prisma.transaction.findFirst({
                where: { tx_ref: reference }
            });

            if (existingTx) {
                console.log(`[Webhook] Duplicate funding prevented for Ref: ${reference}`);
                return NextResponse.json({ received: true });
            }

            console.log(`[Webhook] 🏦 Crediting Agent ${agent.phone} +${amount}`);

            // Atomic Transaction: Credit Balance + Log Transaction
            await prisma.$transaction([
                prisma.agent.update({
                    where: { id: agent.id },
                    data: { balance: { increment: amount } }
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

            return NextResponse.json({ received: true });
        }
    }

    // CASE 2: REGULAR E-COMMERCE / DATA
    const transaction = await prisma.transaction.findFirst({ 
        where: { tx_ref: reference } 
    });
    
    if (!transaction) {
        return NextResponse.json({ error: 'Tx not found' }, { status: 200 });
    }

    if (transaction.status === 'delivered' || transaction.status === 'paid') {
        return NextResponse.json({ received: true });
    }

    await prisma.transaction.update({
        where: { id: transaction.id },
        data: { 
            status: 'paid',
            paymentData: payload as any
        }
    });

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

             const amigoRes = await callAmigoAPI('/data/', amigoPayload, reference);
             
             const isAmigoSuccess = amigoRes.success && (
                amigoRes.data.success === true || 
                amigoRes.data.Status === 'successful' ||
                amigoRes.data.status === 'delivered' ||
                amigoRes.data.status === 'successful'
             );

             if (isAmigoSuccess) {
                 await prisma.transaction.update({
                     where: { id: transaction.id },
                     data: { 
                         status: 'delivered', 
                         deliveryData: amigoRes.data 
                     }
                 });
             } else {
                 await prisma.transaction.update({
                    where: { id: transaction.id },
                    data: {
                        deliveryData: { error: 'Auto-delivery failed', response: amigoRes.data }
                    }
                 });
             }
         }
    }

    return NextResponse.json({ received: true });

  } catch (error) {
      console.error('[Webhook] 🔥 Error', error);
      return NextResponse.json({ error: 'Internal Error' }, { status: 200 });
  }
}

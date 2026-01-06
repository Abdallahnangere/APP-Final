
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
    const eventType = body['event.type'] || body.event; // e.g., BANK_TRANSFER_TRANSACTION

    // Log for debugging
    try {
        await prisma.webhookLog.create({
            data: { source: 'flutterwave', payload: body as any }
        });
    } catch (e) { console.error("Logging failed", e); }

    // 2. PARSING CRITICAL VARIABLES
    const status = (payload.status || '').toLowerCase();
    const amount = Number(payload.amount);
    
    // Webhook Phone (Crucial for identifying agent)
    const customerPhone = payload.customer?.phone_number || payload.phone_number;

    // Webhook ID (Crucial for Uniqueness)
    const flwId = String(payload.id); 

    // Incoming Reference
    const incomingRef = payload.txRef || payload.tx_ref || payload.reference;

    console.log(`[Webhook] ID: ${flwId} | Ref: ${incomingRef} | Phone: ${customerPhone} | Status: ${status}`);

    // 3. SUCCESS CHECK
    const isSuccessful = status === 'successful' || status === 'completed' || status === 'success' || (payload.charge_type === 'bank_transfer' && amount > 0);

    if (!isSuccessful) {
        return NextResponse.json({ received: true });
    }

    // ==========================================================
    // CASE 1: AGENT WALLET FUNDING (Detected via Phone Number)
    // ==========================================================
    if (customerPhone) {
        // Find Agent by Phone
        const agent = await prisma.agent.findUnique({
            where: { phone: customerPhone }
        });

        if (agent) {
            console.log(`[Webhook] Found Agent: ${agent.firstName} (${agent.phone})`);

            // IDEMPOTENCY CHECK
            // We create a custom unique ref using the FLW ID to ensure we never credit the same transfer twice.
            // Even if FLW sends "AGENT-REG-..." multiple times, the 'id' (1954048149) will differ for each actual transfer.
            const uniqueFundingRef = `FUND-${flwId}`;

            const existingTx = await prisma.transaction.findUnique({
                where: { tx_ref: uniqueFundingRef }
            });

            if (existingTx) {
                console.log(`[Webhook] Duplicate funding prevented. Ref: ${uniqueFundingRef} already processed.`);
                return NextResponse.json({ received: true });
            }

            console.log(`[Webhook] 🏦 Crediting Agent ${agent.phone} +${amount}`);

            // ATOMIC UPDATE: Credit Balance + Record Transaction
            await prisma.$transaction([
                prisma.agent.update({
                    where: { id: agent.id },
                    data: { balance: { increment: amount } }
                }),
                prisma.transaction.create({
                    data: {
                        tx_ref: uniqueFundingRef,  // Use our safe unique ID
                        type: 'wallet_funding',
                        status: 'delivered', // Delivered means money is in wallet
                        phone: agent.phone,
                        amount: amount,
                        agentId: agent.id,
                        paymentData: payload as any,
                        deliveryData: { 
                            method: 'Virtual Account Deposit', 
                            original_flw_ref: incomingRef, // Keep the original AGENT-REG ref for records
                            flw_id: flwId,
                            sender: payload.customer?.name
                        }
                    }
                })
            ]);

            return NextResponse.json({ received: true });
        }
    }

    // ==========================================================
    // CASE 2: REGULAR E-COMMERCE / DATA (Identified by unique tx_ref)
    // ==========================================================
    // Only proceed if we have a valid unique reference that isn't the AGENT-REG one
    if (incomingRef && !incomingRef.startsWith('FUND-')) {
        const transaction = await prisma.transaction.findUnique({ 
            where: { tx_ref: incomingRef } 
        });
        
        if (transaction) {
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

                    const amigoRes = await callAmigoAPI('/data/', amigoPayload, incomingRef);
                    
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
        }
    }

    return NextResponse.json({ received: true });

  } catch (error) {
      console.error('[Webhook] 🔥 Critical Error', error);
      return NextResponse.json({ error: 'Internal Error' }, { status: 200 });
  }
}

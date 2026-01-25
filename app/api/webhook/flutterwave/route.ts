
import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { callAmigoAPI, AMIGO_NETWORKS } from '../../../../lib/amigo';
import { Prisma } from '@prisma/client';

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
    } catch (e) { console.error("Logging failed", e); }

    const status = (payload.status || '').toLowerCase();
    const amount = Number(payload.amount);
    const customerPhone = payload.customer?.phone_number || payload.phone_number;
    const flwId = String(payload.id); 
    const incomingRef = payload.txRef || payload.tx_ref || payload.reference;

    console.log(`[Webhook] ID: ${flwId} | Ref: ${incomingRef} | Phone: ${customerPhone} | Status: ${status}`);

    // 3. SUCCESS CHECK
    const isSuccessful = status === 'successful' || status === 'completed' || status === 'success' || amount > 0;

    if (!isSuccessful) {
        return NextResponse.json({ received: true });
    }

    // ==========================================================
    // CASE 1: AGENT WALLET FUNDING
    // ==========================================================
    if (customerPhone) {
        const agent = await prisma.agent.findUnique({ where: { phone: customerPhone } });

        if (agent) {
            const uniqueFundingRef = `FUND-${flwId}`;
            const existingTx = await prisma.transaction.findUnique({ where: { tx_ref: uniqueFundingRef } });

            if (existingTx) return NextResponse.json({ received: true });

            await prisma.$transaction([
                prisma.agent.update({
                    where: { id: agent.id },
                    data: { balance: { increment: amount } }
                }),
                prisma.transaction.create({
                    data: {
                        tx_ref: uniqueFundingRef,
                        type: 'wallet_funding',
                        status: 'delivered',
                        phone: agent.phone,
                        amount: amount,
                        agentId: agent.id,
                        paymentData: payload as any,
                        deliveryData: { 
                            method: 'Virtual Account Deposit', 
                            original_flw_ref: incomingRef,
                            flw_id: flwId
                        }
                    }
                })
            ]);
            return NextResponse.json({ received: true });
        }
    }

    // ==========================================================
    // CASE 2: REGULAR E-COMMERCE / DATA
    // ==========================================================
    if (incomingRef && !incomingRef.startsWith('FUND-')) {
        const transaction = await prisma.transaction.findUnique({ where: { tx_ref: incomingRef } });
        
        if (transaction) {
            // Idempotency check: if already paid or delivered, skip processing
            if (transaction.status === 'delivered' || transaction.status === 'paid') {
                console.log(`[Webhook] Idempotent skip - transaction ${incomingRef} already ${transaction.status}`);
                return NextResponse.json({ received: true });
            }
            
            // Mark as Paid if not already
            await prisma.transaction.update({
                where: { id: transaction.id },
                data: { status: 'paid', paymentData: payload as any }
            });

            // IDEMPOTENCY / LOCKING LOGIC FOR DATA
            if (transaction.type === 'data' && transaction.planId) {
                
                // Attempt to acquire lock. 
                // This ensures if User clicked "Verify" at the same time, only one wins.
                const lockResult = await prisma.transaction.updateMany({
                    where: { 
                        id: transaction.id,
                        OR: [
                            { deliveryData: { equals: Prisma.DbNull } },
                            { deliveryData: { equals: Prisma.JsonNull } }
                        ]
                    },
                    data: { 
                        deliveryData: { status: 'processing', source: 'webhook' } 
                    }
                });

                if (lockResult.count > 0) {
                    // WE WON THE LOCK. CALL AMIGO AND DELIVER AUTOMATICALLY.
                    console.log(`[Webhook] Processing auto-delivery for ${incomingRef}`);
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
                            console.log(`[Webhook] Successfully delivered ${incomingRef}`);
                        } else {
                            await prisma.transaction.update({
                                where: { id: transaction.id },
                                data: {
                                    status: 'failed',
                                    deliveryData: { error: 'Auto-delivery failed', response: amigoRes.data }
                                }
                            });
                            console.log(`[Webhook] Auto-delivery failed for ${incomingRef}: ${amigoRes.data}`);
                        }
                    }
                } else {
                    console.log(`[Webhook] Another process already handling ${incomingRef}, skipping lock acquisition.`);
                }
            } else if (transaction.type === 'ecommerce') {
                // E-COMMERCE: Mark as delivered (customer data delivery happens via admin verification)
                await prisma.transaction.update({
                    where: { id: transaction.id },
                    data: { 
                        status: 'delivered',
                        deliveryData: { 
                            ...((transaction.deliveryData as object) || {}),
                            webhook_processed: true,
                            processed_at: new Date().toISOString()
                        }
                    }
                });
                console.log(`[Webhook] E-commerce transaction ${incomingRef} marked delivered`);
            }
        }
    }

    return NextResponse.json({ received: true });

  } catch (error) {
      console.error('[Webhook] Error', error);
      return NextResponse.json({ error: 'Internal Error' }, { status: 200 });
  }
}

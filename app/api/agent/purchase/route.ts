
import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { v4 as uuidv4 } from 'uuid';
import { callAmigoAPI, AMIGO_NETWORKS } from '../../../../lib/amigo';
import { verifyPin } from '../../../../lib/security';
import { AgentPurchaseSchema, validateRequestBody } from '../../../../lib/validation';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validate request body against schema
    const validation = await validateRequestBody(body, AgentPurchaseSchema);
    if (!validation.valid) {
      const errors = validation.errors.errors.map(e => `${e.path.join('.')}: ${e.message}`);
      return NextResponse.json({ error: 'Validation failed', details: errors }, { status: 400 });
    }

    const { agentId, agentPin, type, payload } = validation.data;

    // 1. Verify Agent & PIN
    const agent = await prisma.agent.findUnique({ where: { id: agentId } });
    if (!agent) {
        return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    // Verify PIN against hash
    const isPinValid = await verifyPin(agentPin, agent.pin);
    if (!isPinValid) {
        console.error(`[PIN VERIFICATION FAILED] Agent: ${agentId}, Input PIN length: ${agentPin.length}, Stored hash length: ${agent.pin.length}`);
        return NextResponse.json({ error: 'Invalid PIN. Please check and try again.' }, { status: 401 });
    }

    if (!agent.isActive) return NextResponse.json({ error: 'Agent Account Suspended' }, { status: 403 });

    let amount = 0;
    let description = '';
    let productDetails: any = {};

    // 2. Calculate Amount
    if (type === 'data' && payload?.planId) {
        const plan = await prisma.dataPlan.findUnique({ where: { id: payload.planId } });
        if (!plan) return NextResponse.json({ error: 'Invalid Plan' }, { status: 400 });
        amount = plan.price;
        description = `Data: ${plan.network} ${plan.data}`;
        productDetails = { planId: plan.id };
    } else if (type === 'ecommerce' && payload?.productId) {
        const product = await prisma.product.findUnique({ where: { id: payload.productId } });
        if (!product) return NextResponse.json({ error: 'Invalid Product' }, { status: 400 });
        amount = product.price;
        description = product.name;
        productDetails = { productId: product.id };
        
        if (payload.simId) {
            const sim = await prisma.product.findUnique({ where: { id: payload.simId } });
            if (sim) {
                amount += sim.price;
                description += ` + ${sim.name}`;
            }
        }
    }

    // 3. Check Main Balance
    if (agent.balance < amount) {
        return NextResponse.json({ error: 'Insufficient Wallet Balance' }, { status: 402 });
    }

    // Calculate 2% cashback
    const cashbackAmount = amount * 0.02;

    const tx_ref = `AGENT-${type?.toUpperCase() || 'TX'}-${Date.now()}`;

    // 4. PRE-VERIFY API (For Data) BEFORE Deducting Wallet
    let amigoVerified = true;
    let amigoResponse: any = null;

    if (type === 'data') {
        const plan = await prisma.dataPlan.findUnique({ where: { id: payload.planId } });
        if (plan) {
            try {
                const networkId = AMIGO_NETWORKS[plan.network];
                const amigoPayload = {
                    network: networkId,
                    mobile_number: payload.phone,
                    plan: Number(plan.planId),
                    Ported_number: true
                };

                const amigoRes = await callAmigoAPI('/data/', amigoPayload, tx_ref);
                amigoVerified = amigoRes.success && (
                    amigoRes.data.success === true || 
                    amigoRes.data.Status === 'successful' || 
                    amigoRes.data.status === 'delivered' ||
                    amigoRes.data.status === 'successful'
                );
                amigoResponse = amigoRes.data;

                if (!amigoVerified) {
                    return NextResponse.json({ 
                        error: 'Network provider failed to process request. Wallet NOT deducted.', 
                        details: amigoResponse 
                    }, { status: 400 });
                }
            } catch (apiError: any) {
                return NextResponse.json({ 
                    error: 'Network provider API error. Wallet NOT deducted. Please try again.', 
                    details: apiError.message 
                }, { status: 500 });
            }
        }
    }

    // 5. NOW Debit Wallet, Credit Cashback & Create Record (ONLY if API verified)
    const result = await prisma.$transaction(async (prisma) => {
        // Debit Main Balance and Credit Cashback
        await prisma.agent.update({
            where: { id: agent.id },
            data: { 
                balance: { decrement: amount },
                cashbackBalance: { increment: cashbackAmount },
                totalCashbackEarned: { increment: cashbackAmount }
            }
        });

        // Create Record with Cashback Info
        const transaction = await prisma.transaction.create({
            data: {
                tx_ref,
                type: type,
                status: type === 'data' ? 'delivered' : 'paid',
                phone: payload.phone,
                amount,
                agentCashbackAmount: cashbackAmount,
                cashbackProcessed: true,
                agentId: agent.id,
                customerName: payload.name || agent.firstName,
                deliveryState: payload.state || 'Agent Direct',
                idempotencyKey: uuidv4(),
                ...productDetails,
                deliveryData: {
                    method: 'Agent Wallet',
                    manifest: description,
                    cashbackEarned: cashbackAmount,
                    ...(amigoResponse && { amigo_response: amigoResponse })
                }
            }
        });

        // Log Cashback Entry
        await prisma.cashbackEntry.create({
            data: {
                agentId: agent.id,
                type: 'earned',
                amount: cashbackAmount,
                transactionId: transaction.id,
                description: `2% cashback on ${description}`
            }
        });

        return transaction;
    });

    const finalTx = await prisma.transaction.findUnique({ where: { id: result.id }, include: { product: true, dataPlan: true } });
    return NextResponse.json({ success: true, transaction: finalTx });

  } catch (error: any) {
    console.error('Agent Purchase Error:', error);
    return NextResponse.json({ error: error.message || 'Transaction failed' }, { status: 500 });
  }
}

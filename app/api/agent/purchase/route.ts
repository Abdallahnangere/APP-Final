
import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { v4 as uuidv4 } from 'uuid';
import { callAmigoAPI, AMIGO_NETWORKS } from '../../../../lib/amigo';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { agentId, pin, type, payload, useCashback } = body;

    // 1. Verify Agent & PIN
    const agent = await prisma.agent.findUnique({ where: { id: agentId } });
    if (!agent || agent.pin !== pin) {
        return NextResponse.json({ error: 'Invalid PIN Authorization' }, { status: 401 });
    }
    if (!agent.isActive) return NextResponse.json({ error: 'Agent Account Suspended' }, { status: 403 });

    let amount = 0;
    let cashbackEarned = 0;
    let description = '';
    let productDetails: any = {};

    // 2. Calculate Amount & Cashback Logic
    if (type === 'data') {
        const plan = await prisma.dataPlan.findUnique({ where: { id: payload.planId } });
        if (!plan) return NextResponse.json({ error: 'Invalid Plan' }, { status: 400 });
        amount = plan.price;
        description = `Data: ${plan.network} ${plan.data}`;
        productDetails = { planId: plan.id };
        
        // Earn 10% Cashback on Data Sales
        cashbackEarned = amount * 0.10;
    } else if (type === 'ecommerce') {
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

    // 3. Determine Payment Splits
    let cashbackToDeduct = 0;
    let mainBalanceToDeduct = amount;

    if (useCashback && agent.cashbackBalance > 0) {
        cashbackToDeduct = Math.min(agent.cashbackBalance, amount);
        mainBalanceToDeduct = amount - cashbackToDeduct;
    }

    // 4. Check Main Balance
    if (agent.balance < mainBalanceToDeduct) {
        return NextResponse.json({ error: 'Insufficient Main Wallet Balance' }, { status: 402 });
    }

    const tx_ref = `AGENT-${type.toUpperCase()}-${Date.now()}`;

    // 5. Debit Wallet, Credit Cashback, Create Record
    const result = await prisma.$transaction(async (prisma) => {
        // Debit
        await prisma.agent.update({
            where: { id: agent.id },
            data: { 
                balance: { decrement: mainBalanceToDeduct },
                cashbackBalance: { decrement: cashbackToDeduct, increment: cashbackEarned }
            }
        });

        // Create Record
        const transaction = await prisma.transaction.create({
            data: {
                tx_ref,
                type: type,
                status: 'paid',
                phone: payload.phone,
                amount,
                cashbackUsed: cashbackToDeduct,
                cashbackEarned: cashbackEarned,
                agentId: agent.id,
                customerName: payload.name || agent.firstName,
                deliveryState: payload.state || 'Agent Direct',
                idempotencyKey: uuidv4(),
                ...productDetails,
                deliveryData: {
                    method: 'Agent Wallet',
                    manifest: description,
                    payment_split: { wallet: mainBalanceToDeduct, cashback: cashbackToDeduct }
                }
            }
        });

        return transaction;
    });

    // 6. Fulfillment (If Data)
    if (type === 'data') {
        const plan = await prisma.dataPlan.findUnique({ where: { id: payload.planId } });
        if (plan) {
            const networkId = AMIGO_NETWORKS[plan.network];
            const amigoPayload = {
                network: networkId,
                mobile_number: payload.phone,
                plan: Number(plan.planId),
                Ported_number: true
            };

            const amigoRes = await callAmigoAPI('/data/', amigoPayload, tx_ref);
            const isSuccess = amigoRes.success && (
                amigoRes.data.success === true || 
                amigoRes.data.Status === 'successful' || 
                amigoRes.data.status === 'delivered' ||
                amigoRes.data.status === 'successful'
            );

            await prisma.transaction.update({
                where: { id: result.id },
                data: {
                    status: isSuccess ? 'delivered' : 'failed', 
                    deliveryData: {
                        ...(result.deliveryData as object),
                        amigo_response: amigoRes.data,
                        status: isSuccess ? 'delivered' : 'failed'
                    }
                }
            });
        }
    }

    const finalTx = await prisma.transaction.findUnique({ where: { id: result.id }, include: { product: true, dataPlan: true } });
    return NextResponse.json({ success: true, transaction: finalTx, earned: cashbackEarned });

  } catch (error: any) {
    console.error('Agent Purchase Error:', error);
    return NextResponse.json({ error: error.message || 'Transaction failed' }, { status: 500 });
  }
}

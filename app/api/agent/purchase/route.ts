// app/api/agent/purchase/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { verifyPin, generateTxRef, generateIdempotencyKey } from '@/lib/auth';
import { deliverData } from '@/lib/amigo';
import { sendPushNotification } from '@/lib/firebase-admin';
import { logger } from '@/lib/logger';

const PurchaseSchema = z.object({
  agentPhone: z.string().regex(/^[0-9]{10,11}$/),
  pin: z.string().regex(/^[0-9]{4}$/),
  type: z.enum(['data', 'ecommerce']),
  // For data
  planId: z.string().optional(),
  phone: z.string().optional(),
  // For ecommerce
  productId: z.string().optional(),
  deliveryState: z.string().optional(),
  customerName: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const start = Date.now();
  try {
    const body = await req.json();
    const parsed = PurchaseSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ message: 'Invalid request', errors: parsed.error.errors }, { status: 400 });
    }

    const { agentPhone, pin, type, planId, phone, productId, deliveryState, customerName } = parsed.data;

    // Find agent
    const agent = await prisma.agent.findUnique({ where: { phone: agentPhone } });
    if (!agent) return NextResponse.json({ message: 'Agent not found' }, { status: 404 });
    if (!agent.isActive) return NextResponse.json({ message: 'Account suspended' }, { status: 403 });

    // Verify PIN
    const pinValid = await verifyPin(pin, agent.pin);
    if (!pinValid) {
      logger.warn('PURCHASE', 'AUTHENTICATION_FAILED', { phone: agentPhone });
      return NextResponse.json({ message: 'Invalid PIN' }, { status: 401 });
    }

    let amount = 0;
    let dataPlan: any = null;
    let product: any = null;
    let txType = type;

    if (type === 'data') {
      if (!planId || !phone) return NextResponse.json({ message: 'planId and phone required for data' }, { status: 400 });

      dataPlan = await prisma.dataPlan.findUnique({ where: { id: planId } });
      if (!dataPlan) return NextResponse.json({ message: 'Data plan not found' }, { status: 404 });

      amount = dataPlan.price;

      // Validate recipient phone
      if (!/^[0-9]{10,11}$/.test(phone)) {
        return NextResponse.json({ message: 'Invalid recipient phone number' }, { status: 400 });
      }
    } else {
      if (!productId) return NextResponse.json({ message: 'productId required for ecommerce' }, { status: 400 });

      product = await prisma.product.findUnique({ where: { id: productId } });
      if (!product) return NextResponse.json({ message: 'Product not found' }, { status: 404 });
      if (!product.inStock) return NextResponse.json({ message: 'Product out of stock' }, { status: 400 });

      amount = product.price;
    }

    // Check balance
    if (agent.balance < amount) {
      return NextResponse.json({ message: `Insufficient balance. Need ₦${amount}, have ₦${agent.balance.toFixed(2)}` }, { status: 400 });
    }

    // Generate refs
    const tx_ref = generateTxRef(type === 'data' ? 'DATA' : 'ECOM');
    const idempotencyKey = generateIdempotencyKey();
    const cashbackAmount = parseFloat((amount * 0.02).toFixed(2));

    // Deduct balance & add cashback atomically
    await prisma.$transaction([
      prisma.agent.update({
        where: { id: agent.id },
        data: {
          balance: { decrement: amount },
          cashbackBalance: { increment: cashbackAmount },
          totalCashbackEarned: { increment: cashbackAmount },
        },
      }),
    ]);

    // Create transaction record
    const transaction = await prisma.transaction.create({
      data: {
        tx_ref,
        type: txType,
        status: 'paid',
        phone: phone || agentPhone,
        amount,
        agentCashbackAmount: cashbackAmount,
        idempotencyKey,
        agentId: agent.id,
        planId: dataPlan?.id,
        productId: product?.id,
        deliveryState,
        customerName,
      },
    });

    // Create cashback entry
    await prisma.cashbackEntry.create({
      data: {
        agentId: agent.id,
        type: 'earned',
        amount: cashbackAmount,
        transactionId: transaction.id,
        description: `Earned on ${tx_ref}`,
      },
    });

    logger.info('PURCHASE', 'PAYMENT_INITIATED', { tx_ref, amount, agentPhone });

    // Deliver data if type === data
    if (type === 'data' && dataPlan) {
      const delivery = await deliverData({
        network: dataPlan.network,
        phone: phone!,
        planId: dataPlan.planId,
        idempotencyKey,
      });

      const newStatus = delivery.success ? 'delivered' : 'failed';

      await prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          status: newStatus,
          cashbackProcessed: true,
          deliveryData: delivery.data || { error: delivery.error },
        },
      });

      if (delivery.success) {
        logger.info('PURCHASE', 'DELIVERY_COMPLETE', { tx_ref, phone });
        // Send push notification (best effort)
        try {
          await sendPushNotification({
            topic: 'all',
            title: '✅ Data Delivered!',
            body: `${dataPlan.data} sent to ${phone}`,
            data: { tx_ref, type: 'data_delivered' },
          });
        } catch {}
      } else {
        // Refund on delivery failure
        await prisma.agent.update({
          where: { id: agent.id },
          data: {
            balance: { increment: amount },
            cashbackBalance: { decrement: cashbackAmount },
            totalCashbackEarned: { decrement: cashbackAmount },
          },
        });
        await prisma.cashbackEntry.deleteMany({ where: { transactionId: transaction.id } });
        logger.error('PURCHASE', 'DELIVERY_FAILED', { tx_ref, error: delivery.error });
        return NextResponse.json({ message: `Data delivery failed: ${delivery.error}` }, { status: 500 });
      }

      const finalTx = await prisma.transaction.findUnique({
        where: { id: transaction.id },
        include: { dataPlan: true },
      });

      const updatedAgent = await prisma.agent.findUnique({
        where: { id: agent.id },
        select: { balance: true, cashbackBalance: true },
      });

      return NextResponse.json({
        success: true,
        transaction: finalTx,
        agent: updatedAgent,
        cashbackEarned: cashbackAmount,
        duration: Date.now() - start,
      });
    }

    // Ecommerce — mark as delivered (physical delivery handled separately)
    await prisma.transaction.update({
      where: { id: transaction.id },
      data: { status: 'delivered', cashbackProcessed: true },
    });

    const updatedAgent = await prisma.agent.findUnique({
      where: { id: agent.id },
      select: { balance: true, cashbackBalance: true },
    });

    return NextResponse.json({
      success: true,
      transaction,
      agent: updatedAgent,
      cashbackEarned: cashbackAmount,
    });
  } catch (err: any) {
    logger.error('PURCHASE', 'PURCHASE_ERROR', { error: err.message });
    return NextResponse.json({ message: 'Purchase failed', error: err.message }, { status: 500 });
  }
}

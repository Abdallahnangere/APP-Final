// app/api/webhook/flutterwave/route.ts
// Critical: Handles all Flutterwave payment webhooks
// - Data payment confirmation → Amigo delivery
// - Ecommerce payment confirmation
// - Agent wallet funding
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyWebhookSignature } from '@/lib/flutterwave';
import { deliverData } from '@/lib/amigo';
import { sendPushNotification } from '@/lib/firebase-admin';
import { generateIdempotencyKey } from '@/lib/auth';
import { logger } from '@/lib/logger';

export async function POST(req: NextRequest) {
  try {
    // 1. Verify webhook signature
    const signature = req.headers.get('verif-hash');
    if (!verifyWebhookSignature(signature)) {
      logger.warn('WEBHOOK', 'INVALID_SIGNATURE', { signature });
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const payload = await req.json();

    // 2. Log all webhooks
    await prisma.webhookLog.create({
      data: { source: 'flutterwave', payload },
    }).catch(() => {}); // non-fatal

    const data = payload?.data;
    if (!data) return NextResponse.json({ received: true });

    const { status, tx_ref, amount, customer, id: flw_id } = data;

    logger.info('WEBHOOK', 'PAYMENT_CONFIRMED', { tx_ref, status, amount });

    if (status !== 'successful') {
      // Mark failed if we have a pending transaction
      if (tx_ref) {
        await prisma.transaction.updateMany({
          where: { tx_ref, status: 'pending' },
          data: { status: 'failed' },
        }).catch(() => {});
      }
      return NextResponse.json({ received: true });
    }

    // 3. Find transaction
    const transaction = await prisma.transaction.findUnique({
      where: { tx_ref },
      include: { dataPlan: true, product: true },
    });

    if (!transaction) {
      // ── Agent wallet funding (no prior transaction record) ──────────────
      const phone = customer?.phone_number;
      if (phone) {
        const agent = await prisma.agent.findUnique({ where: { phone } });
        if (agent) {
          // Check idempotency — prevent double credit
          const existing = await prisma.transaction.findFirst({
            where: { tx_ref },
          });
          if (!existing) {
            await prisma.agent.update({
              where: { id: agent.id },
              data: { balance: { increment: amount } },
            });
            await prisma.transaction.create({
              data: {
                tx_ref,
                type: 'wallet_funding',
                status: 'delivered',
                phone,
                amount,
                agentId: agent.id,
                paymentData: data,
              },
            });
            logger.info('WEBHOOK', 'WALLET_FUNDED', { phone, amount });

            // Push notification
            await sendPushNotification({
              topic: 'all',
              title: '💰 Wallet Funded!',
              body: `₦${amount.toLocaleString()} added to your wallet`,
              data: { type: 'wallet_funded', amount: String(amount) },
            }).catch(() => {});
          }
        }
      }
      return NextResponse.json({ received: true });
    }

    // 4. Already processed?
    if (transaction.status !== 'pending') {
      return NextResponse.json({ received: true, message: 'Already processed' });
    }

    // 5. Update to paid
    await prisma.transaction.update({
      where: { id: transaction.id },
      data: { status: 'paid', paymentData: data },
    });

    // 6. Data purchase — deliver via Amigo
    if (transaction.type === 'data' && transaction.dataPlan) {
      logger.info('WEBHOOK', 'DELIVERY_STARTED', { tx_ref });

      const delivery = await deliverData({
        network: transaction.dataPlan.network,
        phone: transaction.phone,
        planId: transaction.dataPlan.planId,
        idempotencyKey: transaction.idempotencyKey || generateIdempotencyKey(),
      });

      await prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          status: delivery.success ? 'delivered' : 'failed',
          deliveryData: delivery.data || { error: delivery.error },
        },
      });

      if (delivery.success) {
        logger.info('WEBHOOK', 'DELIVERY_COMPLETE', { tx_ref, phone: transaction.phone });
        await sendPushNotification({
          topic: 'all',
          title: '✅ Data Delivered!',
          body: `${transaction.dataPlan.data} sent to ${transaction.phone}`,
          data: { tx_ref, type: 'data_delivered' },
        }).catch(() => {});
      } else {
        logger.error('WEBHOOK', 'DELIVERY_FAILED', { tx_ref, error: delivery.error });
        // TODO: Manual retry or refund flow
      }
    }

    // 7. Ecommerce purchase — mark paid (physical delivery handled by admin)
    if (transaction.type === 'ecommerce') {
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: { status: 'paid' },
      });
      logger.info('WEBHOOK', 'ECOM_PAID', { tx_ref, phone: transaction.phone });
    }

    return NextResponse.json({ received: true, processed: true });
  } catch (err: any) {
    logger.error('WEBHOOK', 'WEBHOOK_ERROR', { error: err.message });
    // Always return 200 to Flutterwave so they don't retry indefinitely
    return NextResponse.json({ received: true, error: err.message });
  }
}

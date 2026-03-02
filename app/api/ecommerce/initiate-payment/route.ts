// app/api/ecommerce/initiate-payment/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { initiateBankTransfer } from '@/lib/flutterwave';
import { generateTxRef } from '@/lib/auth';
import { logger } from '@/lib/logger';

const Schema = z.object({
  productId: z.string().uuid(),
  phone: z.string().regex(/^[0-9]{10,11}$/),
  name: z.string().min(2).max(80),
  state: z.string().min(2).max(40),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = Schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ message: 'Invalid request', errors: parsed.error.errors }, { status: 400 });

    const { productId, phone, name, state } = parsed.data;

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    if (!product.inStock) return NextResponse.json({ message: 'Product is out of stock' }, { status: 400 });

    const tx_ref = generateTxRef('ECOM');

    await prisma.transaction.create({
      data: {
        tx_ref,
        type: 'ecommerce',
        status: 'pending',
        phone,
        amount: product.price,
        productId: product.id,
        customerName: name,
        deliveryState: state,
        idempotencyKey: tx_ref,
      },
    });

    const flwResponse = await initiateBankTransfer({
      tx_ref,
      amount: product.price,
      phone,
      narration: `SaukiMart: ${product.name}`,
      meta: { consumer_id: phone, consumer_mac: 'kgh94', product_id: productId },
    });

    if (flwResponse?.status !== 'success') {
      await prisma.transaction.update({ where: { tx_ref }, data: { status: 'failed' } });
      return NextResponse.json({ message: 'Payment initiation failed' }, { status: 502 });
    }

    const auth = flwResponse.data?.meta?.authorization || {};
    logger.info('PAYMENT', 'ECOM_PAYMENT_INITIATED', { tx_ref, phone, amount: product.price });

    return NextResponse.json({
      success: true,
      tx_ref,
      bank: auth.transfer_bank,
      account_number: auth.transfer_account,
      account_name: 'SAUKI MART FLW',
      amount: product.price,
      note: auth.transfer_note,
      product: { name: product.name, description: product.description },
    });
  } catch (err: any) {
    logger.error('PAYMENT', 'ECOM_INITIATE_ERROR', { error: err.message });
    return NextResponse.json({ message: 'Payment initiation failed', error: err.message }, { status: 500 });
  }
}

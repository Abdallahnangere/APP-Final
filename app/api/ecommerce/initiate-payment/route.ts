
import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { InitiatePaymentSchema, validateRequestBody } from '../../../../lib/validation';
import { logger } from '../../../../lib/logger';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  let phone = '';
  const endLog = logger.logApiRequest('ECOMMERCE', 'INITIATE_PAYMENT');

  try {
    const body = await req.json();

    // Validate request body
    const validation = await validateRequestBody(body, InitiatePaymentSchema);
    if (!validation.valid) {
      const errors = validation.errors.errors.map(e => `${e.path.join('.')}: ${e.message}`);
      logger.logSecurityEvent('INVALID_REQUEST', { service: 'ECOMMERCE_PAYMENT', errors });
      endLog(400, null, new Error('Validation failed'));
      return NextResponse.json({ error: 'Validation failed', details: errors }, { status: 400 });
    }

    const { productId, phone: validPhone, name, state, simId } = validation.data;
    
    if (!validPhone || validPhone.length < 10) {
        logger.logSecurityEvent('INVALID_PHONE', { phone: validPhone });
        endLog(400, null, new Error('Invalid phone number'));
        return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 });
    }
    
    phone = validPhone;

    if (!process.env.FLUTTERWAVE_SECRET_KEY) {
        logger.logCritical('ECOMMERCE', new Error('Missing Flutterwave key'), {});
        endLog(500, null, new Error('Server configuration error'));
        return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      logger.logSecurityEvent('INVALID_REQUEST', { phone, reason: 'Product not found', productId });
      endLog(404, null, new Error('Product not found'));
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    let totalAmount = product.price;
    let items = [{ name: product.name, price: product.price }];
    let manifestParts = [product.name];
    
    if (simId) {
        const simProduct = await prisma.product.findUnique({ where: { id: simId } });
        if (simProduct) {
            totalAmount += simProduct.price;
            items.push({ name: simProduct.name, price: simProduct.price });
            manifestParts.push(simProduct.name);
        }
    }

    const fullManifest = manifestParts.join(" + ");
    // Ensure unique ref
    const tx_ref = `SAUKI-COM-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Flutterwave payload strict typing
    const flwPayload = {
      tx_ref: tx_ref,
      amount: String(totalAmount), // Must be string
      email: "saukidatalinks@gmail.com", // Generic email for guest checkout
      phone_number: phone,
      currency: "NGN",
      fullname: name,
      narration: `SAUKI ${fullManifest.substring(0, 20)}`, // Keep short
      is_permanent: false,
      // Simplified meta to avoid parsing errors on FLW side
      meta: {
        consumer_id: phone,
        consumer_mac: "kgh94"
      }
    };

    try {
        const flwResponse = await axios.post(
          'https://api.flutterwave.com/v3/charges?type=bank_transfer',
          flwPayload,
          {
            headers: { 
                Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
                'Content-Type': 'application/json'
            }
          }
        );

        const responseBody = flwResponse.data;

        if (responseBody.status !== 'success') {
          console.error("FLW Error:", responseBody);
          throw new Error(responseBody.message || 'Payment initialization failed');
        }

        const metaObj = responseBody.meta || responseBody.data?.meta;
        const bankInfo = metaObj?.authorization;

        if (!bankInfo || !bankInfo.transfer_bank || !bankInfo.transfer_account) {
            throw new Error('Gateway returned incomplete bank details.');
        }

        // Saving full details including the composed manifest
        await prisma.transaction.create({
          data: {
            tx_ref,
            type: 'ecommerce',
            status: 'pending',
            phone,
            amount: totalAmount,
            productId, 
            customerName: name,
            deliveryState: state,
            idempotencyKey: uuidv4(),
            paymentData: responseBody,
            deliveryData: {
                manifest: fullManifest,
                items: items,
                address: state,
                initiatedAt: new Date().toISOString()
            }
          }
        });

        logger.logTransaction(phone, 'ECOMMERCE_INITIATED', totalAmount, 'PENDING', {
          tx_ref,
          items: items.length,
          manifest: fullManifest
        });

        endLog(200, { tx_ref, amount: totalAmount });
        return NextResponse.json({
          tx_ref,
          bank: bankInfo.transfer_bank,
          account_number: bankInfo.transfer_account,
          account_name: 'SAUKI MART FLW', 
          amount: totalAmount,
          note: bankInfo.transfer_note
        });

    } catch (flwError: any) {
        logger.logError('PAYMENT', 'FLW_GATEWAY', flwError as Error, { phone, amount: totalAmount });
        const msg = flwError.response?.data?.message || flwError.message;
        endLog(502, null, flwError as Error);
        return NextResponse.json({ error: 'Gateway Error', details: msg }, { status: 502 });
    }

  } catch (error: any) {
    logger.logError('ECOMMERCE', 'INITIATE_PAYMENT', error as Error, { phone });
    endLog(500, null, error as Error);
    return NextResponse.json({ error: error.message || 'Initiation failed' }, { status: 500 });
  }
}

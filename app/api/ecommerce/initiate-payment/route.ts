
import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { productId, phone, name, state, simId } = body;

    if (!process.env.FLUTTERWAVE_SECRET_KEY) {
        return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

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

        return NextResponse.json({
          tx_ref,
          bank: bankInfo.transfer_bank,
          account_number: bankInfo.transfer_account,
          account_name: 'SAUKI MART FLW', 
          amount: totalAmount,
          note: bankInfo.transfer_note
        });

    } catch (flwError: any) {
        console.error("Axios/Gateway Error:", flwError.response?.data || flwError.message);
        const msg = flwError.response?.data?.message || flwError.message;
        return NextResponse.json({ error: 'Gateway Error', details: msg }, { status: 502 });
    }

  } catch (error: any) {
    console.error("Internal Error:", error);
    return NextResponse.json({ error: error.message || 'Initiation failed' }, { status: 500 });
  }
}

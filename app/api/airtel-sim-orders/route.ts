// Airtel SIM Orders API
// File: app/api/airtel-sim-orders/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { v4 as uuid } from 'uuid';

export async function POST(req: NextRequest) {
  try {
    const {
      productId,
      customerName,
      phone,
      email,
      imeiNumber,
      simFrontImageUrl,
      simBackImageUrl,
      agentId
    } = await req.json();

    if (!productId || !customerName || !phone || !simFrontImageUrl || !simBackImageUrl) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify product exists
    const product = await prisma.airtSIMProduct.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Create SIM order
    const order = await prisma.airtSIMOrder.create({
      data: {
        orderRef: `AIRSIM-${Date.now()}-${uuid().slice(0, 8).toUpperCase()}`,
        productId,
        phone,
        customerName,
        email: email || null,
        imeiNumber: imeiNumber || null,
        simFrontImageUrl,
        simBackImageUrl,
        price: product.price,
        agentId: agentId || null,
        status: 'pending'
      },
      include: { product: true }
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error('Create SIM order error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Server error' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const password = req.headers.get('x-admin-password');
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';

    if (!password || password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const orders = await prisma.airtSIMOrder.findMany({
      include: {
        product: true,
        agent: true
      },
      orderBy: { createdAt: 'desc' },
      take: 100
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Get SIM orders error:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}

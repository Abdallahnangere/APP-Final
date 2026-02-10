// Get SIM Order Status API
// File: app/api/airtel-sim-orders/[orderRef]/status/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: { orderRef: string } }
) {
  try {
    const { orderRef } = params;

    const order = await prisma.airtSIMOrder.findUnique({
      where: { orderRef },
      include: {
        product: true,
        transactions: {
          take: 1,
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Get SIM order status error:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { orderRef: string } }
) {
  try {
    const password = req.headers.get('x-admin-password');
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';

    if (!password || password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { orderRef } = params;
    const { status, adminNotes } = await req.json();

    const order = await prisma.airtSIMOrder.update({
      where: { orderRef },
      data: {
        status,
        adminNotes
      }
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error('Update SIM order error:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}

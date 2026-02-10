// Admin Transaction Cost API
// File: app/api/admin/transaction-cost/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';

export async function POST(req: NextRequest) {
  try {
    const { transactionId, costPrice, password } = await req.json();

    if (!password || password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!transactionId || costPrice === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify transaction exists
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId }
    });

    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    // Calculate profit
    const salePrice = transaction.amount;
    const profit = salePrice - costPrice;
    const profitMargin = salePrice > 0 ? (profit / salePrice) * 100 : 0;

    // Create or update transaction cost
    const transactionCost = await prisma.transactionCost.upsert({
      where: { transactionId },
      create: {
        transactionId,
        costPrice,
        salePrice,
        profit,
        profitMargin,
        itemType: transaction.type
      },
      update: {
        costPrice,
        profit,
        profitMargin
      }
    });

    return NextResponse.json(transactionCost);
  } catch (error) {
    console.error('Transaction cost error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Server error' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const password = req.headers.get('x-admin-password');
    if (!password || password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const transactionId = req.nextUrl.searchParams.get('transactionId');

    if (transactionId) {
      const cost = await prisma.transactionCost.findUnique({
        where: { transactionId }
      });
      return NextResponse.json(cost);
    }

    // Get all costs
    const costs = await prisma.transactionCost.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100
    });

    return NextResponse.json(costs);
  } catch (error) {
    console.error('Get transaction costs error:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}

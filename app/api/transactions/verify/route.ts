import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const { tx_ref } = await req.json();
  if (!tx_ref) return NextResponse.json({ message: 'tx_ref required' }, { status: 400 });

  const tx = await prisma.transaction.findUnique({ where: { tx_ref }, include: { dataPlan: true, product: true } });
  if (!tx) return NextResponse.json({ message: 'Transaction not found' }, { status: 404 });

  return NextResponse.json({ tx_ref: tx.tx_ref, status: tx.status, amount: tx.amount, type: tx.type, createdAt: tx.createdAt, dataPlan: tx.dataPlan, product: tx.product });
}

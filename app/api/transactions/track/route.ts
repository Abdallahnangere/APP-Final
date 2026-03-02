import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const tx_ref = req.nextUrl.searchParams.get('tx_ref');
  const phone  = req.nextUrl.searchParams.get('phone');
  if (!tx_ref && !phone) return NextResponse.json({ message: 'tx_ref or phone required' }, { status: 400 });

  if (tx_ref) {
    const tx = await prisma.transaction.findUnique({
      where: { tx_ref },
      include: { dataPlan: true, product: true },
    });
    if (!tx) return NextResponse.json({ message: 'Transaction not found' }, { status: 404 });
    return NextResponse.json(tx);
  }

  const transactions = await prisma.transaction.findMany({
    where: { phone: phone! },
    orderBy: { createdAt: 'desc' },
    take: 20,
    include: { dataPlan: true, product: true },
  });
  return NextResponse.json({ transactions });
}

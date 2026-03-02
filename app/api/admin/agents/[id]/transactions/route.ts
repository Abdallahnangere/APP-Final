import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminPassword } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  if (!verifyAdminPassword(req.headers.get('x-admin-password') || '')) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const transactions = await prisma.transaction.findMany({
    where: { agentId: params.id },
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: { dataPlan: true, product: true },
  });
  return NextResponse.json({ transactions });
}

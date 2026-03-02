import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminPassword } from '@/lib/auth';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  if (!verifyAdminPassword(req.headers.get('x-admin-password') || '')) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const { status } = await req.json();
  if (!['pending','paid','delivered','failed'].includes(status)) return NextResponse.json({ message: 'Invalid status' }, { status: 400 });
  const tx = await prisma.transaction.update({ where: { id: params.id }, data: { status } });
  return NextResponse.json(tx);
}

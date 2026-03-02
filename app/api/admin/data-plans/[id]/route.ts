import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminPassword } from '@/lib/auth';

function auth(req: NextRequest): boolean {
  return verifyAdminPassword(req.headers.get('x-admin-password') || '');
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  if (!auth(req)) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const { network, data, validity, price, planId } = body;
  const plan = await prisma.dataPlan.update({ where: { id: params.id }, data: { network, data, validity, price, planId } });
  return NextResponse.json(plan);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!auth(req)) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  await prisma.dataPlan.delete({ where: { id: params.id } });
  return NextResponse.json({ deleted: true });
}

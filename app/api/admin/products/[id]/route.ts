import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminPassword } from '@/lib/auth';

function getAdminAuth(req: NextRequest): boolean {
  const pw = req.headers.get('x-admin-password') || '';
  return verifyAdminPassword(pw);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  if (!getAdminAuth(req)) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const { name, description, price, image, inStock, category } = body;
  const product = await prisma.product.update({ where: { id: params.id }, data: { name, description, price, image, inStock, category } });
  return NextResponse.json(product);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!getAdminAuth(req)) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  await prisma.product.delete({ where: { id: params.id } });
  return NextResponse.json({ deleted: true });
}

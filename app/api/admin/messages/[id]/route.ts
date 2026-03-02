import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminPassword } from '@/lib/auth';

function auth(req: NextRequest) { return verifyAdminPassword(req.headers.get('x-admin-password') || ''); }

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  if (!auth(req)) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const { content, type, isActive } = await req.json();
  const msg = await prisma.systemMessage.update({ where: { id: params.id }, data: { content, type, isActive } });
  return NextResponse.json(msg);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!auth(req)) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  await prisma.systemMessage.delete({ where: { id: params.id } });
  return NextResponse.json({ deleted: true });
}

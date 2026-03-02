import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminPassword } from '@/lib/auth';

function auth(req: NextRequest) { return verifyAdminPassword(req.headers.get('x-admin-password') || ''); }

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  if (!auth(req)) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const { status, reply } = await req.json();
  const ticket = await prisma.supportTicket.update({ where: { id: params.id }, data: { status, reply } });
  return NextResponse.json(ticket);
}

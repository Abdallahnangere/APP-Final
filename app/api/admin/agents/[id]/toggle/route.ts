import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminPassword } from '@/lib/auth';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  if (!verifyAdminPassword(req.headers.get('x-admin-password') || '')) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const agent = await prisma.agent.findUnique({ where: { id: params.id } });
  if (!agent) return NextResponse.json({ message: 'Not found' }, { status: 404 });
  const updated = await prisma.agent.update({ where: { id: params.id }, data: { isActive: !agent.isActive } });
  return NextResponse.json({ isActive: updated.isActive });
}

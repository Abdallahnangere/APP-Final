import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const message = await prisma.systemMessage.findFirst({ where: { isActive: true }, orderBy: { createdAt: 'desc' } });
  return NextResponse.json(message || null);
}

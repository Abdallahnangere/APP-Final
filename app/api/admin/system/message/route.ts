import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const Schema = z.object({
  content: z.string().min(1),
  type: z.enum(['info','warning','error','success']).default('info'),
  isActive: z.boolean().default(true),
  password: z.string(),
});

export async function GET(req: NextRequest) {
  const pw = req.headers.get('x-admin-password') || req.nextUrl.searchParams.get('password') || '';
  const { verifyAdminPassword } = await import('@/lib/auth');
  if (!verifyAdminPassword(pw)) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const messages = await prisma.systemMessage.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json(messages);
}

export async function POST(req: NextRequest) {
  const { verifyAdminPassword } = await import('@/lib/auth');
  const body = await req.json();
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ message: 'Invalid' }, { status: 400 });
  if (!verifyAdminPassword(parsed.data.password)) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const { password, ...data } = parsed.data;
  const msg = await prisma.systemMessage.create({ data });
  return NextResponse.json(msg, { status: 201 });
}

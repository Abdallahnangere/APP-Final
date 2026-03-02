import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { verifyAdminPassword } from '@/lib/auth';

const CreateSchema = z.object({
  network: z.enum(['MTN','AIRTEL','GLO']),
  data: z.string().min(1),
  validity: z.string().min(1),
  price: z.number().positive(),
  planId: z.number().int().positive(),
  password: z.string(),
});

export async function GET(req: NextRequest) {
  const network = req.nextUrl.searchParams.get('network');
  const plans = await prisma.dataPlan.findMany({
    where: network ? { network: network.toUpperCase() } : {},
    orderBy: [{ network: 'asc' }, { price: 'asc' }],
  });
  return NextResponse.json(plans);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ message: 'Invalid' }, { status: 400 });
  if (!verifyAdminPassword(parsed.data.password)) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const { password, ...data } = parsed.data;
  const plan = await prisma.dataPlan.create({ data });
  return NextResponse.json(plan, { status: 201 });
}

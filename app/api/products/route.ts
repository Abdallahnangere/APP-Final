import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { verifyAdminPassword } from '@/lib/auth';

const CreateSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.number().positive(),
  image: z.string().default(''),
  inStock: z.boolean().default(true),
  category: z.enum(['device','sim','package']).default('device'),
  password: z.string(),
});

export async function GET() {
  const products = await prisma.product.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json(products);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ message: 'Invalid' }, { status: 400 });
  if (!verifyAdminPassword(parsed.data.password)) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const { password, ...data } = parsed.data;
  const product = await prisma.product.create({ data });
  return NextResponse.json(product, { status: 201 });
}

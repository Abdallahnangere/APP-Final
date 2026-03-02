import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const sp      = req.nextUrl.searchParams;
  const limit   = Math.min(parseInt(sp.get('limit') || '50'), 500);
  const status  = sp.get('status');
  const type    = sp.get('type');
  const phone   = sp.get('phone');
  const agentId = sp.get('agentId');
  const from    = sp.get('from');
  const to      = sp.get('to');

  const where: any = {};
  if (status) where.status = status;
  if (type)   where.type   = type;
  if (phone)  where.phone  = phone;
  if (agentId) where.agentId = agentId;
  if (from || to) {
    where.createdAt = {};
    if (from) where.createdAt.gte = new Date(from);
    if (to)   where.createdAt.lte = new Date(to);
  }

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        dataPlan: { select: { network: true, data: true, validity: true } },
        product:  { select: { name: true } },
        agent:    { select: { firstName: true, lastName: true } },
      },
    }),
    prisma.transaction.count({ where }),
  ]);
  return NextResponse.json({ transactions, total });
}

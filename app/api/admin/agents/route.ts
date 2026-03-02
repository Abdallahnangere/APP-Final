// app/api/admin/agents/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminPassword } from '@/lib/auth';

function auth(req: NextRequest) {
  return verifyAdminPassword(req.headers.get('x-admin-password') || '');
}

export async function GET(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const sp = req.nextUrl.searchParams;
  const search = sp.get('search') || '';
  const isActive = sp.get('isActive');
  const limit = Math.min(parseInt(sp.get('limit') || '100'), 500);

  const where: any = {};
  if (search) {
    where.OR = [
      { phone: { contains: search } },
      { firstName: { contains: search, mode: 'insensitive' } },
      { lastName:  { contains: search, mode: 'insensitive' } },
    ];
  }
  if (isActive !== null && isActive !== undefined) {
    where.isActive = isActive === 'true';
  }

  const [agents, total] = await Promise.all([
    prisma.agent.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true, firstName: true, lastName: true, phone: true,
        balance: true, cashbackBalance: true, totalCashbackEarned: true,
        cashbackRedeemed: true, isActive: true, flwAccountNumber: true,
        flwAccountName: true, flwBankName: true, createdAt: true,
      },
    }),
    prisma.agent.count({ where }),
  ]);

  return NextResponse.json({ agents, total });
}

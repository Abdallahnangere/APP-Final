// app/api/admin/support/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminPassword } from '@/lib/auth';

function auth(req: NextRequest) {
  return verifyAdminPassword(req.headers.get('x-admin-password') || '');
}

export async function GET(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const status = req.nextUrl.searchParams.get('status'); // open | closed
  const tickets = await prisma.supportTicket.findMany({
    where: status ? { status } : {},
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ tickets, total: tickets.length });
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminPassword } from '@/lib/auth';

export async function GET(req: NextRequest) {
  if (!verifyAdminPassword(req.headers.get('x-admin-password') || '')) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const limit = parseInt(req.nextUrl.searchParams.get('limit') || '100');
  const logs = await prisma.webhookLog.findMany({ orderBy: { createdAt: 'desc' }, take: Math.min(limit, 500) });
  return NextResponse.json({ logs, total: logs.length });
}

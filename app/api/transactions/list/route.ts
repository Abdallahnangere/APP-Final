import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export const dynamic = 'force-dynamic';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';

function isAuthorized(req: Request) {
  const header = req.headers.get('x-admin-password') || req.headers.get('authorization')?.replace('Bearer ', '') || '';
  return ADMIN_PASSWORD && header && header === ADMIN_PASSWORD;
}

export async function OPTIONS() {
  return NextResponse.json(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-ADMIN-PASSWORD, Authorization'
    }
  });
}

export async function GET(req: Request) {
  try {
    if (!isAuthorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const date = searchParams.get('date');

    const where: any = {};

    if (status) {
      where.status = { in: status.split(',') };
    }

    if (date) {
      const start = new Date(date + 'T00:00:00.000Z');
      const end = new Date(date + 'T23:59:59.999Z');
      where.createdAt = { gte: start, lte: end };
    }

    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 200,
      include: { product: true, dataPlan: true, agent: true }
    });
    return NextResponse.json(transactions, { headers: { 'Access-Control-Allow-Origin': '*' } });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Fetch failed' }, { status: 500 });
  }
}
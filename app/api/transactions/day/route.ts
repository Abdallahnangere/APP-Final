import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export const dynamic = 'force-dynamic';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';

export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-ADMIN-PASSWORD, Authorization'
    }
  });
}

function jsonResponse(payload: any, status = 200) {
  return NextResponse.json(payload, { status, headers: { 'Access-Control-Allow-Origin': '*' } });
}

function isAuthorized(req: Request) {
  const header = req.headers.get('x-admin-password') || req.headers.get('authorization')?.replace('Bearer ', '') || '';
  return ADMIN_PASSWORD && header && header === ADMIN_PASSWORD;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date');
    const agentId = searchParams.get('agentId');

    if (!date) return jsonResponse({ error: 'Missing required query param: date (YYYY-MM-DD)' }, 400);
    if (!isAuthorized(req)) return jsonResponse({ error: 'Unauthorized' }, 401);

    const start = new Date(date + 'T00:00:00.000Z');
    const end = new Date(date + 'T23:59:59.999Z');

    const where: any = {
      createdAt: { gte: start, lte: end }
    };
    if (agentId) where.agentId = agentId;

    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: { createdAt: 'asc' },
      include: { dataPlan: true, product: true, agent: true }
    });

    return jsonResponse({ success: true, date, count: transactions.length, transactions });
  } catch (err) {
    console.error(err);
    return jsonResponse({ error: 'Server error' }, 500);
  }
}

export async function POST(req: Request) {
  try {
    if (!isAuthorized(req)) return jsonResponse({ error: 'Unauthorized' }, 401);

    const body = await req.json();
    const date = body?.date;
    const agentId = body?.agentId;
    if (!date) return jsonResponse({ error: 'Missing body param: date (YYYY-MM-DD)' }, 400);

    const start = new Date(date + 'T00:00:00.000Z');
    const end = new Date(date + 'T23:59:59.999Z');

    const where: any = { createdAt: { gte: start, lte: end } };
    if (agentId) where.agentId = agentId;

    const transactions = await prisma.transaction.findMany({ where, orderBy: { createdAt: 'asc' }, include: { dataPlan: true, product: true, agent: true } });

    return jsonResponse({ success: true, date, count: transactions.length, transactions });
  } catch (err) {
    console.error(err);
    return jsonResponse({ error: 'Server error' }, 500);
  }
}

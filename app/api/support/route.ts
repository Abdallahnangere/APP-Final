import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const Schema = z.object({ phone: z.string().regex(/^[0-9]{10,11}$/), message: z.string().min(10).max(2000) });

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ message: 'Invalid request' }, { status: 400 });
  const ticket = await prisma.supportTicket.create({ data: parsed.data });
  return NextResponse.json({ success: true, id: ticket.id }, { status: 201 });
}

export async function GET() {
  const tickets = await prisma.supportTicket.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json(tickets);
}

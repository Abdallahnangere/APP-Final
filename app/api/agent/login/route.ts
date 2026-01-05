
import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export async function POST(req: Request) {
  try {
    const { phone, pin } = await req.json();

    const agent = await prisma.agent.findUnique({ where: { phone } });

    if (!agent || agent.pin !== pin) {
        return NextResponse.json({ error: 'Invalid Phone or PIN' }, { status: 401 });
    }

    return NextResponse.json({ success: true, agent });
  } catch (error) {
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}

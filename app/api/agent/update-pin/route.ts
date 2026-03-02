// app/api/agent/update-pin/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { verifyPin, hashPin } from '@/lib/auth';

const Schema = z.object({
  agentPhone: z.string().regex(/^[0-9]{10,11}$/),
  oldPin: z.string().regex(/^[0-9]{4}$/),
  newPin: z.string().regex(/^[0-9]{4}$/),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = Schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ message: 'Invalid request' }, { status: 400 });

    const { agentPhone, oldPin, newPin } = parsed.data;
    if (oldPin === newPin) return NextResponse.json({ message: 'New PIN must differ from old PIN' }, { status: 400 });

    const agent = await prisma.agent.findUnique({ where: { phone: agentPhone } });
    if (!agent) return NextResponse.json({ message: 'Agent not found' }, { status: 404 });

    const valid = await verifyPin(oldPin, agent.pin);
    if (!valid) return NextResponse.json({ message: 'Current PIN is incorrect' }, { status: 401 });

    const newHashed = await hashPin(newPin);
    await prisma.agent.update({ where: { id: agent.id }, data: { pin: newHashed } });

    return NextResponse.json({ success: true, message: 'PIN updated successfully' });
  } catch (err: any) {
    return NextResponse.json({ message: 'PIN update failed', error: err.message }, { status: 500 });
  }
}

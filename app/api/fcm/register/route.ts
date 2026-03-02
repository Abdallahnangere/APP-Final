import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const Schema = z.object({
  endpoint: z.string().url(),
  p256dh: z.string(),
  auth: z.string(),
  phone: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const parsed = Schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ message: 'Invalid' }, { status: 400 });
  const sub = await prisma.pushSubscription.upsert({
    where: { endpoint: parsed.data.endpoint },
    update: { p256dh: parsed.data.p256dh, auth: parsed.data.auth, phone: parsed.data.phone },
    create: parsed.data,
  });
  return NextResponse.json({ success: true, id: sub.id });
}

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyAdminPassword } from '@/lib/auth';
import { sendPushNotification } from '@/lib/firebase-admin';

const Schema = z.object({
  title: z.string().min(1),
  body: z.string().min(1),
  targetType: z.enum(['all','agents']).default('all'),
  data: z.record(z.string()).optional(),
  password: z.string(),
});

export async function POST(req: NextRequest) {
  const parsed = Schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ message: 'Invalid' }, { status: 400 });
  if (!verifyAdminPassword(parsed.data.password)) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const { title, body, data } = parsed.data;
  const result = await sendPushNotification({ topic: 'all', title, body, data });
  return NextResponse.json(result);
}

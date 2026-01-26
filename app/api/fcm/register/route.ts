import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export async function POST(req: Request) {
  try {
    const { token, phone } = await req.json();

    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 400 });
    }

    // Re-use PushSubscription table to store FCM tokens with endpoint prefix
    const endpoint = `fcm:${token}`;

    const pushSub = await prisma.pushSubscription.upsert({
      where: { endpoint },
      update: { p256dh: '', auth: '', phone: phone || null },
      create: { endpoint, p256dh: '', auth: '', phone: phone || null }
    });

    return NextResponse.json({ success: true, message: 'FCM token saved', id: pushSub.id });
  } catch (e: any) {
    console.error('FCM register error:', e);
    return NextResponse.json({ error: 'Failed', details: e.message }, { status: 500 });
  }
}

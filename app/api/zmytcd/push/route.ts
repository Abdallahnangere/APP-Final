import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/auth';
import { sendAdminPushNotification } from '@/lib/push';

export const dynamic = 'force-dynamic';

async function auth(req: NextRequest): Promise<boolean> {
  const h = req.headers.get('authorization');
  return Boolean(h?.startsWith('Bearer ')) && await verifyAdminToken((h as string).slice(7));
}

type PushAudience = 'all' | 'specific' | 'selected';

export async function POST(req: NextRequest) {
  if (!await auth(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const body = await req.json() as {
      audience?: PushAudience;
      title?: string;
      message?: string;
      userId?: string;
      userIds?: string[];
    };

    const audience = body.audience || 'all';
    const title = (body.title || '').trim();
    const message = (body.message || '').trim();

    if (!title || !message) {
      return NextResponse.json({ error: 'Title and message are required' }, { status: 400 });
    }

    let targetUserIds: string[] | undefined;
    if (audience === 'specific') {
      if (!body.userId) return NextResponse.json({ error: 'userId is required for specific audience' }, { status: 400 });
      targetUserIds = [body.userId];
    }

    if (audience === 'selected') {
      if (!Array.isArray(body.userIds) || body.userIds.length === 0) {
        return NextResponse.json({ error: 'userIds is required for selected audience' }, { status: 400 });
      }
      targetUserIds = body.userIds;
    }

    const result = await sendAdminPushNotification({
      title,
      body: message,
      userIds: targetUserIds,
      data: {
        source: 'admin_panel',
        audience,
      },
    });

    return NextResponse.json({ success: true, ...result });
  } catch (err: unknown) {
    console.error('Admin push error:', err);
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Push send failed' }, { status: 500 });
  }
}

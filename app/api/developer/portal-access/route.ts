import { NextRequest, NextResponse } from 'next/server';
import { requireAppUser } from '@/lib/developerAuth';
import { sendDeveloperPortalAccessAlert } from '@/lib/push';

export async function POST(req: NextRequest) {
  const user = await requireAppUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  if (user.is_banned) {
    return NextResponse.json({ error: 'Account suspended' }, { status: 403 });
  }

  // Fire-and-forget style endpoint for login security awareness.
  sendDeveloperPortalAccessAlert({ userId: user.id }).catch((err) => {
    console.error('Developer portal access alert failed:', err);
  });

  return NextResponse.json({ success: true });
}

import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { hashPin, verifyPin } from '@/lib/utils';

export const dynamic = 'force-dynamic';

async function getUser(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) return null;
  const payload = await verifyToken(auth.slice(7));
  if (!payload?.userId) return null;
  const [u] = await sql`
    SELECT id, first_name, last_name, phone, wallet_balance, cashback_balance,
           referral_bonus, flw_account_number, flw_bank_name, is_banned,
           theme, notifications_enabled, haptics_enabled, created_at
    FROM users WHERE id = ${payload.userId as string}
  `;
  return u;
}

export async function GET(req: NextRequest) {
  const user = await getUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (user.is_banned) return NextResponse.json({ error: 'Account suspended' }, { status: 403 });

  return NextResponse.json({
    id: user.id,
    firstName: user.first_name,
    lastName: user.last_name,
    phone: user.phone,
    walletBalance: parseFloat(user.wallet_balance),
    cashbackBalance: parseFloat(user.cashback_balance),
    referralBonus: parseFloat(user.referral_bonus),
    accountNumber: user.flw_account_number,
    bankName: user.flw_bank_name,
    theme: user.theme,
    notificationsEnabled: user.notifications_enabled,
    hapticsEnabled: user.haptics_enabled,
    createdAt: user.created_at,
  });
}

export async function PATCH(req: NextRequest) {
  const user = await getUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();

  // Change PIN
  if (body.action === 'change-pin') {
    const { currentPin, newPin } = body;
    if (!/^\d{6}$/.test(newPin)) {
      return NextResponse.json({ error: 'New PIN must be 6 digits' }, { status: 400 });
    }
    const [full] = await sql`SELECT pin_hash FROM users WHERE id = ${user.id}`;
    const valid = await verifyPin(currentPin, full.pin_hash);
    if (!valid) return NextResponse.json({ error: 'Current PIN is incorrect' }, { status: 401 });
    const newHash = await hashPin(newPin);
    await sql`UPDATE users SET pin_hash = ${newHash}, updated_at = NOW() WHERE id = ${user.id}`;
    return NextResponse.json({ success: true, message: 'PIN updated successfully' });
  }

  // Update preferences
  const allowed: Record<string, unknown> = {};
  if (body.theme) allowed.theme = body.theme;
  if (typeof body.notificationsEnabled === 'boolean') allowed.notifications_enabled = body.notificationsEnabled;
  if (typeof body.hapticsEnabled === 'boolean') allowed.haptics_enabled = body.hapticsEnabled;

  if (Object.keys(allowed).length > 0) {
    await sql`
      UPDATE users SET
        theme = COALESCE(${allowed.theme as string ?? null}, theme),
        notifications_enabled = COALESCE(${allowed.notifications_enabled as boolean ?? null}, notifications_enabled),
        haptics_enabled = COALESCE(${allowed.haptics_enabled as boolean ?? null}, haptics_enabled),
        updated_at = NOW()
      WHERE id = ${user.id}
    `;
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
}

import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { verifyPin } from '@/lib/utils';
import { signToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { phone, pin } = await req.json();

    if (!/^\d{11}$/.test(phone) || !/^\d{4}$/.test(pin)) {
      return NextResponse.json({ error: 'Invalid credentials format' }, { status: 400 });
    }

    const [user] = await sql`
      SELECT id, first_name, last_name, phone, pin_hash, wallet_balance,
             cashback_balance, referral_bonus, flw_account_number, flw_bank_name,
             is_banned, theme, notifications_enabled, haptics_enabled,
             is_developer, developer_discount_percent, created_at
      FROM users WHERE phone = ${phone}
    `;

    if (!user) {
      return NextResponse.json({ error: 'Phone number not registered' }, { status: 404 });
    }

    if (user.is_banned) {
      return NextResponse.json({ error: 'Account suspended. Contact support.' }, { status: 403 });
    }

    const valid = await verifyPin(pin, user.pin_hash);
    if (!valid) {
      return NextResponse.json({ error: 'Incorrect PIN' }, { status: 401 });
    }

    const token = await signToken({ userId: user.id, phone: user.phone });

    return NextResponse.json({
      success: true,
      token,
      user: {
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
        isDeveloper: Boolean(user.is_developer),
        developerDiscountPercent: Number(user.developer_discount_percent || 0),
        createdAt: user.created_at,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}

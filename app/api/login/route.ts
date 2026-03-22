import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { verifyPin } from '@/lib/utils';
import { signToken } from '@/lib/auth';
import { sendDeveloperPortalAccessAlert } from '@/lib/push';

async function ensureDeveloperPortalAccessLogSchema() {
  await sql`
    CREATE TABLE IF NOT EXISTS developer_portal_access_logs (
      id BIGSERIAL PRIMARY KEY,
      user_id UUID NOT NULL,
      phone TEXT,
      context TEXT NOT NULL DEFAULT 'app',
      ip_address TEXT,
      user_agent TEXT,
      push_triggered BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
}

export async function POST(req: NextRequest) {
  try {
    const { phone, pin, context } = await req.json();

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

    if (context === 'developers') {
      const xff = req.headers.get('x-forwarded-for') || '';
      const ipAddress = xff.split(',')[0]?.trim() || req.headers.get('x-real-ip') || null;
      const userAgent = req.headers.get('user-agent') || null;

      await ensureDeveloperPortalAccessLogSchema();

      let pushTriggered = false;
      try {
        await sendDeveloperPortalAccessAlert({ userId: user.id as string, accessedAt: new Date() });
        pushTriggered = true;
      } catch (pushErr) {
        console.error('Developer portal login push failed:', pushErr);
      }

      await sql`
        INSERT INTO developer_portal_access_logs (user_id, phone, context, ip_address, user_agent, push_triggered)
        VALUES (${user.id as string}, ${user.phone as string}, 'developers', ${ipAddress}, ${userAgent}, ${pushTriggered})
      `;
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

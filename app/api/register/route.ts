import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { hashPin } from '@/lib/utils';
import { createVirtualAccount } from '@/lib/flutterwave';
import { signToken } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';
import { createUniqueReferralCode, ensureEarnSchema, normalizeReferralCode } from '@/lib/earn';

export async function POST(req: NextRequest) {
  try {
    await ensureEarnSchema();

    const { firstName, lastName, phone, pin, confirmPin, referralId } = await req.json();

    // Validation
    if (!firstName?.trim() || !lastName?.trim()) {
      return NextResponse.json({ error: 'First name and last name are required' }, { status: 400 });
    }
    if (!/^\d{11}$/.test(phone)) {
      return NextResponse.json({ error: 'Phone must be exactly 11 digits' }, { status: 400 });
    }
    if (!/^\d{4}$/.test(pin)) {
      return NextResponse.json({ error: 'PIN must be exactly 4 digits' }, { status: 400 });
    }
    if (pin !== confirmPin) {
      return NextResponse.json({ error: 'PINs do not match' }, { status: 400 });
    }

    // Check existing
    const existing = await sql`SELECT id FROM users WHERE phone = ${phone}`;
    if (existing.length > 0) {
      return NextResponse.json({ error: 'Phone number already registered' }, { status: 409 });
    }

    const normalizedReferralId = normalizeReferralCode(referralId);
    let referredBy: string | null = null;
    if (normalizedReferralId) {
      const [referrer] = await sql`
        SELECT id FROM users WHERE referral_id = ${normalizedReferralId} LIMIT 1
      `;
      if (!referrer) {
        return NextResponse.json({ error: 'Referral ID is invalid' }, { status: 400 });
      }
      referredBy = String(referrer.id);
    }

    // Create Flutterwave virtual account
    const txRef = `SM-${uuidv4().slice(0, 8).toUpperCase()}`;
    const flwPayload = {
      email: 'accounts@saukimart.online',
      is_permanent: true,
      bvn: process.env.MY_BVN!,
      tx_ref: txRef,
      firstname: firstName.trim(),
      lastname: lastName.trim(),
      narration: `SaukiMart - ${firstName.trim()} ${lastName.trim()}`,
      phonenumber: phone,
    };

    const flwRes = await createVirtualAccount(flwPayload);

    let accountNumber = null;
    let bankName = null;
    let orderRef = null;

    if (flwRes.status === 'success' && flwRes.data) {
      accountNumber = flwRes.data.account_number;
      bankName = flwRes.data.bank_name;
      orderRef = flwRes.data.order_ref;
    }

    // Hash PIN and create user
    const pinHash = await hashPin(pin);
    const nextReferralCode = await createUniqueReferralCode();

    const [user] = await sql`
      INSERT INTO users (first_name, last_name, phone, pin_hash, flw_account_number, flw_bank_name, flw_order_ref, referral_id, referred_by)
      VALUES (${firstName.trim()}, ${lastName.trim()}, ${phone}, ${pinHash}, ${accountNumber}, ${bankName}, ${orderRef}, ${nextReferralCode}, ${referredBy})
      RETURNING id, first_name, last_name, phone, flw_account_number, flw_bank_name,
                wallet_balance, cashback_balance, referral_bonus, referral_balance,
                referral_id, total_gb_purchased,
                is_developer, developer_discount_percent, created_at
    `;

    const token = await signToken({ userId: user.id, phone: user.phone });

    return NextResponse.json({
      success: true,
      message: 'Account created successfully!',
      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone,
        accountNumber: user.flw_account_number,
        bankName: user.flw_bank_name,
        walletBalance: parseFloat(user.wallet_balance),
        cashbackBalance: parseFloat(user.cashback_balance),
        referralBonus: parseFloat(user.referral_balance ?? user.referral_bonus ?? 0),
        referralBalance: parseFloat(user.referral_balance ?? user.referral_bonus ?? 0),
        referralId: user.referral_id,
        totalGbPurchased: parseFloat(user.total_gb_purchased || 0),
        isDeveloper: Boolean(user.is_developer),
        developerDiscountPercent: Number(user.developer_discount_percent || 0),
        createdAt: user.created_at,
      },
      token,
    });
  } catch (err: unknown) {
    console.error('Register error:', err);
    const msg = err instanceof Error ? err.message : 'Registration failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import {
  ensureEarnSchema,
  ensureUserReferralCode,
  REFERRAL_REWARD_AMOUNT,
  REFERRAL_TARGET_GB,
} from '@/lib/earn';

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const payload = await verifyToken(auth.slice(7));
  if (!payload?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await ensureEarnSchema();

  const [user] = await sql`
    SELECT id, first_name, last_name, phone, referral_id, referral_balance, referral_bonus, total_gb_purchased
    FROM users
    WHERE id = ${payload.userId as string} AND is_banned = FALSE
    LIMIT 1
  `;

  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const referralId = await ensureUserReferralCode(String(user.id), String(user.referral_id || ''));

  const referredUsers = await sql`
    SELECT id, first_name, last_name, phone, total_gb_purchased, referral_reward_earned, created_at
    FROM users
    WHERE referred_by = ${payload.userId as string}
    ORDER BY created_at DESC
  `;

  const normalizedUsers = referredUsers.map((item) => {
    const totalGbPurchased = Number(item.total_gb_purchased || 0);
    const hasReachedTarget = totalGbPurchased >= REFERRAL_TARGET_GB;
    return {
      id: String(item.id),
      firstName: String(item.first_name || ''),
      lastName: String(item.last_name || ''),
      phone: String(item.phone || ''),
      totalGbPurchased,
      hasReachedTarget,
      rewardUnlocked: Boolean(item.referral_reward_earned || hasReachedTarget),
      createdAt: item.created_at,
    };
  });

  const qualifiedReferrals = normalizedUsers.filter((item) => item.rewardUnlocked).length;

  return NextResponse.json({
    summary: {
      referralId,
      referralBalance: parseFloat(user.referral_balance ?? user.referral_bonus ?? 0),
      totalGbPurchased: parseFloat(user.total_gb_purchased || 0),
      totalReferrals: normalizedUsers.length,
      qualifiedReferrals,
      rewardAmount: REFERRAL_REWARD_AMOUNT,
      targetGb: REFERRAL_TARGET_GB,
      inviteMessage: `Join SaukiMart with my referral ID ${referralId}. Buy up to ${REFERRAL_TARGET_GB}GB and I earn ₦${REFERRAL_REWARD_AMOUNT.toLocaleString('en-NG')}.`,
    },
    referredUsers: normalizedUsers,
  });
}
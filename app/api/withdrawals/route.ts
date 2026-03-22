import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { verifyPin } from '@/lib/utils';
import { resolveAccountNumber } from '@/lib/flutterwave';
import { ensureEarnSchema, MIN_WITHDRAWAL_AMOUNT, roundMoney } from '@/lib/earn';

async function getAuthedUser(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) return null;
  const payload = await verifyToken(auth.slice(7));
  if (!payload?.userId) return null;
  return payload.userId as string;
}

export async function GET(req: NextRequest) {
  const userId = await getAuthedUser(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await ensureEarnSchema();

  const withdrawals = await sql`
    SELECT id, amount, bank_code, bank_name, account_number, account_name,
           status, payout_reference, admin_note, paid_at, created_at, updated_at
    FROM withdrawals
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
    LIMIT 100
  `;

  return NextResponse.json({
    withdrawals: withdrawals.map((item) => ({
      id: String(item.id),
      amount: parseFloat(item.amount),
      bankCode: String(item.bank_code || ''),
      bankName: String(item.bank_name || ''),
      accountNumber: String(item.account_number || ''),
      accountName: String(item.account_name || ''),
      status: String(item.status || 'pending'),
      payoutReference: item.payout_reference || null,
      adminNote: item.admin_note || null,
      paidAt: item.paid_at || null,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    })),
  });
}

export async function POST(req: NextRequest) {
  const userId = await getAuthedUser(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await ensureEarnSchema();

  try {
    const { amount, bankCode, bankName, accountNumber, pin } = await req.json();
    const withdrawalAmount = roundMoney(Number(amount || 0));

    if (!/^\d{4}$/.test(String(pin || ''))) {
      return NextResponse.json({ error: 'Enter your 4-digit PIN' }, { status: 400 });
    }
    if (!/^\d{10}$/.test(String(accountNumber || ''))) {
      return NextResponse.json({ error: 'Enter a valid 10-digit account number' }, { status: 400 });
    }
    if (!String(bankCode || '').trim() || !String(bankName || '').trim()) {
      return NextResponse.json({ error: 'Select a bank first' }, { status: 400 });
    }
    if (!Number.isFinite(withdrawalAmount) || withdrawalAmount < MIN_WITHDRAWAL_AMOUNT) {
      return NextResponse.json({ error: `Minimum withdrawal is ₦${MIN_WITHDRAWAL_AMOUNT.toLocaleString('en-NG')}` }, { status: 400 });
    }

    const [user] = await sql`
      SELECT id, pin_hash, referral_balance, referral_bonus, is_banned
      FROM users
      WHERE id = ${userId}
      LIMIT 1
    `;

    if (!user || user.is_banned) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const isValidPin = await verifyPin(String(pin), String(user.pin_hash));
    if (!isValidPin) return NextResponse.json({ error: 'Incorrect PIN' }, { status: 401 });

    const referralBalance = parseFloat(user.referral_balance ?? user.referral_bonus ?? 0);
    if (withdrawalAmount > referralBalance) {
      return NextResponse.json({ error: 'Insufficient referral balance' }, { status: 400 });
    }

    const resolved = await resolveAccountNumber(String(accountNumber), String(bankCode));
    if (resolved?.status !== 'success' || !resolved?.data?.account_name) {
      return NextResponse.json({ error: resolved?.message || 'Could not verify the bank account' }, { status: 400 });
    }

    const resolvedAccountName = String(resolved.data.account_name);

    const [transaction] = await sql`
      INSERT INTO transactions (user_id, type, description, amount, status, receipt_data)
      VALUES (
        ${userId},
        'withdrawal_request',
        ${`Referral withdrawal to ${String(bankName).trim()}`},
        ${withdrawalAmount},
        'pending',
        ${JSON.stringify({
          bankCode: String(bankCode),
          bankName: String(bankName).trim(),
          accountNumber: String(accountNumber),
          accountName: resolvedAccountName,
          requestedAt: new Date().toISOString(),
        })}
      )
      RETURNING id
    `;

    const [updatedUser] = await sql`
      UPDATE users
      SET referral_balance = referral_balance - ${withdrawalAmount},
          referral_bonus = GREATEST(COALESCE(referral_bonus, 0) - ${withdrawalAmount}, 0),
          updated_at = NOW()
      WHERE id = ${userId}
        AND COALESCE(referral_balance, COALESCE(referral_bonus, 0)) >= ${withdrawalAmount}
      RETURNING referral_balance
    `;

    if (!updatedUser) {
      await sql`UPDATE transactions SET status = 'failed' WHERE id = ${transaction.id}`;
      return NextResponse.json({ error: 'Insufficient referral balance' }, { status: 400 });
    }

    const [withdrawal] = await sql`
      INSERT INTO withdrawals (
        user_id, transaction_id, amount, bank_code, bank_name, account_number, account_name, status
      ) VALUES (
        ${userId}, ${transaction.id}, ${withdrawalAmount}, ${String(bankCode)}, ${String(bankName).trim()},
        ${String(accountNumber)}, ${resolvedAccountName}, 'pending'
      )
      RETURNING id, amount, bank_code, bank_name, account_number, account_name, status, created_at, updated_at
    `;

    return NextResponse.json({
      success: true,
      message: 'Withdrawal request submitted for admin approval',
      referralBalance: parseFloat(updatedUser.referral_balance),
      withdrawal: {
        id: String(withdrawal.id),
        amount: parseFloat(withdrawal.amount),
        bankCode: String(withdrawal.bank_code || ''),
        bankName: String(withdrawal.bank_name || ''),
        accountNumber: String(withdrawal.account_number || ''),
        accountName: String(withdrawal.account_name || ''),
        status: String(withdrawal.status || 'pending'),
        createdAt: withdrawal.created_at,
        updatedAt: withdrawal.updated_at,
      },
    });
  } catch (err) {
    console.error('Withdrawal request error:', err);
    return NextResponse.json({ error: 'Failed to submit withdrawal request' }, { status: 500 });
  }
}
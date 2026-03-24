import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { verifyPin, generateReceiptRef } from '@/lib/utils';
import { initiateTransfer } from '@/lib/flutterwave';
import {
  BANK_TRANSFER_DAILY_LIMIT,
  BANK_TRANSFER_HOURLY_LIMIT_COUNT,
  BANK_TRANSFER_MAX_AMOUNT,
  BANK_TRANSFER_MIN_AMOUNT,
  BANK_TRANSFER_SERVICE_CHARGE,
  ensureBankTransferSchema,
  mapTransferStatus,
  normalizeTransferError,
} from '@/lib/bankTransfer';
import { NIGERIAN_BANKS } from '@/lib/nigerianBanks';

export const dynamic = 'force-dynamic';

function makeTransferReference() {
  return `SAUKI_TRANSFER_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;
}

export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const payload = await verifyToken(auth.slice(7));
  if (!payload?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await ensureBankTransferSchema();

  let debited = false;
  let transferId = '';
  let transactionId = '';
  let totalDeducted = 0;

  try {
    const body = await req.json();
    const userId = String(payload.userId);

    const bankCode = String(body.bankCode || '').trim();
    const accountNumber = String(body.accountNumber || '').trim();
    const accountName = String(body.accountName || '').trim();
    const narration = String(body.narration || '').trim().slice(0, 100);
    const pin = String(body.pin || '').trim();
    const amount = Number(body.amount || 0);

    if (!bankCode) return NextResponse.json({ error: 'Select a bank' }, { status: 400 });
    if (!/^\d{10}$/.test(accountNumber)) return NextResponse.json({ error: 'Account number must be exactly 10 digits' }, { status: 400 });
    if (!accountName) return NextResponse.json({ error: 'Verify recipient account before transfer' }, { status: 400 });
    if (!/^\d{4}$/.test(pin)) return NextResponse.json({ error: 'Enter your 4-digit PIN' }, { status: 400 });

    if (!Number.isFinite(amount) || amount < BANK_TRANSFER_MIN_AMOUNT || amount > BANK_TRANSFER_MAX_AMOUNT) {
      return NextResponse.json({
        error: `Amount must be between ₦${BANK_TRANSFER_MIN_AMOUNT.toLocaleString('en-NG')} and ₦${BANK_TRANSFER_MAX_AMOUNT.toLocaleString('en-NG')}`,
      }, { status: 400 });
    }

    const bank = NIGERIAN_BANKS.find((b) => b.code === bankCode);
    if (!bank) return NextResponse.json({ error: 'Selected bank is not supported' }, { status: 400 });

    totalDeducted = Number((amount + BANK_TRANSFER_SERVICE_CHARGE).toFixed(2));

    const [daily] = await sql`
      SELECT COALESCE(SUM(amount), 0) AS daily_amount
      FROM bank_transfers
      WHERE user_id = ${userId}
        AND created_at::date = CURRENT_DATE
        AND status IN ('pending', 'successful')
    `;
    const dailyAmount = Number(daily?.daily_amount || 0);
    if (dailyAmount + amount > BANK_TRANSFER_DAILY_LIMIT) {
      return NextResponse.json({
        error: `Daily transfer limit reached. Limit is ₦${BANK_TRANSFER_DAILY_LIMIT.toLocaleString('en-NG')}.`,
      }, { status: 400 });
    }

    const [hourly] = await sql`
      SELECT COUNT(*)::int AS transfer_count
      FROM bank_transfers
      WHERE user_id = ${userId}
        AND created_at >= NOW() - INTERVAL '1 hour'
    `;
    if (Number(hourly?.transfer_count || 0) >= BANK_TRANSFER_HOURLY_LIMIT_COUNT) {
      return NextResponse.json({ error: 'Rate limit reached. Maximum 5 transfers per hour.' }, { status: 429 });
    }

    const [user] = await sql`
      SELECT id, first_name, last_name, phone, pin_hash, wallet_balance,
             bank_transfer_pin_failed_attempts, bank_transfer_pin_locked_until
      FROM users
      WHERE id = ${userId}
      LIMIT 1
    `;

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    if (user.bank_transfer_pin_locked_until && new Date(String(user.bank_transfer_pin_locked_until)).getTime() > Date.now()) {
      return NextResponse.json({ error: 'Too many failed PIN attempts. Try again in 30 minutes.' }, { status: 423 });
    }

    const pinValid = await verifyPin(pin, String(user.pin_hash));
    if (!pinValid) {
      const attempts = Number(user.bank_transfer_pin_failed_attempts || 0) + 1;
      const shouldLock = attempts >= 3;

      await sql`
        UPDATE users
        SET bank_transfer_pin_failed_attempts = ${shouldLock ? 0 : attempts},
            bank_transfer_pin_locked_until = ${shouldLock ? new Date(Date.now() + 30 * 60 * 1000).toISOString() : null},
            updated_at = NOW()
        WHERE id = ${userId}
      `;

      return NextResponse.json({
        error: shouldLock ? 'Too many failed PIN attempts. Try again in 30 minutes.' : `Incorrect PIN. ${3 - attempts} attempt(s) left.`,
      }, { status: 401 });
    }

    await sql`
      UPDATE users
      SET bank_transfer_pin_failed_attempts = 0,
          bank_transfer_pin_locked_until = NULL,
          updated_at = NOW()
      WHERE id = ${userId}
    `;

    if (Number(user.wallet_balance || 0) < totalDeducted) {
      return NextResponse.json({
        error: `Insufficient balance. You need ₦${totalDeducted.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} to complete this transfer.`,
      }, { status: 400 });
    }

    const [debitedWallet] = await sql`
      UPDATE users
      SET wallet_balance = wallet_balance - ${totalDeducted},
          updated_at = NOW()
      WHERE id = ${userId}
        AND wallet_balance >= ${totalDeducted}
      RETURNING wallet_balance
    `;

    if (!debitedWallet) {
      return NextResponse.json({ error: 'Insufficient balance. Please fund wallet and try again.' }, { status: 400 });
    }

    debited = true;

    const txRef = makeTransferReference();
    const receiptRef = generateReceiptRef();

    const [transaction] = await sql`
      INSERT INTO transactions (user_id, type, description, amount, status, idempotency_key, receipt_data)
      VALUES (
        ${userId},
        'bank_transfer',
        ${`Bank transfer to ${accountName} (${accountNumber})`},
        ${totalDeducted},
        'pending',
        ${txRef},
        ${JSON.stringify({
          ref: receiptRef,
          type: 'bank_transfer',
          transactionType: 'Bank Transfer',
          date: new Date().toISOString(),
          bankName: bank.name,
          accountNumber,
          recipientName: accountName,
          amountSent: amount,
          serviceCharge: BANK_TRANSFER_SERVICE_CHARGE,
          totalDeducted,
          narration: narration || '',
          flutterwaveReference: null,
          status: 'pending',
          paymentMethod: 'Wallet',
        })}
      )
      RETURNING id
    `;

    transactionId = String(transaction.id);

    const [transfer] = await sql`
      INSERT INTO bank_transfers (
        user_id, transaction_id, bank_code, bank_name, account_number, account_name,
        amount, service_charge, total_deducted, narration, status, tx_reference
      ) VALUES (
        ${userId}, ${transactionId}, ${bank.code}, ${bank.name}, ${accountNumber}, ${accountName},
        ${amount}, ${BANK_TRANSFER_SERVICE_CHARGE}, ${totalDeducted}, ${narration || null}, 'pending', ${txRef}
      )
      RETURNING id
    `;

    transferId = String(transfer.id);

    const flw = await initiateTransfer({
      accountBank: bank.code,
      accountNumber,
      amount,
      narration: narration || 'Wallet transfer',
      reference: txRef,
    });

    const providerOk = String(flw?.status || '').toLowerCase() === 'success' && !!flw?.data;
    if (!providerOk) {
      const providerError = normalizeTransferError(flw?.message);

      await sql`
        UPDATE users
        SET wallet_balance = wallet_balance + ${totalDeducted},
            updated_at = NOW()
        WHERE id = ${userId}
      `;

      await sql`
        UPDATE bank_transfers
        SET status = 'failed',
            error_message = ${providerError},
            refund_status = 'refunded',
            refunded_at = NOW(),
            flw_response = ${JSON.stringify(flw || {})},
            updated_at = NOW(),
            completed_at = NOW()
        WHERE id = ${transferId}
      `;

      await sql`
        UPDATE transactions
        SET status = 'failed',
            receipt_data = COALESCE(receipt_data, '{}'::jsonb) || ${JSON.stringify({
              status: 'failed',
              errorMessage: providerError,
              refunded: true,
            })}::jsonb
        WHERE id = ${transactionId}
      `;

      return NextResponse.json({
        error: `Transfer failed: ${providerError}. Amount refunded to your wallet.`,
      }, { status: 400 });
    }

    const mappedStatus = mapTransferStatus(flw.data.status);
    const flwReference = String(flw.data.reference || txRef);
    const flwTransferId = flw.data.id ? String(flw.data.id) : null;
    const flwFee = Number(flw.data.fee || 0);

    await sql`
      UPDATE bank_transfers
      SET status = ${mappedStatus},
          flw_transfer_id = ${flwTransferId},
          flw_reference = ${flwReference},
          flw_fee = ${flwFee},
          flw_response = ${JSON.stringify(flw)},
          updated_at = NOW(),
          completed_at = CASE WHEN ${mappedStatus} IN ('successful', 'failed') THEN NOW() ELSE completed_at END
      WHERE id = ${transferId}
    `;

    await sql`
      UPDATE transactions
      SET status = ${mappedStatus === 'successful' ? 'success' : mappedStatus},
          receipt_data = ${JSON.stringify({
            ref: receiptRef,
            type: 'bank_transfer',
            transactionType: 'Bank Transfer',
            date: new Date().toISOString(),
            bankName: bank.name,
            accountNumber,
            recipientName: accountName,
            amountSent: amount,
            amount,
            serviceCharge: BANK_TRANSFER_SERVICE_CHARGE,
            totalDeducted,
            narration: narration || '',
            flutterwaveReference: flwReference,
            flwTransferId,
            txReference: txRef,
            status: mappedStatus,
            paymentMethod: 'Wallet',
          })}
      WHERE id = ${transactionId}
    `;

    return NextResponse.json({
      success: true,
      message: mappedStatus === 'successful' ? 'Transfer successful' : 'Transfer submitted and pending completion',
      status: mappedStatus,
      newBalance: Number(debitedWallet.wallet_balance || 0),
      receipt: {
        ref: receiptRef,
        type: 'bank_transfer',
        transactionType: 'Bank Transfer',
        date: new Date().toISOString(),
        bankName: bank.name,
        accountNumber,
        recipientName: accountName,
        amountSent: amount,
        amount,
        serviceCharge: BANK_TRANSFER_SERVICE_CHARGE,
        totalDeducted,
        narration: narration || '',
        flutterwaveReference: flwReference,
        flwTransferId,
        txReference: txRef,
        status: mappedStatus,
        paymentMethod: 'Wallet',
      },
    });
  } catch (err) {
    const message = normalizeTransferError(err instanceof Error ? err.message : 'Transfer failed');
    console.error('Bank transfer error:', err);

    if (debited && payload?.userId && totalDeducted > 0) {
      await sql`
        UPDATE users
        SET wallet_balance = wallet_balance + ${totalDeducted},
            updated_at = NOW()
        WHERE id = ${String(payload.userId)}
      `;
    }

    if (transferId) {
      await sql`
        UPDATE bank_transfers
        SET status = 'failed',
            error_message = ${message},
            refund_status = 'refunded',
            refunded_at = NOW(),
            updated_at = NOW(),
            completed_at = NOW()
        WHERE id = ${transferId}
      `;
    }

    if (transactionId) {
      await sql`
        UPDATE transactions
        SET status = 'failed',
            receipt_data = COALESCE(receipt_data, '{}'::jsonb) || ${JSON.stringify({
              status: 'failed',
              errorMessage: message,
              refunded: true,
            })}::jsonb
        WHERE id = ${transactionId}
      `;
    }

    return NextResponse.json({ error: `${message}. Amount refunded to your wallet.` }, { status: 500 });
  }
}

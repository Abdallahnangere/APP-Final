import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { verifyPin, generateIdempotencyKey, generateReceiptRef } from '@/lib/utils';
import {
  AIRTIME_MAX_AMOUNT,
  AIRTIME_MIN_AMOUNT,
  AIRTIME_SERVICE_CHARGE,
  buildAirtimeTypeLabel,
  detectNetwork,
  ensureAirtimeSchema,
  getNetworkByName,
} from '@/lib/airtime';
import type { AirtimeNetwork } from '@/lib/airtime';
import { purchaseAirtime } from '@/lib/flutterwave';

export const dynamic = 'force-dynamic';

const AIRTIME_NETWORK_OPTIONS: AirtimeNetwork[] = ['MTN', 'Airtel', 'GLO', '9mobile'];

function normalizeAirtimePurchaseError(err: unknown) {
  const raw = err instanceof Error ? err.message : '';
  const lower = raw.toLowerCase();

  if (lower.includes('ip whitelisting')) {
    return 'Airtime service is temporarily unavailable. Please try again shortly.';
  }

  if (lower.includes('service temporarily unavailable')) {
    return 'Airtime service is temporarily unavailable. Please try again shortly.';
  }

  return raw || 'Airtime purchase failed. Please try again.';
}

export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const payload = await verifyToken(auth.slice(7));
  if (!payload?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await ensureAirtimeSchema();

  let walletDebited = false;
  let totalAmount = 0;
  let userId = '';
  let transactionId = '';
  let airtimeId = '';

  try {
    const body = await req.json();
    const { pin, phoneNumber, amount, network, idempotencyKey: clientIdempotency } = body;

    const cleanAmount = Number(amount || 0);
    const cleanPhone = String(phoneNumber || '').trim();
    const selectedNetwork = AIRTIME_NETWORK_OPTIONS.includes(network as AirtimeNetwork)
      ? (network as AirtimeNetwork)
      : null;

    if (network && !selectedNetwork) {
      return NextResponse.json({ error: 'Selected network is not supported' }, { status: 400 });
    }

    if (!/^\d{4}$/.test(String(pin || ''))) {
      return NextResponse.json({ error: 'Enter your 4-digit PIN' }, { status: 400 });
    }
    if (!/^\d{11}$/.test(cleanPhone)) {
      return NextResponse.json({ error: 'Enter an 11-digit phone number' }, { status: 400 });
    }

    const detectedNetwork = detectNetwork(cleanPhone);
    const resolvedNetwork = selectedNetwork || detectedNetwork;

    if (!resolvedNetwork) {
      return NextResponse.json({ error: 'Invalid phone number or unsupported network' }, { status: 400 });
    }

    const networkConfig = getNetworkByName(resolvedNetwork);
    if (!networkConfig) {
      return NextResponse.json({ error: 'Network not supported' }, { status: 400 });
    }

    if (!Number.isFinite(cleanAmount) || cleanAmount < AIRTIME_MIN_AMOUNT || cleanAmount > AIRTIME_MAX_AMOUNT) {
      return NextResponse.json({
        error: `Amount must be between ₦${AIRTIME_MIN_AMOUNT.toLocaleString('en-NG')} and ₦${AIRTIME_MAX_AMOUNT.toLocaleString('en-NG')}`,
      }, { status: 400 });
    }

    userId = String(payload.userId);
    totalAmount = Number((cleanAmount + AIRTIME_SERVICE_CHARGE).toFixed(2));
    const idemKey = String(clientIdempotency || generateIdempotencyKey());

    const [existing] = await sql`
      SELECT id, status, flw_reference, tx_reference, network_name, phone_number, amount, created_at, error_message
      FROM airtime_transactions
      WHERE user_id = ${userId} AND idempotency_key = ${idemKey}
      LIMIT 1
    `;

    if (existing) {
      const success = String(existing.status) === 'success';
      return NextResponse.json({
        success,
        message: success ? 'Airtime purchase successful' : (existing.error_message || 'Previous attempt failed'),
        receipt: {
          ref: String(existing.tx_reference || ''),
          type: 'airtime_purchase',
          transactionType: 'Airtime Purchase',
          date: existing.created_at,
          networkName: String(existing.network_name || ''),
          phoneNumber: String(existing.phone_number || ''),
          amount: Number(existing.amount || 0),
          serviceCharge: AIRTIME_SERVICE_CHARGE,
          totalAmount: totalAmount,
          flwRef: existing.flw_reference || null,
          status: String(existing.status || 'pending'),
          paymentMethod: 'Wallet',
        },
      });
    }

    const [user] = await sql`
      SELECT id, pin_hash, first_name, last_name, phone, wallet_balance, is_banned
      FROM users
      WHERE id = ${userId}
      LIMIT 1
    `;

    if (!user || user.is_banned) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const pinOk = await verifyPin(String(pin), String(user.pin_hash));
    if (!pinOk) return NextResponse.json({ error: 'Incorrect PIN' }, { status: 401 });

    const [balanceRow] = await sql`
      UPDATE users
      SET wallet_balance = wallet_balance - ${totalAmount},
          updated_at = NOW()
      WHERE id = ${userId} AND wallet_balance >= ${totalAmount}
      RETURNING wallet_balance
    `;

    if (!balanceRow) {
      return NextResponse.json({ error: 'Insufficient balance. Please fund your wallet.' }, { status: 400 });
    }

    walletDebited = true;

    const receiptRef = generateReceiptRef();

    const [txn] = await sql`
      INSERT INTO transactions (user_id, type, description, amount, status, idempotency_key, receipt_data)
      VALUES (
        ${userId},
        'airtime_purchase',
        ${buildAirtimeTypeLabel(resolvedNetwork, cleanPhone)},
        ${totalAmount},
        'pending',
        ${idemKey},
        ${JSON.stringify({
          ref: receiptRef,
          type: 'airtime_purchase',
          transactionType: 'Airtime Purchase',
          date: new Date().toISOString(),
          networkName: resolvedNetwork,
          phoneNumber: cleanPhone,
          amount: cleanAmount,
          serviceCharge: AIRTIME_SERVICE_CHARGE,
          totalAmount,
          status: 'pending',
          paymentMethod: 'Wallet',
          userName: `${String(user.first_name || '')} ${String(user.last_name || '')}`.trim(),
          userPhone: String(user.phone || ''),
        })}
      )
      RETURNING id
    `;

    transactionId = String(txn.id);

    const [airtime] = await sql`
      INSERT INTO airtime_transactions (
        user_id, transaction_id, network_code, network_name, phone_number,
        amount, status, tx_reference, idempotency_key
      ) VALUES (
        ${userId}, ${transactionId}, ${networkConfig.networkCode}, ${resolvedNetwork}, ${cleanPhone},
        ${cleanAmount}, 'pending', ${receiptRef}, ${idemKey}
      )
      RETURNING id
    `;

    airtimeId = String(airtime.id);

    const flw = await purchaseAirtime({
      phoneNumber: cleanPhone,
      amount: cleanAmount,
      networkName: resolvedNetwork,
      reference: receiptRef,
    });

    const flwOk = flw?.status === 'success';
    const flwRef = flw?.data?.flw_ref ? String(flw.data.flw_ref) : null;

    if (!flwOk) {
      throw new Error(normalizeAirtimePurchaseError(flw?.message));
    }

    await sql`
      UPDATE airtime_transactions
      SET status = 'success',
          flw_reference = ${flwRef},
          flw_response = ${JSON.stringify(flw)},
          updated_at = NOW()
      WHERE id = ${airtimeId}
    `;

    await sql`
      UPDATE transactions
      SET status = 'success',
          receipt_data = ${JSON.stringify({
            ref: receiptRef,
            type: 'airtime_purchase',
            transactionType: 'Airtime Purchase',
            date: new Date().toISOString(),
            networkName: resolvedNetwork,
            phoneNumber: cleanPhone,
            amount: cleanAmount,
            serviceCharge: AIRTIME_SERVICE_CHARGE,
            totalAmount,
            flwRef,
            txReference: receiptRef,
            flutterwaveReference: flwRef,
            status: 'success',
            paymentMethod: 'Wallet',
            userName: `${String(user.first_name || '')} ${String(user.last_name || '')}`.trim(),
            userPhone: String(user.phone || ''),
          })}
      WHERE id = ${transactionId}
    `;

    return NextResponse.json({
      success: true,
      message: 'Airtime purchase successful',
      flwReference: flwRef,
      newBalance: Number(balanceRow.wallet_balance || 0),
      receipt: {
        ref: receiptRef,
        type: 'airtime_purchase',
        transactionType: 'Airtime Purchase',
        date: new Date().toISOString(),
        networkName: resolvedNetwork,
        phoneNumber: cleanPhone,
        amount: cleanAmount,
        serviceCharge: AIRTIME_SERVICE_CHARGE,
        totalAmount,
        flwRef,
        txReference: receiptRef,
        flutterwaveReference: flwRef,
        status: 'success',
        paymentMethod: 'Wallet',
      },
    });
  } catch (err) {
    const message = normalizeAirtimePurchaseError(err);
    console.error('Airtime purchase error:', err);

    if (walletDebited && userId && totalAmount > 0) {
      await sql`
        UPDATE users
        SET wallet_balance = wallet_balance + ${totalAmount},
            updated_at = NOW()
        WHERE id = ${userId}
      `;
    }

    if (airtimeId) {
      await sql`
        UPDATE airtime_transactions
        SET status = 'failed',
            error_message = ${message},
            retry_attempts = COALESCE(retry_attempts, 0) + 1,
            updated_at = NOW()
        WHERE id = ${airtimeId}
      `;
    }

    if (transactionId) {
      await sql`
        UPDATE transactions
        SET status = 'failed',
            receipt_data = COALESCE(receipt_data, '{}'::jsonb) || ${JSON.stringify({
              status: 'failed',
              errorMessage: message,
            })}::jsonb
        WHERE id = ${transactionId}
      `;
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

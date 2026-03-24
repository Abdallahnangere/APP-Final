import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { verifyPin, generateIdempotencyKey, generateReceiptRef } from '@/lib/utils';
import {
  ELECTRICITY_MAX_AMOUNT,
  ELECTRICITY_MIN_AMOUNT,
  ELECTRICITY_SERVICE_CHARGE,
  buildElectricityTypeLabel,
  ensureElectricitySchema,
  normalizeMeterType,
} from '@/lib/electricity';
import { purchaseElectricityBill, validateElectricityMeter } from '@/lib/flutterwave';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const payload = await verifyToken(auth.slice(7));
  if (!payload?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await ensureElectricitySchema();

  let walletDebited = false;
  let totalAmount = 0;
  let userId = '';
  let transactionId = '';
  let electricityId = '';

  try {
    const body = await req.json();
    const {
      pin,
      itemCode,
      discoName,
      meterNumber,
      meterType,
      amount,
      customerName,
      phoneNumber,
      email,
      idempotencyKey: clientIdempotency,
    } = body;

    const cleanMeterType = normalizeMeterType(meterType);
    const cleanAmount = Number(amount || 0);

    if (!/^\d{4}$/.test(String(pin || ''))) {
      return NextResponse.json({ error: 'Enter your 4-digit PIN' }, { status: 400 });
    }
    if (!String(itemCode || '').trim() || !String(discoName || '').trim()) {
      return NextResponse.json({ error: 'Select a DISCO provider' }, { status: 400 });
    }
    if (!/^\d{11}$/.test(String(meterNumber || ''))) {
      return NextResponse.json({ error: 'Meter number must be 11 digits' }, { status: 400 });
    }
    if (!cleanMeterType) {
      return NextResponse.json({ error: 'Choose meter type' }, { status: 400 });
    }
    if (!Number.isFinite(cleanAmount) || cleanAmount < ELECTRICITY_MIN_AMOUNT || cleanAmount > ELECTRICITY_MAX_AMOUNT) {
      return NextResponse.json({ error: `Amount must be between ₦${ELECTRICITY_MIN_AMOUNT.toLocaleString('en-NG')} and ₦${ELECTRICITY_MAX_AMOUNT.toLocaleString('en-NG')}` }, { status: 400 });
    }

    userId = String(payload.userId);
    totalAmount = Number((cleanAmount + ELECTRICITY_SERVICE_CHARGE).toFixed(2));
    const idemKey = String(clientIdempotency || generateIdempotencyKey());

    const meterValidation = await validateElectricityMeter(String(itemCode), String(meterNumber));
    const meterValid = meterValidation?.status === 'success' && meterValidation?.data?.response_code === '00';
    if (!meterValid) {
      return NextResponse.json({
        error: meterValidation?.data?.response_message || meterValidation?.message || 'Invalid meter number. Please check and try again.',
      }, { status: 400 });
    }
    const validatedCustomerName = String(meterValidation?.data?.name || customerName || '');

    const [existing] = await sql`
      SELECT id, status, token, units, tx_reference, flw_reference, customer_name,
             disco_name, disco_code, meter_number, meter_type, amount, service_charge, total_amount,
             phone_number, email, created_at, error_message
      FROM electricity_transactions
      WHERE user_id = ${userId} AND idempotency_key = ${idemKey}
      LIMIT 1
    `;

    if (existing) {
      const success = String(existing.status) === 'success';
      return NextResponse.json({
        success,
        message: success ? 'Electricity purchase successful' : (existing.error_message || 'Previous attempt failed'),
        receipt: {
          ref: String(existing.tx_reference || ''),
          type: 'electricity_purchase',
          transactionType: 'Electricity Purchase',
          date: existing.created_at,
          discoName: String(existing.disco_name || ''),
          discoCode: String(existing.disco_code || ''),
          meterNumber: String(existing.meter_number || ''),
          meterType: String(existing.meter_type || ''),
          customerName: String(existing.customer_name || ''),
          amount: Number(existing.amount || 0),
          serviceCharge: Number(existing.service_charge || 0),
          totalAmount: Number(existing.total_amount || 0),
          token: existing.token || null,
          units: existing.units || null,
          flwRef: existing.flw_reference || null,
          status: String(existing.status || 'pending'),
          paymentMethod: 'Wallet',
          phoneNumber: String(existing.phone_number || ''),
          email: String(existing.email || ''),
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
        'electricity_purchase',
        ${`${String(discoName)} ${cleanMeterType} for meter ${String(meterNumber)}`},
        ${totalAmount},
        'pending',
        ${idemKey},
        ${JSON.stringify({
          ref: receiptRef,
          type: 'electricity_purchase',
          transactionType: 'Electricity Purchase',
          date: new Date().toISOString(),
          discoName: String(discoName),
          discoCode: String(itemCode),
          meterNumber: String(meterNumber),
          meterType: cleanMeterType,
          customerName: validatedCustomerName,
          amount: cleanAmount,
          serviceCharge: ELECTRICITY_SERVICE_CHARGE,
          totalAmount,
          status: 'pending',
          paymentMethod: 'Wallet',
          phoneNumber: String(phoneNumber || user.phone || ''),
          email: String(email || ''),
        })}
      )
      RETURNING id
    `;

    transactionId = String(txn.id);

    const [electricity] = await sql`
      INSERT INTO electricity_transactions (
        user_id, transaction_id, disco_name, disco_code, meter_number, meter_type, customer_name,
        amount, service_charge, total_amount, phone_number, email, status, tx_reference, idempotency_key
      ) VALUES (
        ${userId}, ${transactionId}, ${String(discoName)}, ${String(itemCode)}, ${String(meterNumber)}, ${cleanMeterType},
        ${validatedCustomerName}, ${cleanAmount}, ${ELECTRICITY_SERVICE_CHARGE}, ${totalAmount},
        ${String(phoneNumber || user.phone || '')}, ${String(email || '')}, 'pending', ${receiptRef}, ${idemKey}
      )
      RETURNING id
    `;

    electricityId = String(electricity.id);

    const flw = await purchaseElectricityBill({
      meterNumber: String(meterNumber),
      amount: cleanAmount,
      meterType: cleanMeterType,
      discoName: buildElectricityTypeLabel(String(discoName), cleanMeterType),
      reference: receiptRef,
    });

    const flwOk = flw?.status === 'success';
    const token = flw?.data?.token ? String(flw.data.token) : null;
    const units = flw?.data?.units ? String(flw.data.units) : null;
    const flwRef = flw?.data?.flw_ref ? String(flw.data.flw_ref) : null;

    if (!flwOk) {
      throw new Error(flw?.message || 'Service temporarily unavailable. Please try again later.');
    }

    await sql`
      UPDATE electricity_transactions
      SET status = 'success',
          token = ${token},
          units = ${units},
          flw_reference = ${flwRef},
          flw_response = ${JSON.stringify(flw)},
          updated_at = NOW()
      WHERE id = ${electricityId}
    `;

    await sql`
      UPDATE transactions
      SET status = 'success',
          receipt_data = ${JSON.stringify({
            ref: receiptRef,
            type: 'electricity_purchase',
            transactionType: 'Electricity Purchase',
            date: new Date().toISOString(),
            discoName: String(discoName),
            discoCode: String(itemCode),
            meterNumber: String(meterNumber),
            meterType: cleanMeterType,
            customerName: validatedCustomerName,
            amount: cleanAmount,
            serviceCharge: ELECTRICITY_SERVICE_CHARGE,
            totalAmount,
            token,
            units,
            flwRef,
            txReference: receiptRef,
            flutterwaveReference: flwRef,
            status: 'success',
            paymentMethod: 'Wallet',
            phoneNumber: String(phoneNumber || user.phone || ''),
            email: String(email || ''),
            userName: `${String(user.first_name || '')} ${String(user.last_name || '')}`.trim(),
            userPhone: String(user.phone || ''),
          })}
      WHERE id = ${transactionId}
    `;

    return NextResponse.json({
      success: true,
      message: 'Electricity purchase successful',
      token,
      units,
      flwReference: flwRef,
      newBalance: Number(balanceRow.wallet_balance || 0),
      receipt: {
        ref: receiptRef,
        type: 'electricity_purchase',
        transactionType: 'Electricity Purchase',
        date: new Date().toISOString(),
        discoName: String(discoName),
        discoCode: String(itemCode),
        meterNumber: String(meterNumber),
        meterType: cleanMeterType,
        customerName: validatedCustomerName,
        amount: cleanAmount,
        serviceCharge: ELECTRICITY_SERVICE_CHARGE,
        totalAmount,
        token,
        units,
        flwRef,
        txReference: receiptRef,
        flutterwaveReference: flwRef,
        status: 'success',
        paymentMethod: 'Wallet',
        phoneNumber: String(phoneNumber || user.phone || ''),
        email: String(email || ''),
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Electricity purchase failed';
    console.error('Electricity purchase error:', err);

    if (walletDebited && userId && totalAmount > 0) {
      await sql`
        UPDATE users
        SET wallet_balance = wallet_balance + ${totalAmount},
            updated_at = NOW()
        WHERE id = ${userId}
      `;
    }

    if (electricityId) {
      await sql`
        UPDATE electricity_transactions
        SET status = 'failed',
            error_message = ${message},
            retry_attempts = COALESCE(retry_attempts, 0) + 1,
            updated_at = NOW()
        WHERE id = ${electricityId}
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

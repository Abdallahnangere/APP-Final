import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getBalances, initiateTransfer } from '@/lib/flutterwave';
import {
  NIGERIAN_BANKS,
  MIN_TRANSFER_AMOUNT,
  MAX_TRANSFER_AMOUNT,
  DAILY_TRANSFER_LIMIT,
  calculateTransferFee,
  ensureAdminTransfersSchema,
  mapFlutterwaveTransferStatus,
} from '@/lib/flutterwaveAdmin';
import { cleanText, getAdminPayload } from '../_shared';

export const dynamic = 'force-dynamic';

function createReference() {
  return `SM_ADMIN_TRF_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;
}

export async function POST(req: NextRequest) {
  const admin = await getAdminPayload(req);
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  await ensureAdminTransfersSchema();

  let transferDbId = '';

  try {
    const body = await req.json();
    const bankCode = cleanText(body.bankCode, 20);
    const accountNumber = cleanText(body.accountNumber, 20);
    const accountName = cleanText(body.accountName, 180);
    const narration = cleanText(body.narration || 'Admin transfer', 100);
    const bank = NIGERIAN_BANKS.find((item) => item.code === bankCode);

    const amount = Number(body.amount || 0);
    if (!bank) return NextResponse.json({ error: 'Select a valid bank' }, { status: 400 });
    if (!/^\d{10}$/.test(accountNumber)) return NextResponse.json({ error: 'Account number must be 10 digits' }, { status: 400 });
    if (!accountName) return NextResponse.json({ error: 'Verify account before transfer' }, { status: 400 });
    if (!Number.isFinite(amount) || amount < MIN_TRANSFER_AMOUNT || amount > MAX_TRANSFER_AMOUNT) {
      return NextResponse.json({
        error: `Amount must be between ₦${MIN_TRANSFER_AMOUNT.toLocaleString('en-NG')} and ₦${MAX_TRANSFER_AMOUNT.toLocaleString('en-NG')}`,
      }, { status: 400 });
    }

    const fee = calculateTransferFee(amount);
    const total = Number((amount + fee).toFixed(2));

    const [daily] = await sql`
      SELECT COALESCE(SUM(total_deducted), 0) AS today_total
      FROM admin_transfers
      WHERE created_at::date = CURRENT_DATE
        AND status IN ('pending', 'successful')
    `;
    const dailyTotal = Number(daily?.today_total || 0);
    if (dailyTotal + total > DAILY_TRANSFER_LIMIT) {
      return NextResponse.json({
        error: `Daily transfer limit exceeded. Limit: ₦${DAILY_TRANSFER_LIMIT.toLocaleString('en-NG')}`,
      }, { status: 400 });
    }

    const balanceRes = await getBalances();
    const balances = Array.isArray(balanceRes?.data) ? balanceRes.data : [];
    const ngn = balances.find((row: Record<string, unknown>) => String(row.currency || '').toUpperCase() === 'NGN');
    const available = Number(ngn?.available_balance || 0);
    if (!ngn || available < total) {
      return NextResponse.json({
        error: `Insufficient Flutterwave balance. Available: ₦${available.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      }, { status: 400 });
    }

    const txReference = createReference();

    const [inserted] = await sql`
      INSERT INTO admin_transfers (
        bank_code, bank_name, account_number, account_name,
        amount, transfer_fee, total_deducted, narration,
        status, tx_reference, admin_user_id
      ) VALUES (
        ${bank.code}, ${bank.name}, ${accountNumber}, ${accountName},
        ${amount}, ${fee}, ${total}, ${narration},
        'pending', ${txReference}, ${admin.userId || null}
      )
      RETURNING id
    `;

    transferDbId = String(inserted.id);

    const flw = await initiateTransfer({
      accountBank: bank.code,
      accountNumber,
      amount,
      narration,
      reference: txReference,
    });

    const providerOk = String(flw?.status || '').toLowerCase() === 'success' && !!flw?.data;

    if (!providerOk) {
      const msg = String(flw?.message || 'Transfer failed');
      await sql`
        UPDATE admin_transfers
        SET status = 'failed',
            error_message = ${msg},
            flw_response = ${JSON.stringify(flw || {})},
            updated_at = NOW(),
            completed_at = NOW()
        WHERE id = ${transferDbId}
      `;

      return NextResponse.json({ error: msg }, { status: 400 });
    }

    const flwStatus = mapFlutterwaveTransferStatus(flw.data.status);

    await sql`
      UPDATE admin_transfers
      SET status = ${flwStatus},
          flw_transfer_id = ${flw.data.id ? String(flw.data.id) : null},
          flw_reference = ${flw.data.reference ? String(flw.data.reference) : txReference},
          flw_response = ${JSON.stringify(flw)},
          updated_at = NOW(),
          completed_at = CASE WHEN ${flwStatus} IN ('successful', 'failed') THEN NOW() ELSE completed_at END
      WHERE id = ${transferDbId}
    `;

    return NextResponse.json({
      success: true,
      message: flw?.message || 'Transfer queued successfully',
      transfer: {
        id: transferDbId,
        bankCode: bank.code,
        bankName: bank.name,
        accountNumber,
        accountName,
        amount,
        transferFee: fee,
        totalDeducted: total,
        narration,
        status: flwStatus,
        flwTransferId: flw.data.id ? String(flw.data.id) : null,
        flwReference: flw.data.reference ? String(flw.data.reference) : txReference,
        txReference,
        createdAt: new Date().toISOString(),
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Transfer failed';
    console.error('Admin transfer error:', err);

    if (transferDbId) {
      await sql`
        UPDATE admin_transfers
        SET status = 'failed',
            error_message = ${message},
            updated_at = NOW(),
            completed_at = NOW()
        WHERE id = ${transferDbId}
      `;
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

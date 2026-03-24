import { NextRequest, NextResponse } from 'next/server';
import { resolveAccountNumber } from '@/lib/flutterwave';
import { NIGERIAN_BANKS, ensureAdminTransfersSchema } from '@/lib/flutterwaveAdmin';
import { getAdminPayload, cleanText } from '../_shared';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const admin = await getAdminPayload(req);
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  await ensureAdminTransfersSchema();

  try {
    const body = await req.json();
    const bankCode = cleanText(body.bankCode, 20);
    const accountNumber = cleanText(body.accountNumber, 20);

    if (!bankCode) return NextResponse.json({ error: 'Select a bank' }, { status: 400 });
    if (!/^\d{10}$/.test(accountNumber)) {
      return NextResponse.json({ error: 'Account number must be 10 digits' }, { status: 400 });
    }

    const bank = NIGERIAN_BANKS.find((item) => item.code === bankCode);
    if (!bank) return NextResponse.json({ error: 'Selected bank is not supported' }, { status: 400 });

    const flw = await resolveAccountNumber(accountNumber, bankCode);
    const ok = String(flw?.status || '').toLowerCase() === 'success' && !!flw?.data;

    if (!ok) {
      return NextResponse.json({
        error: flw?.message || 'Sorry, that account number is invalid, please check and try again',
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      accountNumber: String(flw.data.account_number || accountNumber),
      accountName: String(flw.data.account_name || ''),
      bankCode,
      bankName: bank.name,
      providerMessage: flw?.message || null,
    });
  } catch (err) {
    console.error('Admin account resolve error:', err);
    return NextResponse.json({ error: 'Unable to verify account right now. Please try again.' }, { status: 500 });
  }
}

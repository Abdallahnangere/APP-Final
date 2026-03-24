import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { resolveAccountNumber } from '@/lib/flutterwave';
import { NIGERIAN_BANKS } from '@/lib/nigerianBanks';
import { ensureBankTransferSchema } from '@/lib/bankTransfer';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const payload = await verifyToken(auth.slice(7));
  if (!payload?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await ensureBankTransferSchema();

  try {
    const body = await req.json();
    const bankCode = String(body.bankCode || '').trim();
    const accountNumber = String(body.accountNumber || '').trim();

    if (!bankCode) return NextResponse.json({ error: 'Select a bank' }, { status: 400 });
    if (!/^\d{10}$/.test(accountNumber)) return NextResponse.json({ error: 'Account number must be exactly 10 digits' }, { status: 400 });

    const bank = NIGERIAN_BANKS.find((b) => b.code === bankCode);
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
      bankCode,
      bankName: bank.name,
      accountNumber: String(flw.data.account_number || accountNumber),
      accountName: String(flw.data.account_name || ''),
      providerMessage: flw?.message || null,
    });
  } catch (err) {
    console.error('Bank transfer account verification error:', err);
    return NextResponse.json({ error: 'Verification timed out. Please try again.' }, { status: 500 });
  }
}

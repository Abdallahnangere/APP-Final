import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { resolveAccountNumber } from '@/lib/flutterwave';

export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const payload = await verifyToken(auth.slice(7));
  if (!payload?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { accountNumber, bankCode } = await req.json();

    if (!/^\d{10}$/.test(String(accountNumber || ''))) {
      return NextResponse.json({ error: 'Enter a valid 10-digit account number' }, { status: 400 });
    }
    if (!String(bankCode || '').trim()) {
      return NextResponse.json({ error: 'Select a bank' }, { status: 400 });
    }

    const response = await resolveAccountNumber(String(accountNumber), String(bankCode));
    if (response?.status !== 'success' || !response?.data?.account_name) {
      return NextResponse.json({ error: response?.message || 'Unable to resolve account' }, { status: 400 });
    }

    return NextResponse.json({
      accountName: String(response.data.account_name),
      accountNumber: String(response.data.account_number || accountNumber),
      bankCode: String(bankCode),
    });
  } catch (err) {
    console.error('Resolve account error:', err);
    return NextResponse.json({ error: 'Failed to resolve bank account' }, { status: 500 });
  }
}
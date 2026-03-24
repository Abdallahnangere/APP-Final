import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { normalizeMeterType } from '@/lib/electricity';
import { validateElectricityMeter } from '@/lib/flutterwave';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const payload = await verifyToken(auth.slice(7));
  if (!payload?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { itemCode, meterNumber, meterType } = await req.json();

    if (!String(itemCode || '').trim()) {
      return NextResponse.json({ error: 'Select a DISCO provider' }, { status: 400 });
    }
    if (!/^\d{11}$/.test(String(meterNumber || ''))) {
      return NextResponse.json({ error: 'Meter number must be 11 digits' }, { status: 400 });
    }
    if (!normalizeMeterType(meterType)) {
      return NextResponse.json({ error: 'Choose meter type' }, { status: 400 });
    }

    const response = await validateElectricityMeter(String(itemCode), String(meterNumber));
    const ok = response?.status === 'success' && response?.data?.response_code === '00';

    if (!ok) {
      return NextResponse.json({
        error: response?.data?.response_message || response?.message || 'Invalid meter number. Please check and try again.',
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      customerName: String(response?.data?.name || ''),
      address: String(response?.data?.address || ''),
      meta: response?.data || null,
    });
  } catch (err) {
    console.error('Electricity meter verification error:', err);
    return NextResponse.json({ error: 'Network error. Please check your connection.' }, { status: 500 });
  }
}

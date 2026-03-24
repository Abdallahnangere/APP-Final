import { NextRequest, NextResponse } from 'next/server';
import { getBalances } from '@/lib/flutterwave';
import { ensureAdminTransfersSchema } from '@/lib/flutterwaveAdmin';
import { getAdminPayload } from '../_shared';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const admin = await getAdminPayload(req);
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  await ensureAdminTransfersSchema();

  try {
    const result = await getBalances();
    const rows = Array.isArray(result?.data) ? result.data : [];
    const ngn = rows.find((row: Record<string, unknown>) => String(row.currency || '').toUpperCase() === 'NGN');

    if (!ngn) {
      return NextResponse.json({
        error: result?.message || 'Unable to fetch NGN balance',
      }, { status: 503 });
    }

    return NextResponse.json({
      success: true,
      balance: {
        currency: 'NGN',
        available: Number(ngn.available_balance || 0),
        ledger: Number(ngn.ledger_balance || 0),
      },
      fetchedAt: new Date().toISOString(),
      providerMessage: result?.message || null,
    });
  } catch (err) {
    console.error('Admin Flutterwave balance error:', err);
    return NextResponse.json({ error: 'Unable to fetch Flutterwave balance right now' }, { status: 500 });
  }
}

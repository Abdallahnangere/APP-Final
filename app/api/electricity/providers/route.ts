import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { listElectricityBillers } from '@/lib/flutterwave';
import { NIGERIA_DISCOS, normalizeMeterType } from '@/lib/electricity';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const payload = await verifyToken(auth.slice(7));
  if (!payload?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const flw = await listElectricityBillers();
    const remote = Array.isArray(flw?.data)
      ? flw.data
          .filter((row: Record<string, unknown>) => Number(row.is_active ?? 1) === 1)
          .map((row: Record<string, unknown>) => {
            const name = String(row.name || '').trim();
            const maybeType = name.toLowerCase().includes('post') ? 'postpaid' : 'prepaid';
            return {
              itemCode: String(row.item_code || ''),
              name,
              type: normalizeMeterType(maybeType) || 'prepaid',
            };
          })
          .filter((row: { itemCode: string; name: string }) => row.itemCode && row.name)
      : [];

    const merged = [...NIGERIA_DISCOS, ...remote];
    const seen = new Set<string>();
    const providers = merged.filter((row) => {
      const key = `${row.itemCode}:${row.type}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    return NextResponse.json({ providers });
  } catch (err) {
    console.error('Electricity providers fallback:', err);
    return NextResponse.json({ providers: NIGERIA_DISCOS, fallback: true });
  }
}

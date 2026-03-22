import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { listBanks } from '@/lib/flutterwave';

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const payload = await verifyToken(auth.slice(7));
  if (!payload?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const response = await listBanks('NG');
    if (response?.status !== 'success' || !Array.isArray(response?.data)) {
      return NextResponse.json({ error: response?.message || 'Unable to load banks' }, { status: 400 });
    }

    const banks = response.data
      .map((item: Record<string, unknown>) => ({
        id: String(item.id || ''),
        code: String(item.code || ''),
        name: String(item.name || ''),
      }))
      .filter((item: { code: string; name: string }) => item.code && item.name)
      .sort((left: { name: string }, right: { name: string }) => left.name.localeCompare(right.name));

    return NextResponse.json({ banks });
  } catch (err) {
    console.error('Banks lookup error:', err);
    return NextResponse.json({ error: 'Failed to load banks' }, { status: 500 });
  }
}
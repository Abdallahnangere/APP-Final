import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const h = req.headers.get('authorization');
  if (!h?.startsWith('Bearer ') || !(await verifyAdminToken(h.slice(7)))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { service, endpoint, method, payload, headers: customHeaders } = await req.json();

  const BASES: Record<string, string> = {
    amigo: process.env.AMIGO_PROXY_URL || 'https://amigo.ng/api',
    flutterwave: 'https://api.flutterwave.com/v3',
  };

  const base = BASES[service];
  if (!base) return NextResponse.json({ error: 'Unknown service' }, { status: 400 });

  const url = `${base}${endpoint}`;
  const defaultHeaders: Record<string, string> = { 'Content-Type': 'application/json' };

  if (service === 'amigo') defaultHeaders['X-API-Key'] = process.env.AMIGO_API_KEY || '';
  if (service === 'flutterwave') defaultHeaders['Authorization'] = `Bearer ${process.env.FLW_SECRET_KEY}`;

  try {
    const res = await fetch(url, {
      method: method || 'POST',
      headers: { ...defaultHeaders, ...customHeaders },
      body: payload ? JSON.stringify(payload) : undefined,
    });
    const data = await res.json();
    return NextResponse.json({ success: true, status: res.status, response: data, sentPayload: payload, url, method });
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { verifyAdminPassword } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const { service, method = 'GET', endpoint, payload, password } = await req.json();
  if (!verifyAdminPassword(password)) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    let baseUrl: string;
    let headers: Record<string, string> = { 'Content-Type': 'application/json' };

    if (service === 'flutterwave') {
      baseUrl = 'https://api.flutterwave.com/v3';
      headers['Authorization'] = `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`;
    } else if (service === 'amigo') {
      baseUrl = process.env.AMIGO_BASE_URL || 'https://amigo.ng/api/data/';
      headers['Authorization'] = `Bearer ${process.env.AMIGO_API_KEY}`;
      headers['X-API-Key'] = process.env.AMIGO_API_KEY || '';
    } else {
      return NextResponse.json({ message: 'Unknown service. Use: flutterwave | amigo' }, { status: 400 });
    }

    const url = `${baseUrl}${endpoint || ''}`;
    const response = await axios({ method, url, headers, data: payload || undefined, timeout: 30000 });
    return NextResponse.json({ status: response.status, data: response.data });
  } catch (err: any) {
    return NextResponse.json({ status: err.response?.status || 500, error: err.response?.data || err.message }, { status: 200 });
  }
}

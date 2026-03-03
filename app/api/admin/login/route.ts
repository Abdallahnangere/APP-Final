import { NextRequest, NextResponse } from 'next/server';
import { signAdminToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const password = body.password || body.adminPassword;
    const email = body.email;

    const validPassword = password === process.env.ADMIN_PASSWORD;
    const validEmail = !email || email === process.env.ADMIN_EMAIL;

    if (!validPassword || !validEmail) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
    const token = await signAdminToken();
    return NextResponse.json({ token, success: true });
  } catch {
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}

// app/api/admin/auth/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminPassword } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();
    if (!password) return NextResponse.json({ message: 'Password required' }, { status: 400 });
    if (!verifyAdminPassword(password)) {
      return NextResponse.json({ message: 'Invalid password' }, { status: 401 });
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ message: 'Auth failed' }, { status: 500 });
  }
}

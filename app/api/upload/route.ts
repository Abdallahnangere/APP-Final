import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { verifyAdminToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const auth = req.headers.get('authorization');
    if (!auth?.startsWith('Bearer ')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    if (!await verifyAdminToken(auth.slice(7))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    if (!process.env.BLOB_READ_WRITE_TOKEN) return NextResponse.json({ error: 'Upload not configured' }, { status: 500 });

    const formData = await req.formData();
    const file = formData.get('file') as File;
    if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 });

    const ext = file.name.split('.').pop() || 'jpg';
    const blob = await put(`products/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`, file, { access: 'public', token: process.env.BLOB_READ_WRITE_TOKEN });
    return NextResponse.json({ url: blob.url });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Upload failed' }, { status: 500 });
  }
}

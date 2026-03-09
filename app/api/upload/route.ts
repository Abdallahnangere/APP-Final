import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { verifyAdminToken } from '@/lib/auth';
import sql from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const auth = req.headers.get('authorization');
    if (!auth?.startsWith('Bearer ')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    if (!await verifyAdminToken(auth.slice(7))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const formData = await req.formData();
    const file = formData.get('file') as File;
    if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 });

    const ext = file.name.split('.').pop() || 'jpg';
    const filename = `products/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}?t=${Date.now()}`;
    
    // Generate base64 backup
    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');

    // Try to upload to Blob, fallback to base64 data URL
    let imageUrl = '';
    try {
      if (process.env.BLOB_READ_WRITE_TOKEN) {
        const blob = await put(filename, file, { access: 'public', token: process.env.BLOB_READ_WRITE_TOKEN });
        imageUrl = blob.url;
      }
    } catch (e) {
      console.warn('Blob upload failed, using base64 fallback:', e);
    }

    // Use base64 data URL as fallback
    const dataUrl = `data:${file.type};base64,${base64}`;
    
    return NextResponse.json({ 
      url: imageUrl || dataUrl,
      base64: base64 
    });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Upload failed' }, { status: 500 });
  }
}

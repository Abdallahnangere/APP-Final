import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET() {
  try {
    const rows = await sql`SELECT id, message, created_at FROM broadcasts WHERE is_active = TRUE ORDER BY created_at DESC`;
    const response = NextResponse.json(rows);
    response.headers.set('Cache-Control', 'public, max-age=0, must-revalidate');
    return response;
  } catch {
    return NextResponse.json([]);
  }
}

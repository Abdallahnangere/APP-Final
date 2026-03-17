import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { verifyAdminToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const h = req.headers.get('authorization');
  if (!h?.startsWith('Bearer ') || !(await verifyAdminToken(h.slice(7)))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');

  const txns = userId
    ? await sql`SELECT t.*, u.first_name, u.last_name, u.phone FROM transactions t JOIN users u ON t.user_id=u.id WHERE t.user_id=${userId} ORDER BY t.created_at DESC LIMIT 100`
    : await sql`SELECT t.*, u.first_name, u.last_name, u.phone FROM transactions t JOIN users u ON t.user_id=u.id ORDER BY t.created_at DESC LIMIT 200`;

  const response = NextResponse.json(txns);
  response.headers.set('Cache-Control', 'public, max-age=0, must-revalidate');
  return response;
}

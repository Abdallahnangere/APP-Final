import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAdminToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const h = req.headers.get('authorization');
  if (!h?.startsWith('Bearer ') || !(await verifyAdminToken(h.slice(7)))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');

  const txns = userId
    ? (await db.query(`SELECT t.*, u.first_name, u.last_name, u.phone FROM transactions t JOIN users u ON t.user_id=u.id WHERE t.user_id=$1 ORDER BY t.created_at DESC LIMIT 100`, [userId])).rows
    : (await db.query(`SELECT t.*, u.first_name, u.last_name, u.phone FROM transactions t JOIN users u ON t.user_id=u.id ORDER BY t.created_at DESC LIMIT 200`)).rows;

  const response = NextResponse.json(txns);
  response.headers.set('Cache-Control', 'public, max-age=0, must-revalidate');
  return response;
}

export async function PATCH(req: NextRequest) {
  const h = req.headers.get('authorization');
  if (!h?.startsWith('Bearer ') || !(await verifyAdminToken(h.slice(7)))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json() as { ids?: string[]; status?: string };
  const ids = Array.isArray(body.ids) ? body.ids.filter(Boolean) : [];
  if (!ids.length || !body.status) return NextResponse.json({ error: 'ids and status are required' }, { status: 400 });

  await db.query(
    `UPDATE transactions SET status = $2 WHERE id = ANY($1::uuid[])`,
    [ids, body.status],
  );

  return NextResponse.json({ ok: true, count: ids.length });
}

export async function DELETE(req: NextRequest) {
  const h = req.headers.get('authorization');
  if (!h?.startsWith('Bearer ') || !(await verifyAdminToken(h.slice(7)))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json().catch(() => ({})) as { ids?: string[] };
  const ids = Array.isArray(body.ids) ? body.ids.filter(Boolean) : [];
  if (!ids.length) return NextResponse.json({ error: 'ids are required' }, { status: 400 });

  await db.query(
    `DELETE FROM transactions WHERE id = ANY($1::uuid[])`,
    [ids],
  );

  return NextResponse.json({ ok: true, deleted: ids.length });
}

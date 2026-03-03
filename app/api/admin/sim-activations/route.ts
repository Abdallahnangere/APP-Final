import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { verifyAdminToken } from '@/lib/auth';

async function auth(req: NextRequest) {
  const h = req.headers.get('authorization');
  return h?.startsWith('Bearer ') && await verifyAdminToken(h.slice(7));
}

export async function GET(req: NextRequest) {
  if (!await auth(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const activations = await sql`
    SELECT sa.*, u.first_name, u.last_name, u.phone
    FROM sim_activations sa JOIN users u ON sa.user_id = u.id
    ORDER BY sa.created_at DESC
  `;
  return NextResponse.json(activations);
}

export async function PATCH(req: NextRequest) {
  if (!await auth(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { id, status, adminNote } = await req.json();
  await sql`UPDATE sim_activations SET status=${status}, admin_note=${adminNote||null}, updated_at=NOW() WHERE id=${id}`;
  return NextResponse.json({ success: true });
}

import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const payload = await verifyToken(auth.slice(7));
  if (!payload?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const deposits = await sql`
    SELECT id, amount, sender_name, narration, status, created_at
    FROM deposits WHERE user_id = ${payload.userId as string}
    ORDER BY created_at DESC LIMIT 50
  `;

  return NextResponse.json(deposits.map(d => ({
    id: d.id, amount: parseFloat(d.amount),
    senderName: d.sender_name, narration: d.narration,
    status: d.status, createdAt: d.created_at,
  })));
}

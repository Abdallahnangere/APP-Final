import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const payload = await verifyToken(auth.slice(7));
  if (!payload?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get('limit') || '20');

  const txns = await sql`
    SELECT id, type, description, amount, status, network, phone_number, product_name, amigo_reference, receipt_data, created_at
    FROM transactions WHERE user_id = ${payload.userId as string}
    ORDER BY created_at DESC LIMIT ${limit}
  `;

  const response = NextResponse.json(txns.map(t => ({
    id: t.id, type: t.type, description: t.description,
    amount: parseFloat(t.amount), status: t.status,
    network: t.network, phoneNumber: t.phone_number,
    productName: t.product_name, amigoRef: t.amigo_reference,
    receipt: t.receipt_data, createdAt: t.created_at,
  })));
  response.headers.set('Cache-Control', 'public, max-age=0, must-revalidate');
  return response;
}

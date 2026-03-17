import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { verifyAdminToken } from '@/lib/auth';
import { hashPin } from '@/lib/utils';

export const dynamic = 'force-dynamic';

async function auth(req: NextRequest) {
  const h = req.headers.get('authorization');
  return h?.startsWith('Bearer ') && await verifyAdminToken(h.slice(7));
}

export async function GET(req: NextRequest) {
  if (!await auth(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q');
  const users = q
    ? await sql`SELECT id, first_name, last_name, phone, wallet_balance, cashback_balance, referral_bonus, flw_account_number, flw_bank_name, is_banned, created_at FROM users WHERE first_name ILIKE ${'%' + q + '%'} OR last_name ILIKE ${'%' + q + '%'} OR phone ILIKE ${'%' + q + '%'} ORDER BY created_at DESC LIMIT 50`
    : await sql`SELECT id, first_name, last_name, phone, wallet_balance, cashback_balance, referral_bonus, flw_account_number, flw_bank_name, is_banned, created_at FROM users ORDER BY created_at DESC LIMIT 100`;
  const response = NextResponse.json(users);
  response.headers.set('Cache-Control', 'public, max-age=0, must-revalidate');
  return response;
}

export async function PATCH(req: NextRequest) {
  if (!await auth(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const body = await req.json();
  const { userId, action } = body;

  if (action === 'ban') {
    await sql`UPDATE users SET is_banned = TRUE WHERE id = ${userId}`;
  } else if (action === 'unban') {
    await sql`UPDATE users SET is_banned = FALSE WHERE id = ${userId}`;
  } else if (action === 'change-pin') {
    const hash = await hashPin(body.newPin);
    await sql`UPDATE users SET pin_hash = ${hash} WHERE id = ${userId}`;
  } else if (action === 'update-details') {
    await sql`UPDATE users SET first_name = ${body.firstName}, last_name = ${body.lastName}, updated_at = NOW() WHERE id = ${userId}`;
  }

  return NextResponse.json({ success: true });
}

import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { verifyAdminToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

async function auth(req: NextRequest) {
  const h = req.headers.get('authorization');
  return h?.startsWith('Bearer ') && await verifyAdminToken(h.slice(7));
}

async function ensureProductSchema() {
  await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS image_base64 TEXT`;
}

export async function GET(req: NextRequest) {
  if (!await auth(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  await ensureProductSchema();
  const products = await sql`SELECT id, name, description, price, cost_price, image_url, image_base64, category, in_stock, shipping_terms, pickup_terms, created_at, updated_at FROM products ORDER BY created_at DESC`;
  const response = NextResponse.json(products);
  response.headers.set('Cache-Control', 'no-store');
  return response;
}

export async function POST(req: NextRequest) {
  if (!await auth(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  await ensureProductSchema();
  const body = await req.json();
  const [product] = await sql`
    INSERT INTO products (name, description, price, cost_price, image_url, image_base64, category, in_stock, shipping_terms, pickup_terms)
    VALUES (
      ${body.name}, ${body.description || null}, ${body.price}, ${body.cost_price || body.costPrice || 0},
      ${body.image_url || body.imageUrl || null},
      ${body.image_base64 || body.imageBase64 || null},
      ${body.category || 'General'},
      ${body.in_stock ?? body.inStock ?? true},
      ${body.shipping_terms || body.shippingTerms || null},
      ${body.pickup_terms || body.pickupTerms || null}
    )
    RETURNING *
  `;
  return NextResponse.json(product);
}

export async function PATCH(req: NextRequest) {
  if (!await auth(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  await ensureProductSchema();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
  const body = await req.json();
  await sql`
    UPDATE products SET
      name = COALESCE(${body.name ?? null}, name),
      description = COALESCE(${body.description ?? null}, description),
      price = COALESCE(${body.price ?? null}, price),
      cost_price = COALESCE(${body.cost_price ?? body.costPrice ?? null}, cost_price),
      image_url = COALESCE(${body.image_url ?? body.imageUrl ?? null}, image_url),
      image_base64 = COALESCE(${body.image_base64 ?? body.imageBase64 ?? null}, image_base64),
      category = COALESCE(${body.category ?? null}, category),
      in_stock = COALESCE(${body.in_stock ?? body.inStock ?? null}, in_stock),
      shipping_terms = COALESCE(${body.shipping_terms ?? body.shippingTerms ?? null}, shipping_terms),
      pickup_terms = COALESCE(${body.pickup_terms ?? body.pickupTerms ?? null}, pickup_terms),
      updated_at = NOW()
    WHERE id = ${id}
  `;
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  if (!await auth(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
  await sql`DELETE FROM products WHERE id = ${id}`;
  return NextResponse.json({ success: true });
}

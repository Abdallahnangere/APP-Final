import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { verifyAdminToken } from '@/lib/auth';

async function auth(req: NextRequest) {
  const h = req.headers.get('authorization');
  return h?.startsWith('Bearer ') && await verifyAdminToken(h.slice(7));
}

export async function GET(req: NextRequest) {
  if (!await auth(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const products = await sql`SELECT id, name, description, price, cost_price, image_url, category, in_stock, shipping_terms, pickup_terms, created_at, updated_at FROM products ORDER BY created_at DESC`;
  return NextResponse.json(products);
}

export async function POST(req: NextRequest) {
  if (!await auth(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const body = await req.json();
  const [product] = await sql`
    INSERT INTO products (name, description, price, cost_price, image_url, category, in_stock, shipping_terms, pickup_terms)
    VALUES (
      ${body.name}, ${body.description || null}, ${body.price}, ${body.cost_price || body.costPrice || 0},
      ${body.image_url || body.imageUrl || null}, ${body.category || 'General'},
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

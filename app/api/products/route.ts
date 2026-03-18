import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export const dynamic = 'force-dynamic';

async function ensureProductSchema() {
  await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS image_base64 TEXT`;
}

export async function GET(req: Request) {
  try {
    await ensureProductSchema();
    const products = await sql`
      SELECT id, name, description, price, image_url, image_base64, category, in_stock, shipping_terms, pickup_terms, created_at, updated_at
      FROM products ORDER BY created_at DESC
    `;
    const response = NextResponse.json(products.map(p => ({
      id: p.id, name: p.name, description: p.description,
      price: parseFloat(p.price), imageUrl: p.image_url,
      imageBase64: p.image_base64,
      category: p.category, inStock: p.in_stock,
      shippingTerms: p.shipping_terms, pickupTerms: p.pickup_terms,
      createdAt: p.created_at,
    })));
    response.headers.set('Cache-Control', 'no-store');
    return response;
  } catch (err) {
    console.error('Products fetch error:', err);
    return NextResponse.json([], { status: 200 });
  }
}

import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET() {
  try {
    const products = await sql`
      SELECT id, name, description, price, image_url, category, in_stock, shipping_terms, pickup_terms, created_at
      FROM products ORDER BY created_at DESC
    `;
    return NextResponse.json(products.map(p => ({
      id: p.id, name: p.name, description: p.description,
      price: parseFloat(p.price), imageUrl: p.image_url,
      category: p.category, inStock: p.in_stock,
      shippingTerms: p.shipping_terms, pickupTerms: p.pickup_terms,
      createdAt: p.created_at,
    })));
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}

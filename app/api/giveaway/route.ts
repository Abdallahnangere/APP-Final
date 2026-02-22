import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { phone, network } = await req.json();

    if (!phone || !network) {
      return NextResponse.json({ error: 'Phone and network are required' }, { status: 400 });
    }

    // Auto-creates table on first run — no schema migration needed
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS giveaway_entries (
        id SERIAL PRIMARY KEY,
        phone TEXT NOT NULL,
        network TEXT NOT NULL,
        submitted_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    await prisma.$executeRawUnsafe(
      `INSERT INTO giveaway_entries (phone, network) VALUES ($1, $2)`,
      phone,
      network
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Giveaway entry error:', error);
    return NextResponse.json({ error: 'Failed to save entry' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Create history table if it doesn't exist
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS giveaway_history (
        id SERIAL PRIMARY KEY,
        original_id INTEGER NOT NULL,
        phone TEXT NOT NULL,
        network TEXT NOT NULL,
        submitted_at TIMESTAMPTZ NOT NULL,
        sent_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    const history = await prisma.$queryRawUnsafe<
      { id: number; original_id: number; phone: string; network: string; submitted_at: string; sent_at: string }[]
    >(`SELECT * FROM giveaway_history ORDER BY sent_at DESC`);

    return NextResponse.json(history);
  } catch {
    // Table doesn't exist yet (no sent entries)
    return NextResponse.json([]);
  }
}

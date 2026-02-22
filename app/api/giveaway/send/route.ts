import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { entryId } = await req.json();

    if (!entryId) {
      return NextResponse.json(
        { error: 'entryId is required' },
        { status: 400 }
      );
    }

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

    // Get the entry to send
    const entry = await prisma.$queryRawUnsafe<
      { id: number; phone: string; network: string; submitted_at: string }[]
    >(`SELECT * FROM giveaway_entries WHERE id = $1`, entryId);

    if (!entry || entry.length === 0) {
      return NextResponse.json(
        { error: 'Entry not found' },
        { status: 404 }
      );
    }

    // Move to history
    await prisma.$executeRawUnsafe(
      `INSERT INTO giveaway_history (original_id, phone, network, submitted_at) 
       VALUES ($1, $2, $3, $4)`,
      entry[0].id,
      entry[0].phone,
      entry[0].network,
      entry[0].submitted_at
    );

    // Delete from active entries
    await prisma.$executeRawUnsafe(
      `DELETE FROM giveaway_entries WHERE id = $1`,
      entryId
    );

    return NextResponse.json({ 
      success: true,
      message: `Entry ${entry[0].phone} sent and cleared`
    });
  } catch (error) {
    console.error('Send entry error:', error);
    return NextResponse.json(
      { error: 'Failed to send entry' },
      { status: 500 }
    );
  }
}

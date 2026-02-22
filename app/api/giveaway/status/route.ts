import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Initialize tables if they don't exist
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS giveaway_status (
        id SERIAL PRIMARY KEY,
        is_paused BOOLEAN DEFAULT FALSE,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    // Ensure at least one record exists
    const existing = await prisma.$queryRawUnsafe<{ id: number }[]>(
      `SELECT id FROM giveaway_status LIMIT 1`
    );

    if (existing.length === 0) {
      await prisma.$executeRawUnsafe(
        `INSERT INTO giveaway_status (is_paused) VALUES (FALSE)`
      );
    }

    const status = await prisma.$queryRawUnsafe<{ is_paused: boolean }[]>(
      `SELECT is_paused FROM giveaway_status LIMIT 1`
    );

    return NextResponse.json({ 
      is_paused: status[0]?.is_paused ?? false 
    });
  } catch (error) {
    console.error('Giveaway status GET error:', error);
    return NextResponse.json({ is_paused: false });
  }
}

export async function PUT(req: Request) {
  try {
    const { is_paused } = await req.json();

    if (typeof is_paused !== 'boolean') {
      return NextResponse.json(
        { error: 'is_paused must be a boolean' },
        { status: 400 }
      );
    }

    // Update status
    await prisma.$executeRawUnsafe(
      `UPDATE giveaway_status SET is_paused = $1, updated_at = NOW()`,
      is_paused
    );

    return NextResponse.json({ 
      is_paused,
      message: is_paused ? 'Giveaway paused' : 'Giveaway opened'
    });
  } catch (error) {
    console.error('Giveaway status PUT error:', error);
    return NextResponse.json(
      { error: 'Failed to update giveaway status' },
      { status: 500 }
    );
  }
}

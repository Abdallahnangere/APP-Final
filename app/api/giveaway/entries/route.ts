import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const entries = await prisma.$queryRawUnsafe<
      { id: number; phone: string; network: string; submitted_at: string }[]
    >(`SELECT * FROM giveaway_entries ORDER BY submitted_at DESC`);

    return NextResponse.json(entries);
  } catch {
    // Table doesn't exist yet (no submissions yet)
    return NextResponse.json([]);
  }
}

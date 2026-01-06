
import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const agentId = searchParams.get('agentId');

    if (!agentId) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    const transactions = await prisma.transaction.findMany({
        where: { agentId: agentId },
        orderBy: { createdAt: 'desc' },
        take: 50,
        include: {
            dataPlan: true,
            product: true
        }
    });

    return NextResponse.json({ transactions });
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching history' }, { status: 500 });
  }
}

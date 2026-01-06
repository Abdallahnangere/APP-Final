
import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const agentId = searchParams.get('agentId');

    if (!agentId) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    try {
        const transactions = await prisma.transaction.findMany({
            where: { agentId },
            orderBy: { createdAt: 'desc' },
            take: 100
        });
        return NextResponse.json({ transactions });
    } catch (e) {
        return NextResponse.json({ error: 'Error' }, { status: 500 });
    }
}

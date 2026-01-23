
import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const { password } = await req.json();

        if (password !== process.env.ADMIN_PASSWORD) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const logs = await prisma.webhookLog.findMany({
            orderBy: { createdAt: 'desc' },
            take: 100
        });

        return NextResponse.json({ logs, count: logs.length });
    } catch (e: any) {
        console.error('Webhook logs error:', e);
        return NextResponse.json({ error: e?.message || 'Server Error', logs: [] }, { status: 500 });

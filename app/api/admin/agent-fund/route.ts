
import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: Request) {
    try {
        const { agentId, amount, password, action } = await req.json();

        if (password !== process.env.ADMIN_PASSWORD) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (action === 'toggle_status') {
            const agent = await prisma.agent.findUnique({ where: { id: agentId } });
            if (!agent) return NextResponse.json({ error: 'Not found' }, { status: 404 });
            await prisma.agent.update({ where: { id: agentId }, data: { isActive: !agent.isActive } });
            return NextResponse.json({ success: true });
        }

        if (action === 'credit') {
            await prisma.$transaction([
                prisma.agent.update({
                    where: { id: agentId },
                    data: { balance: { increment: amount } }
                }),
                prisma.transaction.create({
                    data: {
                        tx_ref: `ADMIN-FUND-${uuidv4()}`,
                        type: 'wallet_funding',
                        status: 'delivered',
                        phone: 'ADMIN',
                        amount: amount,
                        agentId: agentId,
                        deliveryData: { method: 'Admin Manual Credit' }
                    }
                })
            ]);
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: 'Invalid Action' }, { status: 400 });
    } catch (e) {
        return NextResponse.json({ error: 'Server Error' }, { status: 500 });
    }
}


import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export async function POST(req: Request) {
    try {
        const { agentId, oldPin, newPin } = await req.json();
        
        const agent = await prisma.agent.findUnique({ where: { id: agentId } });
        if(!agent || agent.pin !== oldPin) return NextResponse.json({ error: 'Invalid old PIN' }, { status: 401 });
        
        await prisma.agent.update({
            where: { id: agentId },
            data: { pin: newPin }
        });
        
        return NextResponse.json({ success: true });
    } catch(e) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

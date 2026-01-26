
import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { verifyPin, hashPin } from '../../../../lib/security';

export async function POST(req: Request) {
    try {
        const { agentId, oldPin, newPin } = await req.json();
        
        const agent = await prisma.agent.findUnique({ where: { id: agentId } });
        if(!agent) return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
        
        // Verify the old PIN against the bcrypt hash
        const isOldPinValid = await verifyPin(oldPin, agent.pin);
        if(!isOldPinValid) return NextResponse.json({ error: 'Invalid old PIN' }, { status: 401 });
        
        // Hash the new PIN before storing
        const hashedNewPin = await hashPin(newPin);
        
        await prisma.agent.update({
            where: { id: agentId },
            data: { pin: hashedNewPin }
        });
        
        return NextResponse.json({ success: true });
    } catch(e) {
        console.error('PIN update error:', e);
        return NextResponse.json({ error: 'Failed to update PIN' }, { status: 500 });
    }
}

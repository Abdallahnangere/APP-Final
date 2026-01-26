import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const { password, ticketId } = await req.json();
        if (password !== process.env.ADMIN_PASSWORD) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Update the ticket status to resolved
        const updatedTicket = await prisma.supportTicket.update({
            where: { id: ticketId },
            data: { 
                status: 'resolved',
                updatedAt: new Date()
            }
        });

        return NextResponse.json({ success: true, ticket: updatedTicket });
    } catch (e: any) {
        console.error('Support resolve error:', e);
        return NextResponse.json({ error: 'Failed to resolve ticket' }, { status: 500 });
    }
}

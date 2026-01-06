
import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function POST(req: Request) {
    try {
        const { phone, message } = await req.json();
        const ticket = await prisma.supportTicket.create({
            data: { phone, message, status: 'open' }
        });
        return NextResponse.json({ success: true, ticket });
    } catch (e) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

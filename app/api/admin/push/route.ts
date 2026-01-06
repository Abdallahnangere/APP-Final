
import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

// In a real PWA, you'd use 'web-push' library here with VAPID keys.
// For this app, we will store a "Push Message" in the DB that the client polls for.

export async function POST(req: Request) {
    try {
        const { title, body, password } = await req.json();

        if (password !== process.env.ADMIN_PASSWORD) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Create a temporary system message typed as 'PUSH'
        // The client will listen for this specific type and show a Modal/Toast
        await prisma.systemMessage.create({
            data: {
                content: JSON.stringify({ title, body }),
                type: 'PUSH',
                isActive: true
            }
        });

        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function POST(req: Request) {
    try {
        const { subscription, phone } = await req.json();

        if (!subscription || !subscription.endpoint) {
            return NextResponse.json({ error: 'Invalid subscription' }, { status: 400 });
        }

        // Handle FCM tokens (endpoint starts with 'fcm:')
        if (subscription.endpoint.startsWith('fcm:')) {
            const pushSub = await prisma.pushSubscription.upsert({
                where: { endpoint: subscription.endpoint },
                update: {
                    phone: phone || null
                },
                create: {
                    endpoint: subscription.endpoint,
                    p256dh: '', // Not needed for FCM
                    auth: '', // Not needed for FCM
                    phone: phone || null
                }
            });

            return NextResponse.json({ 
                success: true, 
                message: 'FCM token saved',
                subscriptionId: pushSub.id 
            });
        }

        // Handle VAPID subscriptions
        if (!subscription.keys || !subscription.keys.p256dh || !subscription.keys.auth) {
            return NextResponse.json({ error: 'Invalid VAPID subscription' }, { status: 400 });
        }

        // Save or update push subscription
        const pushSub = await prisma.pushSubscription.upsert({
            where: { endpoint: subscription.endpoint },
            update: {
                p256dh: subscription.keys.p256dh,
                auth: subscription.keys.auth,
                phone: phone || null
            },
            create: {
                endpoint: subscription.endpoint,
                p256dh: subscription.keys.p256dh,
                auth: subscription.keys.auth,
                phone: phone || null
            }
        });

        return NextResponse.json({ 
            success: true, 
            message: 'Push subscription saved',
            subscriptionId: pushSub.id 
        });
    } catch (e: any) {
        console.error('Push subscription error:', e);
        return NextResponse.json({ 
            error: 'Failed to save subscription',
            details: e.message 
        }, { status: 500 });
    }
}

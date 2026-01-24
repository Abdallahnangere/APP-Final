import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import * as webpush from 'web-push';

// Configure VAPID keys from environment variables
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || '';

if (vapidPrivateKey) {
    const vapidEmail = process.env.VAPID_EMAIL || 'admin@saukimart.com';
    webpush.setVapidDetails(
        `mailto:${vapidEmail}`,
        vapidPublicKey,
        vapidPrivateKey
    );
}

export async function POST(req: Request) {
    try {
        const { title, body, url, password, phone } = await req.json();

        if (password !== process.env.ADMIN_PASSWORD) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Create a system message for fallback
        await prisma.systemMessage.create({
            data: {
                content: JSON.stringify({ title, body, url }),
                type: 'PUSH',
                isActive: true
            }
        });

        // Get all push subscriptions (optionally filtered by phone)
        const subscriptions = phone
            ? await prisma.pushSubscription.findMany({
                where: { phone: phone }
            })
            : await prisma.pushSubscription.findMany();

        // Send push notifications using Web Push API
        const sendResults = await Promise.allSettled(
            subscriptions.map(sub => {
                const notificationPayload = {
                    title: title || 'SAUKI MART Notification',
                    body: body || 'You have a new message',
                    icon: '/icons/icon-192x192.png',
                    badge: '/icons/icon-192x192.png',
                    tag: 'sauki-notification',
                    data: {
                        url: url || '/',
                        timestamp: new Date().toISOString()
                    }
                };

                return webpush.sendNotification(
                    {
                        endpoint: sub.endpoint,
                        keys: {
                            p256dh: sub.p256dh,
                            auth: sub.auth
                        }
                    },
                    JSON.stringify(notificationPayload)
                );
            })
        );

        // Check results and remove failed subscriptions
        let successCount = 0;
        let failureCount = 0;

        for (let i = 0; i < sendResults.length; i++) {
            const result = sendResults[i];
            if (result.status === 'fulfilled') {
                successCount++;
            } else {
                failureCount++;
                // Remove invalid subscription
                const sub = subscriptions[i];
                await prisma.pushSubscription.delete({
                    where: { id: sub.id }
                }).catch(() => {}); // Ignore errors
            }
        }

        return NextResponse.json({
            success: true,
            message: `Notifications sent to ${successCount} device${successCount !== 1 ? 's' : ''}`,
            sent: successCount,
            failed: failureCount,
            total: subscriptions.length
        });
    } catch (e: any) {
        console.error('Push notification error:', e);
        return NextResponse.json({
            error: 'Failed to send notifications',
            details: e.message
        }, { status: 500 });
    }
}

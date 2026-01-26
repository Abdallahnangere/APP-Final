import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import * as webpush from 'web-push';
import admin from 'firebase-admin';

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

// Initialize firebase-admin if SERVICE_ACCOUNT JSON provided
const firebaseServiceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_JSON || process.env.FIREBASE_SERVICE_ACCOUNT;
if (firebaseServiceAccount) {
    try {
        const svc = typeof firebaseServiceAccount === 'string' ? JSON.parse(firebaseServiceAccount) : firebaseServiceAccount;
        if (!admin.apps.length) {
            admin.initializeApp({
                credential: admin.credential.cert(svc as any)
            });
        }
    } catch (e) {
        console.warn('Failed to init firebase-admin:', e);
    }
}

export async function POST(req: Request) {
    try {
        const { title, body, url, password, phone, targetType = 'all' } = await req.json();

        if (password !== process.env.ADMIN_PASSWORD) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Create a system message for fallback
        await prisma.systemMessage.create({
            data: {
                content: JSON.stringify({ title, body, url, targetType }),
                type: 'PUSH',
                isActive: true
            }
        });

        // Get push subscriptions based on target type
        let subscriptions: any[] = [];
        
        if (targetType === 'agents') {
            // Get subscriptions from agents only
            subscriptions = await prisma.pushSubscription.findMany({
                where: {
                    phone: {
                        in: await prisma.agent.findMany({
                            select: { phone: true }
                        }).then(agents => agents.map(a => a.phone))
                    }
                }
            });
        } else if (targetType === 'users') {
            // Get subscriptions from customers only (not agents)
            const agentPhones = await prisma.agent.findMany({
                select: { phone: true }
            }).then(agents => agents.map(a => a.phone));
            
            subscriptions = await prisma.pushSubscription.findMany({
                where: {
                    phone: {
                        notIn: agentPhones
                    }
                }
            });
        } else {
            // Get all subscriptions (all users)
            subscriptions = phone
                ? await prisma.pushSubscription.findMany({
                    where: { phone: phone }
                })
                : await prisma.pushSubscription.findMany();
        }

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

                // If endpoint is an FCM token (we saved them as `fcm:<token>`), send via firebase-admin
                if (sub.endpoint && typeof sub.endpoint === 'string' && sub.endpoint.startsWith('fcm:') && admin.apps.length) {
                    const fcmToken = sub.endpoint.replace('fcm:', '');
                    const message: any = {
                        token: fcmToken,
                        notification: {
                            title: notificationPayload.title,
                            body: notificationPayload.body
                        },
                        webpush: {
                            fcmOptions: {
                                link: notificationPayload.data?.url || '/'
                            }
                        },
                        data: {
                            url: notificationPayload.data?.url || '/',
                            timestamp: notificationPayload.data?.timestamp || new Date().toISOString()
                        }
                    };
                    return admin.messaging().send(message);
                }

                // default: web-push (VAPID)
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
            message: `Notifications sent to ${successCount} device${successCount !== 1 ? 's' : ''} (${targetType})`,
            sent: successCount,
            failed: failureCount,
            total: subscriptions.length,
            targetType
        });
    } catch (e: any) {
        console.error('Push notification error:', e);
        return NextResponse.json({
            error: 'Failed to send notifications',
            details: e.message
        }, { status: 500 });
    }
}

// lib/firebase-admin.ts — Firebase Admin SDK singleton
import * as admin from 'firebase-admin';

const globalAdmin = globalThis as unknown as { firebaseAdmin?: admin.app.App };

function getFirebaseAdmin(): admin.app.App | null {
  if (globalAdmin.firebaseAdmin) return globalAdmin.firebaseAdmin;

  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!serviceAccountKey) {
    console.warn('[Firebase] FIREBASE_SERVICE_ACCOUNT_KEY not set — push notifications disabled');
    return null;
  }

  try {
    let serviceAccount: admin.ServiceAccount;
    if (serviceAccountKey.startsWith('{')) {
      serviceAccount = JSON.parse(serviceAccountKey);
    } else {
      serviceAccount = require(serviceAccountKey);
    }

    if (!admin.apps.length) {
      globalAdmin.firebaseAdmin = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    } else {
      globalAdmin.firebaseAdmin = admin.apps[0]!;
    }

    return globalAdmin.firebaseAdmin;
  } catch (err) {
    console.error('[Firebase] Failed to initialize admin SDK:', err);
    return null;
  }
}

// ─── SEND PUSH NOTIFICATION ─────────────────────────────────────────────────
export async function sendPushNotification(params: {
  token?: string;
  topic?: string;
  title: string;
  body: string;
  data?: Record<string, string>;
}) {
  const app = getFirebaseAdmin();
  if (!app) return { success: false, error: 'Firebase not configured' };

  try {
    const messaging = admin.messaging(app);
    const message: admin.messaging.Message = {
      notification: { title: params.title, body: params.body },
      data: params.data || {},
      ...(params.token ? { token: params.token } : {}),
      ...(params.topic ? { topic: params.topic } : {}),
    };

    const result = await messaging.send(message);
    return { success: true, messageId: result };
  } catch (err: any) {
    console.error('[Firebase] Push send failed:', err.message);
    return { success: false, error: err.message };
  }
}

// ─── SEND TO ALL (broadcast) ────────────────────────────────────────────────
export async function broadcastPush(title: string, body: string, data?: Record<string, string>) {
  return sendPushNotification({ topic: 'all', title, body, data });
}

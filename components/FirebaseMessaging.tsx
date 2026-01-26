"use client";

import { useEffect } from 'react';
import { initFirebaseClient, getFirebaseMessaging } from '../lib/firebaseClient';
import { getToken, onMessage } from 'firebase/messaging';

export default function FirebaseMessaging() {
  useEffect(() => {
    const setup = async () => {
      if (typeof window === 'undefined') return;

      // only run if enabled
      if (process.env.NEXT_PUBLIC_FIREBASE_ENABLED !== 'true') return;

      initFirebaseClient();

      const messaging = getFirebaseMessaging();
      if (!messaging) return;

      // register firebase messaging SW
      try {
        await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      } catch (e) {
        // ignore
      }

      // Request permission and get token
      try {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') return;

        const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || undefined;
        const token = await getToken(messaging as any, { vapidKey });
        if (token) {
          // send token to server for storage
          await fetch('/api/fcm/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, phone: localStorage.getItem('userPhone') || null })
          });
        }
      } catch (e) {
        console.warn('FCM token error', e);
      }

      // optional: foreground message handler
      try {
        onMessage(messaging as any, (payload) => {
          console.log('FCM foreground message', payload);
          // show a notification in-page or via Notification API
        });
      } catch (e) {}
    };

    setup();
  }, []);

  return null;
}

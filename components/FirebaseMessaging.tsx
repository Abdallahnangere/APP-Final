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
        const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
        console.log('FCM Service Worker registered:', registration);
      } catch (e) {
        console.error('FCM SW registration failed:', e);
      }

      // Request permission and get token
      try {
        const permission = await Notification.requestPermission();
        console.log('Notification permission:', permission);
        if (permission !== 'granted') {
          console.warn('Notification permission not granted');
          return;
        }

        const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
        console.log('Getting FCM token with VAPID key:', vapidKey ? 'present' : 'missing');
        const token = await getToken(messaging as any, { vapidKey });
        console.log('FCM token obtained:', token ? 'yes' : 'no');
        if (token) {
          // send token to server for storage
          const response = await fetch('/api/fcm/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, phone: localStorage.getItem('userPhone') || null })
          });
          const result = await response.json();
          console.log('FCM token registration result:', result);
        }
      } catch (e) {
        console.error('FCM token error:', e);
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

'use client';

import { useEffect } from 'react';
import { initFirebaseClient, getFirebaseMessaging } from '../lib/firebaseClient';
import { getToken } from 'firebase/messaging';

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator && window.location.protocol === 'https:') {
      // Register Firebase messaging service worker
      navigator.serviceWorker
        .register('/firebase-messaging-sw.js')
        .then((registration) => {
          console.log('Firebase messaging SW registered');

          // Initialize Firebase
          initFirebaseClient();
          const messaging = getFirebaseMessaging();

          if (messaging) {
            // Request notification permission
            if ('Notification' in window && Notification.permission === 'default') {
              Notification.requestPermission().then((permission) => {
                if (permission === 'granted') {
                  // Get FCM token
                  getToken(messaging, {
                    vapidKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
                    serviceWorkerRegistration: registration
                  })
                  .then((currentToken) => {
                    if (currentToken) {
                      console.log('FCM token available');

                      // Send FCM token to backend as 'fcm:<token>'
                      fetch('/api/push-subscribe', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                          subscription: {
                            endpoint: `fcm:${currentToken}`
                          },
                          phone: localStorage.getItem('userPhone') || null
                        })
                      })
                        .then(res => res.json())
                        .then(data => {
                          console.log('✅ FCM token saved:', data.subscriptionId);
                        })
                        .catch(err => console.log('FCM token save error:', err));
                    } else {
                      console.log('No FCM token available');
                    }
                  })
                  .catch(err => console.log('FCM token error:', err));
                }
              });
            }
          }
        })
        .catch(err => console.log('SW registration failed:', err));
    }
  }, []);

  return null;
}
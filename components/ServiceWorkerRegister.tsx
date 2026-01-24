
'use client';

import { useEffect } from 'react';

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator && window.location.protocol === 'https:') {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          // Request notification permission
          if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission().then((permission) => {
              if (permission === 'granted') {
                // Subscribe to push notifications and save subscription
                if (registration.pushManager) {
                  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
                  
                  registration.pushManager
                    .subscribe({
                      userVisibleOnly: true,
                      applicationServerKey: vapidPublicKey
                        ? urlBase64ToUint8Array(vapidPublicKey)
                        : undefined
                    } as any)
                    .then((subscription) => {
                      // Send subscription to backend
                      fetch('/api/push-subscribe', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                          subscription: subscription,
                          phone: localStorage.getItem('userPhone') || null
                        })
                      })
                        .then(res => res.json())
                        .then(data => {
                          console.log('✅ Push subscription saved:', data.subscriptionId);
                        })
                        .catch(err => console.log('Push subscription error:', err));
                    })
                    .catch(err => console.log('Push subscription failed:', err));
                }
              }
            });
          }
        })
        .catch(() => {}); // Silent catch to prevent console noise
    }
  }, []);

  return null;
}

// Helper function to convert VAPID key to Uint8Array
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;}
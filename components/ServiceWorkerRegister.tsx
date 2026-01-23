
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
                // Subscribe to push notifications
                if (registration.pushManager) {
                  registration.pushManager.getSubscription().catch(() => {});
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

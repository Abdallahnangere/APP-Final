'use client';

import { useEffect } from 'react';

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator && window.location.protocol === 'https:') {
      // Register push notification service worker
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('✅ Service Worker registered');

          // Request notification permission
          if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission().then((permission) => {
              if (permission === 'granted') {
                // Subscribe to push notifications
                subscribeToPush(registration);
              } else {
                console.log('Notification permission denied');
              }
            });
          } else if ('Notification' in window && Notification.permission === 'granted') {
            // Already granted - subscribe
            subscribeToPush(registration);
          }
        })
        .catch(err => console.error('❌ SW registration failed:', err));
    } else {
      console.warn('Service Workers not supported or not HTTPS');
    }
  }, []);

  const subscribeToPush = async (registration: ServiceWorkerRegistration) => {
    try {
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      
      if (!vapidPublicKey) {
        console.error('VAPID public key not found in environment');
        return;
      }

      // Convert VAPID key to Uint8Array
      const vapidKeyArray = urlBase64ToUint8Array(vapidPublicKey);

      // Subscribe to push
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidKeyArray
      });

      console.log('✅ Push subscription created:', subscription.endpoint);

      // Send subscription to backend
      const response = await fetch('/api/push-subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          subscription: subscription.toJSON(),
          phone: localStorage.getItem('userPhone') || null
        })
      });

      const data = await response.json();
      if (data.success) {
        console.log('✅ Subscription saved to database:', data.subscriptionId);
      } else {
        console.error('❌ Failed to save subscription:', data.error);
      }
    } catch (error) {
      console.error('❌ Push subscription error:', error);
    }
  };

  // Convert VAPID public key from base64 to Uint8Array
  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  return null;
}
// Firebase Cloud Messaging Service Worker
// Place this file at /public/firebase-messaging-sw.js

importScripts('https://www.gstatic.com/firebasejs/10.11.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.11.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyDzQrdnbhabk7_4cDHb1I-Ohbg3bKYCysI',
  authDomain: 'sauki-mart.firebaseapp.com',
  projectId: 'sauki-mart',
  storageBucket: 'sauki-mart.firebasestorage.app',
  messagingSenderId: '228994084382',
  appId: '1:228994084382:web:b1079dd1898bb1da40880f',
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[SW] Background message:', payload);
  const { title, body, icon } = payload.notification || {};
  self.registration.showNotification(title || 'SaukiMart', {
    body: body || '',
    icon: icon || '/icon-192.png',
    badge: '/icon-192.png',
    data: payload.data || {},
    actions: [{ action: 'open', title: 'Open App' }],
  });
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes('/app') && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow('/app');
    })
  );
});

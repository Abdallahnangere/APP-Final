/* eslint-disable no-undef */
importScripts('https://www.gstatic.com/firebasejs/9.22.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.2/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing in
// your app's Firebase config. Replace values via build-time envs if needed.
const firebaseConfig = {
  apiKey: "AIzaSyDzQrdnbhabk7_4cDHb1I-Ohbg3bKYCysI",
  authDomain: "sauki-mart.firebaseapp.com",
  projectId: "sauki-mart",
  storageBucket: "sauki-mart.firebasestorage.app",
  messagingSenderId: "228994084382",
  appId: "1:228994084382:web:b1079dd1898bb1da40880f"
};

try {
  firebase.initializeApp(firebaseConfig);
  const messaging = firebase.messaging();

  // Handle background messages
  messaging.onBackgroundMessage(function(payload) {
    try {
      // FCM web push structure: notification details are in payload.data for web
      const notificationTitle = payload.data?.title || payload.notification?.title || 'Notification';
      const notificationOptions = {
        body: payload.data?.body || payload.notification?.body || '',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-192x192.png',
        tag: 'sauki-notification',
        requireInteraction: true,
        data: {
          url: payload.data?.url || payload.fcmOptions?.link || '/',
          timestamp: payload.data?.timestamp || new Date().toISOString()
        },
        actions: [
          {
            action: 'open',
            title: 'Open'
          },
          {
            action: 'close',
            title: 'Dismiss'
          }
        ]
      };

      self.registration.showNotification(notificationTitle, notificationOptions);
    } catch (e) {
      console.error('FCM background message error', e);
    }
  });
} catch (e) {
  console.warn('Firebase messaging SW init error', e);
}

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
      const notificationTitle = (payload.notification && payload.notification.title) || payload.data?.title || 'Notification';
      const notificationOptions = {
        body: (payload.notification && payload.notification.body) || payload.data?.body || '',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-192x192.png',
        data: payload.data || {}
      };

      self.registration.showNotification(notificationTitle, notificationOptions);
    } catch (e) {
      console.error('FCM background message error', e);
    }
  });
} catch (e) {
  console.warn('Firebase messaging SW init error', e);
}

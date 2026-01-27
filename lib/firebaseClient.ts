import { initializeApp, getApps } from 'firebase/app';
import { getMessaging } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyDzQrdnbhabk7_4cDHb1I-Ohbg3bKYCysI",
  authDomain: "sauki-mart.firebaseapp.com",
  projectId: "sauki-mart",
  storageBucket: "sauki-mart.firebasestorage.app",
  messagingSenderId: "228994084382",
  appId: "1:228994084382:web:b1079dd1898bb1da40880f"
};

export function initFirebaseClient() {
  if (!getApps().length) {
    try {
      initializeApp(firebaseConfig);
    } catch (e) {
      console.warn('Firebase init error', e);
    }
  }
}

export function getFirebaseMessaging() {
  initFirebaseClient();
  try {
    return getMessaging();
  } catch (e) {
    console.warn('Failed to get messaging', e);
    return null as any;
  }
}

export default null;


'use client';

import { useEffect } from 'react';

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator && window.location.protocol === 'https:') {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('SW Registered: ', registration);
        })
        .catch((error) => {
          console.error('SW Registration failed: ', error);
        });
    }
  }, []);

  return null;
}

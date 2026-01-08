
const CACHE_NAME = 'sauki-mart-v2'; // Bumped version
const ASSETS_CACHE = 'sauki-assets-v2';
const IMAGES_CACHE = 'sauki-images-v2';

const CORE_ASSETS = [
  '/',
  '/logo.png',
  '/manifest.json',
  '/mtn.png',
  '/airtel.png',
  '/glo.png',
  '/9mobile.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (![CACHE_NAME, ASSETS_CACHE, IMAGES_CACHE].includes(name)) {
            return caches.delete(name);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 1. API Requests: Network First, No Cache (except explicit dynamic logic if needed later)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request).catch(() => {
          return new Response(JSON.stringify({ error: 'Offline' }), { 
              headers: { 'Content-Type': 'application/json' } 
          });
      })
    );
    return;
  }

  // 2. Images: Cache First, then Network (Stale-while-revalidate for speed)
  if (event.request.destination === 'image') {
      event.respondWith(
          caches.open(IMAGES_CACHE).then((cache) => {
              return cache.match(event.request).then((cachedResponse) => {
                  const fetchPromise = fetch(event.request).then((networkResponse) => {
                      if(networkResponse.ok) cache.put(event.request, networkResponse.clone());
                      return networkResponse;
                  }).catch(() => {/* Eat error if offline */});
                  return cachedResponse || fetchPromise;
              });
          })
      );
      return;
  }

  // 3. Static Assets / Pages: Stale-while-revalidate
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        // Cache valid responses only
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
             const responseToCache = networkResponse.clone();
             caches.open(ASSETS_CACHE).then((cache) => {
                 cache.put(event.request, responseToCache);
             });
        }
        return networkResponse;
      }).catch(() => {
          // Fallback logic could go here
      });
      return cachedResponse || fetchPromise;
    })
  );
});

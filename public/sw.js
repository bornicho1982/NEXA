const CACHE_NAME = 'nexa-v1';
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Pre-cache critical static assets
      // We use addAll but verify existence to avoid fail on missing icon
      return cache.addAll(STATIC_ASSETS.filter(url => !url.endsWith('.png')));
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
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

  // 0. Only intercept GET requests. Let POST/PUT/DELETE bypass SW entirely.
  if (event.request.method !== 'GET') {
    return;
  }

  // 1. API Autenticada / Privada -> Network Only
  // Avoid caching auth tokens or user inventory
  if (url.pathname.startsWith('/api/auth') ||
    url.pathname.startsWith('/api/inventory') ||
    url.pathname.startsWith('/api/loadouts')) {
    return;
  }

  // 2. Next.js internals / API -> Network First (or StaleWhileRevalidate)
  if (url.pathname.startsWith('/_next') || url.pathname.startsWith('/api')) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
    return;
  }

  // 3. Static Assets / Pages -> Stale While Revalidate
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, networkResponse.clone());
        });
        return networkResponse;
      });
      return cachedResponse || fetchPromise;
    })
  );
});

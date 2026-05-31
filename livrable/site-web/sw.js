/* Road Spirit — Service Worker (site public)
   Stratégie : network-first pour les pages (toujours la dernière version),
   avec repli sur le cache si hors-ligne. Les assets sont mis en cache au fil de l'eau. */

const CACHE = 'roadspirit-v1';
const CORE = [
  './Road%20Spirit.html',
  './shared.css',
  './shared.js',
  './favicon.svg',
  './icon-192.png',
  './icon-512.png',
  './manifest.webmanifest'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(CORE)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || !req.url.startsWith('http')) return;

  e.respondWith(
    fetch(req)
      .then((res) => {
        // ne met en cache que les réponses same-origin valides
        if (res && res.ok && new URL(req.url).origin === self.location.origin) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
        return res;
      })
      .catch(() =>
        caches.match(req).then(
          (hit) => hit || caches.match('./Road%20Spirit.html')
        )
      )
  );
});

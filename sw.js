/* Ben Sky Tech — service worker (mode hors ligne). Changez VERSION à chaque mise à jour du site. */
const VERSION = 'bst-v4';
const CORE = ['./', 'index.html', 'css/style.css', 'css/advanced.css', 'js/main.js', 'js/ui.js', 'js/quote.js', 'js/compare.js', 'js/palette.js', 'js/gl.js',
  'assets/img/logo.webp', 'assets/fonts/poppins-regular.woff', 'assets/fonts/poppins-bold.woff', 'assets/fonts/poppins-light.woff', 'assets/fonts/poppins-medium.woff', 'assets/fonts/lora-italic.woff'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then((r) => { const copy = r.clone(); caches.open(VERSION).then((c) => c.put(req, copy)); return r; })
      .catch(() => caches.match(req).then((r) => r || caches.match('index.html'))));
    return;
  }
  e.respondWith(caches.match(req).then((hit) => {
    const net = fetch(req).then((r) => { if (r.ok) { const copy = r.clone(); caches.open(VERSION).then((c) => c.put(req, copy)); } return r; }).catch(() => hit);
    return hit || net;
  }));
});

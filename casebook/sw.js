const CACHE = 'krai-casebook-shell-v1';
const SHELL = ['/casebook/', '/casebook/casebook.css', '/casebook/casebook.js', '/casebook/manifest.webmanifest', '/casebook/icon-192.png', '/casebook/icon-512.png', '/assets/logo.svg'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('krai-casebook-shell-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  if (req.mode === 'navigate' && new URL(req.url).pathname === '/casebook/') {
    event.respondWith(fetch(req).then(res => { if (res.ok) caches.open(CACHE).then(c => c.put(req, res.clone())); return res; }).catch(() => caches.match('/casebook/')));
  } else if (SHELL.includes(new URL(req.url).pathname)) {
    event.respondWith(caches.match(req).then(hit => hit || fetch(req)));
  }
});

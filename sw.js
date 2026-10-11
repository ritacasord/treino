/* Treino de Massa: funciona sem internet. Guarda o app e as fontes depois do primeiro uso. */
const VERSAO = 'treino-de-massa-v1';
const APP = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './icon-maskable-512.png', './apple-touch-icon.png'];
self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(VERSAO).then(function (c) { return c.addAll(APP); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k !== VERSAO; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  const u = new URL(e.request.url);
  const fonte = u.hostname === 'fonts.googleapis.com' || u.hostname === 'fonts.gstatic.com';
  if (u.origin !== location.origin && !fonte) return;
  e.respondWith(caches.match(e.request, { ignoreSearch: false }).then(function (hit) {
    const rede = fetch(e.request).then(function (r) {
      if (r && (r.ok || r.type === 'opaque')) { const cp = r.clone(); caches.open(VERSAO).then(function (c) { c.put(e.request, cp); }); }
      return r;
    }).catch(function () { return hit || (e.request.mode === 'navigate' ? caches.match('./index.html') : undefined); });
    return hit || rede;
  }));
});

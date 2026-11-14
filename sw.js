// Service worker: guarda la app para abrirla sin internet
const CACHE = 'inv-ac-v3';
const ARCHIVOS = ['./', './index.html', './lib/jsQR.js', './lib/qrcode.js', './manifest.json', './icon-192.png', './icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(ARCHIVOS)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return; // la API va directo a la red
  // caché primero (abre al instante) y actualiza por detrás para la próxima vez
  e.respondWith(caches.open(CACHE).then(async ca => {
    const enCache = await ca.match(e.request, { ignoreSearch: true });
    const red = fetch(e.request).then(r => { if (r.ok) ca.put(e.request, r.clone()); return r; }).catch(() => null);
    if (enCache) { e.waitUntil(red); return enCache; }
    return (await red) || (await ca.match('./index.html')) || Response.error();
  }));
});

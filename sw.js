importScripts('/wacebo-company-profile/accesso/chiave.js');
const TIPI = { html: 'text/html; charset=utf-8', js: 'text/javascript; charset=utf-8', css: 'text/css; charset=utf-8', svg: 'image/svg+xml', png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', woff2: 'font/woff2', glb: 'model/gltf-binary', txt: 'text/plain; charset=utf-8', json: 'application/json', webp: 'image/webp', mp4: 'video/mp4', webm: 'video/webm' };
let k = null;
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));
self.addEventListener('message', () => { k = null; });
async function file(p) {
  const r = await fetch('/wacebo-company-profile/x' + p + '.bin');
  return r.ok ? r.arrayBuffer() : null;
}
self.addEventListener('fetch', (e) => {
  const u = new URL(e.request.url);
  if (u.origin !== location.origin || e.request.method !== 'GET') return;
  let p = decodeURIComponent(u.pathname);
  if (!p.startsWith('/wacebo-company-profile/')) return;
  p = p.slice(23);
  if (p.startsWith('/x/') || p.startsWith('/accesso/') || p === '/sw.js') return;
  if (p.endsWith('/')) p += 'index.html';
  e.respondWith((async () => {
    k = k || await chiaveLeggi().catch(() => null);
    if (!k) return fetch(e.request);
    let buf = await file(p);
    if (!buf && !/\.[a-z0-9]+$/i.test(p)) buf = await file(p += '.html');
    if (!buf) return fetch(e.request);
    try {
      const est = p.split('.').pop().toLowerCase();
      return new Response(await chiaveDecifra(k, buf), { headers: { 'Content-Type': TIPI[est] || 'application/octet-stream' } });
    } catch (err) { k = null; return fetch(e.request); }
  })());
});

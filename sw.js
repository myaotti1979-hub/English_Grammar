/* Syntax — Service Worker
   アプリを更新したら VERSION の数字を上げてください。
   古いキャッシュは activate 時に自動で削除されます。 */
const VERSION = 'v1.0.0';
const CORE = 'syntax-core-' + VERSION;
const FONTS = 'syntax-fonts-v1';

const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png',
  './icons/favicon-32.png'
];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CORE);
    // 1つ失敗しても install 全体を落とさない
    await Promise.allSettled(
      CORE_ASSETS.map(url => cache.add(new Request(url, { cache: 'reload' })))
    );
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys.filter(k => k !== CORE && k !== FONTS).map(k => caches.delete(k))
    );
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;

  let url;
  try { url = new URL(req.url); } catch (e) { return; }

  // Google Fonts は取得できたぶんだけ長期キャッシュ（オフラインでも日本語は端末フォントにフォールバック）
  if (url.origin === 'https://fonts.googleapis.com' || url.origin === 'https://fonts.gstatic.com') {
    event.respondWith(cacheFirst(req, FONTS));
    return;
  }

  if (url.origin !== self.location.origin) return;

  // ページ遷移：まずネットワーク、失敗したらキャッシュした index.html
  if (req.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const fresh = await fetch(req);
        const cache = await caches.open(CORE);
        cache.put('./index.html', fresh.clone());
        return fresh;
      } catch (e) {
        const cache = await caches.open(CORE);
        return (await cache.match('./index.html')) ||
               (await cache.match('./')) ||
               new Response('オフラインです。一度オンラインで開いてください。', {
                 status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' }
               });
      }
    })());
    return;
  }

  event.respondWith(cacheFirst(req, CORE));
});

async function cacheFirst(req, cacheName) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(req);
  if (hit) return hit;
  try {
    const res = await fetch(req);
    if (res && (res.ok || res.type === 'opaque')) cache.put(req, res.clone());
    return res;
  } catch (e) {
    const fallback = await cache.match(req);
    if (fallback) return fallback;
    return new Response('', { status: 504 });
  }
}

self.addEventListener('message', event => {
  if (event.data === 'skip-waiting') self.skipWaiting();
});

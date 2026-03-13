/* ════════════════════════════════════
   ARCAMIS — Service Worker v3
   Cache-first per asset statici,
   network-first per API Notion
════════════════════════════════════ */

const CACHE = 'arcamis-v3';

const STATIC = [
  '/',
  '/index.html',
  '/style-base.css',
  '/style-page.css',
  '/style-fx.css',
  /* nuova struttura JS modulare */
  '/js/main.js',
  '/js/core/state.js',
  '/js/core/router.js',
  '/js/core/data.js',
  '/js/ui/theme.js',
  '/js/ui/font.js',
  '/js/ui/nav.js',
  '/js/ui/search.js',
  '/js/ui/carousel.js',
  '/js/ui/map.js',
  '/js/ui/overlay.js',
  '/js/ui/whisperNav.js',
  '/js/ui/toast.js',
  '/js/ui/utils.js',
  /* notion renderer rimane top-level */
  '/notion-render.js',
  /* asset statici */
  '/mappa.png',
  '/ambient.mp3',
];

/* ── Install: pre-cache asset statici ── */
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(STATIC))
  );
  self.skipWaiting();
});

/* ── Activate: elimina cache vecchie ── */
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE)
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

/* ── Fetch ── */
self.addEventListener('fetch', (e) => {
  const { url, method } = e.request;

  /* API Notion → network-first, fallback cache */
  if (url.includes('/api/notion')) {
    e.respondWith(
      fetch(e.request)
        .then((r) => {
          const clone = r.clone();
          caches.open(CACHE).then((c) => c.put(e.request, clone));
          return r;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  /* Solo GET → cache-first */
  if (method !== 'GET') return;

  e.respondWith(
    caches.match(e.request).then((cached) => {
      if (cached) return cached;

      return fetch(e.request).then((r) => {
        /* Non cachare risposte opache o errori */
        if (!r || r.status !== 200 || r.type === 'opaque') return r;
        const clone = r.clone();
        caches.open(CACHE).then((c) => c.put(e.request, clone));
        return r;
      });
    })
  );

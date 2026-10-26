// Spear Line service worker. Generated into public/sw.js by scripts/build.mjs, which fills in the release
// version (a hash of the shipped assets) and the precache list.
// Pages: network first, so content is always current, with the cached copy when offline.
// Versioned scripts, styles, fonts and icons: cache first; their addresses change with every release.
// Photographs: served from cache while a fresh copy is fetched, capped so the cache stays small.
const VERSION = "a0c689bdbe";
const CORE = "spear-core-" + VERSION, PAGES = "spear-pages-" + VERSION, MEDIA = "spear-media";
const PRECACHE = ["index.html","site.css?v=a0c689bdbe","app.js?v=a0c689bdbe","motion.js?v=a0c689bdbe","validation.js?v=a0c689bdbe","assets/fonts/mtn-brighter-sans-bold.woff2","assets/fonts/sky-text-regular.woff2","assets/icons.svg","assets/logo.svg","assets/favicon.svg"];
const MEDIA_LIMIT = 60;

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CORE).then(cache => cache.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    for (const name of await caches.keys()) if (name !== CORE && name !== PAGES && name !== MEDIA) await caches.delete(name);
    if (self.registration.navigationPreload) await self.registration.navigationPreload.enable();
    await self.clients.claim();
  })());
});

async function trim(cache, limit) {
  const keys = await cache.keys();
  for (let i = 0; i < keys.length - limit; i++) await cache.delete(keys[i]);
}

async function page(event) {
  const cache = await caches.open(PAGES);
  try {
    const response = (await event.preloadResponse) || await fetch(event.request);
    if (response.ok && response.type === "basic") cache.put(event.request, response.clone());
    return response;
  } catch {
    return (await cache.match(event.request, { ignoreSearch: true })) || (await caches.match("index.html")) || Response.error();
  }
}

async function asset(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok && response.type === "basic") (await caches.open(CORE)).put(request, response.clone());
  return response;
}

async function media(event) {
  const cache = await caches.open(MEDIA), cached = await cache.match(event.request);
  const fresh = fetch(event.request).then(response => {
    if (response.ok && response.type === "basic") cache.put(event.request, response.clone()).then(() => trim(cache, MEDIA_LIMIT));
    return response;
  });
  if (cached) { event.waitUntil(fresh.catch(() => {})); return cached; }
  return fresh;
}

self.addEventListener("fetch", event => {
  const { request } = event, url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== location.origin) return;
  if (url.pathname.endsWith("/site-config.js") || url.pathname.includes("/api/")) return;
  if (request.mode === "navigate") return event.respondWith(page(event));
  if (url.searchParams.has("v") || /\/assets\/(fonts\/|icons\.svg|logo\.svg|favicon|grain)/.test(url.pathname)) return event.respondWith(asset(request));
  if (/\/assets\/(visuals|backdrops)\//.test(url.pathname)) return event.respondWith(media(event));
});

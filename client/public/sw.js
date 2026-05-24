const CACHE = "fiap-v1";
const OFFLINE_URL = "/";

// ── Install: pre-cache the shell ──────────────────────────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.add(OFFLINE_URL)),
  );
  self.skipWaiting();
});

// ── Activate: drop old caches ─────────────────────────────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
      ),
  );
  self.clients.claim();
});

// ── Fetch: tiered caching strategy ────────────────────────────────────────────
self.addEventListener("fetch", (event) => {
  // Only handle GET requests from the same origin
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  // ── Cache-first: hashed Next.js bundles + static images ──
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/images/")
  ) {
    event.respondWith(
      caches.match(event.request).then(
        (hit) =>
          hit ??
          fetch(event.request).then((res) => {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(event.request, copy));
            return res;
          }),
      ),
    );
    return;
  }

  // ── Network-first: pages, icons, everything else ──
  event.respondWith(
    fetch(event.request)
      .then((res) => {
        // Only cache successful responses
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(event.request, copy));
        }
        return res;
      })
      .catch(
        () =>
          caches.match(event.request) ??
          caches.match(OFFLINE_URL),
      ),
  );
});

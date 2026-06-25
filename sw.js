const CACHE = "turingshop-v1";

// API 도메인은 캐시하지 않음
const NO_CACHE_HOSTS = ["supabase.co", "tosspayments.com", "toss.im", "js.tosspayments.com"];

self.addEventListener("install", (e) => {
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);

  // API·결제 요청 → 캐시 안 함
  if (NO_CACHE_HOSTS.some((h) => url.hostname.includes(h))) return;

  // HTML 페이지 탐색 → Network First (오프라인 시 캐시)
  if (e.request.mode === "navigate") {
    e.respondWith(
      fetch(e.request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copy));
          return res;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  // CSS / JS / 이미지 / SVG → Cache First
  if (["style", "script", "image", "font"].includes(e.request.destination) ||
      url.pathname.endsWith(".svg")) {
    e.respondWith(
      caches.match(e.request).then((cached) => {
        if (cached) return cached;
        return fetch(e.request).then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copy));
          return res;
        });
      })
    );
  }
});

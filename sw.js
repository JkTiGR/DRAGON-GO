const CACHE_NAME = "dragon-go-pwa-v1";
const APP_SHELL = [
  "./",
  "./index.html",
  "./HOME.html",
  "./menu.html",
  "./manifest.json",
  "./dragon-theme.css",
  "./base.css",
  "./menu.js",
  "./menu_availability.js",
  "./descriptions.json",
  "./logo.png",
  "./promo.jpg",
  "./DockIconLang.png",
  "./DockIconKorzina.png",
  "./DockIconMenu.png",
  "./DockIconWien.png",
  "./profile.png",
  "./images/pho_bo1.png",
  "./images/spring_rolls.jpeg",
  "./images/mi_xao_ga.png",
  "./images/nem_ran.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/")) return;

  event.respondWith(
    caches.match(request).then(cached => {
      const networkFetch = fetch(request)
        .then(response => {
          if (response && response.status === 200 && response.type === "basic") {
            const copy = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => cached);

      return cached || networkFetch;
    })
  );
});

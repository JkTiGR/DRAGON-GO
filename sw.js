const CACHE_NAME = "dragon-go-pwa-v21";
const APP_SHELL = [
  "./",
  "./index.html",
  "./dragon.com.html",
  "./menu.html",
  "./market.html",
  "./profil.html",
  "./kassa_dragon.html",
  "./monitor_kuhnhya.html",
  "./monitor_klient.html",
  "./admin.html",
  "./manifest.json",
  "./dragon-theme.css",
  "./dragon_static_config.js",
  "./menu.js",
  "./menu_availability.js",
  "./dragon_kassa_modifier_logic.js",
  "./dragon_burger_menu.js",
  "./descriptions.json",
  "./logo.png",
  "./fon1.png",
  "./promo.jpg",
  "./DockIconLang.png",
  "./DockIconKorzina.png",
  "./DockIconMenu.png",
  "./DockIconWien.png",
  "./profile.png",
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

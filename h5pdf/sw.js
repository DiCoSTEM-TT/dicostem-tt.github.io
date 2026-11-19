// Uso sin conexión: red primero y, si no hay red, la copia guardada. Guarda cada archivo de
// la propia web que se usa (también los modelos de OCR cuando hacen falta). Nunca
// intercepta peticiones a otros sitios.
const CACHE = "h5pdf-web-0.2.0-1794939332-footer-links";
const CORE = [
  "./",
  "index.html",
  "app.js?v=0.2.0-1794939332",
  "h5pdf.js?v=0.2.0-1794939332",
  "style.css?v=0.2.0-1794939332",
  "i18n.json?v=0.2.0-1794939332",
  "template.json",
  "icon.png",
  "logos/MICIU-Cofinanciado-AEI.svg",
  "../assets/js/external-links.js",
  "../assets/css/footer-identity.css",
  "../assets/img/logos/uex-horizontal-color.svg",
  "../assets/img/logos/uex-horizontal-blanco.svg",
  "../assets/img/logos/uex-abreviado-vertical-color.svg",
  "../assets/img/logos/uex-abreviado-vertical-blanco.svg",
  "../assets/img/logos/facultad.svg",
  "../assets/img/logos/facultad-dark.svg",
  "vendor/jszip/jszip.min.js",
  "vendor/pdfjs/pdf.min.mjs",
  "vendor/pdfjs/pdf.worker.min.mjs",
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(CORE)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key.startsWith("h5pdf-web-") && key !== CACHE).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET" || new URL(request.url).origin !== self.location.origin) return;
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy));
        }
        return response;
      })
      .catch(() => caches.match(request, { ignoreSearch: request.mode === "navigate" }))
  );
});

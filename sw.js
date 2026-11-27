const CACHE = "shop-v13";
const ASSETS = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png", "./icon-512-mask.png", "./sql-wasm.js", "./sql-wasm.wasm"];
// كل ملف بيتحمّل من السيرفر مباشرة (cache: reload) عشان نسخة قديمة من كاش المتصفح ماتتخزنش كنسخة جديدة
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => Promise.all(ASSETS.map(u => fetch(new Request(u, { cache: "reload" })).then(r => { if (!r.ok) throw new Error(u); return c.put(u, r); })))).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request; if (req.method !== "GET") return;
  if (req.mode === "navigate" || /\/(index\.html)?$/.test(new URL(req.url).pathname)){   // الصفحة نفسها: السيرفر الأول، والكاش لو مفيش نت
    e.respondWith(fetch(req, { cache: "no-cache" }).then(resp => { const copy = resp.clone(); caches.open(CACHE).then(c => c.put("./index.html", copy)); return resp; }).catch(() => caches.match("./index.html")));
    return;
  }
  e.respondWith(caches.match(req, { ignoreSearch: true }).then(r => r || fetch(req).then(resp => { const copy = resp.clone(); caches.open(CACHE).then(c => c.put(req, copy)); return resp; }).catch(() => caches.match("./index.html"))));
});

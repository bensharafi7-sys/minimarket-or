const CACHE='mo-game-20261013125906';
const ASSETS=['./','index.html','cart.html','tower.html','common.css','common.js','kit.js','cart.js','tower.js','vendor/three.js','vendor/cannon.js','fonts/rubik.ttf','manifest.json',
'img/logo.png','img/icon-512.png','img/thumb_cart.jpg','img/thumb_tower.jpg','img/bamba.png','img/bissli.png','img/tapuchips.png','img/cola.png','img/milk.png','img/tara.jpg','img/elite.jpg','img/para.png','img/krembo.jpg','img/pasta.png','img/cottage.png','img/milky.png','img/shoko.png'];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)))});
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
// network-first for HTML (fresh deploys), cache-first for the rest
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;
 if(r.mode==='navigate'||r.url.endsWith('.html')){e.respondWith(fetch(r).then(res=>{const cp=res.clone();caches.open(CACHE).then(c=>c.put(r,cp));return res}).catch(()=>caches.match(r).then(m=>m||caches.match('index.html'))));return}
 e.respondWith(caches.match(r).then(m=>m||fetch(r).then(res=>{if(res.ok){const cp=res.clone();caches.open(CACHE).then(c=>c.put(r,cp))}return res})))});

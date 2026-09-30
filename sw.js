// Freezer RTE offline cache. Build 20260930034440
const CACHE='frte-20260930034440';
const CORE=['./','index.html','manifest.webmanifest','icon-180.png','icon-192.png','icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
function withTimeout(p,ms){return new Promise((res,rej)=>{const t=setTimeout(()=>rej(new Error('timeout')),ms);p.then(v=>{clearTimeout(t);res(v)},e=>{clearTimeout(t);rej(e)})})}
self.addEventListener('fetch',e=>{
  const r=e.request; if(r.method!=='GET') return;
  const u=new URL(r.url);
  if(r.mode==='navigate'){
    // Fresh page when there is signal, saved copy when there is not (freezers often have no signal).
    e.respondWith(withTimeout(fetch(r),3500).then(res=>{const cp=res.clone();caches.open(CACHE).then(c=>c.put('index.html',cp));return res}).catch(()=>caches.match('index.html')));
    return;
  }
  e.respondWith(caches.match(r).then(hit=>hit||fetch(r).then(res=>{
    if(res&&(res.ok||res.type==='opaque')&&(u.origin===location.origin||/fonts\.(googleapis|gstatic)\.com$/.test(u.hostname))){const cp=res.clone();caches.open(CACHE).then(c=>c.put(r,cp))}
    return res;
  })));
});

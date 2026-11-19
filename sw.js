const C='igmind-v22',F=['./','index.html','legacy.html'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>Promise.all(F.map(u=>c.add(new Request(u,{cache:'reload'})).catch(()=>0)))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request;
  if(r.method!=='GET'||new URL(r.url).origin!==location.origin)return;
  const nav=r.mode==='navigate';
  e.respondWith((async()=>{
    const c=await caches.open(C);
    const net=fetch(r).then(x=>{if(x&&x.ok)c.put(r,x.clone());return x});
    e.waitUntil(net.catch(()=>0));
    try{
      // страница: ждём сеть не дольше 4 секунд, затем открываем сохранённую копию
      return nav?await Promise.race([net,new Promise((_,j)=>setTimeout(j,4000))]):await net;
    }catch(_){
      const m=await c.match(r,{ignoreSearch:true})||(nav?(await c.match('index.html'))||(await c.match('./')):null);
      return m||Response.error();
    }
  })());
});

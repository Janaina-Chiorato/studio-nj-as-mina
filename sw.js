// Cache do site para revisitas offline; solicitações de atendimento exigem rede.
const CACHE = 'studio-nj-offline-v12-local';
const INICIO = new URL('./', self.location.href).pathname;
const ARQUIVOS = ["./textos-site.js", "./horarios.js", "./conteudo.js", "./conteudo-fallback.js", "./", "./index.html", "./style.css", "./mina.css", "./script.js", "./galeria.js", "./espaco.js", "./config.js", "./api.js", "./servicos.js", "./servicos-fallback.js", "./formulario.js", "./horario.js", "./integracoes.js", "./imagens/ambiente-studio-nj.webp", "./imagens/barbearia-capa.jpeg", "./imagens/cabelos-capa.jpg", "./imagens/espaco/cantinho-cafe-miniatura.webp", "./imagens/espaco/cantinho-cafe.webp", "./imagens/espaco/espaco-atendimento-miniatura.webp", "./imagens/espaco/espaco-atendimento.webp", "./imagens/espaco/espaco-barbearia-miniatura.webp", "./imagens/espaco/espaco-barbearia.webp", "./imagens/estetica-sobrancelhas-atual.webp", "./imagens/galeria/cabelos-longos.jpg", "./imagens/galeria/cachos.jpg", "./imagens/galeria/corte-e-barba.jpeg", "./imagens/galeria/corte-infantil.jpeg", "./imagens/galeria/unhas-decoradas.jpeg", "./imagens/galeria/unhas-rosa.jpeg", "./imagens/irlania-silva-saraiva.webp", "./imagens/janaina-chiorato-atual.webp", "./imagens/logo-studio-nj.jpeg", "./imagens/lyssandra.webp", "./imagens/nail-design-capa.jpeg", "./imagens/quarta-autoestima-banner.png", "./imagens/trancas-capa.webp"];
self.addEventListener('install', evento => {
 evento.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ARQUIVOS)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate', evento => {
 evento.waitUntil(caches.keys().then(chaves=>Promise.all(chaves.filter(c=>c.startsWith('studio-nj-offline-')&&c!==CACHE).map(c=>caches.delete(c)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch', evento => {
 const req=evento.request; const url=new URL(req.url);
 if(req.method!=='GET' || url.origin!==self.location.origin || !['document','script','style','image',''].includes(req.destination))return;
 if(/\/admin(?:\/|\.|$|-)/.test(url.pathname))return;
 if(url.pathname.includes('/rest/') || url.pathname.includes('/auth/'))return;
 if(req.mode==='navigate') {
  if(![INICIO, INICIO+'index.html'].includes(url.pathname))return;
  evento.respondWith(fetch(req).then(res=>{if(res.ok){const copia=res.clone();evento.waitUntil(caches.open(CACHE).then(c=>c.put('./index.html',copia)));}return res;}).catch(()=>caches.match('./index.html')));return;
 }
 // Scripts e estilos da Mina priorizam a versão atual quando há rede.
 evento.respondWith(caches.match(req).then(cache=>{
  const rede=fetch(req).then(res=>{if(res.ok){const copia=res.clone();evento.waitUntil(caches.open(CACHE).then(c=>c.put(req,copia)));}return res;}).catch(()=>cache || Response.error());
  return req.destination==='script' || url.pathname.endsWith('/mina.css') ? rede : cache || rede;
 }));
});

/* Cada miniatura define uma foto real. Novas fotos entram na navegação automaticamente. */
(() => {
 let miniaturas = Array.from(document.querySelectorAll('[data-foto-espaco]'));
 const foto = document.getElementById('foto-espaco');
 const legenda = document.getElementById('legenda-espaco');
 const modal = document.getElementById('modal-espaco');
 const ampliada = modal.querySelector('.foto-modal-espaco');
 const legendaModal = document.getElementById('legenda-modal-espaco');
 const anterior = modal.querySelector('.anterior-espaco');
 const proxima = modal.querySelector('.proxima-espaco');
 let indice = 0;
 let origem = null;
 let inicioToque = null;
 function selecionar(novoIndice) {
  if(!miniaturas.length)return;
  indice = (novoIndice + miniaturas.length) % miniaturas.length;
  const dados = miniaturas[indice].dataset;
  foto.src = dados.fotoEspaco;
  foto.alt = dados.descricao;
  foto.closest('a').href = dados.fotoEspaco;
  legenda.textContent = dados.legenda;
  ampliada.src = dados.fotoEspaco;
  ampliada.alt = dados.descricao;
  legendaModal.textContent = dados.legenda + ' · ' + (indice + 1) + ' de ' + miniaturas.length;
  miniaturas.forEach((botao, i) => botao.setAttribute('aria-pressed', String(i === indice)));
 }
 const grupo=document.querySelector('.miniaturas-espaco');
 grupo.addEventListener('click',evento=>{const b=evento.target.closest('[data-foto-espaco]');if(b)selecionar(miniaturas.indexOf(b));});
 grupo.addEventListener('keydown',evento=>{
  if(!evento.target.closest('button')||!['ArrowLeft','ArrowRight','Home','End'].includes(evento.key)||!miniaturas.length)return;
  evento.preventDefault();selecionar(evento.key==='Home'?0:evento.key==='End'?miniaturas.length-1:indice+(evento.key==='ArrowRight'?1:-1));miniaturas[indice].focus();
 });
 window.addEventListener('studio:espaco-atualizado',()=>{
  miniaturas=Array.from(document.querySelectorAll('[data-foto-espaco]'));
  anterior.hidden=proxima.hidden=modal.querySelector('.ajuda-modal-espaco').hidden=miniaturas.length<2;
  selecionar(0);
 });
 document.querySelectorAll('[data-ampliar-ambiente]').forEach(link => {
  link.addEventListener('click', evento => {
   if (typeof modal.showModal !== 'function' || evento.ctrlKey || evento.metaKey || evento.shiftKey || evento.altKey) return;
   if(!miniaturas.length)return;
   evento.preventDefault();
   origem = link;
   if (link.classList.contains('foto-ambiente-principal')) selecionar(0);
   else selecionar(indice);
   modal.showModal();
  });
 });
 anterior.hidden = proxima.hidden = miniaturas.length < 2;
 modal.querySelector('.ajuda-modal-espaco').hidden = miniaturas.length < 2;
 anterior.addEventListener('click', () => selecionar(indice - 1));
 proxima.addEventListener('click', () => selecionar(indice + 1));
 modal.querySelector('.fechar-espaco').addEventListener('click', () => modal.close());
 modal.addEventListener('keydown', evento => {
  if (evento.key === 'ArrowLeft' || evento.key === 'ArrowRight') {
   evento.preventDefault();
   selecionar(indice + (evento.key === 'ArrowRight' ? 1 : -1));
  }
 });
 const visualizador = modal.querySelector('.visualizador-espaco');
 visualizador.addEventListener('touchstart', evento => { inicioToque = {x: evento.changedTouches[0].clientX, y: evento.changedTouches[0].clientY}; }, {passive: true});
 visualizador.addEventListener('touchend', evento => {
  if (!inicioToque) return;
  const dx = evento.changedTouches[0].clientX - inicioToque.x;
  const dy = evento.changedTouches[0].clientY - inicioToque.y;
  if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) selecionar(indice + (dx < 0 ? 1 : -1));
  inicioToque = null;
 }, {passive: true});
 modal.addEventListener('click', evento => { if (evento.target === modal) modal.close(); });
 modal.addEventListener('close', () => { if (origem) origem.focus(); });
 selecionar(0);
})();

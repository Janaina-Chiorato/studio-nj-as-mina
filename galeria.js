/* Galeria: filtros por categoria e ampliação das fotografias reais. */
const barraFiltros=document.querySelector('.filtros-galeria');
barraFiltros.hidden=false;
barraFiltros.addEventListener('click',evento=>{
 const botao=evento.target.closest('[data-filtro]');if(!botao)return;
 const filtro=botao.dataset.filtro;
 barraFiltros.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b===botao)));
 let quantidade=0;
 document.querySelectorAll('.trabalho-galeria').forEach(trabalho=>{trabalho.hidden=filtro!=='todos'&&trabalho.dataset.categoria!==filtro;if(!trabalho.hidden)quantidade++;});
 document.querySelectorAll('.grupo-galeria').forEach(grupo=>grupo.hidden=filtro!=='todos'&&grupo.dataset.grupo!==filtro);
 document.querySelector('#status-galeria').textContent=quantidade+(quantidade===1?' trabalho':' trabalhos');
});
const modalGaleria = document.getElementById('modal-galeria');
const fotoAmpliada = modalGaleria.querySelector('.foto-ampliada');
const legendaAmpliada = document.getElementById('legenda-ampliada');
let origemGaleria = null;
// Delegação preserva a ampliação após atualização dos serviços pelo banco.
document.addEventListener('click', function (evento) {
 const link = evento.target.closest('.ampliar-trabalho, .ampliar-estetica, .ampliar-servico');
 if (!link || typeof modalGaleria.showModal !== 'function') return;
 if (evento.ctrlKey || evento.metaKey || evento.shiftKey || evento.altKey) return;
 evento.preventDefault(); origemGaleria = link;
 fotoAmpliada.src = link.href; fotoAmpliada.alt = link.querySelector('img').alt;
 legendaAmpliada.textContent = link.closest('figure').querySelector('figcaption').textContent;
 modalGaleria.showModal();
});
modalGaleria.querySelector('.fechar-galeria').addEventListener('click', function () {
    modalGaleria.close();
});
modalGaleria.addEventListener('click', function (evento) {
    if (evento.target === modalGaleria) modalGaleria.close();
});
modalGaleria.addEventListener('close', function () {
    if (origemGaleria) origemGaleria.focus();
});

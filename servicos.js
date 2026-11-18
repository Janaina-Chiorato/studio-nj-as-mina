import { urlImagem } from './conteudo.js';
import { listarServicos } from './api.js';
import { CONFIG_CATALOGO, configuracaoBancoValida, obterWhatsApp } from './config.js';
import { CATEGORIAS, SERVICOS_FALLBACK } from './servicos-fallback.js';

export function normalizar(texto = '') { return String(texto).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase(); }
export function servicosValidos(lista) {
  if (!Array.isArray(lista)) throw new Error('Catálogo inválido.');
  return lista.filter(s => s && s.disponivel === true && s.id != null && typeof s.nome === 'string' && typeof s.categoria==='string' && s.categoria.trim().length>0)
    .map(s => ({ ...s, id: String(s.id), tipo_preco: ['fixo','a_partir','avaliacao'].includes(s.tipo_preco) ? s.tipo_preco : 'avaliacao' }));
}
function elemento(tag, classe, texto) {
  const e = document.createElement(tag); if (classe) e.className = classe; if (texto != null) e.textContent = texto; return e;
}
export async function iniciarServicos(aoAtualizar, servicoAPI = { listarServicos }) {
  const grid = document.querySelector('.servicos-grid');
  const select = document.querySelector('#servico');
  const status = document.querySelector('#status-servicos');
  const categoria = document.querySelector('#filtro-servicos');
  const busca = document.querySelector('#busca-servicos');
  let lista = [];
  let deBanco = false; let capas=null;
  function grupos() {
    const nomes=[...new Set(lista.map(s=>s.categoria))];
    return nomes.map(nome=>{
      const visual=CATEGORIAS.find(c=>c.categoria===nome)||{...CATEGORIAS[0],categoria:nome,titulo:nome,descricao:'Conheça os serviços disponíveis.',alt:'Atendimento no Studio NJ'};
      const ordem=CATEGORIAS.findIndex(c=>c.categoria===nome);
      return {...visual,ordem:ordem<0?CATEGORIAS.length:ordem};
    }).sort((a,b)=>a.ordem-b.ordem);
  }
  function preencherSelect() {
    const anterior = select.value;
    select.replaceChildren(new Option('Selecione um serviço', ''));
    for (const grupo of grupos()) {
      const itens = lista.filter(s => s.categoria === grupo.categoria);
      if (!itens.length) continue;
      const optgrupo = elemento('optgroup'); optgrupo.label = grupo.titulo;
      itens.forEach(s => optgrupo.append(new Option(s.nome, s.id))); select.append(optgrupo);
    }
    if (lista.some(s => s.id === anterior)) select.value = anterior;
    const filtroAnterior=categoria.value;
    categoria.replaceChildren(new Option('Todas as categorias',''));
    grupos().forEach(g=>categoria.add(new Option(g.titulo,g.categoria)));
    if([...categoria.options].some(o=>o.value===filtroAnterior))categoria.value=filtroAnterior;
    aoAtualizar(lista);
  }
  function linha(s) {
    const li = elemento('li');
    const nome = elemento('span', 'nome-servico', s.nome);
    const imagemServico = urlImagem(s.imagem_url);
    if (imagemServico) {
      const img = elemento('img', 'foto-item-servico');
      img.src = imagemServico; img.alt = s.nome; img.loading = 'lazy'; img.decoding = 'async';
      nome.prepend(img);
    }
    if (s.observacao) nome.append(elemento('small', 'condicao-servico', s.observacao));
    const preco = elemento('strong');
    if (s.tipo_preco === 'avaliacao' || s.preco == null) preco.textContent = 'Valor após avaliação';
    else {
      if (s.tipo_preco === 'a_partir') preco.append(elemento('small','preco-a-partir','A partir de'));
      preco.append(document.createTextNode(' ' + Number(s.preco).toLocaleString('pt-BR',{style:'currency',currency:'BRL'})));
    }
    const agendar = elemento('a', '', 'Agendar →'); agendar.href = '#agendamento'; agendar.dataset.agendarServico = s.id;
    agendar.setAttribute('aria-label', 'Solicitar atendimento: ' + s.nome);
    const whats = elemento('a', 'whatsapp-servico', 'Pelo WhatsApp ↗');
    whats.href = 'https://wa.me/' + obterWhatsApp() + '?text=' + encodeURIComponent('Olá! Gostaria de agendar: ' + s.nome + '. ' + preco.textContent.trim() + '. Quais horários estão disponíveis?');
    whats.target = '_blank'; whats.rel = 'noopener noreferrer'; whats.setAttribute('aria-label','Conversar pelo WhatsApp sobre ' + s.nome);
    li.append(nome, preco, agendar, whats); return li;
  }
  function desenhar() {
    const termo = normalizar(busca.value.trim());
    const filtrada = lista.filter(s => (!categoria.value || s.categoria === categoria.value) && normalizar(s.nome).includes(termo));
    grid.replaceChildren();
    for (const grupo of grupos()) {
      const itens = filtrada.filter(s => s.categoria === grupo.categoria); if (!itens.length) continue;
      const card = elemento('article','card-servico'); card.id = 'servicos-' + normalizar(grupo.categoria);
      const cover=capas?.find(g=>g.categoria==='Capa: '+grupo.categoria);
      const imagem=urlImagem(cover?.imagem_url||grupo.imagem),alt=cover?.texto_alternativo||grupo.alt;
      const capa = elemento('div','foto-servico ' + grupo.classe + ' com-foto');
      const img = elemento('img'); img.src = imagem; img.alt = alt; img.loading = 'lazy'; img.decoding = 'async'; img.width = 1152; img.height = 1536;
      if(grupo.categoria==='Estética')img.style.objectPosition='center 40%';
      const figura = elemento('figure','capa-servico');
      const ampliar = elemento('a','ampliar-servico'); ampliar.href=imagem; ampliar.setAttribute('aria-label','Ampliar foto de '+grupo.titulo);
      ampliar.append(img); const legenda=elemento('figcaption','',alt);legenda.hidden=true;figura.append(ampliar,legenda);capa.append(figura);
      const conteudo = elemento('div','conteudo-card'); conteudo.append(elemento('h3','',grupo.titulo),elemento('p','',grupo.descricao));
      const ul = elemento('ul','precos-servicos'); ul.setAttribute('aria-label',grupo.titulo + ': serviços e preços');
      itens.slice(0,grupo.visiveis).forEach(s=>ul.append(linha(s))); conteudo.append(ul);
      if (itens.length > grupo.visiveis) {
        const details = elemento('details','mais-servicos');
        details.append(elemento('summary','',`Ver mais ${itens.length-grupo.visiveis} serviços`));
        const mais = elemento('ul','precos-servicos'); itens.slice(grupo.visiveis).forEach(s=>mais.append(linha(s))); details.append(mais); conteudo.append(details);
      }
      card.append(capa,conteudo); grid.append(card);
    }
    if (!filtrada.length) grid.append(elemento('p','sem-servicos', lista.length ? 'Nenhum serviço encontrado. Tente outro nome ou categoria.' : 'Não há serviços disponíveis no momento. Fale conosco pelo WhatsApp.'));
    document.querySelector('#total-servicos').textContent = `${filtrada.length} serviço${filtrada.length===1?'':'s'}`;
  }
  grid.addEventListener('click', e => {
    const link = e.target.closest('[data-agendar-servico]'); if (!link) return;
    select.value = link.dataset.agendarServico;
    select.dispatchEvent(new Event('change',{bubbles:true}));
    // A âncora continua funcionando; foco acompanha a ação para teclado e leitores.
    requestAnimationFrame(()=>select.focus({preventScroll:true}));
  });
  window.addEventListener('studio:capas-servicos',e=>{capas=e.detail;desenhar();});
  categoria.addEventListener('change',desenhar); busca.addEventListener('input',desenhar);
  const chaveCache = CONFIG_CATALOGO.CACHE_SERVICOS + ':' + CONFIG_CATALOGO.SUPABASE_URL;
  async function atualizar() {
    if (!configuracaoBancoValida(CONFIG_CATALOGO)) {
      lista = servicosValidos(SERVICOS_FALLBACK);
      status.textContent = 'Confira nossos serviços e solicite informações pelo WhatsApp.';
      preencherSelect(); desenhar();
      return;
    }
    document.querySelector('#skeleton-servicos').hidden = false;
    grid.setAttribute('aria-busy','true');
    try {
      lista = servicosValidos(await servicoAPI.listarServicos());
      deBanco = true;
      try { localStorage.setItem(chaveCache,JSON.stringify({salvo:Date.now(),servicos:lista})); } catch { /* Cache opcional em navegação privada. */ }
      status.textContent = '';
    } catch {
      if (!deBanco) {
        lista = servicosValidos(SERVICOS_FALLBACK);
        try {
          const cache = JSON.parse(localStorage.getItem(chaveCache));
          if (cache && Date.now()-cache.salvo < 86400000) lista = servicosValidos(cache.servicos);
        } catch { /* Mantém a lista original. */ }
      }
      status.textContent = 'Não foi possível atualizar os serviços agora. Exibimos a última lista disponível; confirme os valores com nossa equipe.';
    } finally {
      grid.setAttribute('aria-busy','false'); document.querySelector('#skeleton-servicos').hidden = true;
      preencherSelect(); desenhar();
    }
  }
  window.addEventListener('online',atualizar);
  grid.replaceChildren();
  await atualizar();
}

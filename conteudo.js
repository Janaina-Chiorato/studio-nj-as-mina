import { normalizarHorario, validarHorario, resumoHorario, dataLocal, DIAS } from './horarios.js';
import { apiPublica } from './api.js';
import { CONFIG, CONFIG_CATALOGO, configuracaoBancoValida, estabelecimentoAtual, obterWhatsApp } from './config.js';
import { TEXTOS_SITE } from './textos-site.js';

const elemento = (tag, classe, texto) => {
  const e = document.createElement(tag);
  if (classe) e.className = classe;
  if (texto != null) e.textContent = texto;
  return e;
};
const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const texto = valor => typeof valor === 'string' ? valor.trim() : '';
const categoria = valor => texto(valor).normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();

export function urlSegura(valor) {
  if (!texto(valor)) return '';
  try {
    const base = new URL(globalThis.location?.href || CONFIG.SITE_URL + '/');
    const url = new URL(valor, base);
    const relativo = !/^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(valor.trim());
    if (url.username || url.password) return '';
    if (url.protocol !== 'https:' && !(relativo && url.protocol === 'http:' && url.origin === base.origin)) return '';
    return url.href;
  } catch { return ''; }
}

export function urlImagem(valor, baseArquivos = new URL('./', import.meta.url)) {
  const caminho = texto(valor);
  if (!caminho) return '';
  try {
    const baseInformada = new URL(baseArquivos);
    const base = ['http:', 'https:'].includes(baseInformada.protocol)
      ? baseInformada : new URL(CONFIG.SITE_URL + '/');
    // As fotos do pacote acompanham a pasta dos módulos, inclusive em /dist/.
    const arquivoDoPacote = /^(?:\.\/|\/)?imagens\//.test(caminho);
    const url = new URL(arquivoDoPacote ? caminho.replace(/^(?:\.\/|\/)/, '') : caminho, base);
    if (url.username || url.password) return '';
    if (url.protocol !== 'https:' && !(url.protocol === 'http:' && url.origin === base.origin)) return '';
    const origensDoStudio = [new URL(CONFIG.SITE_URL).origin, base.origin];
    if (origensDoStudio.includes(url.origin) && url.pathname.startsWith('/imagens/')) {
      return new URL(url.pathname.slice(1) + url.search + url.hash, base).href;
    }
    return url.href;
  } catch { return ''; }
}

function foto(src, alt, classe = '') {
  const img = elemento('img', classe);
  img.src = src;
  img.alt = alt;
  img.loading = 'lazy';
  img.decoding = 'async';
  img.width = 1200;
  img.height = 1600;
  return img;
}

function whatsapp(mensagem, rotulo = 'Agendar atendimento') {
  const a = elemento('a', 'botao-principal', rotulo);
  a.href = 'https://wa.me/' + obterWhatsApp() + '?text=' + encodeURIComponent(mensagem);
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  return a;
}

function substituirParagrafos(container, valor) {
  const ancora = container.querySelector('a');
  container.querySelectorAll(':scope > p').forEach(p => p.remove());
  valor.split(/\n\s*\n/).filter(Boolean).forEach(t => container.insertBefore(elemento('p', '', t), ancora));
}

export function aplicarTextos(linhas) {
  const textos = Object.fromEntries(linhas.filter(l => Object.hasOwn(TEXTOS_SITE, l.chave) && typeof l.valor === 'string').map(l => [l.chave, l.valor]));
  for (const [chave, valor] of Object.entries(textos)) {
    const seletor = TEXTOS_SITE[chave][1];
    if (seletor) document.querySelectorAll(seletor).forEach(e => e.textContent = valor);
  }
  if ('hero_titulo' in textos || 'hero_titulo_destaque' in textos) {
    const titulo = document.querySelector('.hero-text h1');
    const destaque = titulo.querySelector('span');
    const prefixo = titulo.firstChild === destaque ? '' : titulo.firstChild?.textContent.trim() || '';
    titulo.replaceChildren(document.createTextNode((textos.hero_titulo ?? prefixo) + ' '), elemento('span', '', textos.hero_titulo_destaque ?? destaque?.textContent ?? ''));
  }
  if ('hero_subtitulo' in textos) document.querySelector('.hero-text > p').textContent = textos.hero_subtitulo;
  if ('sobre_texto' in textos) substituirParagrafos(document.querySelector('.sobre-texto'), textos.sobre_texto);
}

export function aplicarProfissionais(linhas) {
  const grid = document.querySelector('.profissionais-grid');
  const retratos = new Map([...grid.querySelectorAll('.retrato-profissional')].map(img =>
    [urlImagem(img.getAttribute('src')), img]
  ));
  grid.replaceChildren();
  for (const p of linhas.filter(p => p.ativo === true)) {
    const card = elemento('article', 'cartao-profissional');
    card.id = 'profissional-' + p.id;
    const src = urlImagem(p.foto_url);
    if (src) {
      const retrato = retratos.get(src);
      const imagem = foto(src, 'Retrato de ' + p.nome, retrato?.className || 'retrato-profissional');
      if (retrato) {
        imagem.width = retrato.width;
        imagem.height = retrato.height;
        card.id = retrato.closest('article').id;
      }
      card.append(imagem);
    }
    const perfil = elemento('div', 'perfil-profissional');
    perfil.append(elemento('h3', '', p.nome));
    if (texto(p.cargo)) perfil.append(elemento('p', 'cargo-profissional', p.cargo));
    if (texto(p.especialidades)) {
      const especialidades = elemento('p', 'especialidades-profissional');
      especialidades.append(elemento('strong', '', 'Especialidades'), elemento('br'), p.especialidades);
      perfil.append(especialidades);
    }
    if (texto(p.biografia)) {
      const detalhes = elemento('details', 'apresentacao-profissional');
      const bio = elemento('div', 'biografia-profissional');
      bio.append(elemento('h4', '', 'Sobre mim'));
      p.biografia.split(/\n\s*\n/).filter(Boolean).forEach(t => bio.append(elemento('p', '', t)));
      detalhes.append(elemento('summary', '', 'Conheça a profissional'), bio);
      perfil.append(detalhes);
    }
    const agendar = whatsapp('Olá! Gostaria de agendar com ' + p.nome + '.');
    agendar.setAttribute('aria-label', 'Agendar atendimento com ' + p.nome);
    perfil.append(agendar);
    card.append(perfil);
    grid.append(card);
  }
  document.querySelector('#profissionais').hidden = !grid.children.length;
}

export function promocoesVigentes(linhas, hoje = dataLocal()) {
  return linhas.filter(p => p.ativa === true && (!p.inicio || p.inicio <= hoje) && (!p.fim || p.fim >= hoje));
}

export function aplicarPromocoes(linhas) {
  const container = document.querySelector('.ofertas-quarta');
  const vigentes = promocoesVigentes(linhas);
  container.replaceChildren();
  for (const p of vigentes) {
    const card = elemento('article', 'oferta-quarta');
    const preco = p.preco == null ? 'Sob consulta' : moeda.format(Number(p.preco));
    const src = urlImagem(p.imagem_url);
    if (src) card.append(foto(src, p.titulo, 'foto-promocao'));
    if (/quartas?-feiras?/i.test(p.descricao || '')) card.append(elemento('span', 'selo-quarta', 'Toda quarta-feira'));
    card.append(elemento('h3', '', p.titulo), elemento('strong', 'valor-oferta', preco), elemento('p', '', p.descricao));
    card.append(whatsapp('Olá! Gostaria de saber sobre a promoção ' + p.titulo + ' (' + preco + ').', 'Quero aproveitar'));
    container.append(card);
  }
  document.querySelector('#promocoes').hidden = !vigentes.length;
  // A arte antiga contém ofertas fixas. Exibir apenas uma arte cadastrada no painel.
  document.querySelector('.banner-quarta-link').hidden = true;
  document.querySelector('#status-promocoes').hidden = true;
  if (vigentes.some(p => !/quarta/i.test(p.descricao || ''))) {
    document.querySelector('#titulo-quarta').textContent = 'Promoções do Studio';
    document.querySelector('.promocao-texto > p').textContent = 'Confira as ofertas disponíveis.';
    document.querySelector('.condicoes-quarta').textContent = 'Consulte condições e disponibilidade com nossa equipe.';
    document.querySelector('.atracoes-quarta').hidden = true;
  }
}

export function aplicarGaleria(linhas, studio) {
  const ativos = linhas.filter(g => g.ativo === true && texto(g.categoria) && urlImagem(g.imagem_url));
  const grid = document.querySelector('.galeria-grid');
  grid.replaceChildren();
  const grupos = new Map();
  for (const g of ativos) {
    const chave = categoria(g.categoria);
    if (['espaco', 'logo', 'banner de promocoes'].includes(chave) || chave.startsWith('capa:')) continue;
    if (!grupos.has(chave)) {
      const grupo = elemento('section', 'grupo-galeria');
      grupo.dataset.grupo = chave;
      const h = elemento('h3', '', g.categoria);
      h.id = 'grupo-galeria-' + grupos.size;
      grupo.setAttribute('aria-labelledby', h.id);
      grupo.append(h);
      grid.append(grupo);
      grupos.set(chave, grupo);
    }
    const fig = elemento('figure', 'trabalho-galeria');
    fig.dataset.categoria = chave;
    const link = elemento('a', 'ampliar-trabalho');
    link.href = urlImagem(g.imagem_url);
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.setAttribute('aria-label', 'Ampliar foto: ' + (g.titulo || g.categoria));
    link.append(foto(link.getAttribute('href'), g.titulo || g.categoria));
    fig.append(link, elemento('figcaption', '', g.titulo));
    grupos.get(chave).append(fig);
  }
  const filtros = document.querySelector('.filtros-galeria');
  filtros.replaceChildren();
  for (const [valor, nome] of [['todos', 'Todos'], ...[...grupos].map(([k, g]) => [k, g.querySelector('h3').textContent])]) {
    const b = elemento('button', '', nome);
    b.type = 'button';
    b.dataset.filtro = valor;
    b.setAttribute('aria-pressed', String(valor === 'todos'));
    filtros.append(b);
  }
  const total = grid.querySelectorAll('figure').length;
  document.querySelector('#status-galeria').textContent = total + (total === 1 ? ' trabalho' : ' trabalhos');
  filtros.hidden = !total;

  const espaco = ativos.filter(g => categoria(g.categoria) === 'espaco');
  const miniaturas = document.querySelector('.miniaturas-espaco');
  miniaturas.replaceChildren();
  for (const [i, g] of espaco.entries()) {
    const b = elemento('button');
    b.type = 'button';
    b.dataset.fotoEspaco = urlImagem(g.imagem_url);
    b.dataset.legenda = g.titulo || '';
    b.dataset.descricao = g.titulo || 'Foto do Studio';
    b.setAttribute('aria-label', 'Selecionar foto ' + (i + 1) + ': ' + b.dataset.descricao);
    b.setAttribute('aria-pressed', String(i === 0));
    b.append(foto(b.dataset.fotoEspaco, ''));
    miniaturas.append(b);
  }
  document.querySelectorAll('#espaco,.hero-imagem,.sobre-espaco').forEach(e => e.hidden = !espaco.length);
  if (espaco[0]) {
    const src = urlImagem(espaco[0].imagem_url);
    document.querySelectorAll('.hero-imagem [data-ampliar-ambiente],.sobre-espaco').forEach(a => {
      const img = a.querySelector('img');
      img.src = src;
      img.alt = espaco[0].titulo || 'Foto do Studio';
      if (a.hasAttribute('data-ampliar-ambiente')) a.href = src;
    });
  }
  const logo = ativos.find(g => categoria(g.categoria) === 'logo');
  if (logo && !urlImagem(studio?.logo_url)) aplicarLogo(urlImagem(logo.imagem_url), studio?.nome);
  const banner = ativos.find(g => categoria(g.categoria) === 'banner de promocoes');
  if (banner) {
    const link = document.querySelector('.banner-quarta-link');
    link.href = urlImagem(banner.imagem_url);
    link.querySelector('img').src = link.href;
    link.querySelector('img').alt = banner.titulo || 'Promoções do Studio';
    link.hidden = false;
  }
  const capas = ativos.filter(g => categoria(g.categoria).startsWith('capa:')).map(g => ({
    ...g, imagem_url:urlImagem(g.imagem_url), texto_alternativo:g.titulo || g.categoria
  }));
  window.dispatchEvent(new CustomEvent('studio:capas-servicos', {detail:capas}));
  window.dispatchEvent(new Event('studio:espaco-atualizado'));
}

function atualizarSchema(atualizar) {
  const json = document.querySelector('script[type="application/ld+json"]');
  const schema = JSON.parse(json.textContent);
  atualizar(schema);
  json.textContent = JSON.stringify(schema);
}

function numeros(valor) {
  const digitos = texto(valor).replace(/\D/g, '');
  const n = digitos.length === 10 || digitos.length === 11 ? '55' + digitos : digitos;
  return /^55[1-9]\d{9,10}$/.test(n) ? n : '';
}

function aplicarLogo(logo, nome) {
  document.querySelectorAll('.logo img,footer img').forEach(img => {
    img.src = logo;
    if (nome) img.alt = nome;
  });
  document.querySelector('link[rel="icon"]').href = logo;
  const url = new URL(logo, new URL('./', import.meta.url)).href;
  document.querySelector('[property="og:image"]').content = url;
  atualizarSchema(schema => { schema.image = url; });
}

export function aplicarEstabelecimento(e, textos = []) {
  const numero = numeros(e.whatsapp);
  const telefone = numeros(e.telefone);
  const nome = texto(e.nome);
  const sobreEditado = textos.some(l => l.chave === 'sobre_texto' && typeof l.valor === 'string');
  if (nome) {
    document.title = nome + ' | Beleza em Fortaleza';
    document.querySelector('[property="og:site_name"]').content = nome;
    document.querySelector('[property="og:title"]').content = document.title;
    document.querySelector('footer .footer-container > p').textContent = nome + ' © 2026';
    document.querySelectorAll('.logo img,footer img').forEach(img => img.alt = nome);
  }
  if (texto(e.descricao)) {
    if (sobreEditado) {
      const resumo = document.querySelector('#descricao-studio');
      resumo.textContent = e.descricao;
      resumo.hidden = false;
    } else substituirParagrafos(document.querySelector('.sobre-texto'), e.descricao);
  }
  if (texto(e.slogan)) {
    const titulo = document.querySelector('.hero-text h1');
    if (textos.some(l => ['hero_titulo','hero_titulo_destaque'].includes(l.chave) && typeof l.valor === 'string')) {
      const slogan = document.querySelector('#slogan-studio');
      slogan.textContent = e.slogan;
      slogan.hidden = false;
    }
    const divisao = e.slogan.trim().match(/^(realçando\s+a)\s+(.+)$/i);
    if (divisao) titulo.replaceChildren(divisao[1] + ' ', elemento('span', '', divisao[2]));
    else titulo.replaceChildren(elemento('span', '', e.slogan));
  }

  const logo = urlImagem(e.logo_url);
  if (logo) aplicarLogo(logo, nome);
  if (numero) {
    estabelecimentoAtual.whatsapp = numero;
    document.querySelectorAll('a[href*="wa.me/"]').forEach(a => {
      const url = new URL(a.href);
      if (url.pathname !== '/' + CONFIG.WHATSAPP_ALTERNATIVO) {
        url.pathname = '/' + numero;
        a.href = url.href;
      }
    });
    const link = document.querySelector('#contato [data-whatsapp-principal]');
    link.textContent = numero.replace(/^55(\d{2})(\d{4,5})(\d{4})$/, '($1) $2-$3');
  }
  if (telefone) {
    const bloco = document.querySelector('#contato [data-telefone-studio]');
    const link = bloco.querySelector('a');
    link.href = 'tel:+' + telefone;
    link.textContent = telefone.replace(/^55(\d{2})(\d{4,5})(\d{4})$/, '($1) $2-$3');
    bloco.hidden = false;
  }
  const dadosEndereco = {streetAddress:e.endereco,addressLocality:e.cidade,addressRegion:e.estado,postalCode:e.cep};
  let rotaEnderecoAtual = '';
  atualizarSchema(schema => {
    const endereco = {...schema.address};
    for (const [campo, valor] of Object.entries(dadosEndereco)) {
      if (texto(valor)) endereco[campo] = valor;
    }
    const mudou = Object.keys(dadosEndereco).some(campo => endereco[campo] !== schema.address[campo]);
    if (mudou || texto(e.bairro)) {
      const exibicao = [endereco.streetAddress, texto(e.bairro), endereco.addressLocality + '/' + endereco.addressRegion, 'CEP ' + endereco.postalCode].filter(Boolean).join(' — ');
      document.querySelector('[data-endereco-studio]').textContent = exibicao;
      if (mudou) {
        // A incorporação gerada pelo Google é específica para o endereço original.
        document.querySelector('#contato .mapa iframe').remove();
        document.querySelector('#contato .mapa-aviso').hidden = false;
        const rota = new URL('https://www.google.com/maps/dir/?api=1');
        rota.searchParams.set('destination', exibicao);
        rotaEnderecoAtual = rota.href;
      }
    }
    schema.address = endereco;
  });
  const mapaConfigurado = urlSegura(e.google_maps);
  const mapa = mapaConfigurado ? new URL(mapaConfigurado) : null;
  const linkIncorporado = mapa?.pathname.startsWith('/maps/embed') || mapa?.searchParams.get('output') === 'embed';
  const rota = mapa && !linkIncorporado ? mapa.href : rotaEnderecoAtual;
  if (rota) document.querySelectorAll('#contato [data-link-mapa]').forEach(a => a.href = rota);
  const instagram = texto(e.instagram);
  let urlInstagram = '';
  if (instagram) {
    const perfil = instagram.replace(/^@/, '');
    urlInstagram = /^[\w.]+$/.test(perfil) ? 'https://www.instagram.com/' + perfil + '/' : urlSegura(instagram);
    if (urlInstagram) {
      const url = new URL(urlInstagram);
      if (!['www.instagram.com', 'instagram.com'].includes(url.hostname)) urlInstagram = '';
    }
  }
  if (urlInstagram) {
    document.querySelectorAll('a[href*="instagram.com"]').forEach(a => a.href = urlInstagram);
    document.querySelector('#contato [data-instagram-studio]').textContent = '@' + new URL(urlInstagram).pathname.split('/').filter(Boolean)[0];
  }
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(texto(e.email))) {
    document.querySelectorAll('a[href^="mailto:"]').forEach(a => { a.href = 'mailto:' + e.email; a.textContent = e.email; });
  }
  atualizarSchema(schema => {
    if (nome) schema.name = nome;
    if (telefone || numero) schema.telephone = '+' + (telefone || numero);
    if (urlInstagram) schema.sameAs = [urlInstagram];
  });
}

export function aplicarHorarios(linhas) {
  if (!linhas.length) return;
  const semana = Object.fromEntries(DIAS.map((_, dia) => [dia, {aberto:false}]));
  for (const h of linhas) semana[h.dia_semana] = {aberto:h.aberto, abre:h.abre?.slice(0, 5), fecha:h.fecha?.slice(0, 5)};
  const horario = normalizarHorario({ semana });
  if (!validarHorario(horario)) return;
  estabelecimentoAtual.horario = horario;
  const badge = document.querySelector('#status-horario');
  badge.parentElement.replaceChildren(resumoHorario(horario) + ' ', badge);
  const abertos = Object.entries(semana).filter(([, i]) => i.aberto);
  document.querySelector('#ajuda-data').textContent = abertos.length ? 'Atendimento: ' + abertos.map(([dia]) => DIAS[dia]).join(', ') + '.' : 'Sem horários disponíveis no momento.';
  document.querySelector('#ajuda-periodo').textContent = 'Confira o horário de funcionamento do dia escolhido.';
  atualizarSchema(schema => {
    const nomes = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    schema.openingHoursSpecification = abertos.map(([dia, i]) => ({'@type':'OpeningHoursSpecification',dayOfWeek:nomes[dia],opens:i.abre,closes:i.fecha}));
  });
}

export async function iniciarConteudo(atualizarFormulario, servicoAPI = apiPublica) {
  if (!configuracaoBancoValida(CONFIG_CATALOGO)) return;
  const secoes = document.querySelectorAll('#inicio,#sobre,#profissionais,#promocoes,#galeria,#espaco,#contato');
  secoes.forEach(s => s.setAttribute('aria-busy', 'true'));
  let studio;
  let textos = [];
  const tarefas = [
    [() => servicoAPI.listarConteudo(), linhas => { textos = linhas; }],
    [() => servicoAPI.listarEstabelecimento(), linhas => {
      studio = linhas[0];
      if (studio) aplicarEstabelecimento(studio, textos);
    }],
    [() => servicoAPI.listarHorarios(), aplicarHorarios],
    [() => servicoAPI.listarAvisos(), linhas => { estabelecimentoAtual.avisos = linhas; }],
    [() => servicoAPI.listarProfissionais(), linhas => {
      aplicarProfissionais(linhas);
      // O banco atual não tem relações de profissional por serviço. O campo é uma preferência.
      atualizarFormulario.profissionais(linhas, null);
    }],
    [() => servicoAPI.listarPromocoes(), aplicarPromocoes, () => {
      document.querySelector('.banner-quarta-link').hidden = true;
      document.querySelector('.ofertas-quarta').replaceChildren();
      document.querySelector('#status-promocoes').hidden = false;
    }],
    [() => servicoAPI.listarGaleria(), linhas => aplicarGaleria(linhas, studio)]
  ];
  const resultados = await Promise.allSettled(tarefas.map(([buscar]) => buscar()));
  let falhou = false;
  resultados.forEach((r, i) => {
    if (r.status === 'rejected') {
      falhou = true;
      tarefas[i][2]?.();
      return;
    }
    try { tarefas[i][1](r.value); }
    catch (erro) { falhou = true; console.error('Não foi possível exibir uma seção do Studio.', erro); }
  });
  aplicarTextos(textos);
  const aviso = document.querySelector('#status-conteudo');
  aviso.hidden = !falhou;
  secoes.forEach(s => s.removeAttribute('aria-busy'));
  window.dispatchEvent(new Event('studio:estabelecimento'));
}

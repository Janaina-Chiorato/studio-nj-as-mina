import { configuracaoBancoValida } from './config.js';
import { CONFIG_ADMIN } from './admin-config.js';
import { criarAdminAPI, csvContatos } from './admin-api.js';
import { CAMPOS, STATUS, STATUS_SOLICITACOES, ROTULOS_TEXTOS, validarRegistro } from './admin-modelo.js';
import { DIAS } from './horarios.js';
import { comprimirImagem } from './admin-imagens.js';
import { urlImagem } from './conteudo.js';

const $=s=>document.querySelector(s);
const el=(tag,classe,texto)=>{const e=document.createElement(tag);if(classe)e.className=classe;if(texto!=null)e.textContent=texto;return e;};
const retornoAuth = new URLSearchParams(location.hash.slice(1));
const tokenRecuperacao = retornoAuth.get('type') === 'recovery' ? retornoAuth.get('access_token') : null;
const chaveSessao = 'studio-nj-admin-' + new URL(CONFIG_ADMIN.SUPABASE_URL).hostname;
const supabase = configuracaoBancoValida(CONFIG_ADMIN) && globalThis.supabase?.createClient(
  CONFIG_ADMIN.SUPABASE_URL, CONFIG_ADMIN.SUPABASE_ANON_KEY, {
    auth: { storage: sessionStorage, storageKey: chaveSessao, flowType: 'implicit', detectSessionInUrl: Boolean(tokenRecuperacao) },
    global: { fetch: (url, opcoes = {}) => {
      const limite = AbortSignal.timeout(CONFIG_ADMIN.TIMEOUT_MS);
      const signal = opcoes.signal ? AbortSignal.any([opcoes.signal, limite]) : limite;
      return fetch(url, { ...opcoes, signal, cache: 'no-store', referrerPolicy: 'no-referrer' });
    } }
  }
);
const api = supabase ? criarAdminAPI(supabase) : null;
const ABAS={dashboard:['Visão geral','Seu atendimento em números.'],estabelecimento:['Informações do Studio','Endereço e contatos.'],horarios_funcionamento:['Horários','Dias e horários de funcionamento.'],avisos:['Avisos','Comunicados do Studio.'],servicos:['Serviços e preços','Organize os serviços e mantenha os valores atualizados.'],profissionais:['Profissionais','Apresente a equipe e os serviços de cada profissional.'],promocoes:['Promoções','Publique ofertas e escolha o período de validade.'],galeria:['Galeria e espaço','Mostre seu trabalho e o ambiente do Studio.'],site_conteudo:['Textos do site','Atualize as mensagens do site sem mexer em código.'],contatos:['Solicitações de Agendamento','Consulte os pedidos e confirme o atendimento com cada cliente.']};
let tempoMensagem=null;
let versaoSolicitacoes=0;
let dados={},aba='dashboard',sujo=false,ocupado=false,usuario=null,verificacao=null,versao=0,previewURLs=[];
function mensagem(texto,erro=false){const m=$('#mensagem-admin');m.textContent=texto;m.classList.toggle('erro',erro);m.hidden=false;clearTimeout(tempoMensagem);tempoMensagem=setTimeout(()=>m.hidden=true,9000);}
function marcarSujo(valor){sujo=valor;const aviso=$('#nao-salvo');if(aviso)aviso.hidden=!valor;}
window.addEventListener('beforeunload',e=>{if(sujo){e.preventDefault();e.returnValue='';}});
function confirmar(texto,perigo=false){
 const dialog=$('#confirmacao');$('#texto-confirmacao').textContent=texto;const aceitar=$('#aceitar-confirmacao');aceitar.textContent=perigo?'Excluir':'Continuar';aceitar.classList.toggle('perigo',perigo);
 return new Promise(resolve=>{const terminar=v=>{dialog.close();aceitar.onclick=null;$('#cancelar-confirmacao').onclick=null;dialog.oncancel=null;resolve(v);};aceitar.onclick=()=>terminar(true);$('#cancelar-confirmacao').onclick=()=>terminar(false);dialog.oncancel=e=>{e.preventDefault();terminar(false);};dialog.showModal();});
}
async function podeSair(){return !sujo||await confirmar('Há alterações não salvas. Deseja sair sem salvar?');}
function limparPreviews(){previewURLs.forEach(u=>URL.revokeObjectURL(u));previewURLs=[];}
function bloquear(texto, erro = true){sessionStorage.removeItem(chaveSessao);versao++;usuario=null;dados={};marcarSujo(false);limparPreviews();$('#conteudo-painel').replaceChildren();$('#painel').hidden=true;$('#entrada').hidden=false;$('#login').hidden=false;$('#nova-senha').hidden=true;$('#sair').hidden=true;$('#senha-login').value='';if(verificacao)clearInterval(verificacao);mensagem(texto,erro);}
async function lidarErro(e){mensagem(e.message||'Não foi possível concluir. Tente novamente.',true);if(e.status===401||e.status===403)bloquear(e.message||'Sua sessão expirou. Entre novamente.');}
async function acao(fn){if(ocupado)return;ocupado=true;$('#conteudo-admin').setAttribute('aria-busy','true');try{await fn();}catch(e){await lidarErro(e);}finally{ocupado=false;$('#conteudo-admin').setAttribute('aria-busy','false');}}
function botao(texto,fn,classe=''){const b=el('button',classe,texto);b.type='button';b.addEventListener('click',()=>{if(!ocupado)fn();});return b;}
async function carregar(){
 const atual=versao;$('#conteudo-painel').replaceChildren(el('div','skeleton-admin'));$('#conteudo-painel').setAttribute('aria-busy','true');
 const tabelas = {
   estabelecimento: ['id'], horarios_funcionamento: ['dia_semana'], avisos: ['id'],
   servicos: ['ordem', 'id'], profissionais: ['ordem', 'id'], promocoes: ['id'],
   galeria: ['ordem', 'id'], site_conteudo: ['chave']
 };
 const entradas = await Promise.all(Object.entries(tabelas).map(async ([tabela, ordem]) =>
   [tabela, await api.listar(tabela, { ordem })]
 ));
 if(atual!==versao||!usuario)return;
 dados=Object.fromEntries(entradas);
 dados.site_conteudo=dados.site_conteudo.filter(r=>Object.hasOwn(ROTULOS_TEXTOS,r.chave));$('#conteudo-painel').setAttribute('aria-busy','false');renderizar();
}
async function entrarPainel(u){
 usuario=u;await carregar();if(usuario!==u)return;$('#entrada').hidden=true;$('#painel').hidden=false;$('#sair').hidden=false;$('#conta-admin').textContent=u.email;$('#senha-login').value='';$('#mensagem-admin').hidden=true;
 if(verificacao)clearInterval(verificacao);
 verificacao=setInterval(async()=>{if(!usuario)return;try{await api.verificarAdmin();}catch(e){if(e.status===401||e.status===403)bloquear(e.message);else mensagem('Não foi possível verificar a conexão. Novas gravações exigem validação do acesso.',true);}},30000);
}
for(const [id,[nome]] of Object.entries(ABAS)){$('#abas').append(botao(nome,async()=>{if(!await podeSair())return;marcarSujo(false);aba=id;renderizar();}));$('#abas').lastChild.dataset.aba=id;}
function renderizar(){
 limparPreviews();marcarSujo(false);$('#conteudo-painel').replaceChildren();const info=ABAS[aba]||['Categorias','Organize as categorias de serviços.'];$('#titulo-area').textContent=info[0];$('#descricao-area').textContent=info[1];
 $('#abas').querySelectorAll('button').forEach(b=>{if(b.dataset.aba===aba||(aba==='categorias'&&b.dataset.aba==='servicos'))b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');});
 if(aba==='contatos'){
  listarSolicitacoes().catch(lidarErro);
  return;
 }
 if(aba==='dashboard'){
  $('#conteudo-painel').append(el('p','aviso','Acompanhe os pedidos na aba Solicitações de Agendamento.'));
  return;
 }
 listarRegistros();
}
async function listarSolicitacoes(){
 const atual=++versaoSolicitacoes, versaoConta=versao;
 const box=$('#conteudo-painel');
 box.replaceChildren(el('div','skeleton-admin'));
 box.setAttribute('aria-busy','true');
 try{
  const registros=await api.listarSolicitacoes();
  if(atual!==versaoSolicitacoes||versaoConta!==versao||aba!=='contatos'||!usuario)return;
  box.replaceChildren();
  const filtros=el('div','filtros-admin');
  const labelBusca=el('label','','Buscar solicitação');
  const busca=el('input');busca.type='search';busca.placeholder='Nome, telefone, serviço ou profissional';labelBusca.append(busca);
  const labelStatus=el('label','','Situação');
  const filtro=el('select');filtro.add(new Option('Todas',''));
  Object.entries(STATUS_SOLICITACOES).forEach(([valor,nome])=>filtro.add(new Option(nome,valor)));
  labelStatus.append(filtro);filtros.append(labelBusca,labelStatus);
  const quantidade=el('p','ajuda');quantidade.setAttribute('aria-live','polite');
  const container=el('div','tabela-container');
  box.append(filtros,quantidade,container);
  let limite=50;
  const normalizar=v=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  function desenhar(){
   const termo=normalizar(busca.value.trim());
   const linhas=registros.filter(r=>(!filtro.value||r.status===filtro.value)&&normalizar([r.nome,r.telefone,r.email,r.servico,r.profissional,r.mensagem].join(' ')).includes(termo));
   quantidade.textContent=linhas.length+(linhas.length===1?' solicitação encontrada':' solicitações encontradas');
   container.replaceChildren();
   if(!linhas.length){container.append(el('p','vazio','Nenhuma solicitação encontrada.'));return;}
   const tabela=el('table'),head=el('thead'),titulos=el('tr');
   for(const nome of ['Cliente','Atendimento solicitado','Observações','Enviado em','Situação','Contato']){
    const th=el('th','',nome);th.scope='col';titulos.append(th);
   }
   head.append(titulos);tabela.append(head);const corpo=el('tbody');
   for(const r of linhas.slice(0,limite)){
    const linha=el('tr'),cliente=el('td'),pedido=el('td'),observacoes=el('td','',r.mensagem||'Sem observações'),envio=el('td'),situacao=el('td'),contato=el('td');
    cliente.append(el('strong','',r.nome),el('small','',r.telefone),el('small','',r.email||''));
    const data=r.data_preferida?r.data_preferida.split('-').reverse().join('/'):'Sem data preferida';
    pedido.append(el('strong','',r.servico||'Serviço não informado'),el('small','',r.profissional||'Sem preferência de profissional'),el('small','',data),el('small','',r.horario_preferido?.slice(0,5)||'Sem horário preferido'));
    envio.textContent=new Date(r.criado_em).toLocaleString('pt-BR',{timeZone:'America/Fortaleza'});
    const select=el('select');select.setAttribute('aria-label','Situação de '+r.nome);
    Object.entries(STATUS_SOLICITACOES).forEach(([valor,nome])=>select.add(new Option(nome,valor)));
    select.value=r.status;
    select.addEventListener('change',()=>{
     if(ocupado){select.value=r.status;return;}
     acao(async()=>{
      select.disabled=true;
      try{
       const salvo=await api.atualizarStatusSolicitacao(r.id,select.value);
       Object.assign(r,salvo);mensagem('Situação da solicitação atualizada.');desenhar();
      }finally{select.value=r.status;select.disabled=false;}
     });
    });
    situacao.append(select);
    const n=String(r.telefone||'').replace(/\D/g,'');
    if(n.length>=10){
     const a=el('a','','WhatsApp ↗');
     a.href='https://wa.me/'+(n.startsWith('55')&&n.length>11?n:'55'+n);
     a.target='_blank';a.rel='noopener noreferrer';a.setAttribute('aria-label','Conversar no WhatsApp com '+r.nome);
     contato.append(a);
    }
    linha.append(cliente,pedido,observacoes,envio,situacao,contato);corpo.append(linha);
   }
   tabela.append(corpo);container.append(tabela);
   if(linhas.length>limite)container.append(botao('Mostrar mais 50',()=>{limite+=50;desenhar();}));
  }
  for(const [campo,evento] of [[busca,'input'],[filtro,'change']])campo.addEventListener(evento,()=>{limite=50;desenhar();});
  desenhar();
 }catch(erro){
  if(atual===versaoSolicitacoes&&aba==='contatos')box.replaceChildren(el('p','aviso','Não foi possível carregar as solicitações. Use Atualizar dados para tentar novamente.'));
  throw erro;
 }finally{
  if(atual===versaoSolicitacoes&&aba==='contatos')box.setAttribute('aria-busy','false');
 }
}
function listarRegistros(){
 const box=$('#conteudo-painel'),acoes=el('div','acoes');acoes.append(botao(aba==='estabelecimento'?'Cadastrar informações':'Adicionar novo',()=>editar({}), 'primario'));
 if(aba==='estabelecimento'&&dados[aba]?.length)acoes.firstChild.hidden=true;
 if(aba==='promocoes')acoes.append(botao('Editar textos da seção',()=>{aba='site_conteudo';renderizar();}));
 box.append(acoes);
 if(aba==='estabelecimento'){
  for(const e of dados.estabelecimento||[]){const card=el('article','cartao-admin');card.append(el('h2','',e.nome),el('p','',e.endereco));const a=el('div','acoes');a.append(botao('Editar informações',()=>editar(e),'primario'),botao('Excluir registro',()=>excluir(e),'perigo'));card.append(a);box.append(card);}return;
 }
 const ehServicos = aba === 'servicos';
 const registros = dados[aba] || [];
 const ativos = ehServicos ? registros.filter(r => r.disponivel === true) : [];
 const inativos = ehServicos ? registros.filter(r => r.disponivel === false) : [];
 const totalServicos = (total, ativo) => total + (total === 1
   ? (ativo ? ' serviço ativo' : ' serviço inativo')
   : (ativo ? ' serviços ativos' : ' serviços inativos'));
 if (ehServicos) box.append(el('p','indicador',totalServicos(ativos.length,true)));
 const filtros=el('div','filtros-admin'),label=el('label','','Buscar');const busca=el('input');busca.type='search';busca.placeholder=aba==='contatos'?'Nome, telefone, e-mail ou mensagem':'Digite um nome ou texto';label.append(busca);filtros.append(label);
 let filtroStatus;
 if(ehServicos){
  const l=el('label','','Exibir serviços');
  filtroStatus=el('select');
  filtroStatus.add(new Option('Ativos','ativos'));
  filtroStatus.add(new Option('Inativos ('+inativos.length+')','inativos'));
  l.append(filtroStatus);filtros.append(l);
 }else if(aba==='contatos'){
  const l=el('label','','Situação');filtroStatus=el('select');filtroStatus.add(new Option('Todas',''));Object.entries(STATUS).forEach(([v,t])=>filtroStatus.add(new Option(t,v)));l.append(filtroStatus);filtros.append(l);
  filtros.append(botao('Exportar CSV',()=>acao(async()=>{await api.verificarAdmin();const linhas=filtrar();const blob=new Blob([csvContatos(linhas)],{type:'text/csv;charset=utf-8'});const url=URL.createObjectURL(blob),a=el('a');a.href=url;a.download='contatos-studio-nj-'+new Date().toISOString().slice(0,10)+'.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);mensagem(linhas.length+' contatos exportados (filtros atuais).');})));
 }
 box.append(filtros);const quantidade=el('p','ajuda');quantidade.setAttribute('aria-live','polite');const tabela=el('div','tabela-container');box.append(quantidade,tabela);const tamanhoPagina=ehServicos?100:50;let limite=tamanhoPagina;
 const normalizar=t=>String(t).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 function filtrar(){
  const termo=normalizar(busca.value);
  const origem=ehServicos?(filtroStatus.value==='ativos'?ativos:inativos):registros;
  return origem.filter(r=>(ehServicos||!filtroStatus?.value||r.status===filtroStatus.value)&&normalizar(Object.values(r).join(' ')).includes(termo));
 }
 function desenhar(){
  const linhas=filtrar();quantidade.textContent=ehServicos?totalServicos(linhas.length,filtroStatus.value==='ativos')+' na lista':linhas.length+' registros encontrados';tabela.replaceChildren();if(!linhas.length){tabela.append(el('p','vazio','Nenhum registro encontrado.'));return;}
  const table=el('table'),head=el('thead'),tr=el('tr');for(const h of aba==='contatos'?['Contato','Serviço / data','Situação','Ações']:['Informação','Detalhes','Ações']){const th=el('th','',h);th.scope='col';tr.append(th);}head.append(tr);table.append(head);const body=el('tbody');
  for(const r of linhas.slice(0,limite)){
   const linha=el('tr'),nome=el('td'),detalhes=el('td'),acoes=el('td');
   const titulo=r.nome||r.titulo||ROTULOS_TEXTOS[r.chave]||r.chave||DIAS[r.dia_semana]||r.mensagem;
   nome.append(el('strong','',titulo));
   if(aba==='contatos'){
    nome.append(el('small','',r.telefone),el('small','',r.email||''));detalhes.append(el('span','',dados.servicos.find(s=>s.id===r.servico_id)?.nome||'Sem serviço'),el('small','',new Date(r.criado_em).toLocaleString('pt-BR',{timeZone:'America/Fortaleza'})),el('small','',r.mensagem||''));
    const statusCell=el('td'),select=el('select');select.setAttribute('aria-label','Situação de '+r.nome);Object.entries(STATUS).forEach(([v,t])=>select.add(new Option(t,v)));select.value=r.status;select.addEventListener('change',()=>acao(async()=>{select.disabled=true;try{const salvo=await api.gravar('contatos',{status:select.value},r.id);Object.assign(r,salvo);mensagem('Situação atualizada.');}finally{select.value=r.status;select.disabled=false;}}));statusCell.append(select);linha.append(nome,detalhes,statusCell);
    const a=el('a','','WhatsApp ↗');a.href='https://wa.me/55'+String(r.telefone).replace(/\D/g,'');a.target='_blank';a.rel='noopener noreferrer';acoes.append(a);
   }else{
    const url=urlImagem(r.imagem_url||r.foto_url);if(url){const img=el('img');img.src=url;img.alt=r.texto_alternativo||r.nome;img.loading='lazy';nome.prepend(img);}
    const detalhe=aba==='servicos'?((r.categoria||'')+' · '+(r.preco_tipo==='sob_avaliacao'?'Valor após avaliação':(r.preco_tipo==='a_partir_de'?'A partir de ':'')+Number(r.preco).toLocaleString('pt-BR',{style:'currency',currency:'BRL'}))):aba==='profissionais'?r.cargo:aba==='promocoes'?(r.preco==null?'Sob consulta':Number(r.preco).toLocaleString('pt-BR',{style:'currency',currency:'BRL'}))+' · '+(r.inicio||'sem início')+' a '+(r.fim||'sem fim'):aba==='galeria'?r.categoria:aba==='site_conteudo'?r.valor.slice(0,160):aba==='horarios_funcionamento'?(r.aberto?r.abre+'–'+r.fecha:'Fechado'):aba==='avisos'?'Comunicado':'Ordem '+r.ordem;
    detalhes.textContent=detalhe;const ativo=r.ativo??r.ativa??r.disponivel;if(ativo!=null)detalhes.append(el('small','badge',ativo?'Visível / ativo':'Oculto / inativo'));linha.append(nome,detalhes);
   }
   acoes.append(botao('Editar',()=>editar(r)),botao('Excluir',()=>excluir(r),'perigo'));linha.append(acoes);body.append(linha);
  }
  table.append(body);tabela.append(table);if(linhas.length>limite)tabela.append(botao('Mostrar mais '+tamanhoPagina,()=>{limite+=tamanhoPagina;desenhar();}));
 }
 busca.addEventListener('input',()=>{limite=tamanhoPagina;desenhar();});filtroStatus?.addEventListener('change',()=>{limite=tamanhoPagina;desenhar();});desenhar();
}
async function excluir(registro){
 const tabela=aba,id=registro.chave||registro.id;if(!await confirmar('Excluir “'+(registro.nome||registro.titulo||registro.chave||DIAS[registro.dia_semana]||registro.mensagem)+'”? A exclusão é permanente. Fotos deste bucket serão removidas se não forem usadas em outro cadastro.',true))return;
 await acao(async()=>{await api.excluir(tabela,id);let aviso='';try{await api.excluirImagemLivre(registro.imagem_url||registro.foto_url);}catch{aviso=' O cadastro foi removido, mas o arquivo foi preservado no Storage.';}await carregar();mensagem('Registro excluído.'+aviso);});
}
function editar(registro){
 $('#mensagem-admin').hidden=true;
 const tabela=aba,existe=!!(registro.id||registro.chave);limparPreviews();const box=$('#conteudo-painel');box.replaceChildren();
 const form=el('form','cartao-admin');form.id='editor-admin';form.noValidate=true;form.append(el('h2','',existe?'Editar informações':'Novo cadastro'));
 const aviso=el('p','aviso','Você tem alterações não salvas.');aviso.id='nao-salvo';aviso.hidden=true;form.append(aviso);
 const grid=el('div','campos-admin'),campos={},imagens={};
 for(const c of CAMPOS[tabela]){
  const wrap=el('div','campo-admin'+(['textarea','imagem'].includes(c.tipo)?' largo':'')),label=el('label','',c.rotulo+(c.required?' *':''));let input;
  if(c.tipo==='select'){input=el('select');if(!c.required)input.add(new Option('Sem preferência / não informado',''));for(const [v,t]of c.opcoes||(dados[c.fonte]||[]).map(x=>[x.id,x.nome]))input.add(new Option(t,v));}
  else if(c.tipo==='textarea')input=el('textarea');else{input=el('input');input.type=c.tipo==='imagem'?'text':c.tipo;}
  input.id='editar-'+c.nome;input.name=c.nome;label.htmlFor=input.id;input.required=!!c.required;
  const valor=registro[c.nome]??c.padrao??'';
  if(c.tipo==='checkbox')input.checked=!!valor;else input.value=Array.isArray(valor)?valor.join('\n'):valor;
  if(c.max)input.maxLength=c.max;if(c.min!=null)input.min=c.min;if(c.maxNumero)input.max=c.maxNumero;if(c.step)input.step=c.step;
  if(c.tipo==='number')input.step=c.step||'1';
  if(tabela==='site_conteudo'&&c.nome==='chave'&&existe)input.disabled=true;
  if(c.tipo==='checkbox'){label.className='check-label';label.prepend(input);wrap.append(label);}else wrap.append(label,input);
  const erro=el('span','erro-campo');erro.id='erro-editar-'+c.nome;input.setAttribute('aria-describedby',erro.id);input.setAttribute('aria-invalid','false');wrap.append(erro);
  if(c.ajuda)wrap.append(el('small','ajuda',c.ajuda));
  if(c.max&&c.tipo==='textarea'){const count=el('small','contador',input.value.length+'/'+c.max);wrap.append(count);input.addEventListener('input',()=>count.textContent=input.value.length+'/'+c.max);}
  if(c.tipo==='imagem'){
   input.placeholder='Envie uma foto abaixo ou cole a URL pública';const file=el('input');file.type='file';file.accept='image/jpeg,image/png,image/webp';file.setAttribute('aria-label','Selecionar '+c.rotulo);const preview=el('img','foto-preview');preview.alt='Pré-visualização da foto selecionada';const atualizarPreview=()=>{const url=urlImagem(input.value);preview.hidden=!url;if(url)preview.src=url;};atualizarPreview();
   const situacao=el('small','ajuda','JPG, PNG ou WebP, até 5 MB. Envio em WebP com até 1600 px.');situacao.setAttribute('aria-live','polite');wrap.append(file,situacao,preview);
   const estado={blob:null,processando:false,erro:false,versao:0};imagens[c.nome]=estado;
   file.addEventListener('change',async()=>{estado.blob=null;estado.erro=false;const v=++estado.versao;if(!file.files[0]){estado.processando=false;return;}estado.processando=true;situacao.textContent='Preparando a foto…';try{const blob=await comprimirImagem(file.files[0]);if(v!==estado.versao)return;estado.blob=blob;const u=URL.createObjectURL(blob);previewURLs.push(u);preview.src=u;preview.hidden=false;situacao.textContent='Foto preparada: '+Math.round(blob.size/1024)+' KB. Será enviada ao salvar.';}catch(e){if(v!==estado.versao)return;estado.erro=true;erro.textContent=e.message;file.value='';situacao.textContent='Escolha outra foto para continuar.';}finally{if(v===estado.versao)estado.processando=false;}});
   input.addEventListener('input',()=>{estado.versao++;estado.blob=null;estado.erro=false;estado.processando=false;atualizarPreview();});
  }
  campos[c.nome]={input,erro,c};grid.append(wrap);
 }
 form.append(grid);
 const rodape=el('div','acoes'),salvar=el('button','primario','Salvar alterações');salvar.type='submit';rodape.append(salvar,botao('Cancelar',async()=>{if(await podeSair()){marcarSujo(false);renderizar();}}));form.append(rodape);box.append(form);
 function precoEstado(){if(tabela!=='servicos')return;const avaliacao=campos.preco_tipo.input.value==='sob_avaliacao';campos.preco.input.disabled=avaliacao;campos.preco.input.required=!avaliacao;}
 if(tabela==='servicos'){campos.preco_tipo.input.addEventListener('change',precoEstado);precoEstado();}
 form.addEventListener('input',()=>marcarSujo(true));form.addEventListener('change',()=>marcarSujo(true));
 form.addEventListener('submit',e=>{e.preventDefault();acao(async()=>{
  if(Object.values(imagens).some(i=>i.processando))throw Error('Aguarde a preparação da foto.');
  if(Object.values(imagens).some(i=>i.erro))throw Error('Escolha uma foto válida antes de salvar.');
  const valores={};for(const [nome,{input,c}]of Object.entries(campos))valores[nome]=c.tipo==='checkbox'?input.checked:c.tipo==='number'?input.value===''?null:Number(input.value):input.value.trim();
  if(tabela==='servicos'&&valores.preco_tipo==='sob_avaliacao')valores.preco=null;
  if (tabela === 'horarios_funcionamento' && !valores.aberto) valores.abre = valores.fecha = null;
  for(const n of ['telefone','whatsapp_principal','whatsapp_alternativo'])if(n in valores)valores[n]=valores[n].replace(/\D/g,'');
  for(const n of ['email','inicio','fim','preferencia_data','preferencia_periodo','servico_id','profissional_id','classificacao','urgencia','whatsapp_alternativo'])if(n in valores&&valores[n]==='')valores[n]=null;
  const validar={...valores};for(const [n,i]of Object.entries(imagens))if(i.blob)validar[n]='foto-preparada.webp';
  const erros=validarRegistro(tabela,validar);
  for(const [n,{input,erro}]of Object.entries(campos)){erro.textContent=erros[n]||'';input.setAttribute('aria-invalid',String(!!erros[n]));}
  if(Object.keys(erros).length){mensagem('Confira os campos indicados antes de salvar.',true);campos[Object.keys(erros)[0]]?.input.focus();return;}
  salvar.disabled=true;salvar.textContent='Salvando…';
  try{
   for(const [n,i]of Object.entries(imagens))if(i.blob){const url=await api.enviarImagem(i.blob,tabela);valores[n]=url;campos[n].input.value=url;i.blob=null;}
   await api.gravar(tabela,valores,existe?(registro.chave||registro.id):null);
   marcarSujo(false);await carregar();mensagem('Alterações salvas no banco do Studio.');
  }finally{salvar.disabled=false;salvar.textContent='Salvar alterações';}
 });});
 marcarSujo(false);form.querySelector('input,textarea,select')?.focus({preventScroll:true});
}
$('#recarregar').addEventListener('click',async()=>{if(await podeSair())acao(async()=>{marcarSujo(false);await carregar();mensagem('Dados atualizados.');});});
$('#sair').addEventListener('click',async()=>{if(!await podeSair())return;acao(async()=>{try{await api.sair();}finally{bloquear('Você saiu da sua conta.', false);}});});
$('#login').addEventListener('submit',e=>{e.preventDefault();acao(async()=>{const b=$('#login [type=submit]');b.disabled=true;b.textContent='Entrando…';try{const u=await api.entrar($('#email-login').value.trim(),$('#senha-login').value);await entrarPainel(u);}finally{b.disabled=false;b.textContent='Entrar';$('#senha-login').value='';}});});
$('#recuperar').addEventListener('click',()=>acao(async()=>{const email=$('#email-login');if(!email.reportValidity())return;await api.recuperar(email.value.trim(),new URL('/admin/', CONFIG_ADMIN.SITE_URL).href);mensagem('Se o e-mail estiver cadastrado, você receberá um link para criar uma nova senha.');}));
$('#nova-senha').addEventListener('submit',e=>{e.preventDefault();acao(async()=>{const form=e.currentTarget;if(!form.reportValidity())return;if($('#senha-nova').value!==$('#senha-confirma').value)throw Error('As senhas precisam ser iguais.');await api.novaSenha($('#senha-nova').value);form.reset();await api.sair();bloquear('Senha atualizada. Entre com sua nova senha.', false);});});
async function iniciar() {
 const login = $('#login');
 if (!api) {
   $('#configuracao-aviso').hidden = false;
   login.querySelectorAll('input,button').forEach(campo => campo.disabled = true);
   return;
 }

 login.querySelectorAll('input,button').forEach(campo => campo.disabled = false);

 const erroRetorno = retornoAuth.has('error') || new URLSearchParams(location.search).has('error');
 if (erroRetorno || tokenRecuperacao) {
   try {
     if (erroRetorno || !await api.sessaoRecuperacao(tokenRecuperacao)) {
       mensagem('O link de recuperação expirou ou é inválido. Solicite outro.', true);
       return;
     }
     await acao(async () => {
       usuario = await api.verificarAdmin();
       login.hidden = true;
       $('#nova-senha').hidden = false;
       $('#sair').hidden = false;
       $('#senha-nova').focus();
     });
   } catch (erro) {
     await lidarErro(erro);
   } finally {
     history.replaceState(null, '', location.pathname);
   }
   return;
 }

 await acao(async () => {
   if (await api.temSessao()) await entrarPainel(await api.verificarAdmin());
 });
}
iniciar();

import { normalizarHorario, avisosAtuais } from './horarios.js';
import { apiPublica } from './api.js';
import { PROFISSIONAIS_FALLBACK, VINCULOS_FALLBACK } from './conteudo-fallback.js';
import { CONFIG, obterWhatsApp, estabelecimentoAtual } from './config.js';

export function dataFortaleza(agora = new Date()) {
  const partes = new Intl.DateTimeFormat('en-CA',{timeZone:CONFIG.FUSO,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(agora);
  return ['year','month','day'].map(t=>partes.find(p=>p.type===t).value).join('-');
}
export function mascararTelefone(valor) {
  let n = String(valor).replace(/\D/g,''); if (n.length>11 && n.startsWith('55')) n=n.slice(2); n=n.slice(0,11);
  if (!n) return ''; if (n.length<3) return '('+n;
  const corpo=n.slice(2); const corte=corpo.length>8?5:4;
  return '('+n.slice(0,2)+') '+corpo.slice(0,corte)+(corpo.length>corte?'-'+corpo.slice(corte):'');
}
export function validarDados(dados, servicos, hoje = dataFortaleza(), profissionais = PROFISSIONAIS_FALLBACK) {
  const erros={}; const nome=dados.nome.trim(); const telefone=dados.telefone.replace(/\D/g,'');
  if (nome.length<2 || nome.length>100) erros.nome='Informe seu nome, com 2 a 100 caracteres.';
  if (!/^[1-9]\d9\d{8}$/.test(telefone)) erros.telefone='Informe um celular com DDD, por exemplo: (85) 99999-9999.';
  if (dados.email && (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dados.email) || dados.email.length>254)) erros.email='Informe um e-mail válido ou deixe este campo vazio.';
  if (!servicos.some(s=>String(s.id)===dados.servico_id && s.disponivel===true)) erros.servico='Selecione um serviço disponível.';
  if (dados.profissional_id && !profissionais.some(p=>String(p.id)===dados.profissional_id && p.ativo)) erros.profissional='Selecione um profissional da lista.';
  if (dados.preferencia_data && (!/^\d{4}-\d{2}-\d{2}$/.test(dados.preferencia_data) || Number.isNaN(Date.parse(dados.preferencia_data)) || new Date(dados.preferencia_data).toISOString().slice(0,10)!==dados.preferencia_data || dados.preferencia_data<hoje)) erros.data='Escolha hoje ou uma data futura.';
  if (dados.preferencia_data && !erros.data) {
    const dia=new Date(dados.preferencia_data+'T12:00:00-03:00').getUTCDay();
    if (!normalizarHorario(estabelecimentoAtual.horario).semana[dia].aberto || avisosAtuais(estabelecimentoAtual.avisos||[],new Date(dados.preferencia_data+'T12:00:00-03:00')).some(a=>a.fechado)) erros.data='Escolha um dos dias de atendimento informados abaixo do campo.';
  }
  if (dados.horario_preferido && !/^([01]\d|2[0-3]):[0-5]\d$/.test(dados.horario_preferido)) {
    erros.periodo='Informe um horário válido.';
  }
  if (dados.horario_preferido && !erros.periodo) {
    const semana=normalizarHorario(estabelecimentoAtual.horario).semana;
    const horarios=dados.preferencia_data&&!erros.data
      ? [semana[new Date(dados.preferencia_data+'T12:00:00-03:00').getUTCDay()]]
      : Object.values(semana);
    if(!horarios.some(h=>h.aberto&&dados.horario_preferido>=h.abre&&dados.horario_preferido<h.fecha)) {
      erros.periodo='Escolha um horário dentro do atendimento informado.';
    }
  }
  if (dados.mensagem.length>500) erros.mensagem='Escreva uma mensagem de até 500 caracteres.';
  return erros;
}
export function iniciarFormulario(servicoAPI = apiPublica) {
  const form=document.querySelector('#form-atendimento'); let servicos=[]; let profissionais=PROFISSIONAIS_FALLBACK; let vinculos=VINCULOS_FALLBACK; let enviando=false; let tentativa=null;
  const status=document.querySelector('#resultado-formulario'); const botao=form.querySelector('[type=submit]');
  const cooldown=document.querySelector('#intervalo-envio'); const chave='studio-nj-ultimo-envio'; let ultimo=0;
  try { ultimo=Number(localStorage.getItem(chave))||0; } catch { /* Bloqueio também funciona em memória. */ }
  let intervalo=null;
  function atualizarBloqueio() {
    const segundos=Math.max(0,Math.ceil((ultimo+CONFIG.INTERVALO_ENVIO_MS-Date.now())/1000));
    botao.disabled=enviando || segundos>0;
    cooldown.textContent=segundos?`Aguarde ${segundos} segundos para enviar novamente.`:'';
    const retry=status.querySelector('button'); if(retry) retry.disabled=enviando || segundos>0;
    if (!segundos && intervalo) { clearInterval(intervalo); intervalo=null; }
    return segundos;
  }
  function bloquear() { ultimo=Date.now(); try {localStorage.setItem(chave,String(ultimo));}catch{}; atualizarBloqueio(); if(!intervalo)intervalo=setInterval(atualizarBloqueio,1000); }
  if(atualizarBloqueio())intervalo=setInterval(atualizarBloqueio,1000);
  window.addEventListener('storage',e=>{if(e.key===chave){ultimo=Number(e.newValue)||0;if(!intervalo)intervalo=setInterval(atualizarBloqueio,1000);atualizarBloqueio();}});
  const mensagem=form.elements.mensagem; const contador=document.querySelector('#contador-mensagem');
  mensagem.addEventListener('input',()=>contador.textContent=`${mensagem.value.length}/500 caracteres`);
  form.elements.telefone.addEventListener('input',e=>e.target.value=mascararTelefone(e.target.value));
  form.elements.data.min=dataFortaleza();
  function atualizarHorarioPreferido() {
    const data=form.elements.data.value;
    const semana=normalizarHorario(estabelecimentoAtual.horario).semana;
    const dia=data?new Date(data+'T12:00:00-03:00').getUTCDay():null;
    const h=semana[dia];
    const campo=form.elements.periodo;
    campo.min=h?.aberto?h.abre:'';
    campo.max=h?.aberto?h.fecha:'';
  }
  form.elements.data.addEventListener('change',atualizarHorarioPreferido);
  window.addEventListener('studio:estabelecimento',atualizarHorarioPreferido);
  function preencherProfissionais() {
    const select=form.elements.profissional, anterior=select.value, servico=form.elements.servico.value;
    select.replaceChildren(new Option('Sem preferência',''));
    profissionais.filter(p=>p.ativo && (!servico || !vinculos || vinculos.some(v=>v.profissional_id===p.id && v.servico_id===servico))).forEach(p=>select.add(new Option(p.nome+(p.apelido?' ('+p.apelido+')':''),p.id)));
    if([...select.options].some(o=>o.value===anterior))select.value=anterior;
  }
  preencherProfissionais(); form.elements.servico.addEventListener('change',preencherProfissionais);
  function limparErro(campo) { campo.setAttribute('aria-invalid','false'); const erro=document.querySelector('#erro-'+campo.id);if(erro)erro.textContent=''; }
  form.addEventListener('input',e=>{if(e.target.id)limparErro(e.target);});
  form.addEventListener('change',e=>{if(e.target.id)limparErro(e.target);});
  function resultado(texto, erro=false) {
    status.hidden=false;status.className=erro?'resultado-formulario erro':'resultado-formulario sucesso';status.replaceChildren();
    const p=document.createElement('p');p.textContent=texto;status.append(p);
    if(erro){const b=document.createElement('button');b.type='button';b.textContent='Tentar novamente';b.className='botao-outline';b.addEventListener('click',()=>form.requestSubmit());status.append(b);}
    const a=document.createElement('a');a.textContent='Falar no WhatsApp ↗';a.href='https://wa.me/'+obterWhatsApp();a.target='_blank';a.rel='noopener noreferrer';status.append(a);
    atualizarBloqueio();
  }
  form.addEventListener('submit',async e=>{
    e.preventDefault();if(enviando||atualizarBloqueio())return;
    const dados={nome:form.elements.nome.value.trim(),telefone:form.elements.telefone.value,email:form.elements.email.value.trim(),servico_id:form.elements.servico.value,profissional_id:form.elements.profissional.value,preferencia_data:form.elements.data.value,horario_preferido:form.elements.periodo.value,mensagem:mensagem.value.trim()};
    if(form.elements.website.value){bloquear();resultado('Não foi possível enviar. Atualize a página e tente novamente.',true);return;}
    const erros=validarDados(dados,servicos,dataFortaleza(),profissionais);
    for(const id of ['nome','telefone','email','servico','profissional','data','periodo','mensagem']) {
      const campo=document.getElementById(id);limparErro(campo);
      if(erros[id]){campo.setAttribute('aria-invalid','true');document.querySelector('#erro-'+id).textContent=erros[id];}
    }
    if(Object.keys(erros).length){document.getElementById(Object.keys(erros)[0]).focus();return;}
    const servico=servicos.find(s=>String(s.id)===dados.servico_id);
    const profissional=profissionais.find(p=>String(p.id)===dados.profissional_id);
    tentativa={registro:{
      nome:dados.nome,telefone:dados.telefone,email:dados.email,
      servico:servico.nome,profissional:profissional?.nome||null,
      data_preferida:dados.preferencia_data,horario_preferido:dados.horario_preferido,
      mensagem:dados.mensagem
    }};
    enviando=true;
    const campos=form.querySelectorAll('input,select,textarea');
    campos.forEach(c=>c.disabled=true);
    bloquear();botao.textContent='Enviando seu pedido…';botao.setAttribute('aria-busy','true');status.hidden=true;
    try { await servicoAPI.enviarSolicitacao(tentativa.registro); resultado('Recebemos seu pedido! Entraremos em contato em breve.');form.reset();preencherProfissionais();atualizarHorarioPreferido();contador.textContent='0/500 caracteres';tentativa=null; }
    catch(erro){resultado(erro.name==='AbortError'||erro instanceof TypeError?'Não foi possível confirmar o envio. Seus dados continuam preenchidos. Confira com a equipe pelo WhatsApp antes de reenviar.':(erro.message||'Não conseguimos enviar. Tente novamente.'),true);}
    finally{campos.forEach(c=>c.disabled=false);enviando=false;botao.textContent='Enviar solicitação';botao.setAttribute('aria-busy','false');atualizarBloqueio();}
  });
  const atualizar=lista=>{servicos=lista;preencherProfissionais();};
  atualizar.profissionais=(lista,relacoes)=>{profissionais=lista;vinculos=relacoes;preencherProfissionais();};
  return atualizar;
}

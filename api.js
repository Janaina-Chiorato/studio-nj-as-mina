import { TEXTOS_SITE } from './textos-site.js';
import { CONFIG, CONFIG_CATALOGO, configuracaoBancoValida, urlPublica } from './config.js';

// Somente campos permitidos ao visitante. Metadados internos ficam no banco.
export function dadosDoFormulario(dados) {
  return {
    nome:String(dados.nome||'').trim(),
    telefone:String(dados.telefone||'').replace(/\D/g,''),
    email:dados.email?.trim()||null,
    servico:dados.servico?.trim()||null,
    profissional:dados.profissional?.trim()||null,
    data_preferida:dados.data_preferida||null,
    horario_preferido:dados.horario_preferido||null,
    mensagem:String(dados.mensagem||'').trim()||null
  };
}
export function criarAPI(config = CONFIG, requisitar = globalThis.fetch) {
  async function pedido(url, opcoes = {}) {
    const abortar=new AbortController();const timer=setTimeout(()=>abortar.abort(),config.TIMEOUT_MS);
    try{return await requisitar(url,{...opcoes,signal:abortar.signal});}finally{clearTimeout(timer);}
  }
  function cabecalhos(){
    if(!configuracaoBancoValida(config))throw new Error('O formulário está temporariamente indisponível. Fale conosco pelo WhatsApp.');
    const h={apikey:config.SUPABASE_ANON_KEY,'Content-Type':'application/json'};
    if(config.SUPABASE_ANON_KEY.includes('.'))h.Authorization='Bearer '+config.SUPABASE_ANON_KEY;return h;
  }
  async function listar(tabela, parametros){
    const query=new URLSearchParams(parametros);const res=await pedido(config.SUPABASE_URL.replace(/\/$/,'')+'/rest/v1/'+tabela+'?'+query,{headers:cabecalhos(),cache:'no-store'});
    if(!res.ok)throw new Error('Não foi possível atualizar os dados do site.');
    const rows=await res.json();if(!Array.isArray(rows))throw new Error('Resposta inválida do catálogo.');return rows;
  }
  async function listarServicos(){
    const rows = await listar('servicos', {
      select: 'id,categoria,nome,descricao,preco,tipo_preco,imagem_url,ativo,ordem',
      ativo: 'eq.true',
      order: 'ordem.asc,nome.asc,id.asc'
    });
    const tipos = {fixo:'fixo',a_partir_de:'a_partir',sob_avaliacao:'avaliacao'};
    return rows.filter(s => s.ativo === true).map(s => ({
      ...s,
      disponivel: s.ativo,
      tipo_preco: tipos[s.tipo_preco],
      observacao: s.descricao || ''
    }));
  }
  async function criarContato(dados){
    const registro=dadosDoFormulario(dados);
    const res=await pedido(config.SUPABASE_URL.replace(/\/$/,'')+'/rest/v1/contatos',{method:'POST',headers:{...cabecalhos(),Prefer:'return=minimal'},body:JSON.stringify(registro)});
    if (!res.ok) {
      const erro = await res.json().catch(()=>({}));
      if (res.status===429) throw new Error('Muitas solicitações. Aguarde um pouco e tente novamente.');
      if (erro.code==='42501' || res.status===401 || res.status===403) {
        throw new Error('O recebimento de solicitações está temporariamente indisponível. Seus dados continuam preenchidos. Fale com a equipe pelo WhatsApp.');
      }
      throw new Error('Não conseguimos enviar seu pedido. Seus dados continuam preenchidos. Confira os campos e tente novamente.');
    }
    // O INSERT confirmado usa status e identificação gerados pelo banco.
    return {...registro,status:'novo'};
  }
  async function notificarN8n(registro){
    if(!urlPublica(config.N8N_WEBHOOK_URL))return {enviado:false};
    try{const res=await pedido(config.N8N_WEBHOOK_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(registro)});return {enviado:res.ok};}catch{return {enviado:false};}
  }
  async function enviarSolicitacao(registro){const criado=await criarContato(registro);await notificarN8n(criado);return criado;}
  return {listarServicos,criarContato,salvarContato:criarContato,notificarN8n,enviarSolicitacao,
    listarProfissionais:()=>listar('profissionais',{select:'id,nome,cargo,ativo,biografia,especialidades,foto_url,ordem',ativo:'eq.true',order:'ordem.asc.nullslast,id.asc'}),
    listarPromocoes:()=>listar('promocoes',{select:'id,titulo,descricao,preco,imagem_url,ativa,inicio,fim',ativa:'eq.true',order:'id.asc'}),
    listarGaleria:()=>listar('galeria',{select:'id,titulo,categoria,imagem_url,ordem,ativo',ativo:'eq.true',order:'ordem.asc.nullslast,id.asc'}),
    listarConteudo:()=>listar('configuracoes',{select:'chave,valor',chave:'in.('+Object.keys(TEXTOS_SITE).join(',')+')'}),
    listarEstabelecimento:()=>listar('studio',{select:'id,nome,slogan,descricao,endereco,bairro,cidade,estado,cep,telefone,whatsapp,instagram,email,google_maps,logo_url',order:'id.asc',limit:'1'}),
    listarHorarios:()=>listar('horarios_funcionamento',{select:'dia_semana,aberto,abre,fecha',order:'dia_semana.asc,id.asc'}),
    listarAvisos:()=>listar('avisos',{select:'id,mensagem,ativo,inicio,fim',ativo:'eq.true',order:'inicio.desc.nullslast,id.asc'})
  };
}
export const api=criarAPI();
export const apiPublica = criarAPI(CONFIG_CATALOGO);
export const { listarServicos } = apiPublica;
export const criarContato=(...args)=>apiPublica.criarContato(...args);

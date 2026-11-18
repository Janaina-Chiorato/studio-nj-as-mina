import { STATUS_SOLICITACOES } from './admin-modelo.js';
import { CONFIG_ADMIN } from './admin-config.js';

const TABELAS = {
  estabelecimento: 'studio',
  contatos: 'contatos',
  servicos: 'servicos',
  profissionais: 'profissionais',
  promocoes: 'promocoes',
  galeria: 'galeria',
  horarios_funcionamento: 'horarios_funcionamento',
  avisos: 'avisos',
  site_conteudo: 'configuracoes'
};

const CAMPOS_RENOMEADOS = {
  estabelecimento: { whatsapp_principal: 'whatsapp', mapa_url: 'google_maps' },
  servicos: { preco_tipo: 'tipo_preco', disponivel: 'ativo' },
  profissionais: { bio: 'biografia' },
  galeria: { ativa: 'ativo' }
};

function adaptarRegistro(tabela, registro, paraBanco = false) {
  const dados = { ...registro };
  for (const [campo, coluna] of Object.entries(CAMPOS_RENOMEADOS[tabela] || {})) {
    const [origem, destino] = paraBanco ? [campo, coluna] : [coluna, campo];
    if (Object.hasOwn(dados, origem)) {
      dados[destino] = dados[origem];
      delete dados[origem];
    }
  }
  if (tabela === 'site_conteudo' && !paraBanco && typeof dados.valor !== 'string') {
    dados.valor = JSON.stringify(dados.valor ?? null);
  }
  if (tabela === 'horarios_funcionamento' && !paraBanco) {
    dados.abre = dados.abre?.slice(0, 5) || '';
    dados.fecha = dados.fecha?.slice(0, 5) || '';
  }
  return dados;
}

function erroPainel(mensagem, status) {
  return Object.assign(new Error(mensagem), { status });
}

function verificarErro(erro) {
  if (!erro) return;
  const { code, status, name } = erro;
  if (code === 'invalid_credentials') throw erroPainel('E-mail ou senha incorretos.', 400);
  if (code === 'email_not_confirmed') throw erroPainel('Confirme seu e-mail antes de entrar.', 400);
  if (code === 'weak_password' || name === 'AuthWeakPasswordError') {
    throw erroPainel('A nova senha não atende aos requisitos de segurança.', 400);
  }
  if (status === 429) throw erroPainel('Muitas tentativas. Aguarde alguns minutos e tente novamente.', status);
  if (code === '42501' || status === 403) throw erroPainel('Acesso negado pelo Supabase.', 403);
  if (status === 401 || code === 'session_not_found' || name === 'AuthSessionMissingError') {
    throw erroPainel('Sua sessão expirou. Entre novamente.', 401);
  }
  if (name === 'AuthRetryableFetchError' || status === 0 || /fetch|network|timeout|abort/i.test(erro.message || '')) {
    throw erroPainel('Falha de conexão com o Supabase. Confira sua internet e tente novamente.', 503);
  }
  if (code === '23503') throw erroPainel('Este registro está vinculado a outro cadastro e não pode ser excluído.', 409);
  throw erroPainel('O Supabase não concluiu a operação. Confira os dados e tente novamente.', status);
}

export function criarAdminAPI(supabase, config = CONFIG_ADMIN) {
  const { auth } = supabase;

  async function temSessao() {
    const { data, error } = await auth.getSession();
    verificarErro(error);
    return Boolean(data.session);
  }

  async function verificarAdmin() {
    if (!await temSessao()) throw erroPainel('Entre na sua conta para continuar.', 401);
    const { data, error } = await auth.getUser();
    verificarErro(error);
    const usuario = data.user;
    if (!usuario) throw erroPainel('Sua sessão expirou. Entre novamente.', 401);

    const { data: cadastro, error: erroCadastro } = await supabase
      .from('admins').select('user_id').eq('user_id', usuario.id).maybeSingle();
    verificarErro(erroCadastro);
    if (cadastro?.user_id !== usuario.id) throw erroPainel('Acesso negado. Sua conta não está autorizada.', 403);
    return usuario;
  }

  function consultar(tabela) {
    if (!Object.hasOwn(TABELAS, tabela)) throw new Error('Esta área ainda não está vinculada ao banco do Studio.');
    return supabase.from(TABELAS[tabela]);
  }

  async function listar(tabela, { ordem, filtro, descendente = false } = {}) {
    await verificarAdmin();
    const linhas = [];
    for (let inicio = 0; ; inicio += 500) {
      let consulta = consultar(tabela).select('*').range(inicio, inicio + 499);
      for (const campo of ordem || [tabela === 'site_conteudo' ? 'chave' : 'id']) consulta = consulta.order(campo, { ascending: !descendente });
      if (filtro) consulta = consulta.eq(filtro[0], filtro[1]);
      const { data, error } = await consulta;
      verificarErro(error);
      linhas.push(...data.map(registro => adaptarRegistro(tabela, registro)));
      if (data.length < 500) return linhas;
    }
  }

  async function atualizarStatusSolicitacao(id, status) {
    if (!Object.hasOwn(STATUS_SOLICITACOES,status)) throw new Error('Selecione uma situação válida.');
    return gravar('contatos',{status},id);
  }

  async function gravar(tabela, dados, id = null) {
    await verificarAdmin();
    const registro = adaptarRegistro(tabela, dados, true);
    const chave = tabela === 'site_conteudo' ? 'chave' : 'id';
    const consulta = id == null ? consultar(tabela).insert(registro) : consultar(tabela).update(registro).eq(chave, id);
    const { data, error } = await consulta.select().maybeSingle();
    verificarErro(error);
    if (!data) throw new Error('Registro não alterado. Confira seu acesso e atualize a lista.');
    return adaptarRegistro(tabela, data);
  }

  async function excluir(tabela, id) {
    await verificarAdmin();
    const chave = tabela === 'site_conteudo' ? 'chave' : 'id';
    const { data, error } = await consultar(tabela).delete().eq(chave, id).select(chave).maybeSingle();
    verificarErro(error);
    if (!data) throw new Error('Registro não excluído. Confira seu acesso e atualize a lista.');
  }

  async function enviarImagem(blob, pasta) {
    await verificarAdmin();
    if (blob.type !== 'image/webp' || blob.size > 5 * 1024 * 1024) {
      throw new Error('A imagem deve ser WebP com até 5 MB.');
    }
    const bucket = supabase.storage.from('site-imagens');
    const caminho = pasta + '/' + crypto.randomUUID() + '.webp';
    const { error } = await bucket.upload(caminho, blob, { contentType: 'image/webp' });
    if (error) throw new Error('Envio indisponível. Verifique a configuração do Storage ou informe a URL pública da foto.');
    return bucket.getPublicUrl(caminho).data.publicUrl;
  }

  async function excluirImagemLivre(url) {
    const prefixo = config.SUPABASE_URL + '/storage/v1/object/public/site-imagens/';
    if (!url?.startsWith(prefixo)) return;
    const [galeria, profissionais] = await Promise.all([
      listar('galeria', { filtro: ['imagem_url', url] }),
      listar('profissionais', { filtro: ['foto_url', url] })
    ]);
    if (galeria.length || profissionais.length) return;
    await verificarAdmin();
    const { error } = await supabase.storage.from('site-imagens').remove([decodeURIComponent(url.slice(prefixo.length))]);
    verificarErro(error);
  }

  async function sair() {
    const { error } = await auth.signOut({ scope: 'local' });
    verificarErro(error);
  }

  return {
    verificarAdmin, listar, gravar, excluir, enviarImagem, excluirImagemLivre, temSessao, sair,
    listarSolicitacoes:()=>listar('contatos',{ordem:['criado_em','id'],descendente:true}),
    atualizarStatusSolicitacao,
    async entrar(email, password) {
      const { error } = await auth.signInWithPassword({ email, password });
      verificarErro(error);
      try {
        return await verificarAdmin();
      } catch (erro) {
        await sair().catch(() => {});
        throw erro;
      }
    },
    async recuperar(email, redirectTo) {
      const { error } = await auth.resetPasswordForEmail(email, { redirectTo });
      verificarErro(error);
    },
    async novaSenha(password) {
      await verificarAdmin();
      const { error } = await auth.updateUser({ password });
      verificarErro(error);
    },
    async sessaoRecuperacao(token) {
      const { data, error } = await auth.getSession();
      verificarErro(error);
      return Boolean(token && data.session?.access_token === token);
    }
  };
}
export function csvContatos(linhas){
 const colunas=['nome','telefone','email','status','servico_id','profissional_id','preferencia_data','preferencia_periodo','mensagem','origem','classificacao','urgencia','criado_em'];
 const cell=v=>{let t=String(v??'');if(/^[\s]*[=+\-@\t\r]/.test(t))t="'"+t;return '"'+t.replaceAll('"','""')+'"';};
 return '\ufeff'+[colunas,...linhas.map(r=>colunas.map(c=>r[c]))].map(r=>r.map(cell).join(';')).join('\r\n');
}
export function calcularDashboard(linhas){const status={novo:0,contatado:0,agendado:0,cancelado:0},servicos={},dias={};for(const r of linhas){if(r.status in status)status[r.status]++;const id=r.servico_id||'sem-servico';servicos[id]=(servicos[id]||0)+1;const dia=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Fortaleza',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(r.criado_em));dias[dia]=(dias[dia]||0)+1;}return {total:linhas.length,status,servicos,dias};}

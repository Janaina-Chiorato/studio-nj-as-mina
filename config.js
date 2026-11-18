// Único ponto de configuração. Preencha somente com dados públicos.
export const CONFIG = Object.freeze({
  SUPABASE_URL: '',
  SUPABASE_ANON_KEY: '', // Somente anon/publishable; jamais service_role ou secret.
  N8N_WEBHOOK_URL: '', // URL HTTPS pública, sem credenciais no endereço.
  N8N_CHAT_URL: 'https://n8n.pointcontrol.com.br/webhook/beb50cd9-05b9-4d24-8417-91b41eae4a63/chat',
  SITE_URL: 'https://studio-nj-as-mina.janaaparecidachiorat.chatgpt.site',
  WHATSAPP: '5585985145543',
  WHATSAPP_ALTERNATIVO: '5585987328281',
  INSTAGRAM: 'studionjasmina',
  EMAIL: 'janachiorato@icloud.com',
  FUSO: 'America/Fortaleza',
  TIMEOUT_MS: 10000,
  INTERVALO_ENVIO_MS: 30000,
  CACHE_SERVICOS: 'studio-nj-servicos-v2',
  PROFISSIONAIS: ['Janaina Chiorato', 'Lyssandra Kryshna', 'Irlânia Silva Saraiva (Neguinha)']
});
// A conexão atual atende o painel e a leitura pública do catálogo.
export const CONFIG_CATALOGO = Object.freeze({
  ...CONFIG,
  SUPABASE_URL: 'https://wjuxabblqchpietztsvm.supabase.co',
  SUPABASE_ANON_KEY: 'sb_publishable_elmKwIdOr3ROOGO8PIf3nw_09SaR05s'
});
export function urlPublica(valor) {
  try { const u = new URL(valor); return u.protocol === 'https:' && !u.username && !u.password; }
  catch { return false; }
}
export function configuracaoBancoValida(config = CONFIG) {
  if (!urlPublica(config.SUPABASE_URL) || !config.SUPABASE_ANON_KEY || config.SUPABASE_ANON_KEY.startsWith('sb_secret_')) return false;
  // JWTs antigos devem ter exclusivamente a função anon.
  if (config.SUPABASE_ANON_KEY.includes('.')) {
    try { const p = config.SUPABASE_ANON_KEY.split('.')[1].replace(/-/g,'+').replace(/_/g,'/'); return JSON.parse(atob(p)).role === 'anon'; }
    catch { return false; }
  }
  return config.SUPABASE_ANON_KEY.startsWith('sb_publishable_');
}

// Estado público carregado do estabelecimento; nenhuma credencial editável pelo CMS.
export const estabelecimentoAtual = {whatsapp:CONFIG.WHATSAPP,horario:{fuso:CONFIG.FUSO,dias:[2,3,4,5,6],abertura:'09:00',fechamento:'19:30'}};
export const obterWhatsApp=()=>estabelecimentoAtual.whatsapp;

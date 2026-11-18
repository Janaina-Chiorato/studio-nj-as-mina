import { CONFIG, urlPublica } from './config.js';

const PACOTE_CHAT = 'https://cdn.jsdelivr.net/npm/@n8n/chat@1.46.4/dist/';
const SAUDACAO = 'Olá! ✨ Sou a Mina, assistente virtual do Studio NJ – As Mina. Como posso te ajudar hoje?';

function carregarEstiloChat() {
  const estilo = document.createElement('link');
  estilo.rel = 'stylesheet';
  estilo.href = PACOTE_CHAT + 'style.css';
  estilo.crossOrigin = 'anonymous';
  return new Promise((resolver, rejeitar) => {
    estilo.addEventListener('load', resolver, { once: true });
    estilo.addEventListener('error', rejeitar, { once: true });
    document.head.append(estilo);
  });
}

function prepararAcessibilidade(widget) {
  const campo = widget.querySelector('textarea');
  campo?.setAttribute('aria-label', 'Sua mensagem para a Mina');
  widget.querySelector('.chat-input-send-button')?.setAttribute('aria-label', 'Enviar mensagem');
  widget.querySelector('.chat-messages-list')?.setAttribute('role', 'log');

  for (const paragrafo of widget.querySelectorAll('.chat-message-from-bot p')) {
    if (paragrafo.textContent === 'Error: Failed to receive response') {
      paragrafo.textContent = 'Não consegui obter uma resposta agora. Tente novamente ou fale com a equipe pelo WhatsApp.';
    }
  }
}

async function montarChat(widget) {
  if (!urlPublica(CONFIG.N8N_CHAT_URL)) throw new Error('Endereço do chat inválido.');

  const [{ createChat }] = await Promise.all([
    import(PACOTE_CHAT + 'chat.bundle.es.js'),
    carregarEstiloChat()
  ]);

  // A conversa fica na memória da página, inclusive ao fechar e reabrir a janela.
  const sessao = crypto.randomUUID();
  createChat({
    webhookUrl: CONFIG.N8N_CHAT_URL,
    target: widget,
    mode: 'fullscreen',
    sessionId: sessao,
    loadPreviousSession: false,
    allowFileUploads: false,
    enableMessageActions: false,
    initialMessages: [SAUDACAO],
    i18n: {
      // A chave en é a opção de idioma exposta pelo pacote oficial.
      en: {
        title: 'Mina',
        subtitle: 'Assistente virtual do Studio NJ – As Mina',
        footer: '',
        getStarted: 'Iniciar conversa',
        inputPlaceholder: 'Digite sua mensagem…',
        closeButtonTooltip: 'Fechar conversa',
        repostButton: 'Reenviar mensagem',
        reuseButton: 'Reutilizar mensagem'
      }
    }
  });

  // O widget grava o ID ao renderizar o campo. A conversa só precisa dele em memória.
  const chaveSessao = 'n8n-chat/sessionId';
  function prepararWidget() {
    prepararAcessibilidade(widget);
    if (localStorage.getItem(chaveSessao) === sessao) localStorage.removeItem(chaveSessao);
  }

  prepararWidget();
  const observador = new MutationObserver(prepararWidget);
  observador.observe(widget, { childList: true, subtree: true, characterData: true });
}

export function iniciarAssistente() {
  const janela = document.querySelector('#chat-mina');
  if (!janela) return;
  const widget = document.querySelector('#chat-mina-widget');
  const estado = document.querySelector('#chat-mina-estado');
  const fechar = janela.querySelector('.fechar-chat-mina');
  const acionadores = document.querySelectorAll('[data-assistente]');
  let origem;
  let montagem;

  function definirJanelaAberta(aberta) {
    // show() pode deslocar a página ao focar automaticamente o conteúdo do diálogo.
    janela.open = aberta;
    acionadores.forEach(acionador => acionador.setAttribute('aria-expanded', String(aberta)));
    (aberta ? fechar : origem)?.focus({ preventScroll: true });
  }

  function alternar(evento) {
    evento.preventDefault();
    if (janela.open) {
      definirJanelaAberta(false);
      return;
    }

    origem = evento.currentTarget;
    definirJanelaAberta(true);

    if (montagem) return;
    estado.hidden = false;
    estado.textContent = 'Carregando conversa…';
    montagem = montarChat(widget).then(() => {
      estado.hidden = true;
    }).catch(() => {
      estado.textContent = 'Não foi possível carregar a conversa. Atualize a página ou fale com a equipe pelo WhatsApp.';
    });
  }

  fechar.addEventListener('click', () => definirJanelaAberta(false));
  janela.addEventListener('keydown', evento => {
    if (evento.key === 'Escape') {
      evento.preventDefault();
      definirJanelaAberta(false);
    }
  });

  acionadores.forEach(acionador => {
    acionador.setAttribute('role', 'button');
    acionador.setAttribute('aria-controls', janela.id);
    acionador.setAttribute('aria-expanded', 'false');
    acionador.setAttribute('aria-haspopup', 'dialog');
    acionador.tabIndex = 0;
    acionador.addEventListener('click', alternar);
    acionador.addEventListener('keydown', evento => {
      if ((evento.key === 'Enter' || evento.key === ' ') && !evento.repeat) alternar(evento);
    });
  });

  // O teclado virtual pode reduzir a área visível sem alterar o tamanho do layout.
  window.visualViewport?.addEventListener('resize', () => {
    const alturaTeclado = Math.max(0, window.innerHeight - window.visualViewport.height);
    const tecladoAberto = janela.contains(document.activeElement) && alturaTeclado > 100;
    janela.toggleAttribute('data-teclado', tecladoAberto);
    janela.style.setProperty('--mina-teclado', tecladoAberto ? alturaTeclado + 'px' : '0px');
  });
}

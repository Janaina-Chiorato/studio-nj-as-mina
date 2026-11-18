import { CONFIG } from './config.js';
/* Contatos oficiais. O primeiro número recebe os agendamentos gerais. */
const contatosStudio = {
    whatsappPrincipal: CONFIG.WHATSAPP,
    whatsappAlternativo: CONFIG.WHATSAPP_ALTERNATIVO,
    instagram: CONFIG.INSTAGRAM,
    email: CONFIG.EMAIL
};
const menuMobile = document.getElementById("menuMobile");
const menu = document.getElementById("menu");
function fecharMenu() {
    menu.classList.remove("aberto");
    menuMobile.setAttribute("aria-expanded", "false");
    menuMobile.setAttribute("aria-label", "Abrir menu");
}
menuMobile.addEventListener("click", function () {
    const aberto = menu.classList.toggle("aberto");
    menuMobile.setAttribute("aria-expanded", String(aberto));
    menuMobile.setAttribute("aria-label", aberto ? "Fechar menu" : "Abrir menu");
});
document.querySelectorAll(".menu a").forEach(function (link) {
    link.addEventListener("click", fecharMenu);
});
document.addEventListener("keydown", function (evento) {
    if (evento.key === "Escape" && menu.classList.contains("aberto")) {
        fecharMenu();
        menuMobile.focus();
    }
});
/* Apenas prepara a conversa; a equipe confirma a disponibilidade. */
function criarLinkWhatsApp(mensagem, numero = contatosStudio.whatsappPrincipal) {
    return "https://wa.me/" + numero + "?text=" + encodeURIComponent(mensagem);
}
const botaoWhatsApp = document.getElementById("whatsapp");
botaoWhatsApp.href = criarLinkWhatsApp("Olá! Vim pelo site do Studio NJ e gostaria de agendar um atendimento. Quais horários estão disponíveis?");
botaoWhatsApp.target = "_blank";
botaoWhatsApp.rel = "noopener noreferrer";
document.querySelectorAll("[data-servico]").forEach(function (link) {
    link.href = criarLinkWhatsApp("Olá! Vim pelo site do Studio NJ e gostaria de agendar um serviço de " + link.dataset.servico + ". Pode me passar mais informações?");
    link.target = "_blank";
    link.rel = "noopener noreferrer";
});
const botaoPromocoes = document.querySelector(".promocao-texto .botao-claro");
botaoPromocoes.href = criarLinkWhatsApp("Olá! Gostaria de conhecer as promoções atuais da Quarta da Autoestima do Studio NJ.");
botaoPromocoes.target = "_blank";
botaoPromocoes.rel = "noopener noreferrer";

// Módulos independentes preservam o menu, as galerias e os canais existentes.
import { iniciarServicos } from './servicos.js';
import { iniciarFormulario } from './formulario.js';
import { iniciarHorario } from './horario.js';
import { iniciarConteudo } from './conteudo.js';
import { iniciarAssistente } from './integracoes.js';
const atualizarServicosDoFormulario = iniciarFormulario();
iniciarHorario();
iniciarAssistente();
iniciarServicos(atualizarServicosDoFormulario);
iniciarConteudo(atualizarServicosDoFormulario);
if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{
    // Sem suporte ao cache, os dados embutidos continuam disponíveis nesta visita.
  }));
}

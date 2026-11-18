import { estabelecimentoAtual } from './config.js';
import { horarioAberto, avisosAtuais } from './horarios.js';
export function abertoAgora(data=new Date()){return horarioAberto(estabelecimentoAtual.horario,estabelecimentoAtual.avisos||[],data);}
export function iniciarHorario(){const badge=document.querySelector('#status-horario');function atualizar(){const aberto=abertoAgora();badge.textContent=aberto?'Aberto agora':'Fechado';badge.dataset.aberto=String(aberto);const aviso=document.querySelector('#aviso-studio');if(aviso){aviso.textContent=avisosAtuais(estabelecimentoAtual.avisos||[]).map(a=>a.mensagem).join(' · ');aviso.hidden=!aviso.textContent;}}window.addEventListener('studio:estabelecimento',atualizar);atualizar();setInterval(atualizar,60000);}

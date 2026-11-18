// Um único contrato de horários para a landing e o painel. Dias: domingo=0.
export const DIAS=['Domingo','Segunda-feira','Terça-feira','Quarta-feira','Quinta-feira','Sexta-feira','Sábado'];
export function normalizarHorario(h={}) {
 const semana={};
 for(let d=0;d<7;d++)semana[d]=h.semana?.[d]||{aberto:(h.dias||[2,3,4,5,6]).includes(d),abre:h.abertura||'09:00',fecha:h.fechamento||'19:30'};
 return {fuso:'America/Fortaleza',semana};
}
export function validarHorario(h) {
 if(h?.fuso!=='America/Fortaleza')return false;
 return Array.from({length:7},(_,d)=>h.semana?.[d]).every(i=>i&&typeof i.aberto==='boolean'&&(!i.aberto||(/^([01]\d|2[0-3]):[0-5]\d$/.test(i.abre)&&/^([01]\d|2[0-3]):[0-5]\d$/.test(i.fecha)&&i.abre<i.fecha)));
}
export function dataLocal(data=new Date()) {
 const p=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Fortaleza',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(data);
 return ['year','month','day'].map(t=>p.find(x=>x.type===t).value).join('-');
}
export function avisosAtuais(avisos=[],data=new Date()) {
 const hoje=dataLocal(data);
 const limite=(valor, final)=>!valor || (valor.length===10 ? (final?valor>=hoje:valor<=hoje) : (final?Date.parse(valor)>=data.getTime():Date.parse(valor)<=data.getTime()));
 return avisos.filter(a=>a.ativo!==false&&a.mensagem&&limite(a.inicio,false)&&limite(a.fim,true));
}
export function horarioAberto(h,avisos=[],data=new Date()) {
 if(avisosAtuais(avisos,data).some(a=>a.fechado))return false;
 const p=new Intl.DateTimeFormat('en-US',{timeZone:'America/Fortaleza',weekday:'short',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(data);
 const v=t=>p.find(x=>x.type===t).value;
 const dia=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].indexOf(v('weekday')),hora=v('hour')+':'+v('minute');
 const i=normalizarHorario(h).semana[dia];return i.aberto&&hora>=i.abre&&hora<i.fecha;
}
export function resumoHorario(h) {return Object.entries(normalizarHorario(h).semana).map(([d,i])=>DIAS[d]+': '+(i.aberto?i.abre+'–'+i.fecha:'fechado')).join(' · ');}

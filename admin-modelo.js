import { TEXTOS_SITE } from './textos-site.js';

export const STATUS_SOLICITACOES={novo:'Novo',em_atendimento:'Em atendimento',confirmado:'Confirmado',cancelado:'Cancelado'};
export const STATUS={novo:'Novo',contatado:'Contatado',agendado:'Agendado',cancelado:'Cancelado'};
export const ROTULOS_TEXTOS=Object.fromEntries(Object.entries(TEXTOS_SITE).map(([chave,[rotulo]])=>[chave,rotulo]));
const linkPublicoValido=v=>{try{const u=new URL(v);return u.protocol==='https:'&&!u.username&&!u.password;}catch{return false;}};
const campo=(nome,rotulo,tipo='text',extra={})=>({nome,rotulo,tipo,...extra});
export const CAMPOS={
 estabelecimento:[
  campo('nome','Nome do Studio','text',{required:true,max:150}),
  campo('slogan','Slogan'), campo('descricao','Descrição','textarea'),
  campo('endereco','Endereço'), campo('bairro','Bairro'), campo('cidade','Cidade'), campo('estado','Estado'), campo('cep','CEP'),
  campo('telefone','Telefone','tel'), campo('whatsapp_principal','WhatsApp com DDD','tel'),
  campo('instagram','Instagram'), campo('email','E-mail','email'),
  campo('mapa_url','Link do Google Maps','url'), campo('logo_url','Logo','imagem')
 ],
 servicos:[
  campo('nome','Nome do serviço','text',{required:true,max:150}), campo('categoria','Categoria','text',{required:true,max:80}),
  campo('descricao','Descrição / condições','textarea',{max:1000}),
  campo('preco_tipo','Como mostrar o preço','select',{opcoes:[['fixo','Preço fixo'],['a_partir_de','A partir de'],['sob_avaliacao','Valor após avaliação']],required:true}),
  campo('preco','Preço (R$)','number',{min:0,maxNumero:99999999.99,step:'.01'}), campo('imagem_url','Foto do serviço','imagem'),
  campo('ordem','Ordem de exibição','number',{min:0,padrao:0,required:true}), campo('disponivel','Serviço disponível','checkbox',{padrao:true})
 ],
 profissionais:[
  campo('nome','Nome','text',{required:true,max:100}), campo('cargo','Profissão / apresentação','text',{max:250}),
  campo('bio','Biografia','textarea',{max:10000}), campo('especialidades','Especialidades','textarea',{max:3000}),
  campo('foto_url','Foto da profissional','imagem'), campo('ordem','Ordem de exibição','number',{min:0,padrao:0,required:true}),
  campo('ativo','Mostrar no site','checkbox',{padrao:true})
 ],
 promocoes:[
  campo('titulo','Título da promoção','text',{required:true,max:150}), campo('descricao','Descrição','textarea',{max:2000}),
  campo('preco','Preço (R$)','number',{min:0,maxNumero:99999999.99,step:'.01'}), campo('imagem_url','Foto da promoção','imagem'),
  campo('inicio','Válida a partir de','date'), campo('fim','Válida até','date'), campo('ativa','Mostrar promoção','checkbox',{padrao:true})
 ],
 galeria:[
  campo('titulo','Legenda / título','text',{max:150}), campo('categoria','Categoria','text',{required:true,max:80}),
  campo('imagem_url','Fotografia','imagem',{required:true}), campo('ordem','Ordem de exibição','number',{min:0,padrao:0,required:true}),
  campo('ativa','Mostrar foto','checkbox',{padrao:true})
 ],
 horarios_funcionamento:[
  campo('dia_semana','Dia da semana (domingo = 0, sábado = 6)','number',{min:0,maxNumero:6,required:true}),
  campo('aberto','Dia aberto','checkbox'), campo('abre','Abertura','time'), campo('fecha','Fechamento','time')
 ],
 avisos:[campo('mensagem','Comunicado','textarea',{required:true,max:300}),campo('ativo','Mostrar aviso','checkbox',{padrao:true})],
 site_conteudo:[campo('chave','Texto exibido em','select',{required:true,opcoes:Object.entries(ROTULOS_TEXTOS)}),campo('valor','Texto do site','textarea',{max:10000})],
 contatos:[campo('nome','Nome do contato','text',{required:true,max:100}),campo('telefone','Celular com DDD (11 dígitos)','tel',{required:true}),campo('email','E-mail','email',{max:254}),campo('servico_id','Serviço','select',{fonte:'servicos'}),campo('profissional_id','Profissional','select',{fonte:'profissionais'}),campo('preferencia_data','Data preferida','date'),campo('preferencia_periodo','Período preferido','select',{opcoes:[['manha','Manhã'],['tarde','Tarde'],['noite','Noite']]}),campo('mensagem','Mensagem','textarea',{max:500}),campo('status','Situação do contato','select',{opcoes:Object.entries(STATUS),required:true}),campo('origem','Origem','select',{padrao:'chat',opcoes:[['formulario','Formulário'],['chat','Chat / contato manual']],required:true}),campo('classificacao','Classificação (opcional)','text',{max:100}),campo('urgencia','Urgência (opcional)','text',{max:100})]
};
export function validarRegistro(tabela,dados){
 const erros={};
 for(const c of CAMPOS[tabela]||[]){const v=dados[c.nome];if(c.required&&c.tipo!=='checkbox'&&(v==null||String(v).trim()===''))erros[c.nome]='Preencha este campo.';if(c.max&&String(v??'').length>c.max)erros[c.nome]='Use até '+c.max+' caracteres.';if(c.tipo==='number'&&v!=null&&(!Number.isFinite(v)||v<(c.min??0)||(c.maxNumero&&v>c.maxNumero)||(c.step!=='.01'&&!Number.isInteger(v))))erros[c.nome]='Informe um número válido dentro dos limites.';if(c.tipo==='url'&&v&&!linkPublicoValido(v))erros[c.nome]='Use um link completo começando com https://.';if(c.tipo==='email'&&v&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v))erros[c.nome]='Informe um e-mail válido.';}
 for(const c of CAMPOS[tabela]||[])if(c.tipo==='imagem'&&dados[c.nome]&&dados[c.nome]!=='foto-preparada.webp'&&!linkPublicoValido(dados[c.nome])&&!/^\/?imagens\/[a-zA-Z0-9_/. -]+$/.test(dados[c.nome]))erros[c.nome]='Envie uma foto ou use uma URL HTTPS pública.';
 if(dados.nome&&dados.nome.length<2)erros.nome='Use pelo menos 2 caracteres.';
 if(dados.titulo&&dados.titulo.length<2)erros.titulo='Use pelo menos 2 caracteres.';
 if(tabela==='servicos'&&dados.preco_tipo!=='sob_avaliacao'&&dados.preco==null)erros.preco='Informe o preço deste serviço.';
 if(tabela==='promocoes'&&dados.inicio&&dados.fim&&dados.fim<dados.inicio)erros.fim='A data final deve ser igual ou posterior à inicial.';
 if(tabela==='contatos'&&!/^[1-9]\d9\d{8}$/.test(dados.telefone))erros.telefone='Informe os 11 dígitos do celular com DDD.';
 if (tabela === 'horarios_funcionamento' && dados.aberto && (!dados.abre || !dados.fecha || dados.abre >= dados.fecha)) {
  erros.fecha = 'Informe um horário de fechamento posterior à abertura.';
 }
 if(tabela==='site_conteudo'&&!Object.hasOwn(TEXTOS_SITE,dados.chave||''))erros.chave='Selecione um texto exibido no site.';
 return erros;
}

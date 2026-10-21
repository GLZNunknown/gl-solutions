/* Segmentos de demonstração e gerador de dados */
const SEG = {
 barbearia:{ label:'Barbearia', biz:{name:'Barbearia Navalha', phone:'(11) 4002-1010', address:'Rua das Palmeiras, 220 — Santo André'}, noun:'cliente',
  hours:{0:null,1:null,2:[['09:00','19:00']],3:[['09:00','19:00']],4:[['09:00','19:00']],5:[['09:00','19:00']],6:[['08:00','17:00']]},
  pros:[['Diego Alves','Barbeiro'],['Léo Marques','Barbeiro'],['Caio Ribeiro','Barbeiro']],
  services:[['Corte masculino',40,55,[0,1,2]],['Barba',30,40,[0,1,2]],['Corte + barba',60,85,[0,1,2]],['Sobrancelha',15,20,[1,2]],['Pigmentação',45,70,[0]]],
  faqs:[['Quais as formas de pagamento?','pagamento,pagar,pix,cartao,dinheiro,credito,debito','Aceitamos PIX, cartão de crédito e débito e dinheiro. O pagamento é feito no balcão, depois do atendimento.'],
        ['Tem estacionamento?','estacionamento,vaga,estacionar,carro','Temos convênio com o estacionamento ao lado: a primeira hora é por nossa conta. Peça o ticket no balcão.'],
        ['E se eu atrasar?','atraso,atrasar,atrasado,tolerancia','Temos tolerância de 10 minutos. Depois disso, podemos precisar encaixar seu horário em outra vaga do dia. Se for atrasar, me avise por aqui.'],
        ['Atendem crianças?','crianca,filho,infantil,menino,kids','Sim! Atendemos crianças a partir de 3 anos. Para elas, o corte tem o mesmo valor e leva cerca de 30 minutos.'],
        ['Vocês vendem produtos?','produto,pomada,shampoo,cera,vende','Vendemos pomadas, óleo de barba e shampoo das marcas que usamos no atendimento. Veja as opções no balcão.'],
        ['Atendem sem agendar?','sem marcar,sem agendar,encaixe,fila,espera,ordem de chegada','Atendemos por encaixe quando há horário livre, mas o agendamento garante sua vaga e evita espera. Posso marcar agora para você?']] },
 clinica:{ label:'Clínica', biz:{name:'Clínica Bem Estar', phone:'(11) 4003-2020', address:'Av. Industrial, 1450, sala 3 — Santo André'}, noun:'paciente',
  hours:{0:null,1:[['08:00','12:00'],['14:00','18:00']],2:[['08:00','12:00'],['14:00','18:00']],3:[['08:00','12:00'],['14:00','18:00']],4:[['08:00','12:00'],['14:00','18:00']],5:[['08:00','12:00'],['14:00','17:00']],6:[['08:00','12:00']]},
  pros:[['Dra. Helena Souza','Clínica geral'],['Dr. Marcos Pinheiro','Odontologia'],['Dra. Paula Rezende','Dermatologia']],
  services:[['Consulta clínica',30,180,[0]],['Avaliação odontológica',30,120,[1]],['Limpeza dental',45,160,[1]],['Consulta dermatológica',30,250,[2]],['Retorno',30,0,[0,1,2]]],
  faqs:[['Vocês atendem convênio?','convenio,plano de saude,unimed,amil,bradesco,particular','Atendemos de forma particular e damos recibo para reembolso. Alguns convênios são aceitos para consultas: me diga qual é o seu que eu confirmo para você.'],
        ['O que levar na primeira consulta?','documento,levar,primeira consulta,exame,rg,cpf,carteirinha','Traga um documento com foto, exames anteriores (se tiver) e a lista de medicamentos que usa. Chegue 10 minutos antes para o cadastro.'],
        ['Como cancelar ou remarcar?','cancelar consulta,remarcar consulta,desmarcar,reagendar','É só me avisar por aqui com pelo menos 24 horas de antecedência, sem custo. Quer remarcar agora?'],
        ['Tem estacionamento?','estacionamento,vaga,estacionar','Temos estacionamento conveniado em frente à clínica, com desconto para pacientes.'],
        ['Quando saem os resultados dos exames?','resultado,laudo,exame pronto','Os resultados são enviados por WhatsApp e e-mail em até 3 dias úteis, conforme o exame.'],
        ['Formas de pagamento','pagamento,pagar,pix,cartao,parcelar','Aceitamos PIX, cartão em até 3x sem juros e dinheiro.']] },
 oficina:{ label:'Oficina', biz:{name:'Auto Center Ferreira', phone:'(11) 4004-3030', address:'Rua Bartolomeu, 87 — Santo André'}, noun:'cliente',
  hours:{0:null,1:[['08:00','12:00'],['13:30','18:00']],2:[['08:00','12:00'],['13:30','18:00']],3:[['08:00','12:00'],['13:30','18:00']],4:[['08:00','12:00'],['13:30','18:00']],5:[['08:00','12:00'],['13:30','18:00']],6:[['08:00','13:00']]},
  pros:[['Box 1 · Jorge','Mecânico'],['Box 2 · Tiago','Mecânico'],['Box 3 · Sr. Ferreira','Chefe de oficina']],
  services:[['Diagnóstico e orçamento',30,80,[0,1,2]],['Troca de óleo e filtros',45,150,[0,1]],['Alinhamento e balanceamento',60,120,[1,2]],['Freios (pastilhas e discos)',90,220,[0,2]],['Revisão completa',120,380,[0,2]]],
  faqs:[['Vocês fazem orçamento?','orcamento,quanto custa,valor do servico,preco do conserto','O diagnóstico custa R$ 80 e o valor é abatido se você fizer o serviço conosco. Depois dele, mandamos o orçamento detalhado por aqui antes de começar.'],
        ['Posso levar minhas peças?','peca,pecas,trazer,levar peca','Pode sim, mas a garantia do serviço vale só para peças compradas conosco. Se preferir levar as suas, avisamos antes no orçamento.'],
        ['Tem garantia?','garantia,garantido','Todo serviço tem 90 dias de garantia e as peças seguem a garantia do fabricante.'],
        ['Quanto tempo leva?','prazo,demora,quanto tempo,ficar pronto,pronto','A troca de óleo leva cerca de 45 minutos e a revisão completa, até 2 horas. Para serviços maiores, avisamos o prazo no orçamento.'],
        ['Formas de pagamento','pagamento,pagar,pix,cartao,parcelar,credito','Aceitamos PIX, cartão em até 6x e dinheiro. Para serviços acima de R$ 500, parcelamos no boleto.'],
        ['Precisa deixar o carro?','deixar o carro,deixar carro,buscar,leva e traz,aguardar','Para serviços rápidos você pode aguardar na nossa sala de espera. Para os maiores, deixe o carro e avisamos quando estiver pronto.']] },
 academia:{ label:'Academia', biz:{name:'Forma Fit Academia', phone:'(11) 4005-4040', address:'Av. Dom Pedro I, 900 — Santo André'}, noun:'aluno',
  hours:{0:null,1:[['06:00','21:00']],2:[['06:00','21:00']],3:[['06:00','21:00']],4:[['06:00','21:00']],5:[['06:00','20:00']],6:[['08:00','13:00']]},
  pros:[['Prof. Rafa','Musculação'],['Prof. Ju','Funcional'],['Carol','Nutricionista']],
  services:[['Aula experimental',60,0,[0,1]],['Avaliação física',45,60,[0,1]],['Consulta com nutricionista',40,150,[2]],['Visita guiada e matrícula',30,0,[0,1]]],
  faqs:[['Quais os planos e valores?','plano,planos,mensalidade,valor,preco,quanto custa,mensal','Temos planos mensal (R$ 99,90), trimestral (R$ 269), semestral (R$ 479) e anual (R$ 849). Posso agendar uma visita para você conhecer a academia?'],
        ['Tem aula experimental?','experimental,teste,gratis,conhecer','Temos sim! A aula experimental é gratuita e dura 1 hora. Quer escolher um horário?'],
        ['Qual o horário de pico?','pico,lotado,cheio,movimento','O pico é das 18h às 20h em dias úteis. Se prefere treinar mais tranquilo, o melhor é das 9h às 11h ou depois das 20h.'],
        ['Posso trancar a matrícula?','trancar,cancelar plano,pausar,congelar','Pode sim: os planos semestral e anual podem ser trancados por até 30 dias. Para cancelar ou trancar, converse com a recepção.'],
        ['Tem estacionamento?','estacionamento,vaga,estacionar,carro','Temos estacionamento gratuito para alunos, com 30 vagas.'],
        ['Preciso de atestado?','atestado,medico,liberacao','Para começar, pedimos apenas o preenchimento do questionário de saúde (PAR-Q). Dependendo do resultado, solicitamos liberação médica.']] }
};
const SEG_ORDER = ['barbearia','clinica','oficina','academia'];

const NAMES = ['Mariana Costa','Rafael Teixeira','Bruna Oliveira','Lucas Mendonça','Fernanda Reis','Gustavo Lima','Patrícia Duarte','Thiago Barros','Juliana Freitas','Eduardo Campos','Camila Nogueira','Vinícius Pires','Letícia Araújo','Rodrigo Santos','Amanda Vieira','Felipe Moura','Carolina Batista','Diego Ferraz','Beatriz Cardoso','André Macedo','Larissa Gomes','Marcelo Tavares','Priscila Rocha','Henrique Dias','Natália Furtado','Bruno Castro','Aline Monteiro','Ricardo Pacheco','Vanessa Lopes','Matheus Andrade','Tatiane Coelho','Leonardo Faria','Renata Siqueira','Gabriel Neves','Isabela Martins','Sérgio Brandão','Paula Cunha','Caio Medeiros','Débora Ramos','Otávio Prado'];

const toMin = t => { const [h, m] = t.split(':').map(Number); return h*60 + m; };
const fromMin = n => `${pad(Math.floor(n/60))}:${pad(n%60)}`;
function mulberry(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}

const DEFAULT_AUTO = {
  confirm:{on:true,  title:'Confirmação do agendamento', text:'Agendado! {nome}, seu horário de {servico} é {data} às {hora}, com {profissional}. Enviarei um lembrete antes. Se precisar remarcar ou cancelar, é só me chamar por aqui.'},
  remind24:{on:true, title:'Lembrete 24h antes', text:'Olá, {nome}! Passando para lembrar do seu horário amanhã, {data}, às {hora} ({servico}). Você confirma presença?'},
  remind2:{on:true,  title:'Lembrete 2h antes', text:'{nome}, seu horário de {servico} é hoje às {hora}. Estamos te esperando em {endereco}.'},
  post:{on:false,    title:'Pós-atendimento', text:'Obrigado pela visita, {nome}! Como foi o atendimento? Responda de 1 a 5 e, se quiser, já deixe marcado o próximo horário.'}
};

function buildSeed(seg = 'barbearia') {
  const P = SEG[seg], rnd = mulberry(7 + seg.length * 31), R = (a,b) => a + Math.floor(rnd()*(b-a+1)), pick = a => a[Math.floor(rnd()*a.length)];
  const T = today();
  const D = {v:1, seg, biz:{...P.biz, noun:P.noun, step:30, lead:60, cancelH:24, tone:'cordial', owner:'Carla'}, whats:true};
  D.hours = JSON.parse(JSON.stringify(P.hours));
  D.pros = P.pros.map((p, i) => ({id:'p'+(i+1), name:p[0], role:p[1], active:true}));
  D.services = P.services.map((s, i) => ({id:'s'+(i+1), name:s[0], dur:s[1], price:s[2], pros:s[3].map(k => 'p'+(k+1)), active:true}));
  D.faqs = P.faqs.map((f, i) => ({id:'f'+(i+1), q:f[0], keys:f[1].split(',').map(x => x.trim()), a:f[2], hits:R(6, 48)}));
  D.auto = JSON.parse(JSON.stringify(DEFAULT_AUTO));
  D.blocks = [{id:'b1', proId:'p2', date:addDays(T, 3), from:'09:00', to:'12:00', reason:'Consulta pessoal'}];
  D.clients = NAMES.map((n, i) => ({id:'c'+(i+1), name:n, phone:`(11) 9${R(1000,9999)}-${R(1000,9999)}`, tags: rnd() < .2 ? ['VIP'] : [], notes:'', created:addDays(T, -R(20, 400))}));
  D.clients[0].phone = '(11) 98765-4321';
  D.appts = []; D.convs = []; D.hist = [];

  const busy = (proId, date, a, b, ex) => D.appts.some(x => x.proId === proId && x.date === date && x.status !== 'cancelado' && x.status !== 'faltou' && toMin(x.time) < b && toMin(x.time) + svc(x.serviceId).dur > a) ||
    D.blocks.some(x => x.proId === proId && x.date === date && toMin(x.from) < b && toMin(x.to) > a);
  const svc = id => D.services.find(s => s.id === id);
  const place = (date, clientId, status, source, opts = {}) => {
    const rs = D.hours[wday(date)]; if (!rs) return null;
    for (let k = 0; k < 40; k++) {
      const s = opts.svc || pick(D.services).id, S = svc(s), pr = pick(S.pros), r = pick(rs), a = toMin(r[0]), b = toMin(r[1]);
      const t = a + Math.floor(R(0, Math.max(0, Math.floor((b - a - S.dur)/30))) ) * 30;
      if (t + S.dur > b || (date === T && opts.past != null && (opts.past ? t + S.dur > nowMin() : t < nowMin() + 40))) continue;
      if (busy(pr, date, t, t + S.dur)) continue;
      const ap = {id:uid('a'), clientId, serviceId:s, proId:pr, date, time:fromMin(t), status, source, created:addDays(date, -R(1, 6)), notes:''}; D.appts.push(ap); return ap;
    }
    return null;
  };
  const nowMin = () => new Date().getHours()*60 + new Date().getMinutes();
  const cid = () => pick(D.clients.slice(1)).id;

  for (let d = -35; d <= 12; d++) {
    const date = addDays(T, d); if (!D.hours[wday(date)]) continue;
    const base = R(5, 8) + Math.round(D.pros.length), n = d < 0 ? base : d === 0 ? base - 1 : Math.max(2, base - 2 - Math.floor(d/3));
    for (let i = 0; i < n; i++) {
      let st, src = rnd() < (d < -14 ? .5 : .68) ? 'Assistente' : 'Painel';
      if (d < 0) { const x = rnd(); st = x < .84 ? 'concluido' : x < .92 ? 'faltou' : 'cancelado'; place(date, cid(), st, src); }
      else if (d === 0) { const past = rnd() < .5; st = past ? 'concluido' : 'confirmado'; place(date, cid(), st, src, {past}); }
      else { st = d === 1 ? 'agendado' : rnd() < .45 ? 'confirmado' : 'agendado'; place(date, cid(), st, src); }
    }
  }
  /* cliente de demonstração: agendamentos de amanhã e daqui a 5 dias */
  const tomorrow = [1,2,3,4].map(d => addDays(T, d)).find(d => D.hours[wday(d)]);
  const later = [5,6,7,8].map(d => addDays(T, d)).find(d => D.hours[wday(d)] && d !== tomorrow);
  place(tomorrow, 'c1', 'agendado', 'Assistente'); place(later, 'c1', 'confirmado', 'Assistente');
  for (let d = -40; d < -6; d += 11) place(addDays(T, d), 'c1', 'concluido', 'Assistente');

  /* histórico de conversas (métricas diárias) */
  for (let d = -29; d <= 0; d++) { const date = addDays(T, d), open = !!D.hours[wday(date)], c = open ? R(14, 30) + (d + 29) % 5 : R(4, 9); D.hist.push({date, convs:d === 0 ? R(8, 14) : c, human:Math.round(c * (.08 + rnd()*.07)), booked:D.appts.filter(a => a.created === date && a.source === 'Assistente').length + R(1, 4)}); }

  /* conversas de exemplo */
  const msg = (from, text, ts, extra) => ({id:uid('m'), from, text, ts, ...extra});
  const mkBooking = (ap, minsAgo) => {
    const cl = D.clients.find(c => c.id === ap.clientId), S = svc(ap.serviceId), pr = D.pros.find(p => p.id === ap.proId); let ts = Date.now() - minsAgo*60000;
    const fn = cl.name.split(' ')[0], step = () => (ts += 40000 + R(0, 50000));
    return {id:uid('cv'), clientId:cl.id, name:cl.name, phone:cl.phone, channel:'WhatsApp', needsHuman:false, handled:'bot', unread:0, state:{step:'menu', d:{}, fb:0}, msgs:[
      msg('client', pick(['Oi, tudo bem?', 'Boa tarde', 'Olá!', 'Oi, queria marcar um horário']), ts), msg('bot', `Olá, ${fn}! Sou o assistente virtual da ${D.biz.name}. Como posso ajudar?`, step()),
      msg('client', 'Quero agendar', step()), msg('bot', 'Claro! Qual serviço você quer?', step()), msg('client', S.name, step()),
      msg('bot', `Perfeito, ${S.name}. Qual dia fica melhor para você?`, step()), msg('client', `${WD[wday(ap.date)]} ${fmtD(ap.date).slice(0,5)}`, step()),
      msg('bot', `Tenho horário às ${ap.time} com ${pr.name.split(' ')[0]}. Posso confirmar?`, step()), msg('client', 'Pode confirmar', step()),
      msg('bot', `Agendado! ${S.name} em ${fmtD(ap.date).slice(0,5)} às ${ap.time}. Enviarei um lembrete antes.`, step())], updated:ts};
  };
  D.appts.filter(a => a.source === 'Assistente' && a.date >= addDays(T, -3) && a.clientId !== 'c1').slice(0, 9).forEach((a, i) => D.convs.push(mkBooking(a, 45 + i*170)));
  const faqConv = (cl, q, f, minsAgo) => { const ts = Date.now() - minsAgo*60000; return {id:uid('cv'), clientId:cl.id, name:cl.name, phone:cl.phone, channel:'WhatsApp', needsHuman:false, handled:'bot', unread:0, state:{step:'menu', d:{}, fb:0}, msgs:[msg('client', q, ts), msg('bot', f.a, ts + 3000)], updated:ts}; };
  [0,1,2].forEach(i => D.convs.push(faqConv(D.clients[10+i], pick(['Vocês aceitam pix?', 'tem estacionamento aí?', 'qual o endereço de vocês?']).replace('pix', 'pix'), D.faqs[i % D.faqs.length], 20 + i*95)));
  const hu = [['Quero pagar adiantado e pedir nota fiscal, como faço?', 25], ['Preciso falar sobre um problema no último atendimento', 140]];
  hu.forEach(([q, m], i) => { const cl = D.clients[20+i], ts = Date.now() - m*60000; D.convs.unshift({id:uid('cv'), clientId:cl.id, name:cl.name, phone:cl.phone, channel:'WhatsApp', needsHuman:true, handled:'human', unread:1, state:{step:'menu', d:{}, fb:0}, msgs:[msg('client', q, ts), msg('bot', 'Entendi! Para isso vou chamar um atendente. Ele responde por aqui em instantes.', ts + 4000)], updated:ts + 4000}); });
  /* conversas de teste do simulador */
  D.convs.push({id:'demo_known', demo:true, clientId:'c1', name:'Mariana Costa', phone:'(11) 98765-4321', channel:'WhatsApp', needsHuman:false, handled:'bot', unread:0, state:{step:'menu', d:{}, fb:0}, msgs:[], updated:Date.now() - 864e5*9});
  D.convs.push({id:'demo_new', demo:true, clientId:null, name:'Novo contato', phone:'(11) 90000-0000', channel:'WhatsApp', needsHuman:false, handled:'bot', unread:0, state:{step:'menu', d:{}, fb:0}, msgs:[], updated:Date.now() - 864e5*9});
  D.persona = 'demo_known';
  return D;
}

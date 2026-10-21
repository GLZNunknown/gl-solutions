/* Motor do assistente: intenções, perguntas frequentes e fluxo de agendamento */
const INTENTS = [
  ['human', /\b(atendente|humano|pessoa|falar com alguem|gerente|dono|responsavel)\b/],
  ['cancel', /\b(cancelar|desmarcar|cancela|nao vou poder)\b/],
  ['resched', /\b(remarcar|reagendar|trocar (o )?horario|mudar (o )?horario|adiar|outro horario)\b/],
  ['confirm', /\b(confirmar|confirmo|confirmado|vou sim|estarei la|presenca)\b/],
  ['mine', /\b(meu agendamento|meus agendamentos|meu horario|minha consulta|quando e meu|tenho horario|meu proximo)\b/],
  ['book', /\b(agendar|marcar|reservar|agenda|horario disponivel|horarios disponiveis|vaga|vagas|quero um horario|tem horario|disponibilidade|agendamento)\b/],
  ['prices', /\b(preco|precos|valor|valores|quanto (custa|fica|e|sai)|servico|servicos|tabela|cardapio)\b/],
  ['info', /\b(endereco|onde (fica|e|voces ficam)|localizacao|como chegar|horario de funcionamento|funcionamento|abre|fecha|aberto|telefone|contato|que horas)\b/],
  ['thanks', /\b(obrigad[oa]|valeu|grato|brigad[oa])\b/],
  ['bye', /\b(tchau|ate mais|ate logo|flw)\b/],
  ['hello', /^(oi|ola|bom dia|boa tarde|boa noite|e ai|opa|eae|oie|hey)\b/]
];
const DAYNAMES = {domingo:0, segunda:1, terca:2, quarta:3, quinta:4, sexta:5, sabado:6};

const Bot = {
  /* ---- reconhecimento ---- */
  faqMatch(text){
    const t = ' ' + norm(text) + ' '; let best = null;
    Store.d.faqs.forEach(f => { let s = 0; f.keys.forEach(k => { const nk = norm(k); if (nk && t.includes(' ' + nk + ' ') || (nk.length > 4 && t.includes(nk))) s += 1 + (nk.split(' ').length - 1) * .5; }); if (s && (!best || s > best.score)) best = {faq:f, score:s}; });
    return best;
  },
  intent(text){ const t = norm(text); for (const [k, re] of INTENTS) if (re.test(t)) return k; return null; },
  match(text){ const faq = Bot.faqMatch(text), it = Bot.intent(text); return {faq, intent:it}; },
  parseDay(text, svcId, proId){
    const t = norm(text), T = today();
    if (/\bhoje\b/.test(t)) return T; if (/depois de amanha/.test(t)) return addDays(T, 2); if (/\bamanha\b/.test(t)) return addDays(T, 1);
    const m = t.match(/\b(\d{1,2})[\/\-](\d{1,2})\b/); if (m) { const y = new Date().getFullYear(); let d = `${y}-${pad(+m[2])}-${pad(+m[1])}`; if (d < T) d = `${y + 1}-${pad(+m[2])}-${pad(+m[1])}`; return d; }
    for (const [n, w] of Object.entries(DAYNAMES)) if (t.includes(n)) { for (let i = 0; i < 8; i++) { const d = addDays(T, i); if (wday(d) === w && (i > 0 || t.includes(n))) return d; } }
    return null;
  },
  parseTime(text){
    const t = norm(text), m = t.match(/\b(\d{1,2})(?:[:h ]?(\d{2}))?\s*(h|hs|horas)?\b/); if (!m) return null;
    let h = +m[1], mi = m[2] ? +m[2] : 0; if (h > 23 || mi > 59) return null;
    if (/(tarde|noite)/.test(t) && h < 12) h += 12; return h*60 + mi;
  },
  findSvc(text){
    const t = norm(text); let best = null, bs = 0;
    Store.d.services.filter(s => s.active !== false).forEach(s => { const words = norm(s.name).split(' ').filter(w => w.length > 3); const hit = words.filter(w => t.includes(w.slice(0, Math.max(4, w.length - 2)))).length, sc = hit ? hit + hit / words.length : 0; if (sc > bs) { bs = sc; best = s; } });
    Bot.lastScore = bs; return best;
  },

  /* ---- mensagens ---- */
  menu(){ return [{l:'Agendar horário', pl:'act:book'}, {l:'Serviços e preços', pl:'act:prices'}, {l:'Horários e endereço', pl:'act:info'}, {l:'Meu agendamento', pl:'act:mine'}, {l:'Falar com atendente', pl:'act:human'}]; },
  greet(conv){
    const b = Store.d.biz, n = conv.clientId ? ', ' + firstName(conv.name) : '';
    return {text: b.tone === 'descontraido' ? `E aí${n}! Aqui é o assistente da ${b.name}. Bora resolver o que você precisa?` : `Olá${n}! Sou o assistente virtual da ${b.name}. Como posso ajudar?`, buttons:Bot.menu()};
  },
  prices(){
    const L = Store.d.services.filter(s => s.active !== false).map(s => `• ${s.name}: ${money(s.price)} (${s.dur} min)`).join('\n');
    return {text:`Estes são nossos serviços:\n${L}`, buttons:[{l:'Agendar horário', pl:'act:book'}, {l:'Voltar ao menu', pl:'act:menu'}]};
  },
  info(){ const b = Store.d.biz; return {text:`${b.name}\n${b.address}\n\nHorário de atendimento:\n${Q.hoursText()}\n\nTelefone: ${b.phone}`, buttons:[{l:'Agendar horário', pl:'act:book'}, {l:'Voltar ao menu', pl:'act:menu'}]}; },
  apptLine(a){ const S = Q.svc(a.serviceId), p = Q.pro(a.proId); return `${S.name} · ${dayLabel(a.date).toLowerCase()} às ${a.time} · ${firstName(p.name)}`; },

  /* ---- perguntas do fluxo ---- */
  ask(conv){
    const st = conv.state, d = st.d, S = Q.svc(d.svcId);
    switch (st.step) {
      case 'svc': return {text:'Claro! Qual serviço você quer agendar?', buttons:Store.d.services.filter(s => s.active !== false).map(s => ({l:`${s.name} · ${money(s.price)}`, pl:'svc:' + s.id}))};
      case 'pro': return {text:`Com qual profissional você prefere?`, buttons:[{l:'Qualquer um (mais cedo)', pl:'pro:any'}, ...S.pros.map(id => ({l:Q.pro(id).name, pl:'pro:' + id}))]};
      case 'day': { const days = nextOpenDays(6, d.svcId, d.proId === 'any' ? null : d.proId); if (!days.length) return Bot.handoff(conv, 'No momento não encontrei horários livres para esse serviço. Vou chamar um atendente para encontrar uma opção para você.');
        return {text:`Perfeito, ${S.name}. Qual dia fica melhor para você?`, buttons:days.map(x => ({l:dayLabel(x), pl:'day:' + x}))}; }
      case 'time': { const sl = slotsFor(d.date, d.svcId, d.proId === 'any' ? null : d.proId, d.apptId), off = d.off || 0, page = sl.slice(off, off + 8);
        if (!sl.length) { st.step = 'day'; return Bot.ask(conv); }
        const btn = page.map(x => ({l:x.time, pl:'time:' + x.time})); if (sl.length > off + 8) btn.push({l:'Mais horários', pl:'more:' + (off + 8)}); btn.push({l:'Outro dia', pl:'back:day'});
        return {text:`Horários livres ${dayLabel(d.date).toLowerCase()} (${fmtD(d.date).slice(0, 5)}). Qual prefere? Você também pode digitar, por exemplo, "15h".`, buttons:btn}; }
      case 'name': return {text:'Para finalizar, qual é o seu nome completo?', buttons:[]};
      case 'confirm': { const p = Q.pro(d.slot?.proId || d.proId); return {text:`Confira os dados:\n• ${S.name}\n• ${dayLabel(d.date)} (${fmtD(d.date).slice(0, 5)}) às ${d.time}\n• ${p ? p.name : ''}\n• ${money(S.price)}\n\n${d.apptId ? 'Posso remarcar para esse horário?' : 'Posso confirmar o agendamento?'}`, buttons:[{l:'Confirmar', pl:'ok:yes'}, {l:'Mudar horário', pl:'back:day'}, {l:'Cancelar', pl:'act:menu'}]}; }
      case 'cancelc': { const a = Q.appt(d.apptId); return {text:`Quer mesmo cancelar este horário?\n${Bot.apptLine(a)}`, buttons:[{l:'Sim, cancelar', pl:'ok:cancel'}, {l:'Manter horário', pl:'act:mine'}]}; }
      default: return Bot.greet(conv);
    }
  },
  handoff(conv, text){
    conv.needsHuman = true; conv.handled = 'human'; conv.unread = (conv.unread || 0) + 1; const h = Store.d.hist[Store.d.hist.length - 1]; if (h) h.human++;
    return {text: text || 'Certo! Vou chamar um atendente. Ele responde por aqui em instantes.', buttons:[]};
  },
  start(conv, mode, apptId){
    conv.state = {step:'svc', d:{mode:mode || 'new', apptId:apptId || null}, fb:0};
    if (apptId) { const a = Q.appt(apptId); Object.assign(conv.state.d, {svcId:a.serviceId, proId:a.proId}); conv.state.step = 'day'; }
    return Bot.ask(conv);
  },
  mine(conv){
    const L = conv.clientId ? Q.upcoming(conv.clientId) : [];
    if (!L.length) return [{text:'Não encontrei agendamentos futuros no seu cadastro. Quer marcar um horário?', buttons:[{l:'Agendar horário', pl:'act:book'}, {l:'Voltar ao menu', pl:'act:menu'}]}];
    return L.slice(0, 3).map(a => ({text:`${Bot.apptLine(a)}\nStatus: ${STATUS[a.status].l}`, buttons:[...(a.status === 'agendado' ? [{l:'Confirmar presença', pl:'ap:confirm:' + a.id}] : []), {l:'Remarcar', pl:'ap:resched:' + a.id}, {l:'Cancelar', pl:'ap:cancel:' + a.id}]}));
  },

  /* ---- entrada principal: devolve lista de respostas ---- */
  handle(conv, input){
    const text = input.text || '', pl = input.pl || '', st = conv.state, d = st.d, out = [];
    if (!conv.msgs.some(m => m.from === 'client')) { const h = Store.d.hist[Store.d.hist.length - 1]; if (h) h.convs++; }
    if (conv.handled === 'human') { if (!conv.ackHuman) { conv.ackHuman = true; out.push({text:'Recebi sua mensagem. Um atendente responde por aqui em instantes.', buttons:[]}); } conv.unread = (conv.unread || 0) + 1; return out; }
    const reply = (...r) => r.flat().forEach(x => x && out.push(x));
    const bookFlow = () => { conv.state = {step:'svc', d:{mode:'new'}, fb:0}; const sv = text ? Bot.findSvc(text) : null; if (sv) { conv.state.d.svcId = sv.id; return Bot.svcChosen(conv, sv.id); } return Bot.ask(conv); };

    /* payloads (botões) */
    if (pl) {
      const [k, a, b] = pl.split(':'), arg = pl.slice(k.length + 1);
      if (k === 'act') { st.fb = 0;
        if (a === 'menu') { conv.state = {step:'menu', d:{}, fb:0}; reply(Bot.greet(conv)); }
        else if (a === 'book') reply(bookFlow()); else if (a === 'prices') reply(Bot.prices()); else if (a === 'info') reply(Bot.info()); else if (a === 'mine') reply(Bot.mine(conv)); else if (a === 'human') reply(Bot.handoff(conv));
        return out; }
      if (['pro', 'day', 'more', 'back', 'time'].includes(k) && !d.svcId) return [Bot.greet(conv)];
      if (k === 'svc') return [Bot.svcChosen(conv, arg)];
      if (k === 'pro') { d.proId = arg; st.step = 'day'; return [Bot.ask(conv)]; }
      if (k === 'day') { d.date = arg; d.off = 0; st.step = 'time'; return [Bot.ask(conv)]; }
      if (k === 'more') { d.off = +arg; return [Bot.ask(conv)]; }
      if (k === 'back') { st.step = 'day'; return [Bot.ask(conv)]; }
      if (k === 'time') return Bot.timeChosen(conv, arg);
      if (k === 'ok') return Bot.okChosen(conv, a);
      if (k === 'ap') { const ap = Q.appt(b); if (!ap) return [{text:'Não encontrei esse agendamento.', buttons:Bot.menu()}];
        if (a === 'confirm') { ap.status = 'confirmado'; Store.save(); return [{text:`Presença confirmada! Te esperamos ${dayLabel(ap.date).toLowerCase()} às ${ap.time}.`, buttons:[{l:'Voltar ao menu', pl:'act:menu'}]}]; }
        if (a === 'cancel') { conv.state = {step:'cancelc', d:{apptId:ap.id}, fb:0}; return [Bot.ask(conv)]; }
        if (a === 'resched') return [Bot.start(conv, 'resched', ap.id)]; }
      return [Bot.greet(conv)];
    }

    /* texto livre */
    const m = Bot.match(text), faq = m.faq, it = m.intent;
    if (it === 'human') return [Bot.handoff(conv)];
    if (!['svc', 'pro', 'day', 'time', 'name', 'confirm', 'cancelc'].includes(st.step) && !['cancel', 'resched', 'prices', 'info', 'mine', 'confirm'].includes(it)) { const hit = Bot.findSvc(text); if (hit && Bot.lastScore >= 1.5 && !(faq && faq.score >= 2)) return [bookFlow()]; }
    /* respostas esperadas pelo passo atual */
    if (st.step === 'svc') { const sv = Bot.findSvc(text); if (sv) return [Bot.svcChosen(conv, sv.id)]; }
    if (st.step === 'pro') { const t = norm(text); if (/(qualquer|tanto faz|mais cedo|indiferente)/.test(t)) { d.proId = 'any'; st.step = 'day'; return [Bot.ask(conv)]; } const p = Q.svc(d.svcId).pros.map(Q.pro).find(p => t.includes(norm(firstName(p.name)))); if (p) { d.proId = p.id; st.step = 'day'; return [Bot.ask(conv)]; } }
    if (st.step === 'day') { const day = Bot.parseDay(text); if (day) { if (!slotsFor(day, d.svcId, d.proId === 'any' ? null : d.proId, d.apptId).length) return [{text:`Não tenho horários livres ${dayLabel(day).toLowerCase()}. Veja outras opções:`, buttons:[]}, Bot.ask(conv)]; d.date = day; d.off = 0; st.step = 'time'; return [Bot.ask(conv)]; } }
    if (st.step === 'time') { const mins = Bot.parseTime(text); if (mins != null && !faq) { const sl = slotsFor(d.date, d.svcId, d.proId === 'any' ? null : d.proId, d.apptId), hit = sl.find(x => toMin(x.time) === mins);
      if (hit) return Bot.timeChosen(conv, hit.time); const near = sl.filter(x => Math.abs(toMin(x.time) - mins) <= 90).slice(0, 4);
      return [{text:`Às ${fromMin(mins)} não tenho vaga. ${near.length ? 'Os horários mais próximos são:' : 'Escolha um dos horários livres:'}`, buttons:near.map(x => ({l:x.time, pl:'time:' + x.time})).concat([{l:'Ver todos', pl:'more:0'}])}]; }
      const day = Bot.parseDay(text); if (day && slotsFor(day, d.svcId, d.proId === 'any' ? null : d.proId).length) { d.date = day; d.off = 0; return [Bot.ask(conv)]; } }
    if (st.step === 'name') { const nm = text.trim(); if (nm.length >= 2 && !faq && !it) { conv.name = nm.replace(/\b\w/g, c => c.toUpperCase()); const c = { id:uid('c'), name:conv.name, phone:conv.phone, tags:['Novo'], notes:'', created:today() }; Store.d.clients.push(c); conv.clientId = c.id; st.step = 'confirm'; return [Bot.ask(conv)]; } }
    if (st.step === 'confirm') { const t = norm(text); if (/^(sim|pode|confirmo|confirmar|ok|isso|certo|fechado|beleza|claro)\b/.test(t)) return Bot.okChosen(conv, 'yes'); if (/^(nao|n|mudar|outro)\b/.test(t)) { st.step = 'day'; return [Bot.ask(conv)]; } }
    if (st.step === 'cancelc') { const t = norm(text); if (/^(sim|pode|confirmo|ok|cancela)/.test(t)) return Bot.okChosen(conv, 'cancel'); if (/^(nao|n|manter)/.test(t)) { conv.state = {step:'menu', d:{}, fb:0}; return [{text:'Tudo bem, mantive o seu horário.', buttons:[{l:'Voltar ao menu', pl:'act:menu'}]}]; } }

    /* perguntas frequentes e intenções */
    const inFlow = ['svc', 'pro', 'day', 'time', 'name', 'confirm', 'cancelc'].includes(st.step);
    const faqReply = f => { f.hits = (f.hits || 0) + 1; return {text:f.a, buttons:inFlow ? [] : [{l:'Agendar horário', pl:'act:book'}, {l:'Voltar ao menu', pl:'act:menu'}]}; };
    if (faq && faq.score >= 2) { st.fb = 0; reply(faqReply(faq.faq)); if (inFlow) reply(Bot.ask(conv)); return out; }
    const hasAppt = conv.clientId && Q.upcoming(conv.clientId).length;
    if (it === 'cancel' || it === 'resched') { st.fb = 0;
      if (!hasAppt) { if (faq) { reply(faqReply(faq.faq)); return out; } return [{text:'Não encontrei agendamentos futuros no seu cadastro. Quer marcar um novo horário?', buttons:[{l:'Agendar horário', pl:'act:book'}, {l:'Falar com atendente', pl:'act:human'}]}]; }
      const L = Q.upcoming(conv.clientId); if (L.length === 1) return [it === 'cancel' ? (conv.state = {step:'cancelc', d:{apptId:L[0].id}, fb:0}, Bot.ask(conv)) : Bot.start(conv, 'resched', L[0].id)];
      return [{text:`Qual agendamento você quer ${it === 'cancel' ? 'cancelar' : 'remarcar'}?`, buttons:[]}, ...Bot.mine(conv)]; }
    if (it === 'confirm') { st.fb = 0; const L = hasAppt ? Q.upcoming(conv.clientId).filter(a => a.status === 'agendado') : []; if (L.length) { L[0].status = 'confirmado'; Store.save(); return [{text:`Presença confirmada! Te esperamos ${dayLabel(L[0].date).toLowerCase()} às ${L[0].time}.`, buttons:[{l:'Voltar ao menu', pl:'act:menu'}]}]; } }
    if (it === 'book') { st.fb = 0; return [bookFlow()]; }
    if (it === 'prices') { st.fb = 0; return [Bot.prices()]; }
    if (it === 'info') { st.fb = 0; return [Bot.info()]; }
    if (it === 'mine') { st.fb = 0; return Bot.mine(conv); }
    if (faq) { st.fb = 0; reply(faqReply(faq.faq)); if (inFlow) reply(Bot.ask(conv)); return out; }
    if (it === 'thanks') return [{text:'Por nada! Se precisar de mais alguma coisa, é só chamar.', buttons:[]}];
    if (it === 'bye') return [{text:'Até logo! Qualquer coisa, estou por aqui.', buttons:[]}];
    if (it === 'hello') { conv.state = {step:'menu', d:{}, fb:0}; return [Bot.greet(conv)]; }
    /* não entendi */
    st.fb = (st.fb || 0) + 1;
    if (inFlow) return [{text:'Não consegui entender essa resposta. Pode escolher uma das opções abaixo?', buttons:[]}, Bot.ask(conv)];
    if (st.fb >= 2) return [Bot.handoff(conv, 'Não consegui entender direito, então vou chamar um atendente para ajudar você. Ele responde por aqui em instantes.')];
    return [{text:'Ainda estou aprendendo e não entendi bem. Escolha uma das opções ou me conte de outro jeito.', buttons:Bot.menu()}];
  },

  svcChosen(conv, svcId){
    const S = Q.svc(svcId); if (!S) return Bot.ask(conv); const d = conv.state.d; d.svcId = svcId;
    if (S.pros.length > 1 && !d.apptId) { conv.state.step = 'pro'; return Bot.ask(conv); }
    d.proId = d.proId || S.pros[0]; conv.state.step = 'day'; return Bot.ask(conv);
  },
  timeChosen(conv, time){
    const d = conv.state.d, sl = slotsFor(d.date, d.svcId, d.proId === 'any' ? null : d.proId, d.apptId), hit = sl.find(x => x.time === time);
    if (!hit) { return [{text:'Esse horário acabou de ser ocupado. Veja as opções atualizadas:', buttons:[]}, Bot.ask(conv)]; }
    d.time = time; d.slot = hit;
    if (!conv.clientId) { conv.state.step = 'name'; return [Bot.ask(conv)]; }
    conv.state.step = 'confirm'; return [Bot.ask(conv)];
  },
  okChosen(conv, kind){
    const st = conv.state, d = st.d;
    if (kind === 'cancel') { const a = Q.appt(d.apptId); if (a) { a.status = 'cancelado'; Store.save(); }
      conv.state = {step:'menu', d:{}, fb:0}; return [{text:'Agendamento cancelado. Quando quiser marcar de novo, é só me chamar.', buttons:[{l:'Agendar horário', pl:'act:book'}, {l:'Voltar ao menu', pl:'act:menu'}]}]; }
    if (st.step !== 'confirm') return [Bot.greet(conv)];
    const hit = slotsFor(d.date, d.svcId, d.proId === 'any' ? null : d.proId, d.apptId).find(x => x.time === d.time); if (!hit) { st.step = 'time'; return [{text:'Esse horário acabou de ser ocupado. Escolha outro:', buttons:[]}, Bot.ask(conv)]; }
    let ap;
    if (d.apptId) { ap = Q.appt(d.apptId); Object.assign(ap, {date:d.date, time:d.time, proId:hit.proId, status:'agendado', reminded:false}); Store.save(); }
    else ap = createAppt({clientId:conv.clientId, serviceId:d.svcId, proId:hit.proId, date:d.date, time:d.time, source:'Assistente'});
    conv.state = {step:'menu', d:{}, fb:0};
    const txt = Store.d.auto.confirm.on ? Q.fmt(Store.d.auto.confirm.text, ap) : `Agendado: ${Bot.apptLine(ap)}.`;
    return [{text:txt, buttons:[{l:'Voltar ao menu', pl:'act:menu'}, {l:'Ver meu agendamento', pl:'act:mine'}], ev:{type:d.apptId ? 'Reagendamento' : 'Novo agendamento', apptId:ap.id}}];
  },

  /* ---- automações: lembretes ---- */
  sendReminders(){
    const T = addDays(today(), 1); let sent = 0, confirmed = 0;
    Store.d.appts.filter(a => a.date === T && a.status === 'agendado' && !a.reminded).forEach(a => {
      const cl = Q.client(a.clientId); if (!cl) return;
      let conv = a.clientId === 'c1' ? Q.conv('demo_known') : Store.d.convs.find(c => c.clientId === cl.id && !c.demo);
      if (!conv) { conv = {id:uid('cv'), clientId:cl.id, name:cl.name, phone:cl.phone, channel:'WhatsApp', needsHuman:false, handled:'bot', unread:0, state:{step:'menu', d:{}, fb:0}, msgs:[], updated:Date.now()}; Store.d.convs.push(conv); }
      Chat.push(conv, 'bot', Q.fmt(Store.d.auto.remind24.text, a), {buttons:[{l:'Confirmar', pl:'ap:confirm:' + a.id}, {l:'Remarcar', pl:'ap:resched:' + a.id}, {l:'Cancelar', pl:'ap:cancel:' + a.id}], reminder:true});
      a.reminded = true; sent++;
      if (a.clientId !== 'c1' && Math.random() < .65) { Chat.push(conv, 'client', pick(['Confirmo!', 'Confirmado, obrigado', 'Estarei lá']), {}); a.status = 'confirmado'; confirmed++; Chat.push(conv, 'bot', 'Presença confirmada! Te esperamos.', {}); }
    });
    Store.save(); return {sent, confirmed};
  }
};
const pick = a => a[Math.floor(Math.random() * a.length)];

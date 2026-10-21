/* Simulador de WhatsApp: a conversa do cliente com o assistente */
const Chat = {
  busy:false, events:[],
  conv:() => Q.conv(Store.d.persona),
  push(conv, from, text, extra = {}){ conv.msgs.push({id:uid('m'), from, text, ts:Date.now(), ...extra}); conv.updated = Date.now(); },
  suggestions(){
    const f = Store.d.faqs[0], s = Store.d.services[0];
    return ['Oi', 'Quero agendar um horário', 'Quanto custa?', 'Qual o endereço?', f.q.replace('?', '').replace(/^Quais as /, '').toLowerCase().replace(/^./, c => c.toUpperCase()) + '?', `Quero ${s.name.toLowerCase()} amanhã de tarde`, 'Quero remarcar meu horário', 'Falar com atendente'];
  },
  bubble(m, last){
    const who = m.from === 'client' ? 'me' : m.from === 'staff' ? 'staff' : 'bot';
    const body = esc(m.text).replace(/\n/g, '<br>');
    const btns = last && m.buttons && m.buttons.length ? `<div class="qrs">${m.buttons.map(b => `<button class="qbtn" data-act="chatPl" data-pl="${esc(b.pl)}">${esc(b.l)}</button>`).join('')}</div>` : '';
    return `<div class="msg ${who}"><div class="bub">${who === 'staff' ? '<div class="who">Atendente</div>' : ''}${m.reminder ? '<div class="who">Lembrete automático</div>' : ''}${body}<span class="ts">${fmtTime(m.ts)}${who === 'me' ? ' ' + icon('check', 'sm') : ''}</span></div>${btns}</div>`;
  },
  list(conv){
    if (!conv.msgs.length) return `<div class="chat-empty"><div class="logo">GL</div><b>Conversa de demonstração</b><p>Toque em uma sugestão abaixo ou escreva como se fosse um cliente no WhatsApp. O que o assistente fizer aparece no painel do negócio.</p></div>`;
    let day = '', h = '';
    conv.msgs.forEach((m, i) => { const d = iso(new Date(m.ts)); if (d !== day) { day = d; h += `<div class="day-sep"><span>${d === today() ? 'Hoje' : fmtD(d)}</span></div>`; } h += Chat.bubble(m, i === conv.msgs.length - 1); });
    return h;
  },
  renderMsgs(typing){
    const box = $('#msgs'); if (!box) return; const conv = Chat.conv();
    box.innerHTML = Chat.list(conv) + (typing ? '<div class="msg bot"><div class="bub typing"><i></i><i></i><i></i></div></div>' : '');
    box.scrollTop = box.scrollHeight;
  },
  async send(input, label){
    if (Chat.busy) return; const conv = Chat.conv(); const text = (label || input.text || '').trim(); if (!text) return;
    Chat.push(conv, 'client', text); Chat.renderMsgs(true); Chat.busy = true;
    const replies = Bot.handle(conv, input); Store.save();
    for (const r of replies) {
      await new Promise(res => setTimeout(res, 550 + Math.min(900, r.text.length * 7)));
      Chat.push(conv, 'bot', r.text, {buttons:r.buttons || []});
      if (r.ev) { Chat.events.unshift({...r.ev, at:Date.now()}); const ap = Q.appt(r.ev.apptId); UI.toast(`${r.ev.type} na agenda: ${firstName(Q.client(ap.clientId).name)}, ${ap.time}`, 'calendar'); }
      Chat.renderMsgs(r !== replies[replies.length - 1]);
    }
    if (!replies.length) Chat.renderMsgs(false);
    if (conv.needsHuman && !Chat.events.some(e => e.type === 'Atendente chamado' && e.conv === conv.id)) Chat.events.unshift({type:'Atendente chamado', conv:conv.id, at:Date.now()});
    Chat.busy = false; Store.save(); Chat.side();
  },
  side(){ const el = $('#live'); if (el) el.innerHTML = Chat.liveHtml(); }
};

Pages.chat = () => {
  const conv = Chat.conv(), b = Store.d.biz, known = Store.d.persona === 'demo_known';
  return `<div class="chat-page">
    <section class="phone">
      <header class="phone-h"><a class="icon-btn ghost" href="#/painel/inicio" aria-label="Ir para o painel" style="border:0;background:none">${icon('chevL')}</a><div class="logo">${esc(initials(b.name))}</div><div class="grow"><b>${esc(b.name)}</b><div class="tiny muted"><i class="on-dot"></i> assistente virtual · online</div></div><button class="icon-btn" data-act="chatMenu" aria-label="Opções">${icon('more')}</button></header>
      <div class="msgs" id="msgs">${Chat.list(conv)}</div>
      <div class="sugs">${Chat.suggestions().map(s => `<button class="chip" data-act="chatSug" data-t="${esc(s)}">${esc(s)}</button>`).join('')}</div>
      <form class="composer" id="cform"><input class="input" id="cin" name="t" autocomplete="off" placeholder="Digite uma mensagem" aria-label="Mensagem"><button class="send" type="submit" aria-label="Enviar">${icon('send')}</button></form>
    </section>
    <aside class="live-col"><div class="card"><div class="card-h"><h3>Você está no papel do cliente</h3></div>
        <p class="small muted">Conversando como <b>${known ? 'Mariana Costa (cliente cadastrada)' : 'um novo contato'}</b>. O assistente entende texto livre, responde dúvidas, agenda, remarca e cancela, sem intervenção humana.</p>
        <div class="row wrap" style="margin-top:12px;gap:8px"><a class="btn primary sm" href="#/painel/inicio">${icon('grid', 'sm')} Abrir painel do negócio</a><button class="btn sm" data-act="chatMenu">Trocar cliente</button></div></div>
      <div id="live">${Chat.liveHtml()}</div>
      <div class="card"><div class="card-h"><h3>Como funciona</h3></div><ol class="steps">
        <li>O cliente chama no WhatsApp, a qualquer hora.</li><li>O assistente responde dúvidas com as respostas que você cadastrou.</li><li>Para agendar, ele mostra só os horários realmente livres.</li><li>Lembretes automáticos reduzem faltas e o painel mostra tudo.</li></ol></div></aside></div>`;
};
Chat.liveHtml = () => {
  const ev = Chat.events.slice(0, 5), up = Store.d.appts.filter(a => a.source === 'Assistente' && a.created === today()).length;
  return `<div class="card"><div class="card-h"><h3>Acontecendo no painel</h3><span class="badge ok"><i class="on-dot"></i> ao vivo</span></div>
    ${ev.length ? `<div class="list">${ev.map(e => { const ap = e.apptId && Q.appt(e.apptId); return `<a class="item" href="${ap ? '#/painel/agenda' : '#/painel/conversas'}"><div class="avatar sm">${icon(ap ? 'calendar' : 'user', 'sm')}</div><div class="grow"><div class="t">${esc(e.type)}</div><div class="s">${ap ? esc(Q.svc(ap.serviceId).name) + ' · ' + dayLabel(ap.date).toLowerCase() + ' ' + ap.time : 'Aparece em Conversas, aguardando resposta'}</div></div>${icon('chevR', 'sm')}</a>`; }).join('')}</div>` : `<p class="small muted">Faça um agendamento no chat e veja o horário aparecer aqui e na agenda do painel. Hoje o assistente já criou <b>${up}</b> agendamento(s).</p>`}</div>`;
};
Chat.after = () => {
  const m = $('#msgs'); if (m) m.scrollTop = m.scrollHeight;
  const f = $('#cform'); if (f) f.addEventListener('submit', e => { e.preventDefault(); const i = $('#cin'), t = i.value; i.value = ''; Chat.send({text:t}); i.focus(); });
};
A.chatPl = el => Chat.send({pl:el.dataset.pl}, el.textContent.trim());
A.chatSug = el => Chat.send({text:el.dataset.t});
A.chatMenu = () => {
  const known = Store.d.persona === 'demo_known';
  const o = UI.modal(`<div class="sheet-h"><h2>Opções da demonstração</h2>${closeBtn}</div>
    <div class="field"><label>Conversar como</label><div class="chips"><button class="chip ${known ? 'on' : ''}" data-act="persona" data-p="demo_known">Cliente cadastrada (Mariana)</button><button class="chip ${known ? '' : 'on'}" data-act="persona" data-p="demo_new">Novo contato</button></div></div>
    <p class="small muted" style="margin-bottom:12px">Como cliente cadastrada, o assistente já sabe seu nome e seus horários. Como novo contato, ele pede o nome na hora de agendar.</p>
    <div class="sheet-f"><button class="btn danger" data-act="chatReset">Reiniciar conversa</button><button class="btn" data-act="close">Fechar</button></div>`);
};
A.persona = el => { Store.d.persona = el.dataset.p; Store.save(); UI.close(); App.render(); };
A.chatReset = () => { const c = Chat.conv(); c.msgs = []; c.state = {step:'menu', d:{}, fb:0}; c.needsHuman = false; c.handled = 'bot'; c.ackHuman = false; if (Store.d.persona === 'demo_new') { c.clientId = null; c.name = 'Novo contato'; Store.d.clients = Store.d.clients.filter(x => !(x.tags.includes('Novo') && x.phone === c.phone)); } Store.save(); UI.close(); App.render(); };

/* Painel do negócio */
const St = {agDate:null, agPro:'', convSel:null, convF:'todas', cliQ:'', resp:'faq', rep:30};
const PN = Pages.painel;
const weekStart = d => addDays(d, -((wday(d) + 6) % 7));
const PPM = 1.5;
const stCount = (arr, s) => arr.filter(a => a.status === s).length;
const hrs = n => (n < 1 ? Math.round(n * 60) + ' min' : n.toFixed(1).replace('.', ',') + ' h');
const sumHist = (k, n = 30) => Store.d.hist.slice(-n).reduce((a, h) => a + h[k], 0);
const clientName = id => Q.client(id)?.name || 'Cliente';
const apptRow = a => `<button class="item" data-act="apptOpen" data-id="${a.id}"><b class="num" style="width:46px">${a.time}</b><div class="grow"><div class="t">${esc(clientName(a.clientId))}</div><div class="s">${esc(Q.svc(a.serviceId)?.name)} · ${esc(firstName(Q.pro(a.proId)?.name))}</div></div>${UI.badge(a.status)}</button>`;

/* ---------- INÍCIO ---------- */
PN.inicio = () => {
  const T = today(), b = Store.d.biz, today_ = Q.apptsOn(T).filter(a => a.status !== 'cancelado'), past30 = Store.d.appts.filter(a => a.date >= addDays(T, -30) && a.date < T);
  const done = stCount(past30, 'concluido'), miss = stCount(past30, 'faltou'), attend = done + miss ? Math.round(done / (done + miss) * 100) : 0;
  const convs = sumHist('convs'), human = sumHist('human'), auto = convs ? Math.round((1 - human / convs) * 100) : 0, saved = convs * 3.5 / 60;
  const days = Array.from({length:14}, (_, i) => addDays(T, i)), cnt = days.map(d => Q.apptsOn(d).filter(a => ACTIVE.includes(a.status)).length);
  const src = [{l:'Assistente', v:past30.filter(a => a.source === 'Assistente').length}, {l:'Painel', v:past30.filter(a => a.source === 'Painel').length}];
  const booked = sumHist('booked'), conf = past30.filter(a => ['confirmado', 'concluido'].includes(a.status)).length;
  const funnel = [['Conversas iniciadas', convs], ['Agendamentos criados', Math.min(booked, convs)], ['Comparecimentos', done]], mx = Math.max(...funnel.map(f => f[1]), 1);
  const upNow = today_.filter(a => ACTIVE.includes(a.status) && a.time >= fromMin(new Date().getHours()*60 + new Date().getMinutes() - 30));
  const nh = Q.needsHuman();
  return UI.head(`${greet()}, ${esc(b.owner)}`, `${WDL[wday(T)]}, ${fmtD(T)} · ${esc(b.name)}`, `<button class="btn primary" data-act="apptNew">${icon('plus', 'sm')} Novo agendamento</button>`) + `<div class="stack">
    <div class="kpis k4">
      <div class="kpi"><div class="l">${icon('calendar', 'sm')} Agendamentos hoje</div><div class="v">${today_.length}</div><div class="d">${stCount(today_, 'confirmado')} confirmados · ${stCount(today_, 'concluido')} concluídos</div></div>
      <div class="kpi"><div class="l">${icon('check', 'sm')} Comparecimento</div><div class="v">${attend}%</div><div class="d">${miss} falta(s) nos últimos 30 dias</div></div>
      <div class="kpi"><div class="l">${icon('bot', 'sm')} Resolvido pelo assistente</div><div class="v">${auto}%</div><div class="d">${convs - human} de ${convs} conversas</div></div>
      <div class="kpi"><div class="l">${icon('clock', 'sm')} Tempo poupado</div><div class="v">${hrs(saved)}</div><div class="d">estimativa em 30 dias</div></div>
    </div>
    ${nh.length ? `<div class="card" style="border-color:var(--warn)"><div class="card-h"><h3>${icon('user', 'sm')} ${nh.length} conversa(s) esperando atendente</h3><a class="btn sm primary" href="#/painel/conversas">Responder</a></div><div class="list">${nh.slice(0, 3).map(c => `<a class="item" href="#/painel/conversas" data-act="convSel" data-id="${c.id}"><div class="avatar sm">${initials(c.name)}</div><div class="grow"><div class="t">${esc(c.name)}</div><div class="s">${esc(c.msgs.filter(m => m.from === 'client').slice(-1)[0]?.text || '')}</div></div><span class="tiny muted">${fmtTime(c.updated)}</span></a>`).join('')}</div></div>` : ''}
    <div class="grid split">
      <div class="card"><div class="card-h"><h3>Próximos atendimentos de hoje</h3><a class="small muted" href="#/painel/agenda">Abrir agenda</a></div><div class="list">${upNow.slice(0, 7).map(apptRow).join('') || UI.empty('calendar', 'Nada mais agendado para hoje.')}</div></div>
      <div class="card"><div class="card-h"><h3>Origem dos agendamentos</h3><span class="muted small">30 dias</span></div>${donut(src, 'agend.')}</div>
    </div>
    <div class="grid split-eq">
      <div class="card"><div class="card-h"><h3>Agenda dos próximos 14 dias</h3></div>${barChart(cnt, days.map(d => dt(d).getDate()), {hi:0})}</div>
      <div class="card"><div class="card-h"><h3>Do chat ao atendimento</h3><span class="muted small">30 dias</span></div>
        <div class="funnel">${funnel.map(([l, v], i) => `<div class="fn"><div class="row between small"><span>${l}</span><b class="num">${v}</b></div><div class="progress"><i style="width:${v / mx * 100}%;opacity:${1 - i*.22}"></i></div></div>`).join('')}</div>
        <p class="small muted" style="margin-top:12px">Receita estimada com serviços concluídos: <b>${brl(past30.filter(a => a.status === 'concluido').reduce((s, a) => s + (Q.svc(a.serviceId)?.price || 0), 0))}</b></p></div>
    </div></div>`;
};
const greet = () => { const h = new Date().getHours(); return h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite'; };

/* ---------- AGENDA ---------- */
PN.agenda = () => {
  if (!St.agDate) St.agDate = today(); const d = St.agDate, ws = weekStart(d), pros = Store.d.pros.filter(p => p.active !== false);
  const strip = Array.from({length:7}, (_, i) => { const x = addDays(ws, i), n = Q.apptsOn(x).filter(a => ACTIVE.includes(a.status)).length; return `<button class="day ${x === d ? 'sel' : ''} ${x === today() ? 'today' : ''} ${Q.isOpen(x) ? '' : 'off'}" data-act="agDay" data-d="${x}"><span>${WD[wday(x)]}</span><b>${dt(x).getDate()}</b><i>${n || ''}</i></button>`; }).join('');
  const rs = Store.d.hours[wday(d)], list = Q.apptsOn(d).filter(a => !St.agPro || a.proId === St.agPro);
  let grid = '';
  if (!rs) grid = `<div class="card">${UI.empty('clock', 'Fechado neste dia.')}</div>`;
  else {
    const a0 = toMin(rs[0][0]), a1 = toMin(rs[rs.length - 1][1]), H = (a1 - a0) * PPM, hours = []; for (let t = Math.ceil(a0 / 60) * 60; t < a1; t += 60) hours.push(t);
    const gaps = rs.slice(1).map((r, i) => [toMin(rs[i][1]), toMin(r[0])]);
    const now = new Date(), nowM = now.getHours()*60 + now.getMinutes(), nowLine = d === today() && nowM > a0 && nowM < a1 ? `<i class="nowline" style="top:${(nowM - a0) * PPM}px"></i>` : '';
    grid = `<div class="ag"><div class="ag-head" style="grid-template-columns:52px repeat(${pros.length},minmax(0,1fr))"><span></span>${pros.map(p => `<div><b>${esc(firstName(p.name))}</b><span class="tiny muted">${esc(p.role)}</span></div>`).join('')}</div>
      <div class="ag-body" style="grid-template-columns:52px repeat(${pros.length},minmax(0,1fr));height:${H}px">
        <div class="ag-times">${hours.map(t => `<span style="top:${(t - a0) * PPM}px">${fromMin(t)}</span>`).join('')}</div>
        ${pros.map(p => `<div class="ag-col" data-act="gridClick" data-pro="${p.id}" data-a0="${a0}">${gaps.map(g => `<u style="top:${(g[0] - a0) * PPM}px;height:${(g[1] - g[0]) * PPM}px"></u>`).join('')}${nowLine}
          ${Store.d.blocks.filter(b => b.proId === p.id && b.date === d).map(b => `<div class="blk off" style="top:${(toMin(b.from) - a0) * PPM}px;height:${(toMin(b.to) - toMin(b.from)) * PPM - 2}px">${esc(b.reason || 'Bloqueado')}</div>`).join('')}
          ${list.filter(a => a.proId === p.id && a.status !== 'cancelado').map(a => { const S = Q.svc(a.serviceId); return `<button class="blk st-${a.status}" data-act="apptOpen" data-id="${a.id}" style="top:${(toMin(a.time) - a0) * PPM}px;height:${S.dur * PPM - 2}px"><b>${a.time} ${esc(firstName(clientName(a.clientId)))}</b><span>${esc(S.name)}</span></button>`; }).join('')}</div>`).join('')}
      </div></div>`;
  }
  const mobile = `<div class="card"><div class="list">${list.map(a => `<button class="item" data-act="apptOpen" data-id="${a.id}"><b class="num" style="width:46px">${a.time}</b><div class="grow"><div class="t">${esc(clientName(a.clientId))}</div><div class="s">${esc(Q.svc(a.serviceId)?.name)} · ${esc(firstName(Q.pro(a.proId)?.name))} · até ${Q.end(a)}</div></div>${UI.badge(a.status)}</button>`).join('') || UI.empty('calendar', 'Nenhum agendamento neste dia.')}</div></div>`;
  return UI.head('Agenda', `${WDL[wday(d)]}, ${fmtD(d)} · ${Q.apptsOn(d).filter(a => ACTIVE.includes(a.status)).length} agendamento(s)`, `<button class="btn primary" data-act="apptNew">${icon('plus', 'sm')} Novo</button>`) + `
    <div class="ag-bar"><div class="row"><button class="icon-btn" data-act="agNav" data-n="-1" aria-label="Dia anterior">${icon('chevL')}</button><button class="btn" data-act="agDay" data-d="${today()}">Hoje</button><button class="icon-btn" data-act="agNav" data-n="1" aria-label="Próximo dia">${icon('chevR')}</button><input class="input" type="date" value="${d}" data-ch="agDate" style="width:auto" aria-label="Escolher data"></div>
    <select class="select hide-d-only" data-ch="agPro" style="width:auto" aria-label="Profissional"><option value="">Todos os profissionais</option>${selOpts(pros, St.agPro, p => p.name)}</select></div>
    <div class="weekstrip">${strip}</div><div class="only-desk">${grid}</div><div class="only-mob">${mobile}</div>
    <div class="legend" style="margin-top:12px">${['agendado', 'confirmado', 'concluido', 'faltou'].map(s => `<span><i class="st-dot st-${s}"></i>${STATUS[s].l}</span>`).join('')}</div>`;
};
A.agDay = el => { St.agDate = el.dataset.d; App.render(true); };
A.agNav = el => { St.agDate = addDays(St.agDate, +el.dataset.n); App.render(true); };
I.agDate = el => { if (el.value) { St.agDate = el.value; App.render(true); } };
I.agPro = el => { St.agPro = el.value; App.render(true); };
A.gridClick = (el, e) => { const y = e.clientY - el.getBoundingClientRect().top, t = +el.dataset.a0 + Math.floor(y / PPM / 30) * 30; apptForm(null, {proId:el.dataset.pro, time:fromMin(t), date:St.agDate}); };
A.apptNew = () => apptForm(null, {date:St.agDate || today()});

function apptForm(ap, pre = {}) {
  const v = ap || {clientId:'', serviceId:pre.serviceId || Store.d.services[0].id, proId:pre.proId || '', date:pre.date || today(), time:pre.time || '', notes:''};
  const clients = Store.d.clients.slice().sort((a, b) => a.name.localeCompare(b.name));
  const o = UI.modal(`<div class="sheet-h"><h2>${ap ? 'Editar agendamento' : 'Novo agendamento'}</h2>${closeBtn}</div>
    <div class="field"><label>Cliente</label><select class="select" name="clientId"><option value="">Selecione…</option><option value="__new">+ Novo cliente</option>${selOpts(clients, v.clientId, c => c.name)}</select></div>
    <div class="form-row" id="newc" hidden><div class="field"><label>Nome</label><input class="input" name="newName"></div><div class="field"><label>Telefone</label><input class="input" name="newPhone" placeholder="(11) 90000-0000"></div></div>
    <div class="field"><label>Serviço</label><select class="select" name="serviceId">${selOpts(Store.d.services.filter(s => s.active !== false), v.serviceId, s => `${s.name} · ${s.dur} min · ${money(s.price)}`)}</select></div>
    <div class="form-row"><div class="field"><label>Profissional</label><select class="select" name="proId"></select></div><div class="field"><label>Data</label><input class="input" type="date" name="date" value="${v.date}"></div></div>
    <div class="field"><label>Horário</label><input class="input" type="time" name="time" step="900" value="${v.time}"><div class="chips" id="slots" style="margin-top:8px"></div></div>
    <div class="field"><label>Observações</label><textarea class="textarea" name="notes" style="min-height:64px">${esc(v.notes || '')}</textarea></div>
    <div class="sheet-f"><button class="btn" data-act="close">Cancelar</button><button class="btn primary" id="sv">Salvar</button></div>`);
  const f = n => $(`[name="${n}"]`, o);
  const refresh = (what) => {
    const S = Q.svc(f('serviceId').value), cur = f('proId').value || v.proId;
    if (!what || what === 'serviceId') { f('proId').innerHTML = `<option value="">Automático</option>` + selOpts(S.pros.map(Q.pro).filter(Boolean), S.pros.includes(cur) ? cur : '', p => p.name); }
    const sl = slotsFor(f('date').value, S.id, f('proId').value || null, ap?.id);
    $('#slots', o).innerHTML = sl.length ? sl.slice(0, 24).map(x => `<button type="button" class="chip ${f('time').value === x.time ? 'on' : ''}" data-t="${x.time}">${x.time}</button>`).join('') : '<span class="small muted">Sem horários livres neste dia.</span>';
  };
  o.addEventListener('change', e => { const n = e.target.name; if (n === 'clientId') $('#newc', o).hidden = e.target.value !== '__new'; if (['serviceId', 'proId', 'date', 'time'].includes(n)) refresh(n); });
  o.addEventListener('click', e => { const c = e.target.closest('[data-t]'); if (c) { f('time').value = c.dataset.t; refresh('time'); } });
  refresh(); if (v.proId) f('proId').value = v.proId; refresh('proId');
  $('#sv', o).onclick = () => {
    const x = UI.form(o); let cid = x.clientId;
    if (cid === '__new') { if (!x.newName.trim()) return UI.toast('Informe o nome do cliente', 'info'); const c = {id:uid('c'), name:x.newName.trim(), phone:x.newPhone || '', tags:['Novo'], notes:'', created:today()}; Store.d.clients.push(c); cid = c.id; }
    if (!cid || !x.time || !x.date) return UI.toast('Preencha cliente, data e horário', 'info');
    const S = Q.svc(x.serviceId), a = toMin(x.time), pro = x.proId || (slotsFor(x.date, S.id, null, ap?.id).find(s => s.time === x.time)?.proId) || S.pros[0];
    const clash = Store.d.appts.find(z => z.id !== ap?.id && z.proId === pro && z.date === x.date && ACTIVE.includes(z.status) && toMin(z.time) < a + S.dur && toMin(z.time) + Q.svc(z.serviceId).dur > a);
    if (clash) return UI.toast(`Horário ocupado: ${clientName(clash.clientId)} às ${clash.time}`, 'x');
    if (ap) Object.assign(ap, {clientId:cid, serviceId:S.id, proId:pro, date:x.date, time:x.time, notes:x.notes}); else createAppt({clientId:cid, serviceId:S.id, proId:pro, date:x.date, time:x.time, source:'Painel', notes:x.notes});
    Store.save(); UI.close(o); UI.toast('Agendamento salvo'); St.agDate = x.date; App.render(true);
  };
}
A.apptOpen = el => {
  const a = Q.appt(el.dataset.id), c = Q.client(a.clientId), S = Q.svc(a.serviceId), p = Q.pro(a.proId);
  const o = UI.modal(`<div class="sheet-h"><h2>${esc(c?.name)}</h2>${closeBtn}</div>
    <div class="row wrap" style="gap:8px;margin-bottom:12px">${UI.badge(a.status)}<span class="chip">${icon(a.source === 'Assistente' ? 'bot' : 'user', 'sm')} ${a.source}</span>${a.reminded ? `<span class="chip">${icon('bell', 'sm')} Lembrete enviado</span>` : ''}</div>
    <div class="list small">${[['Serviço', `${S.name} (${S.dur} min · ${money(S.price)})`], ['Profissional', p.name], ['Quando', `${WDL[wday(a.date)]}, ${fmtD(a.date)} · ${a.time} às ${Q.end(a)}`], ['Telefone', c?.phone || '—'], ['Observações', a.notes || '—']].map(([k, v]) => `<div class="item" style="padding:8px 0"><span class="muted grow">${k}</span><b style="text-align:right">${esc(v)}</b></div>`).join('')}</div>
    <div class="row wrap" style="gap:8px;margin-top:14px">${a.status === 'agendado' ? `<button class="btn sm" data-act="apptSt" data-s="confirmado" data-id="${a.id}">${icon('check', 'sm')} Confirmar</button>` : ''}
      ${ACTIVE.includes(a.status) ? `<button class="btn sm primary" data-act="apptSt" data-s="concluido" data-id="${a.id}">Concluir</button><button class="btn sm" data-act="apptSt" data-s="faltou" data-id="${a.id}">Faltou</button><button class="btn sm danger" data-act="apptSt" data-s="cancelado" data-id="${a.id}">Cancelar</button>` : `<button class="btn sm" data-act="apptSt" data-s="agendado" data-id="${a.id}">Reabrir</button>`}
      <button class="btn sm" data-act="apptEdit" data-id="${a.id}">${icon('edit', 'sm')} Editar / remarcar</button>
      <a class="btn sm" target="_blank" rel="noopener" href="${UI.wa(c?.phone || '', Q.fmt(Store.d.auto.remind24.text, a))}">${icon('phone', 'sm')} WhatsApp</a><button class="btn sm ghost" data-act="apptDel" data-id="${a.id}" aria-label="Excluir">${icon('trash', 'sm')}</button></div>`);
};
A.apptSt = el => { const a = Q.appt(el.dataset.id); a.status = el.dataset.s; Store.save(); UI.close(); UI.toast(`Marcado como ${STATUS[a.status].l.toLowerCase()}`); App.render(true); };
A.apptEdit = el => { const a = Q.appt(el.dataset.id); UI.close(); apptForm(a); };
A.apptDel = el => { UI.close(); UI.confirm('Excluir este agendamento definitivamente?', () => { Store.d.appts = Store.d.appts.filter(x => x.id !== el.dataset.id); Store.save(); UI.toast('Agendamento excluído', 'trash'); App.render(true); }, {danger:true, label:'Excluir'}); };

/* ---------- CONVERSAS ---------- */
PN.conversas = () => {
  const f = St.convF; let L = Store.d.convs.filter(c => c.msgs.length).sort((a, b) => b.updated - a.updated);
  if (f === 'humano') L = L.filter(c => c.needsHuman); else if (f === 'assistente') L = L.filter(c => !c.needsHuman);
  const sel = Q.conv(St.convSel) && Q.conv(St.convSel).msgs.length ? Q.conv(St.convSel) : null;
  const item = c => { const last = c.msgs[c.msgs.length - 1]; return `<button class="cv ${sel?.id === c.id ? 'on' : ''}" data-act="convSel" data-id="${c.id}"><div class="avatar sm">${initials(c.name)}</div><div class="grow"><div class="row between"><b class="t">${esc(c.name)}</b><span class="tiny muted">${fmtTime(c.updated)}</span></div><div class="s">${last.from === 'client' ? '' : last.from === 'staff' ? 'Você: ' : 'Assistente: '}${esc(last.text.replace(/\n/g, ' '))}</div><div class="row" style="gap:6px;margin-top:4px">${c.needsHuman ? '<span class="badge warn">Precisa de atendente</span>' : '<span class="badge ok">Assistente</span>'}${c.demo ? '<span class="badge">Simulador</span>' : ''}</div></div>${c.unread ? `<span class="unread">${c.unread}</span>` : ''}</button>`; };
  const thread = sel ? `<div class="th-h"><button class="icon-btn only-mob" data-act="convSel" data-id="" aria-label="Voltar">${icon('chevL')}</button><div class="avatar sm">${initials(sel.name)}</div><div class="grow"><b>${esc(sel.name)}</b><div class="tiny muted">${esc(sel.phone)} · ${sel.channel}</div></div>
      ${sel.needsHuman || sel.handled === 'human' ? `<button class="btn sm" data-act="convBack" data-id="${sel.id}">${icon('bot', 'sm')} Devolver ao assistente</button>` : `<button class="btn sm" data-act="convTake" data-id="${sel.id}">${icon('user', 'sm')} Assumir</button>`}</div>
    <div class="msgs th-msgs" id="thmsgs">${sel.msgs.map((m, i) => Chat.bubble({...m, buttons:[]}, false)).join('')}</div>
    <form class="composer" data-conv="${sel.id}" id="sform"><input class="input" name="t" autocomplete="off" placeholder="Responder como atendente" aria-label="Resposta"><button class="send" type="submit" aria-label="Enviar">${icon('send')}</button></form>` : `<div class="empty" style="margin:auto">${icon('chat')}<div>Selecione uma conversa para ler e responder.</div></div>`;
  return UI.head('Conversas', 'Tudo o que o assistente conversa com seus clientes') + `
    <div class="chips" style="margin-bottom:12px">${[['todas', 'Todas'], ['humano', `Precisam de atendente (${Q.needsHuman().length})`], ['assistente', 'Resolvidas pelo assistente']].map(([k, l]) => `<button class="chip ${f === k ? 'on' : ''}" data-act="convF" data-v="${k}">${l}</button>`).join('')}</div>
    <div class="inbox ${sel ? 'has-sel' : ''}"><div class="in-list">${L.map(item).join('') || UI.empty('chat', 'Nenhuma conversa neste filtro.')}</div><div class="in-thread">${thread}</div></div>`;
};
PN.conversasAfter = () => { const m = $('#thmsgs'); if (m) m.scrollTop = m.scrollHeight; const f = $('#sform'); if (f) f.addEventListener('submit', e => { e.preventDefault(); const i = f.elements.t, t = i.value.trim(); if (!t) return; const c = Q.conv(f.dataset.conv); Chat.push(c, 'staff', t); c.handled = 'human'; c.needsHuman = false; c.unread = 0; Store.save(); App.render(true); $('#sform input')?.focus(); }); };
A.convSel = el => { St.convSel = el.dataset.id || null; const c = Q.conv(St.convSel); if (c) { c.unread = 0; Store.save(); } if (location.hash !== '#/painel/conversas') location.hash = '#/painel/conversas'; else App.render(true); };
A.convF = el => { St.convF = el.dataset.v; App.render(true); };
A.convBack = el => { const c = Q.conv(el.dataset.id); c.handled = 'bot'; c.needsHuman = false; c.ackHuman = false; Chat.push(c, 'bot', 'O assistente voltou a atender você por aqui. Posso ajudar com algo mais?', {buttons:Bot.menu()}); Store.save(); UI.toast('Conversa devolvida ao assistente', 'bot'); App.render(true); };
A.convTake = el => { const c = Q.conv(el.dataset.id); c.handled = 'human'; Store.save(); UI.toast('Você assumiu a conversa', 'user'); App.render(true); };

/* ---------- CLIENTES ---------- */
PN.clientes = () => {
  const q = norm(St.cliQ); let L = Store.d.clients.slice().sort((a, b) => a.name.localeCompare(b.name)); if (q) L = L.filter(c => norm(c.name).includes(q) || c.phone.includes(q));
  return UI.head('Clientes', `${Store.d.clients.length} cadastrados`, `<button class="btn primary" data-act="cliEdit">${icon('plus', 'sm')} Novo cliente</button>`) + `
    <div class="toolbar"><div class="search">${icon('search', 'sm')}<input class="input" placeholder="Buscar por nome ou telefone" data-in="cliQ" value="${esc(St.cliQ)}"></div></div><div id="cli-list">${cliTable(L)}</div>`;
};
function cliTable(L) {
  if (!L.length) return `<div class="card">${UI.empty('users', 'Nenhum cliente encontrado.')}</div>`;
  return `<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Cliente</th><th>Telefone</th><th>Visitas</th><th>Faltas</th><th>Próximo horário</th></tr></thead><tbody>${L.slice(0, 80).map(c => { const up = Q.upcoming(c.id)[0]; return `<tr class="click" data-act="cliOpen" data-id="${c.id}"><td class="main"><div class="row"><div class="avatar sm">${initials(c.name)}</div><div><b>${esc(c.name)}</b><div class="row" style="gap:4px">${c.tags.map(t => `<span class="badge">${esc(t)}</span>`).join('')}</div></div></div></td><td data-l="Telefone">${esc(c.phone)}</td><td data-l="Visitas">${Q.visits(c.id)}</td><td data-l="Faltas">${Q.misses(c.id) ? `<span class="badge bad">${Q.misses(c.id)}</span>` : '0'}</td><td data-l="Próximo">${up ? `${fmtS(up.date)} · ${up.time}` : '—'}</td></tr>`; }).join('')}</tbody></table></div>`;
}
I.cliQ = el => { St.cliQ = el.value; const q = norm(el.value); $('#cli-list').innerHTML = cliTable(Store.d.clients.filter(c => !q || norm(c.name).includes(q) || c.phone.includes(q)).sort((a, b) => a.name.localeCompare(b.name))); };
A.cliOpen = el => {
  const c = Q.client(el.dataset.id), h = Q.apptsOf(c.id);
  UI.modal(`<div class="sheet-h"><h2>${esc(c.name)}</h2>${closeBtn}</div><div class="row wrap" style="gap:8px;margin-bottom:12px"><span class="chip">${icon('phone', 'sm')} ${esc(c.phone)}</span>${c.tags.map(t => `<span class="chip">${esc(t)}</span>`).join('')}<span class="chip">Cliente desde ${fmtD(c.created)}</span></div>
    <div class="kpis" style="grid-template-columns:repeat(3,1fr);margin-bottom:14px"><div class="kpi"><div class="l">Visitas</div><div class="v">${Q.visits(c.id)}</div></div><div class="kpi"><div class="l">Faltas</div><div class="v">${Q.misses(c.id)}</div></div><div class="kpi"><div class="l">Gasto</div><div class="v" style="font-size:1.1rem">${brl(h.filter(a => a.status === 'concluido').reduce((s, a) => s + Q.svc(a.serviceId).price, 0))}</div></div></div>
    ${c.notes ? `<div class="tip" style="background:var(--soft);color:var(--ink)">${icon('info', 'sm')}<span>${esc(c.notes)}</span></div>` : ''}
    <h3 style="margin:12px 0 4px">Histórico</h3><div class="list" style="max-height:30vh;overflow:auto">${h.slice(0, 8).map(a => `<div class="item"><div class="grow"><div class="t">${esc(Q.svc(a.serviceId)?.name)}</div><div class="s">${fmtD(a.date)} · ${a.time}</div></div>${UI.badge(a.status)}</div>`).join('') || UI.empty('calendar', 'Sem histórico.')}</div>
    <div class="sheet-f"><button class="btn" data-act="cliEdit" data-id="${c.id}">${icon('edit', 'sm')} Editar</button><button class="btn primary" data-act="cliBook" data-id="${c.id}">${icon('calendar', 'sm')} Agendar</button></div>`);
};
A.cliBook = el => { UI.close(); apptForm(null, {date:today()}); setTimeout(() => { const s = $('.overlay [name="clientId"]'); if (s) { s.value = el.dataset.id; } }, 0); };
A.cliEdit = el => {
  UI.close(); const c = el?.dataset?.id ? Q.client(el.dataset.id) : null;
  const o = UI.modal(`<div class="sheet-h"><h2>${c ? 'Editar' : 'Novo'} cliente</h2>${closeBtn}</div><div class="field"><label>Nome</label><input class="input" name="name" value="${esc(c?.name || '')}"></div><div class="field"><label>Telefone (WhatsApp)</label><input class="input" name="phone" value="${esc(c?.phone || '')}"></div><div class="field"><label>Etiquetas (separadas por vírgula)</label><input class="input" name="tags" value="${esc((c?.tags || []).join(', '))}"></div><div class="field"><label>Observações</label><textarea class="textarea" name="notes">${esc(c?.notes || '')}</textarea></div>
    <div class="sheet-f"><button class="btn" data-act="close">Cancelar</button><button class="btn primary" id="sv">Salvar</button></div>`);
  $('#sv', o).onclick = () => { const f = UI.form(o); if (!f.name.trim()) return UI.toast('Informe o nome', 'info'); const d = {name:f.name.trim(), phone:f.phone, tags:f.tags.split(',').map(x => x.trim()).filter(Boolean), notes:f.notes}; if (c) Object.assign(c, d); else Store.d.clients.push({id:uid('c'), created:today(), ...d}); Store.save(); UI.close(o); UI.toast('Cliente salvo'); App.render(true); };
};

/* ---------- SERVIÇOS ---------- */
PN.servicos = () => UI.head('Serviços', 'O que o assistente oferece para agendamento', `<button class="btn primary" data-act="svcEdit">${icon('plus', 'sm')} Novo serviço</button>`) + `<div class="grid g3">${Store.d.services.map(s => { const n = Store.d.appts.filter(a => a.serviceId === s.id && a.date >= addDays(today(), -30) && a.status !== 'cancelado').length; return `<div class="card" style="${s.active === false ? 'opacity:.55' : ''}"><div class="card-h"><h3>${esc(s.name)}</h3>${s.active === false ? '<span class="badge">Inativo</span>' : ''}</div><div class="row" style="align-items:baseline"><h2 class="num">${money(s.price)}</h2><span class="muted small">${s.dur} min</span></div><div class="row wrap" style="gap:6px;margin:10px 0">${s.pros.map(id => `<span class="chip">${esc(firstName(Q.pro(id)?.name))}</span>`).join('')}</div><div class="row between small muted"><span>${n} agend. em 30 dias</span><button class="btn sm" data-act="svcEdit" data-id="${s.id}">${icon('edit', 'sm')} Editar</button></div></div>`; }).join('')}</div>`;
A.svcEdit = el => {
  const s = el?.dataset?.id ? Q.svc(el.dataset.id) : null;
  const o = UI.modal(`<div class="sheet-h"><h2>${s ? 'Editar' : 'Novo'} serviço</h2>${closeBtn}</div><div class="field"><label>Nome</label><input class="input" name="name" value="${esc(s?.name || '')}"></div>
    <div class="form-row"><div class="field"><label>Duração (min)</label><input class="input" type="number" name="dur" min="5" step="5" value="${s?.dur || 30}"></div><div class="field"><label>Preço (R$)</label><input class="input" name="price" inputmode="decimal" value="${s?.price ?? ''}"></div></div>
    <div class="field"><label>Quem realiza</label><div class="chips">${Store.d.pros.map(p => `<label class="chip"><input type="checkbox" name="p_${p.id}" ${!s || s.pros.includes(p.id) ? 'checked' : ''}> ${esc(firstName(p.name))}</label>`).join('')}</div></div>
    <label class="row small" style="margin-bottom:10px"><input type="checkbox" name="active" ${s?.active === false ? '' : 'checked'}> Disponível para agendamento pelo assistente</label>
    <div class="sheet-f">${s ? `<button class="btn danger" id="dl">${icon('trash', 'sm')}</button>` : ''}<button class="btn" data-act="close">Cancelar</button><button class="btn primary" id="sv">Salvar</button></div>`);
  $('#sv', o).onclick = () => { const f = UI.form(o), pros = Store.d.pros.filter(p => f['p_' + p.id]).map(p => p.id); if (!f.name.trim() || !pros.length) return UI.toast('Informe o nome e ao menos um profissional', 'info');
    const d = {name:f.name.trim(), dur:+f.dur || 30, price:parseFloat(String(f.price).replace(',', '.')) || 0, pros, active:f.active}; if (s) Object.assign(s, d); else Store.d.services.push({id:uid('s'), ...d}); Store.save(); UI.close(o); UI.toast('Serviço salvo'); App.render(true); };
  if (s) $('#dl', o).onclick = () => { if (Store.d.appts.some(a => a.serviceId === s.id && ACTIVE.includes(a.status))) return UI.toast('Há agendamentos futuros neste serviço. Desative-o em vez de excluir.', 'lock'); Store.d.services = Store.d.services.filter(x => x.id !== s.id); Store.save(); UI.close(o); App.render(true); };
};

/* ---------- EQUIPE E HORÁRIOS ---------- */
PN.equipe = () => {
  const H = Store.d.hours, B = Store.d.biz;
  return UI.head('Equipe e horários', 'Quem atende e quando o assistente pode agendar') + `<div class="stack">
    <div class="card"><div class="card-h"><h3>Profissionais</h3><button class="btn sm" data-act="proEdit">${icon('plus', 'sm')} Adicionar</button></div><div class="list">${Store.d.pros.map(p => `<div class="item"><div class="avatar">${initials(p.name)}</div><div class="grow"><div class="t">${esc(p.name)}</div><div class="s">${esc(p.role)}${p.active === false ? ' · inativo' : ''}</div></div><button class="btn sm" data-act="proEdit" data-id="${p.id}">${icon('edit', 'sm')}</button></div>`).join('')}</div></div>
    <div class="card"><div class="card-h"><h3>Horário de funcionamento</h3><button class="btn sm primary" data-act="hoursSave">Salvar horários</button></div><div class="hours" id="hours">${[1, 2, 3, 4, 5, 6, 0].map(d => { const r = H[d] || [], a = r[0] || ['', ''], b = r[1] || ['', '']; return `<div class="hr"><label class="row" style="gap:8px;min-width:110px"><input type="checkbox" name="open${d}" ${H[d] ? 'checked' : ''}> <b>${WD[d]}</b></label><div class="row wrap" style="gap:6px"><input class="input" type="time" name="a${d}" value="${a[0]}"><span class="muted">às</span><input class="input" type="time" name="b${d}" value="${a[1]}"><span class="muted small">e</span><input class="input" type="time" name="c${d}" value="${b[0]}"><span class="muted">às</span><input class="input" type="time" name="e${d}" value="${b[1]}"></div></div>`; }).join('')}</div><p class="small muted" style="margin-top:8px">O segundo intervalo é opcional (use para pausas de almoço).</p></div>
    <div class="grid split-eq"><div class="card"><div class="card-h"><h3>Regras de agendamento</h3></div>
      <div class="field"><label>Intervalo entre horários</label><select class="select" data-ch="param" data-k="step"><option value="15" ${B.step === 15 ? 'selected' : ''}>15 minutos</option><option value="30" ${B.step === 30 ? 'selected' : ''}>30 minutos</option><option value="60" ${B.step === 60 ? 'selected' : ''}>60 minutos</option></select></div>
      <div class="field"><label>Antecedência mínima para agendar</label><select class="select" data-ch="param" data-k="lead">${[0, 30, 60, 120, 240].map(n => `<option value="${n}" ${B.lead === n ? 'selected' : ''}>${n ? n + ' minutos' : 'Sem antecedência'}</option>`).join('')}</select></div>
      <div class="field"><label>Prazo para cancelar sem custo</label><select class="select" data-ch="param" data-k="cancelH">${[2, 12, 24, 48].map(n => `<option value="${n}" ${B.cancelH === n ? 'selected' : ''}>${n} horas antes</option>`).join('')}</select></div></div>
      <div class="card"><div class="card-h"><h3>Folgas e bloqueios</h3><button class="btn sm" data-act="blockAdd">${icon('plus', 'sm')} Bloquear</button></div><div class="list">${Store.d.blocks.filter(b => b.date >= today()).sort((a, b) => a.date.localeCompare(b.date)).map(b => `<div class="item"><div class="avatar sm">${icon('lock', 'sm')}</div><div class="grow"><div class="t">${esc(firstName(Q.pro(b.proId)?.name))} · ${fmtS(b.date)}</div><div class="s">${b.from}–${b.to} · ${esc(b.reason || '')}</div></div><button class="btn sm ghost" data-act="blockDel" data-id="${b.id}" aria-label="Remover">${icon('x', 'sm')}</button></div>`).join('') || UI.empty('lock', 'Nenhum bloqueio futuro.')}</div></div></div></div>`;
};
I.param = el => { Store.d.biz[el.dataset.k] = +el.value; Store.save(); UI.toast('Regra atualizada'); };
A.hoursSave = () => { const root = $('#hours'), H = {}; [0, 1, 2, 3, 4, 5, 6].forEach(d => { const g = n => $(`[name="${n}${d}"]`, root).value; if (!$(`[name="open${d}"]`, root).checked) { H[d] = null; return; } const r = []; if (g('a') && g('b') && g('a') < g('b')) r.push([g('a'), g('b')]); if (g('c') && g('e') && g('c') < g('e')) r.push([g('c'), g('e')]); H[d] = r.length ? r : null; }); Store.d.hours = H; Store.save(); UI.toast('Horários atualizados'); };
A.proEdit = el => {
  const p = el?.dataset?.id ? Q.pro(el.dataset.id) : null;
  const o = UI.modal(`<div class="sheet-h"><h2>${p ? 'Editar' : 'Novo'} profissional</h2>${closeBtn}</div><div class="field"><label>Nome</label><input class="input" name="name" value="${esc(p?.name || '')}"></div><div class="field"><label>Função</label><input class="input" name="role" value="${esc(p?.role || '')}"></div><label class="row small" style="margin-bottom:10px"><input type="checkbox" name="active" ${p?.active === false ? '' : 'checked'}> Atende e recebe agendamentos</label><div class="sheet-f"><button class="btn" data-act="close">Cancelar</button><button class="btn primary" id="sv">Salvar</button></div>`);
  $('#sv', o).onclick = () => { const f = UI.form(o); if (!f.name.trim()) return UI.toast('Informe o nome', 'info'); if (p) Object.assign(p, {name:f.name.trim(), role:f.role, active:f.active}); else { const n = {id:uid('p'), name:f.name.trim(), role:f.role, active:f.active}; Store.d.pros.push(n); Store.d.services.forEach(s => s.pros.push(n.id)); } Store.save(); UI.close(o); UI.toast('Profissional salvo'); App.render(true); };
};
A.blockAdd = () => {
  const o = UI.modal(`<div class="sheet-h"><h2>Bloquear horário</h2>${closeBtn}</div><div class="field"><label>Profissional</label><select class="select" name="proId">${selOpts(Store.d.pros, '', p => p.name)}</select></div><div class="form-row"><div class="field"><label>Data</label><input class="input" type="date" name="date" value="${today()}"></div><div class="field"><label>Motivo</label><input class="input" name="reason" placeholder="Folga, curso…"></div></div><div class="form-row"><div class="field"><label>Das</label><input class="input" type="time" name="from" value="09:00"></div><div class="field"><label>Até</label><input class="input" type="time" name="to" value="12:00"></div></div><div class="sheet-f"><button class="btn" data-act="close">Cancelar</button><button class="btn primary" id="sv">Bloquear</button></div>`);
  $('#sv', o).onclick = () => { const f = UI.form(o); if (f.from >= f.to) return UI.toast('O horário final deve ser depois do inicial', 'info'); Store.d.blocks.push({id:uid('b'), ...f}); Store.save(); UI.close(o); UI.toast('Horário bloqueado'); App.render(true); };
};
A.blockDel = el => { Store.d.blocks = Store.d.blocks.filter(b => b.id !== el.dataset.id); Store.save(); App.render(true); };

/* ---------- RESPOSTAS AUTOMÁTICAS ---------- */
PN.respostas = () => {
  const tab = St.resp, tabs = [['faq', 'Perguntas frequentes'], ['auto', 'Mensagens automáticas'], ['teste', 'Testar o assistente']].map(([k, l]) => `<button class="${tab === k ? 'on' : ''}" data-act="respTab" data-v="${k}">${l}</button>`).join('');
  let body;
  if (tab === 'faq') body = `<div class="row between" style="margin-bottom:12px"><p class="small muted" style="max-width:560px">O assistente responde sozinho quando a mensagem do cliente contém uma das palavras-chave. Cadastre as dúvidas que mais aparecem.</p><button class="btn primary" data-act="faqEdit">${icon('plus', 'sm')} Nova resposta</button></div><div class="grid g2">${Store.d.faqs.map(f => `<div class="card"><div class="card-h"><h3>${esc(f.q)}</h3><span class="badge">${f.hits} usos</span></div><p class="small" style="color:var(--ink-2)">${esc(f.a)}</p><div class="row wrap" style="gap:6px;margin:10px 0">${f.keys.slice(0, 6).map(k => `<span class="chip">${esc(k)}</span>`).join('')}</div><button class="btn sm" data-act="faqEdit" data-id="${f.id}">${icon('edit', 'sm')} Editar</button></div>`).join('')}</div>`;
  else if (tab === 'auto') { const ex = Store.d.appts.find(a => ACTIVE.includes(a.status) && a.date >= today()) || Store.d.appts[0];
    body = `<div class="card" style="margin-bottom:14px"><div class="row between wrap" style="gap:10px"><div><h3>Lembretes de amanhã</h3><p class="small muted">Envia agora o lembrete para todos os horários de amanhã. No chat do cliente você vê a mensagem chegar.</p></div><button class="btn primary" data-act="sendRem">${icon('bell', 'sm')} Simular envio</button></div></div>
    <div class="grid g2">${Object.entries(Store.d.auto).map(([k, a]) => `<div class="card"><div class="card-h"><h3>${a.title}</h3><label class="switch"><input type="checkbox" data-ch="autoOn" data-k="${k}" ${a.on ? 'checked' : ''}><i></i></label></div><textarea class="textarea" data-in="autoText" data-k="${k}" style="min-height:96px">${esc(a.text)}</textarea><div class="chips" style="margin:8px 0">${['{nome}', '{servico}', '{data}', '{hora}', '{profissional}', '{endereco}'].map(v => `<button class="chip" data-act="insVar" data-k="${k}" data-v="${v}">${v}</button>`).join('')}</div><div class="bub preview" id="pv-${k}">${esc(Q.fmt(a.text, ex)).replace(/\n/g, '<br>')}</div></div>`).join('')}</div>`; }
  else body = `<div class="card"><h3>Teste uma mensagem</h3><p class="small muted" style="margin:4px 0 12px">Veja como o assistente interpreta uma frase antes de um cliente de verdade escrevê-la.</p><form class="row" id="tform" style="gap:8px"><input class="input" name="t" placeholder='Ex.: "tem estacionamento?" ou "quero remarcar"' autocomplete="off"><button class="btn primary" type="submit">Testar</button></form><div id="tout" style="margin-top:14px"></div></div>`;
  return UI.head('Respostas do assistente', 'Dúvidas, mensagens automáticas e testes') + `<div class="tabs">${tabs}</div>${body}`;
};
PN.respostasAfter = () => { const f = $('#tform'); if (f) f.addEventListener('submit', e => { e.preventDefault(); const t = f.elements.t.value; if (!t.trim()) return; const m = Bot.match(t), fq = m.faq, lab = {human:'Falar com atendente', cancel:'Cancelar horário', resched:'Remarcar horário', confirm:'Confirmar presença', mine:'Consultar agendamento', book:'Agendar horário', prices:'Serviços e preços', info:'Horários e endereço', thanks:'Agradecimento', bye:'Despedida', hello:'Saudação'};
  $('#tout').innerHTML = `<div class="list"><div class="item"><span class="muted grow">Intenção reconhecida</span><b>${m.intent ? lab[m.intent] : 'Nenhuma'}</b></div><div class="item"><span class="muted grow">Pergunta frequente</span><b>${fq ? esc(fq.faq.q) + ' (relevância ' + fq.score + ')' : 'Nenhuma'}</b></div></div>${fq ? `<div class="msg bot" style="margin-top:12px"><div class="bub">${esc(fq.faq.a)}</div></div>` : `<p class="small muted" style="margin-top:12px">${m.intent ? 'O assistente segue o fluxo da intenção reconhecida.' : 'Sem resposta cadastrada: o assistente oferece o menu e, na segunda tentativa, chama um atendente.'}</p>`}`; }); };
A.respTab = el => { St.resp = el.dataset.v; App.render(true); };
I.autoOn = el => { Store.d.auto[el.dataset.k].on = el.checked; Store.save(); UI.toast(el.checked ? 'Mensagem ativada' : 'Mensagem desativada'); };
I.autoText = el => { const k = el.dataset.k; Store.d.auto[k].text = el.value; Store.save(); const ex = Store.d.appts.find(a => ACTIVE.includes(a.status) && a.date >= today()) || Store.d.appts[0]; const p = $('#pv-' + k); if (p) p.innerHTML = esc(Q.fmt(el.value, ex)).replace(/\n/g, '<br>'); };
A.insVar = el => { const t = $(`textarea[data-k="${el.dataset.k}"]`); t.setRangeText(el.dataset.v, t.selectionStart, t.selectionEnd, 'end'); t.focus(); I.autoText(t); };
A.sendRem = () => { const r = Bot.sendReminders(); r.sent ? UI.toast(`${r.sent} lembrete(s) enviado(s); ${r.confirmed} já confirmaram`, 'bell') : UI.toast('Nenhum horário pendente de lembrete para amanhã', 'info'); App.render(true); };
A.faqEdit = el => {
  const f = el?.dataset?.id ? Store.d.faqs.find(x => x.id === el.dataset.id) : null;
  const o = UI.modal(`<div class="sheet-h"><h2>${f ? 'Editar' : 'Nova'} resposta</h2>${closeBtn}</div><div class="field"><label>Pergunta</label><input class="input" name="q" value="${esc(f?.q || '')}"></div><div class="field"><label>Palavras-chave (separadas por vírgula)</label><input class="input" name="keys" value="${esc((f?.keys || []).join(', '))}" placeholder="pix, cartão, pagamento"></div><div class="field"><label>Resposta do assistente</label><textarea class="textarea" name="a">${esc(f?.a || '')}</textarea></div>
    <div class="sheet-f">${f ? `<button class="btn danger" id="dl">${icon('trash', 'sm')}</button>` : ''}<button class="btn" data-act="close">Cancelar</button><button class="btn primary" id="sv">Salvar</button></div>`);
  $('#sv', o).onclick = () => { const x = UI.form(o); if (!x.q.trim() || !x.a.trim() || !x.keys.trim()) return UI.toast('Preencha pergunta, palavras-chave e resposta', 'info'); const d = {q:x.q.trim(), keys:x.keys.split(',').map(k => k.trim()).filter(Boolean), a:x.a.trim()}; if (f) Object.assign(f, d); else Store.d.faqs.push({id:uid('f'), hits:0, ...d}); Store.save(); UI.close(o); UI.toast('Resposta salva'); App.render(true); };
  if (f) $('#dl', o).onclick = () => { Store.d.faqs = Store.d.faqs.filter(z => z.id !== f.id); Store.save(); UI.close(o); App.render(true); };
};

/* ---------- RELATÓRIOS ---------- */
PN.relatorios = () => {
  const n = St.rep, T = today(), from = addDays(T, -n), L = Store.d.appts.filter(a => a.date >= from && a.date < T), done = L.filter(a => a.status === 'concluido'), miss = stCount(L, 'faltou');
  const rev = done.reduce((s, a) => s + Q.svc(a.serviceId).price, 0), wd = [0, 0, 0, 0, 0, 0, 0]; L.filter(a => a.status !== 'cancelado').forEach(a => wd[(wday(a.date) + 6) % 7]++);
  const bySvc = Store.d.services.map(s => ({l:s.name, n:L.filter(a => a.serviceId === s.id && a.status !== 'cancelado').length, r:done.filter(a => a.serviceId === s.id).reduce((x, a) => x + s.price, 0)})).sort((a, b) => b.n - a.n), mx = Math.max(...bySvc.map(x => x.n), 1);
  const byPro = Store.d.pros.map(p => ({l:p.name, n:L.filter(a => a.proId === p.id && a.status !== 'cancelado').length})), mp = Math.max(...byPro.map(x => x.n), 1);
  const st = ['concluido', 'faltou', 'cancelado'].map(s => ({l:STATUS[s].l, v:stCount(L, s)})), fresh = Store.d.clients.filter(c => c.created >= from).length;
  return UI.head('Relatórios', `Últimos ${n} dias`, `<select class="select" data-ch="repN" style="width:auto">${[7, 30, 90].map(x => `<option value="${x}" ${x === n ? 'selected' : ''}>${x} dias</option>`).join('')}</select><button class="btn" data-act="exportCsv">${icon('download', 'sm')} Exportar CSV</button>`) + `<div class="stack">
    <div class="kpis k4"><div class="kpi"><div class="l">Atendimentos</div><div class="v">${done.length}</div><div class="d">${L.length} agendados no período</div></div><div class="kpi"><div class="l">Receita estimada</div><div class="v">${brl(rev)}</div></div><div class="kpi"><div class="l">Taxa de faltas</div><div class="v">${done.length + miss ? Math.round(miss / (done.length + miss) * 100) : 0}%</div><div class="d">${miss} falta(s)</div></div><div class="kpi"><div class="l">Novos clientes</div><div class="v">${fresh}</div></div></div>
    <div class="grid split-eq"><div class="card"><div class="card-h"><h3>Agendamentos por dia da semana</h3></div>${barChart(wd, ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'], {hi:wd.indexOf(Math.max(...wd))})}</div><div class="card"><div class="card-h"><h3>Resultado dos agendamentos</h3></div>${donut(st, 'total')}</div></div>
    <div class="grid split-eq"><div class="card"><div class="card-h"><h3>Serviços mais pedidos</h3></div><div class="funnel">${bySvc.map(x => `<div class="fn"><div class="row between small"><span>${esc(x.l)}</span><span><b class="num">${x.n}</b> <span class="muted">· ${brl(x.r)}</span></span></div><div class="progress"><i style="width:${x.n / mx * 100}%"></i></div></div>`).join('')}</div></div>
    <div class="card"><div class="card-h"><h3>Carga por profissional</h3></div><div class="funnel">${byPro.map(x => `<div class="fn"><div class="row between small"><span>${esc(x.l)}</span><b class="num">${x.n}</b></div><div class="progress"><i style="width:${x.n / mp * 100}%"></i></div></div>`).join('')}</div></div></div></div>`;
};
I.repN = el => { St.rep = +el.value; App.render(true); };
A.exportCsv = () => { const rows = [['Data', 'Hora', 'Cliente', 'Telefone', 'Serviço', 'Profissional', 'Valor', 'Status', 'Origem']].concat(Store.d.appts.filter(a => a.date >= addDays(today(), -St.rep) && a.date < today()).sort((a, b) => a.date.localeCompare(b.date)).map(a => [a.date, a.time, clientName(a.clientId), Q.client(a.clientId)?.phone, Q.svc(a.serviceId).name, Q.pro(a.proId).name, Q.svc(a.serviceId).price, STATUS[a.status].l, a.source]));
  const csv = rows.map(r => r.map(x => `"${String(x ?? '').replace(/"/g, '""')}"`).join(';')).join('\n'), l = document.createElement('a'); l.href = URL.createObjectURL(new Blob(['﻿' + csv], {type:'text/csv'})); l.download = 'agendamentos.csv'; l.click(); UI.toast('Relatório exportado', 'download'); };

/* ---------- CONFIGURAÇÕES ---------- */
PN.config = () => {
  const b = Store.d.biz;
  return UI.head('Configurações') + `<div class="grid g2"><div class="stack">
    <div class="card"><div class="card-h"><h3>Dados do negócio</h3></div>
      <div class="field"><label>Nome</label><input class="input" value="${esc(b.name)}" data-in="biz" data-k="name"></div><div class="field"><label>Telefone</label><input class="input" value="${esc(b.phone)}" data-in="biz" data-k="phone"></div><div class="field"><label>Endereço</label><input class="input" value="${esc(b.address)}" data-in="biz" data-k="address"></div>
      <div class="field"><label>Tom das mensagens</label><select class="select" data-ch="biz" data-k="tone"><option value="cordial" ${b.tone === 'cordial' ? 'selected' : ''}>Cordial</option><option value="descontraido" ${b.tone === 'descontraido' ? 'selected' : ''}>Descontraído</option></select></div></div>
    <div class="card"><div class="card-h"><h3>Tipo de negócio (demonstração)</h3></div><p class="small muted" style="margin-bottom:10px">O assistente se adapta a cada segmento: serviços, equipe, horários e respostas mudam. Trocar recarrega os dados de exemplo.</p><div class="chips">${SEG_ORDER.map(k => `<button class="chip ${Store.d.seg === k ? 'on' : ''}" data-act="segSet" data-k="${k}">${SEG[k].label}</button>`).join('')}</div></div></div>
    <div class="stack"><div class="card"><div class="card-h"><h3>Canal de WhatsApp</h3><span class="badge ${Store.d.whats ? 'ok' : 'warn'}">${Store.d.whats ? 'Conectado' : 'Desconectado'}</span></div>
      <p class="small muted" style="margin-bottom:12px">Na versão real, o número do negócio é conectado à API oficial do WhatsApp. Aqui a conexão é apenas ilustrativa.</p>${Store.d.whats ? `<div class="row small" style="margin-bottom:10px">${icon('phone', 'sm')} ${esc(b.phone)}</div><button class="btn" data-act="whatsToggle">Desconectar número</button>` : `<div style="text-align:center">${fakeQR('glatende-' + b.name)}<p class="small muted" style="margin:10px 0">Leia o código com o WhatsApp do negócio</p><button class="btn primary" data-act="whatsToggle">Simular conexão</button></div>`}</div>
      <div class="card"><div class="card-h"><h3>Aparência e dados</h3></div><div class="row wrap"><button class="btn" data-act="theme">${icon(UI.theme() === 'dark' ? 'sun' : 'moon', 'sm')} Tema ${UI.theme() === 'dark' ? 'claro' : 'escuro'}</button><button class="btn danger" data-act="resetAll">${icon('repeat', 'sm')} Restaurar demonstração</button></div></div></div></div>`;
};
I.biz = el => { Store.d.biz[el.dataset.k] = el.value; Store.save(); };
A.segSet = el => { const k = el.dataset.k; if (k === Store.d.seg) return; Store.reset(k); Chat.events = []; UI.toast(`Demonstração de ${SEG[k].label.toLowerCase()} carregada`, 'check'); App.render(true); };
A.whatsToggle = () => { Store.d.whats = !Store.d.whats; Store.save(); UI.toast(Store.d.whats ? 'Número conectado' : 'Número desconectado', 'phone'); App.render(true); };
A.resetAll = () => UI.confirm('Restaurar os dados de demonstração? As alterações feitas serão perdidas.', () => { Store.reset(); Chat.events = []; UI.toast('Demonstração restaurada', 'repeat'); App.render(true); }, {danger:true, label:'Restaurar'});

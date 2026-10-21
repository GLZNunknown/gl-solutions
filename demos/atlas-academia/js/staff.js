/* Área administrativa e dos professores */
Object.assign(St, { stu:{q:'', status:'', plan:'', scope:'meus'}, stuTab:'resumo', trTab:'modelos', trQ:'', fin:{q:'', f:'todos'}, exq:{q:'', g:''}, aulasTab:'dia', aulasDay:null, draft:null });
const me = () => Auth.user;
const isAdmin = () => me().role === 'admin';
const sBadge = u => { const s = Q.status(u); return `<span class="badge ${s.c}">${s.label}</span>`; };
const planName = id => Q.plan(id)?.name || '—';
const selOpts = (arr, cur, fn) => arr.map(x => `<option value="${x.id}" ${x.id === cur ? 'selected' : ''}>${esc(fn(x))}</option>`).join('');
const closeBtn = `<button class="icon-btn" data-act="close" aria-label="Fechar">${icon('x')}</button>`;
const firstName = n => n.split(' ')[0];

/* ---------- PAINEL ---------- */
Pages.staff.dashboard = () => {
  const u = me(), T = today(), studs = Q.students(), act = studs.filter(s => ['ativo','vencendo'].includes(Q.status(s).k));
  const expiring = studs.filter(s => { const k = Q.status(s).k; return k === 'vencendo' || (k === 'vencido' && diffDays(T, s.end) <= 15); }).sort((a,b) => a.end.localeCompare(b.end));
  const overdue = Store.d.payments.filter(p => Q.payStatus(p).k === 'atrasado');
  const ciToday = Store.d.checkins.filter(c => iso(new Date(c.ts)) === T);
  const classesToday = Q.classesOn(T);
  const head = UI.head(`${greet()}, ${firstName(u.name)}`, `${WDL[wday(T)]}, ${fmtD(T)} · ${u.role === 'admin' ? 'Visão geral da academia' : 'Visão dos seus alunos'}`,
    isAdmin() ? `<button class="btn" data-act="newStudent">${icon('plus','sm')} Aluno</button><button class="btn primary" data-act="sell">${icon('tag','sm')} Nova venda</button>` : `<button class="btn primary" href="#/staff/treino/new" data-act="go" data-to="#/staff/treino/new">${icon('plus','sm')} Montar treino</button>`);
  const classList = `<div class="card"><div class="card-h"><h3>Aulas de hoje</h3><a class="small muted" href="#/staff/aulas">Gerenciar</a></div><div class="list">${classesToday.map(c => `<div class="item"><div class="avatar sm">${icon('zap','sm')}</div><div class="grow"><div class="t">${c.name} · ${c.time}</div><div class="s">${esc(Q.user(c.instructorId)?.name)} · ${c.room}</div></div><span class="badge">${Q.bookedOn(c.id, T).length}/${c.cap}</span></div>`).join('') || UI.empty('calendar','Sem aulas hoje')}</div></div>`;
  if (!isAdmin()) {
    const mine = Q.myStudents(u), stale = mine.filter(s => Q.status(s).k !== 'vencido' && (!Q.checkinsOf(s.id)[0] || diffDays(T, iso(new Date(Q.checkinsOf(s.id)[0].ts))) >= 7));
    const renew = Store.d.workouts.filter(w => !w.tpl && mine.some(s => s.id === w.studentId) && diffDays(T, w.createdAt) > 45);
    return head + `<div class="stack"><div class="kpis k4">
      <div class="kpi"><div class="l">${icon('users','sm')} Meus alunos</div><div class="v">${mine.length}</div></div>
      <div class="kpi"><div class="l">${icon('qr','sm')} Treinaram hoje</div><div class="v">${ciToday.filter(c => mine.some(s => s.id === c.studentId)).length}</div></div>
      <div class="kpi"><div class="l">${icon('repeat','sm')} Treinos a renovar</div><div class="v">${renew.length}</div><div class="d">+ de 45 dias</div></div>
      <div class="kpi"><div class="l">${icon('clock','sm')} Sem treinar +7d</div><div class="v">${stale.length}</div></div></div>
      <div class="grid split-eq">
        <div class="card"><div class="card-h"><h3>Treinos para renovar</h3></div><div class="list">${renew.slice(0,6).map(w => { const s = Q.user(w.studentId); return `<a class="item" href="#/staff/treino/${w.id}"><div class="avatar sm">${initials(s.name)}</div><div class="grow"><div class="t">${esc(s.name)}</div><div class="s">${esc(w.name)} · criado há ${diffDays(T, w.createdAt)} dias</div></div>${icon('chevR','sm')}</a>`; }).join('') || UI.empty('check','Tudo atualizado!')}</div></div>
        <div class="card"><div class="card-h"><h3>Alunos ausentes</h3></div><div class="list">${stale.slice(0,6).map(s => { const c = Q.checkinsOf(s.id)[0]; return `<div class="item"><a class="avatar sm" href="#/staff/aluno/${s.id}">${initials(s.name)}</a><div class="grow"><div class="t">${esc(s.name)}</div><div class="s">${c ? 'Último treino há ' + diffDays(T, iso(new Date(c.ts))) + ' dias' : 'Nunca treinou'}</div></div><a class="btn sm" target="_blank" rel="noopener" href="${UI.wa(s.phone, 'Oi ' + firstName(s.name) + '! Sentimos sua falta na academia. Bora voltar a treinar? 💪')}">${icon('phone','sm')}</a></div>`; }).join('') || UI.empty('check','Todos em dia!')}</div></div>
      </div>${classList}</div>`;
  }
  const months = Array.from({length:6}, (_, i) => { const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - (5-i)); return `${d.getFullYear()}-${pad(d.getMonth()+1)}`; });
  const rev = months.map(m => Math.round(Q.revenue(m)));
  const byPlan = Store.d.plans.map(p => ({l:p.name, v:act.filter(s => s.planId === p.id).length}));
  const wd = [0,0,0,0,0,0,0]; Store.d.checkins.filter(c => Date.now() - c.ts < 28*864e5).forEach(c => wd[(new Date(c.ts).getDay()+6)%7]++);
  const monthRev = Q.revenue(monthKey(T)), prevRev = Q.revenue(months[4]);
  return head + `<div class="stack">
    <div class="kpis k4">
      <div class="kpi"><div class="l">${icon('users','sm')} Alunos ativos</div><div class="v">${act.length}</div><div class="d">${studs.length} cadastrados</div></div>
      <div class="kpi"><div class="l">${icon('wallet','sm')} Receita do mês</div><div class="v">${brl(monthRev)}</div><div class="d">${prevRev ? (monthRev >= prevRev ? '▲' : '▼') + ' vs. mês anterior (' + brl(prevRev) + ')' : ''}</div></div>
      <div class="kpi"><div class="l">${icon('qr','sm')} Check-ins hoje</div><div class="v">${ciToday.length}</div></div>
      <div class="kpi"><div class="l">${icon('clock','sm')} A vencer / atrasos</div><div class="v">${expiring.length} / ${overdue.length}</div><div class="d">planos · cobranças</div></div>
    </div>
    <div class="grid split-eq">
      <div class="card"><div class="card-h"><h3>Receita — últimos 6 meses</h3></div>${barChart(rev, months.map(m => MONTHS[+m.slice(5)-1].slice(0,3)), {hi:5, fmt:v => v >= 1000 ? (v/1000).toFixed(1) + 'k' : v})}</div>
      <div class="card"><div class="card-h"><h3>Alunos por plano</h3></div>${donut(byPlan)}</div>
    </div>
    <div class="grid split-eq">
      <div class="card"><div class="card-h"><h3>Frequência por dia da semana</h3><span class="muted small">28 dias</span></div>${barChart(wd, ['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'], {hi:wd.indexOf(Math.max(...wd))})}</div>
      ${classList}
    </div>
    <div class="grid split-eq">
      <div class="card"><div class="card-h"><h3>Vencimentos próximos</h3><a class="small muted" href="#/staff/alunos">Ver alunos</a></div><div class="list">${expiring.slice(0,6).map(s => `<div class="item"><a class="avatar sm" href="#/staff/aluno/${s.id}">${initials(s.name)}</a><div class="grow"><div class="t">${esc(s.name)}</div><div class="s">${planName(s.planId)} · ${fmtD(s.end)}</div></div>${sBadge(s)}<a class="btn sm" target="_blank" rel="noopener" href="${UI.wa(s.phone, 'Olá ' + firstName(s.name) + '! Seu plano ' + planName(s.planId) + ' ' + (Q.status(s).k === 'vencido' ? 'venceu' : 'vence') + ' em ' + fmtD(s.end) + '. Vamos renovar?')}" aria-label="WhatsApp">${icon('phone','sm')}</a></div>`).join('') || UI.empty('check','Nenhum vencimento próximo')}</div></div>
      <div class="card"><div class="card-h"><h3>Cobranças em atraso</h3><a class="small muted" href="#/staff/financeiro">Financeiro</a></div><div class="list">${overdue.slice(0,6).map(p => { const s = Q.user(p.studentId); return `<div class="item"><a class="avatar sm" href="#/staff/aluno/${s.id}">${initials(s.name)}</a><div class="grow"><div class="t">${esc(s.name)}</div><div class="s">${esc(p.desc)} · venc. ${fmtD(p.due)}</div></div><b class="num">${brl(p.amount)}</b><button class="btn sm primary" data-act="markPaid" data-id="${p.id}">Baixar</button></div>`; }).join('') || UI.empty('check','Sem inadimplência')}</div></div>
    </div></div>`;
};
A.go = el => { location.hash = el.dataset.to; };

/* ---------- ALUNOS ---------- */
function stuTable() {
  const f = St.stu, u = me();
  let L = f.scope === 'meus' && !isAdmin() ? Q.myStudents(u) : Q.students();
  if (f.q) { const q = f.q.toLowerCase(); L = L.filter(s => s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q) || s.phone.includes(q)); }
  if (f.status) L = L.filter(s => Q.status(s).k === f.status);
  if (f.plan) L = L.filter(s => s.planId === f.plan);
  L = L.slice().sort((a,b) => a.name.localeCompare(b.name));
  if (!L.length) return `<div class="card">${UI.empty('users','Nenhum aluno encontrado.')}</div>`;
  return `<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Aluno</th><th>Plano</th><th>Vencimento</th><th>Professor</th><th>Status</th><th></th></tr></thead><tbody>${L.slice(0,120).map(s => `
    <tr class="click" data-act="go" data-to="#/staff/aluno/${s.id}"><td class="main"><div class="row"><div class="avatar sm">${initials(s.name)}</div><div><b>${esc(s.name)}</b><div class="muted small">${esc(s.phone)}</div></div></div></td>
    <td data-l="Plano">${planName(s.planId)}</td><td data-l="Vence em">${fmtD(s.end)}</td><td data-l="Professor">${esc(firstName(Q.user(s.instructorId)?.name || '—'))}</td><td data-l="Status">${sBadge(s)}</td><td class="hide-m td">${icon('chevR','sm')}</td></tr>`).join('')}</tbody></table></div><div class="muted small" style="margin-top:8px">${L.length} aluno(s)</div>`;
}
Pages.staff.alunos = () => {
  const f = St.stu;
  return UI.head('Alunos', 'Cadastro, planos e acompanhamento', `<button class="btn primary" data-act="newStudent">${icon('plus','sm')} Novo aluno</button>`) + `
  <div class="toolbar"><div class="search">${icon('search','sm')}<input class="input" placeholder="Buscar por nome, e-mail ou telefone" data-in="stuF" data-k="q" value="${esc(f.q)}"></div>
    <select class="select" data-in="stuF" data-k="status"><option value="">Todos status</option>${[['ativo','Ativos'],['vencendo','Vencendo'],['vencido','Vencidos'],['bloqueado','Bloqueados']].map(([k, l]) => `<option value="${k}" ${f.status===k?'selected':''}>${l}</option>`).join('')}</select>
    <select class="select" data-in="stuF" data-k="plan"><option value="">Todos planos</option>${selOpts(Store.d.plans, f.plan, p => p.name)}</select>
    ${isAdmin() ? '' : `<select class="select" data-in="stuF" data-k="scope"><option value="meus" ${f.scope==='meus'?'selected':''}>Meus alunos</option><option value="todos" ${f.scope==='todos'?'selected':''}>Todos</option></select>`}</div>
  <div id="stu-list">${stuTable()}</div>`;
};
I.stuF = el => { St.stu[el.dataset.k] = el.value; $('#stu-list').innerHTML = stuTable(); };

function studentForm(s) {
  const isNew = !s; s = s || {};
  const o = UI.modal(`<div class="sheet-h"><h2>${isNew ? 'Novo aluno' : 'Editar aluno'}</h2>${closeBtn}</div>
    <div class="field"><label>Nome completo</label><input class="input" name="name" value="${esc(s.name || '')}"></div>
    <div class="form-row"><div class="field"><label>E-mail</label><input class="input" type="email" name="email" value="${esc(s.email || '')}"></div><div class="field"><label>Telefone</label><input class="input" name="phone" value="${esc(s.phone || '')}" placeholder="(11) 90000-0000"></div></div>
    <div class="form-row"><div class="field"><label>Nascimento</label><input class="input" type="date" name="birth" value="${s.birth || ''}"></div><div class="field"><label>Objetivo</label><select class="select" name="goal">${GOALS.map(g => `<option ${g===s.goal?'selected':''}>${g}</option>`).join('')}</select></div></div>
    <div class="field"><label>Professor responsável</label><select class="select" name="instructorId">${selOpts(Q.profs(), s.instructorId || (me().role === 'prof' ? me().id : ''), p => p.name)}</select></div>
    ${isNew ? `<div class="divider"></div><div class="form-row"><div class="field"><label>Plano</label><select class="select" name="planId"><option value="">Sem plano por enquanto</option>${selOpts(Store.d.plans.filter(p => p.active), '', p => `${p.name} — ${brl(p.price)}`)}</select></div><div class="field"><label>Pagamento</label><select class="select" name="method"><option>PIX</option><option>Cartão</option><option>Dinheiro</option><option>Boleto</option></select></div></div><label class="row small" style="margin-bottom:12px"><input type="checkbox" name="paid" checked> Pagamento recebido</label>` : ''}
    <div class="field"><label>Observações (saúde, restrições…)</label><textarea class="textarea" name="notes">${esc(s.notes || '')}</textarea></div>
    <div class="sheet-f"><button class="btn" data-act="close">Cancelar</button><button class="btn primary" id="sv">Salvar</button></div>`);
  $('#sv', o).onclick = () => {
    const f = UI.form(o); if (!f.name.trim()) return UI.toast('Informe o nome', 'info');
    if (isNew) {
      const n = {id:uid('u_s'), role:'aluno', name:f.name.trim(), email:f.email, pass:'123456', phone:f.phone, birth:f.birth, planId:'', start:'', end:'', instructorId:f.instructorId, goal:f.goal, notes:f.notes, blocked:false};
      Store.d.users.push(n); Store.d.measures[n.id] = [];
      if (f.planId) doSale({studentId:n.id, planId:f.planId, start:today(), discount:0, method:f.method, paid:f.paid});
      UI.toast('Aluno cadastrado'); Store.save(); UI.close(o); location.hash = '#/staff/aluno/' + n.id; App.render(true);
    } else { Object.assign(s, {name:f.name.trim(), email:f.email, phone:f.phone, birth:f.birth, goal:f.goal, instructorId:f.instructorId, notes:f.notes}); Store.save(); UI.close(o); UI.toast('Dados atualizados'); App.render(true); }
  };
}
A.newStudent = () => studentForm();
A.editStudent = el => studentForm(Q.user(el.dataset.id));

Pages.staff.aluno = (id) => {
  const s = Q.user(id); if (!s) return UI.empty('users', 'Aluno não encontrado.');
  const tab = St.stuTab, plan = Q.plan(s.planId), ses = Q.sessionsOf(id), ci = Q.checkinsOf(id), ws = Q.workoutsOf(id);
  const tabs = [['resumo','Resumo'],['treinos','Treinos'],['pagamentos','Pagamentos'],['medidas','Medidas']].map(([k, l]) => `<button class="${tab===k?'on':''}" data-act="tab" data-k="stuTab" data-v="${k}">${l}</button>`).join('');
  let body = '';
  if (tab === 'resumo') {
    const weeks = Array.from({length:8}, (_, i) => { const a = addDays(weekStart(today()), -(7-i)*7), b = addDays(a, 6); return ses.filter(x => x.date >= a && x.date <= b).length; });
    body = `<div class="grid split-eq"><div class="card"><div class="card-h"><h3>Dados</h3></div><div class="list small">
      ${[['E-mail', s.email],['Telefone', s.phone],['Nascimento', fmtD(s.birth)],['Objetivo', s.goal],['Professor', Q.user(s.instructorId)?.name || '—'],['Último check-in', ci[0] ? fmtD(iso(new Date(ci[0].ts))) + ' às ' + fmtTime(ci[0].ts) : 'Nunca']].map(([k, v]) => `<div class="item" style="padding:8px 0"><span class="muted grow">${k}</span><b>${esc(v)}</b></div>`).join('')}
      </div>${s.notes ? `<div class="tip" style="background:var(--soft);color:var(--ink)">${icon('info','sm')}<span>${esc(s.notes)}</span></div>` : ''}</div>
      <div class="stack"><div class="card"><div class="card-h"><h3>Frequência (8 semanas)</h3></div>${barChart(weeks, Array.from({length:8}, (_, i) => fmtS(addDays(weekStart(today()), -(7-i)*7)).slice(0,5)), {hi:7})}</div>
      <div class="card"><div class="card-h"><h3>Últimos treinos</h3></div><div class="list">${ses.slice(0,5).map(x => `<div class="item"><div class="grow"><div class="t">${esc(Q.workout(x.workoutId)?.name || 'Treino')}</div><div class="s">${fmtD(x.date)}</div></div><span class="small muted">${x.min} min</span></div>`).join('') || UI.empty('clock','Sem treinos registrados')}</div></div></div></div>`;
  } else if (tab === 'treinos') {
    body = `<div class="row" style="margin-bottom:12px;gap:8px"><a class="btn primary" href="#/staff/treino/new?aluno=${id}">${icon('plus','sm')} Montar treino</a><button class="btn" data-act="applyTpl" data-id="${id}">${icon('copy','sm')} Aplicar modelo</button></div>
      <div class="grid g2">${ws.map(w => `<div class="card"><div class="row"><div class="wk-letter">${esc(letterOf(w))}</div><div class="grow"><h3>${esc(w.name)}</h3><div class="muted small">${w.items.length} exercícios · ${Q.muscles(w).join(', ')}</div></div></div><div class="row wrap" style="gap:6px;margin:10px 0">${dayChips(w.days)}</div><div class="row"><a class="btn sm" href="#/staff/treino/${w.id}">${icon('edit','sm')} Editar</a><button class="btn sm danger" data-act="wkDel" data-id="${w.id}">${icon('trash','sm')}</button><span class="grow"></span><span class="tiny muted">${fmtD(w.createdAt)}</span></div></div>`).join('') || `<div class="card">${UI.empty('dumbbell','Nenhum treino atribuído.')}</div>`}</div>`;
  } else if (tab === 'pagamentos') {
    const pays = Q.paymentsOf(id);
    body = `<div class="row" style="margin-bottom:12px"><button class="btn primary" data-act="sell" data-id="${id}">${icon('tag','sm')} ${s.planId ? 'Renovar / trocar plano' : 'Vender plano'}</button></div><div class="card"><div class="list">${pays.map(p => { const ps = Q.payStatus(p); return `<div class="item"><div class="grow"><div class="t">${esc(p.desc)}</div><div class="s">Venc. ${fmtD(p.due)}${p.paidAt ? ' · pago ' + fmtD(p.paidAt) + ' (' + p.method + ')' : ''}</div></div><div style="text-align:right"><b class="num">${brl(p.amount)}</b><div><span class="badge ${ps.c}">${ps.label}</span></div></div>${p.paidAt ? '' : `<button class="btn sm primary" data-act="markPaid" data-id="${p.id}">Baixar</button>`}</div>`; }).join('') || UI.empty('wallet','Sem pagamentos.')}</div></div>`;
  } else {
    const m = Q.measuresOf(id);
    body = `<div class="grid split-eq"><div class="card"><div class="card-h"><h3>Peso (kg)</h3></div>${lineChart(m.map(x => x.weight), m.map(x => fmtS(x.date).slice(0,5)))}</div><div class="card"><div class="card-h"><h3>Medidas</h3></div><div class="list">${m.slice().reverse().map(x => `<div class="item"><div class="grow"><div class="t">${fmtD(x.date)}</div><div class="s">Cintura ${x.waist} · Braço ${x.arm} · Peito ${x.chest}</div></div><div style="text-align:right"><b class="num">${x.weight} kg</b><div class="s">${x.fat}%</div></div></div>`).join('') || UI.empty('scale','Sem medidas.')}</div></div></div>`;
  }
  return `<div class="row" style="margin-bottom:12px"><a class="icon-btn" href="#/staff/alunos" aria-label="Voltar">${icon('chevL')}</a><span class="muted small">Alunos</span></div>
  <div class="card" style="margin-bottom:16px"><div class="row wrap" style="gap:14px"><div class="avatar lg">${initials(s.name)}</div><div class="grow" style="min-width:200px"><h1>${esc(s.name)}</h1><div class="row wrap" style="gap:6px;margin-top:6px">${sBadge(s)}<span class="chip">${planName(s.planId)}${plan ? ' · até ' + fmtD(s.end) : ''}</span><span class="chip">${icon('flame','sm')} ${Q.streak(id)}</span></div></div>
    <div class="row wrap" style="gap:8px"><a class="btn sm" target="_blank" rel="noopener" href="${UI.wa(s.phone)}">${icon('phone','sm')} WhatsApp</a><button class="btn sm" data-act="editStudent" data-id="${id}">${icon('edit','sm')} Editar</button><button class="btn sm" data-act="sell" data-id="${id}">${icon('tag','sm')} Plano</button><button class="btn sm ${s.blocked ? '' : 'danger'}" data-act="toggleBlock" data-id="${id}">${icon('lock','sm')} ${s.blocked ? 'Desbloquear' : 'Bloquear'}</button></div></div></div>
  <div class="tabs">${tabs}</div>${body}`;
};
A.toggleBlock = el => { const s = Q.user(el.dataset.id); UI.confirm(s.blocked ? `Liberar o acesso de <b>${esc(s.name)}</b>?` : `Bloquear o acesso de <b>${esc(s.name)}</b>? Ele não conseguirá fazer check-in.`, () => { s.blocked = !s.blocked; Store.save(); UI.toast(s.blocked ? 'Aluno bloqueado' : 'Acesso liberado', 'lock'); App.render(true); }, {danger:!s.blocked}); };

/* ---------- VENDA DE PLANO ---------- */
function doSale({studentId, planId, start, discount, method, paid}) {
  const u = Q.user(studentId), plan = Q.plan(planId), keep = u.planId && u.end && u.end >= today() && !u.blocked;
  const from = keep ? u.end : start;
  const amount = Math.max(0, plan.price - (+discount || 0));
  Store.d.payments.push({id:uid('pg'), studentId, planId, amount, due:from, paidAt: paid ? today() : null, method, desc:(keep ? 'Renovação — ' : '') + 'Plano ' + plan.name + ' (' + plan.months + (plan.months > 1 ? ' meses' : ' mês') + ')'});
  if (!keep) u.start = from; u.end = addMonths(from, plan.months); u.planId = planId; u.blocked = false;
  Store.save();
}
A.sell = (el) => {
  const pre = el?.dataset?.id, studs = Q.students().sort((a,b) => a.name.localeCompare(b.name)), plans = Store.d.plans.filter(p => p.active);
  const o = UI.modal(`<div class="sheet-h"><h2>Nova venda de plano</h2>${closeBtn}</div>
    <div class="field"><label>Aluno</label><select class="select" name="studentId">${selOpts(studs, pre, s => s.name)}</select></div>
    <div class="field"><label>Plano</label><select class="select" name="planId">${plans.map(p => `<option value="${p.id}">${p.name} · ${p.months} ${p.months > 1 ? 'meses' : 'mês'} · ${brl(p.price)}</option>`).join('')}</select></div>
    <div class="form-row"><div class="field"><label>Início</label><input class="input" type="date" name="start" value="${today()}"></div><div class="field"><label>Desconto (R$)</label><input class="input" name="discount" inputmode="decimal" value="0"></div></div>
    <div class="form-row"><div class="field"><label>Forma de pagamento</label><select class="select" name="method"><option>PIX</option><option>Cartão</option><option>Dinheiro</option><option>Boleto</option></select></div><div class="field"><label>&nbsp;</label><label class="row small" style="min-height:44px"><input type="checkbox" name="paid" checked> Pagamento recebido</label></div></div>
    <div class="card flat row between"><span class="muted">Total</span><h2 id="tot" class="num"></h2></div>
    <div class="sheet-f"><button class="btn" data-act="close">Cancelar</button><button class="btn primary" id="sv">Confirmar venda</button></div>`);
  const calc = () => { const f = UI.form(o), p = Q.plan(f.planId); $('#tot', o).textContent = brl(Math.max(0, p.price - (parseFloat(String(f.discount).replace(',', '.')) || 0))); };
  o.addEventListener('input', calc); calc();
  $('#sv', o).onclick = () => { const f = UI.form(o); doSale({...f, discount:parseFloat(String(f.discount).replace(',', '.')) || 0}); UI.close(o); UI.toast('Venda registrada'); App.render(true); };
};
A.markPaid = el => { const p = Store.d.payments.find(x => x.id === el.dataset.id), s = Q.user(p.studentId); p.paidAt = today(); Store.save(); UI.toast(`Baixa de ${brl(p.amount)} — ${firstName(s.name)}`); App.render(true); };

/* ---------- PLANOS ---------- */
Pages.staff.planos = () => UI.head('Planos', 'Planos oferecidos e vendas', `<button class="btn primary" data-act="planEdit">${icon('plus','sm')} Novo plano</button>`) + `
  <div class="grid g2">${Store.d.plans.map(p => {
    const act = Q.students().filter(s => s.planId === p.id && ['ativo','vencendo'].includes(Q.status(s).k)).length, sold = Store.d.payments.filter(x => x.planId === p.id).length, rev = Store.d.payments.filter(x => x.planId === p.id && x.paidAt).reduce((a, x) => a + x.amount, 0);
    return `<div class="card" style="${p.active ? '' : 'opacity:.6'}"><div class="card-h"><div><h2>${esc(p.name)}</h2><span class="muted small">${p.months} ${p.months > 1 ? 'meses' : 'mês'}</span></div>${p.active ? '' : '<span class="badge">Inativo</span>'}</div>
      <div class="row" style="align-items:baseline"><h1 class="num">${brl(p.price)}</h1><span class="muted small">${brl(p.price / p.months)}/mês</span></div>
      <ul class="small" style="padding-left:18px;color:var(--ink-2);line-height:1.8">${p.perks.map(x => `<li>${esc(x)}</li>`).join('')}</ul>
      <div class="kpis" style="grid-template-columns:repeat(3,1fr);margin:12px 0"><div><div class="muted tiny">Ativos</div><b class="num">${act}</b></div><div><div class="muted tiny">Vendidos</div><b class="num">${sold}</b></div><div><div class="muted tiny">Receita</div><b class="num">${brl(rev)}</b></div></div>
      <div class="row"><button class="btn sm primary" data-act="sellPlan" data-id="${p.id}">${icon('tag','sm')} Vender</button><button class="btn sm" data-act="planEdit" data-id="${p.id}">${icon('edit','sm')} Editar</button><button class="btn sm ghost" data-act="planToggle" data-id="${p.id}">${p.active ? 'Desativar' : 'Ativar'}</button></div></div>`; }).join('')}</div>`;
A.sellPlan = () => A.sell();
A.planToggle = el => { const p = Q.plan(el.dataset.id); p.active = !p.active; Store.save(); App.render(true); };
A.planEdit = el => {
  const p = el?.dataset?.id ? Q.plan(el.dataset.id) : null;
  const o = UI.modal(`<div class="sheet-h"><h2>${p ? 'Editar' : 'Novo'} plano</h2>${closeBtn}</div>
    <div class="field"><label>Nome</label><input class="input" name="name" value="${esc(p?.name || '')}"></div>
    <div class="form-row"><div class="field"><label>Duração (meses)</label><input class="input" name="months" type="number" min="1" value="${p?.months || 1}"></div><div class="field"><label>Preço total (R$)</label><input class="input" name="price" inputmode="decimal" value="${p?.price || ''}"></div></div>
    <div class="field"><label>Benefícios (um por linha)</label><textarea class="textarea" name="perks">${esc((p?.perks || []).join('\n'))}</textarea></div>
    <div class="sheet-f"><button class="btn" data-act="close">Cancelar</button><button class="btn primary" id="sv">Salvar</button></div>`);
  $('#sv', o).onclick = () => { const f = UI.form(o); if (!f.name.trim() || !parseFloat(String(f.price).replace(',', '.'))) return UI.toast('Preencha nome e preço', 'info');
    const d = {name:f.name.trim(), months:Math.max(1, +f.months || 1), price:parseFloat(String(f.price).replace(',', '.')), perks:f.perks.split('\n').map(x => x.trim()).filter(Boolean)};
    if (p) Object.assign(p, d); else Store.d.plans.push({id:uid('p'), active:true, ...d}); Store.save(); UI.close(o); UI.toast('Plano salvo'); App.render(true); };
};

/* ---------- FINANCEIRO ---------- */
function finTable() {
  const f = St.fin; let L = Store.d.payments.slice().sort((a,b) => b.due.localeCompare(a.due));
  if (f.f !== 'todos') L = L.filter(p => Q.payStatus(p).k === f.f);
  if (f.q) { const q = f.q.toLowerCase(); L = L.filter(p => Q.user(p.studentId)?.name.toLowerCase().includes(q)); }
  if (!L.length) return `<div class="card">${UI.empty('wallet','Nada por aqui.')}</div>`;
  return `<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Aluno</th><th>Descrição</th><th>Vencimento</th><th>Valor</th><th>Status</th><th></th></tr></thead><tbody>${L.slice(0,80).map(p => { const s = Q.user(p.studentId), ps = Q.payStatus(p); return `<tr><td class="main"><b>${esc(s?.name)}</b></td><td data-l="Descrição">${esc(p.desc)}</td><td data-l="Vencimento">${fmtD(p.due)}</td><td data-l="Valor"><b class="num">${brl(p.amount)}</b></td><td data-l="Status"><span class="badge ${ps.c}">${ps.label}</span></td><td>${p.paidAt ? `<span class="muted small">${p.method}</span>` : `<div class="row" style="gap:6px;justify-content:flex-end"><a class="btn sm" target="_blank" rel="noopener" href="${UI.wa(s.phone, 'Olá ' + firstName(s.name) + ', identificamos uma cobrança em aberto de ' + brl(p.amount) + ' (' + p.desc + '). Podemos ajudar?')}">${icon('phone','sm')}</a><button class="btn sm primary" data-act="markPaid" data-id="${p.id}">Baixar</button></div>`}</td></tr>`; }).join('')}</tbody></table></div><div class="muted small" style="margin-top:8px">Mostrando ${Math.min(80, L.length)} de ${L.length}</div>`;
}
Pages.staff.financeiro = () => {
  const T = today(), pays = Store.d.payments, mk = monthKey(T);
  const received = Q.revenue(mk), open = pays.filter(p => Q.payStatus(p).k === 'pendente').reduce((a,p) => a + p.amount, 0), late = pays.filter(p => Q.payStatus(p).k === 'atrasado'), lateSum = late.reduce((a,p) => a + p.amount, 0);
  const paidMonth = pays.filter(p => p.paidAt && p.paidAt.startsWith(mk));
  const months = Array.from({length:6}, (_, i) => { const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - (5-i)); return `${d.getFullYear()}-${pad(d.getMonth()+1)}`; });
  const byMethod = ['PIX','Cartão','Dinheiro','Boleto'].map(m => ({l:m, v:paidMonth.filter(p => p.method === m).length}));
  return UI.head('Financeiro', 'Cobranças, recebimentos e vendas de planos', `<button class="btn primary" data-act="sell">${icon('tag','sm')} Nova venda</button>`) + `<div class="stack">
    <div class="kpis k4"><div class="kpi"><div class="l">Recebido no mês</div><div class="v">${brl(received)}</div></div><div class="kpi"><div class="l">A receber</div><div class="v">${brl(open)}</div></div><div class="kpi"><div class="l">Em atraso</div><div class="v" style="color:var(--bad)">${brl(lateSum)}</div><div class="d">${late.length} cobrança(s)</div></div><div class="kpi"><div class="l">Ticket médio</div><div class="v">${brl(paidMonth.length ? received / paidMonth.length : 0)}</div></div></div>
    <div class="grid split-eq"><div class="card"><div class="card-h"><h3>Receita mensal</h3></div>${barChart(months.map(m => Math.round(Q.revenue(m))), months.map(m => MONTHS[+m.slice(5)-1].slice(0,3)), {hi:5, fmt:v => v >= 1000 ? (v/1000).toFixed(1) + 'k' : v})}</div><div class="card"><div class="card-h"><h3>Formas de pagamento (mês)</h3></div>${donut(byMethod)}</div></div>
    <div><div class="toolbar"><div class="search">${icon('search','sm')}<input class="input" placeholder="Buscar aluno" data-in="finF" data-k="q" value="${esc(St.fin.q)}"></div></div>
    <div class="chips" style="margin-bottom:12px">${[['todos','Todas'],['pago','Pagas'],['pendente','Pendentes'],['atrasado','Atrasadas']].map(([k, l]) => `<button class="chip ${St.fin.f===k?'on':''}" data-act="finChip" data-v="${k}">${l}</button>`).join('')}</div>
    <div id="fin-list">${finTable()}</div></div></div>`;
};
I.finF = el => { St.fin[el.dataset.k] = el.value; $('#fin-list').innerHTML = finTable(); };
A.finChip = el => { St.fin.f = el.dataset.v; App.render(true); };

/* ---------- TREINOS (lista) ---------- */
Pages.staff.treinos = () => {
  const u = me(), tab = St.trTab, q = St.trQ.toLowerCase();
  let body;
  if (tab === 'modelos') body = `<div class="grid g3">${Q.templates().filter(w => w.name.toLowerCase().includes(q)).map(w => `<div class="card"><div class="row"><div class="wk-letter">${icon('copy')}</div><div class="grow"><h3>${esc(w.name)}</h3><div class="muted small">${esc(w.focus)}</div></div></div><div class="muted small" style="margin:10px 0">${w.items.length} exercícios · ~${Q.estMin(w)} min</div><div class="row wrap" style="gap:8px"><button class="btn sm primary" data-act="applyTplTo" data-id="${w.id}">Atribuir</button><a class="btn sm" href="#/staff/treino/${w.id}">${icon('edit','sm')}</a><button class="btn sm danger" data-act="wkDel" data-id="${w.id}">${icon('trash','sm')}</button></div></div>`).join('')}</div>`;
  else { const ids = new Set(Q.myStudents(u).map(s => s.id)); const L = Store.d.workouts.filter(w => !w.tpl && (isAdmin() || ids.has(w.studentId)) && (Q.user(w.studentId)?.name.toLowerCase().includes(q) || w.name.toLowerCase().includes(q)));
    body = L.length ? `<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Aluno</th><th>Treino</th><th>Dias</th><th>Exercícios</th><th></th></tr></thead><tbody>${L.slice(0,100).map(w => { const s = Q.user(w.studentId); return `<tr class="click" data-act="go" data-to="#/staff/treino/${w.id}"><td class="main"><b>${esc(s?.name)}</b></td><td data-l="Treino">${esc(w.name)}</td><td data-l="Dias">${w.days.map(d => WD[d]).join(', ') || '—'}</td><td data-l="Exercícios">${w.items.length}</td><td class="hide-m td">${icon('chevR','sm')}</td></tr>`; }).join('')}</tbody></table></div>` : `<div class="card">${UI.empty('dumbbell','Nenhum treino encontrado.')}</div>`; }
  return UI.head('Treinos', 'Monte, indique e acompanhe treinos', `<a class="btn primary" href="#/staff/treino/new">${icon('plus','sm')} Montar treino</a>`) +
    `<div class="row between wrap" style="gap:10px"><div class="tabs"><button class="${tab==='modelos'?'on':''}" data-act="tab" data-k="trTab" data-v="modelos">Modelos</button><button class="${tab==='alunos'?'on':''}" data-act="tab" data-k="trTab" data-v="alunos">Treinos dos alunos</button></div><div class="search" style="min-width:220px">${icon('search','sm')}<input class="input" placeholder="Buscar…" data-in="trF" value="${esc(St.trQ)}"></div></div>` + `<div id="tr-list">${body}</div>`;
};
I.trF = el => { St.trQ = el.value; const keep = el.selectionStart; App.render(true); const n = $('[data-in="trF"]'); n.focus(); n.setSelectionRange(keep, keep); };
A.wkDel = el => { const w = Q.workout(el.dataset.id); UI.confirm(`Excluir <b>${esc(w.name)}</b>${w.studentId ? ' de ' + esc(Q.user(w.studentId).name) : ''}?`, () => { Store.d.workouts = Store.d.workouts.filter(x => x.id !== w.id); Store.save(); UI.toast('Treino excluído', 'trash'); App.render(true); }, {danger:true, label:'Excluir'}); };
function cloneTo(tplId, studentId) {
  const t = Q.workout(tplId), n = JSON.parse(JSON.stringify(t)); Object.assign(n, {id:uid('w'), tpl:false, studentId, createdBy:me().id, createdAt:today(), days:[]}); Store.d.workouts.push(n); Store.save(); return n;
}
A.applyTpl = el => { const sid = el.dataset.id;
  const o = UI.modal(`<div class="sheet-h"><h2>Aplicar modelo</h2>${closeBtn}</div><div class="list">${Q.templates().map(t => `<button class="item" data-pick="${t.id}"><div class="wk-letter" style="width:40px;height:40px">${icon('copy','sm')}</div><div class="grow"><div class="t">${esc(t.name)}</div><div class="s">${t.items.length} exercícios · ${esc(t.focus)}</div></div>${icon('chevR','sm')}</button>`).join('')}</div>`);
  o.addEventListener('click', e => { const b = e.target.closest('[data-pick]'); if (!b) return; const n = cloneTo(b.dataset.pick, sid); UI.close(o); UI.toast('Modelo aplicado — ajuste os detalhes'); location.hash = '#/staff/treino/' + n.id; });
};
A.applyTplTo = el => { const t = Q.workout(el.dataset.id), L = Q.myStudents(me()).sort((a,b) => a.name.localeCompare(b.name));
  const o = UI.modal(`<div class="sheet-h"><h2>Atribuir "${esc(t.name)}"</h2>${closeBtn}</div><div class="field"><label>Aluno</label><select class="select" name="sid">${selOpts(L, '', s => s.name)}</select></div><div class="sheet-f"><button class="btn" data-act="close">Cancelar</button><button class="btn primary" id="sv">Atribuir e editar</button></div>`);
  $('#sv', o).onclick = () => { const n = cloneTo(t.id, UI.form(o).sid); UI.close(o); location.hash = '#/staff/treino/' + n.id; };
};

/* ---------- MONTADOR DE TREINO ---------- */
Pages.staff.treino = (id) => {
  const qs = new URLSearchParams(location.hash.split('?')[1] || ''), key = id + '|' + qs.toString();
  if (!St.draft || St.draft.key !== key) {
    const w = id !== 'new' ? Q.workout(id) : null;
    St.draft = w ? {key, id:w.id, tpl:w.tpl, studentId:w.studentId, name:w.name, focus:w.focus, days:[...w.days], items:JSON.parse(JSON.stringify(w.items))}
      : {key, id:null, tpl:qs.get('tpl') === '1', studentId:qs.get('aluno') || '', name:'', focus:'', days:[], items:[]};
  }
  const d = St.draft, studs = Q.myStudents(me()).sort((a,b) => a.name.localeCompare(b.name));
  const items = d.items.map((it, i) => { const ex = Q.ex(it.exId); return `<div class="builder-ex"><div class="row"><span class="ex-n">${i+1}</span><div class="grow"><b>${esc(ex.name)}</b><div class="muted tiny">${ex.group} · ${ex.equip}</div></div>
    <button class="icon-btn" style="width:34px;height:34px" data-act="drMove" data-i="${i}" data-n="-1" aria-label="Subir">${icon('arrowUp','sm')}</button><button class="icon-btn" style="width:34px;height:34px" data-act="drMove" data-i="${i}" data-n="1" aria-label="Descer">${icon('arrowDown','sm')}</button><button class="icon-btn" style="width:34px;height:34px" data-act="drRm" data-i="${i}" aria-label="Remover">${icon('trash','sm')}</button></div>
    <div class="mini-in">${[['sets','Séries',it.sets],['reps','Reps',it.reps],['rest','Desc. (s)',it.rest],['load','Carga (kg)',it.load]].map(([f, l, v]) => `<div><label>${l}</label><input class="input" data-in="drField" data-i="${i}" data-f="${f}" value="${esc(v)}"></div>`).join('')}</div>
    <input class="input" style="margin-top:8px;min-height:38px" placeholder="Recado para o aluno (opcional)" data-in="drField" data-i="${i}" data-f="note" value="${esc(it.note || '')}"></div>`; }).join('');
  return `<div class="row" style="margin-bottom:12px"><a class="icon-btn" href="${d.studentId ? '#/staff/aluno/' + d.studentId : '#/staff/treinos'}" aria-label="Voltar">${icon('chevL')}</a><span class="muted small">Voltar</span></div>
  ${UI.head(d.id ? 'Editar treino' : 'Montar treino', d.tpl ? 'Modelo reutilizável' : 'Prescrição individual')}
  <div class="grid split">
    <div class="stack">
      <div class="card"><div class="field"><label>Nome do treino</label><input class="input" data-in="drMeta" data-f="name" placeholder="Ex.: Treino A — Peito e Tríceps" value="${esc(d.name)}"></div>
        <div class="form-row"><div class="field"><label>Foco</label><input class="input" data-in="drMeta" data-f="focus" placeholder="Peito · Tríceps" value="${esc(d.focus)}"></div>
        ${d.tpl ? '<div class="field"><label>Tipo</label><input class="input" value="Modelo" disabled></div>' : `<div class="field"><label>Aluno</label><select class="select" data-in="drMeta" data-f="studentId"><option value="">Selecione…</option>${selOpts(studs, d.studentId, s => s.name)}</select></div>`}</div>
        <div class="field"><label>Dias da semana</label><div class="chips">${[1,2,3,4,5,6,0].map(n => `<button class="chip ${d.days.includes(n) ? 'on' : ''}" data-act="drDay" data-n="${n}">${WD[n]}</button>`).join('')}</div></div></div>
      <div class="card"><div class="card-h"><h3>Exercícios (${d.items.length})</h3><button class="btn sm primary" data-act="drAdd">${icon('plus','sm')} Adicionar</button></div>${items || UI.empty('dumbbell','Adicione exercícios da biblioteca.')}</div>
    </div>
    <div class="stack"><div class="card"><h3 style="margin-bottom:8px">Resumo</h3><div class="small muted" style="line-height:1.9">${d.items.length} exercícios<br>${d.items.reduce((a, i) => a + (+i.sets || 0), 0)} séries no total<br>~${Q.estMin({items:d.items.map(i => ({sets:+i.sets || 0, rest:+i.rest || 0}))})} minutos<br>${[...new Set(d.items.map(i => Q.ex(i.exId).group))].join(', ') || '—'}</div></div>
      ${d.tpl ? '' : `<button class="btn block" data-act="drTplLoad">${icon('copy','sm')} Carregar de um modelo</button>`}</div>
  </div>
  <div class="sticky-bar" style="margin-top:16px"><button class="btn primary block" data-act="drSave">${icon('check','sm')} Salvar treino</button></div>`;
};
I.drMeta = el => { St.draft[el.dataset.f] = el.value; };
I.drField = el => { const it = St.draft.items[el.dataset.i], f = el.dataset.f; it[f] = ['sets','rest','load'].includes(f) ? (parseFloat(String(el.value).replace(',', '.')) || 0) : el.value; };
A.drDay = el => { const n = +el.dataset.n, a = St.draft.days; a.includes(n) ? a.splice(a.indexOf(n), 1) : a.push(n); el.classList.toggle('on'); };
A.drRm = el => { St.draft.items.splice(+el.dataset.i, 1); App.render(true); };
A.drMove = el => { const a = St.draft.items, i = +el.dataset.i, j = i + +el.dataset.n; if (j < 0 || j >= a.length) return; [a[i], a[j]] = [a[j], a[i]]; App.render(true); };
A.drTplLoad = () => {
  const o = UI.modal(`<div class="sheet-h"><h2>Carregar modelo</h2>${closeBtn}</div><div class="list">${Q.templates().map(t => `<button class="item" data-pick="${t.id}"><div class="grow"><div class="t">${esc(t.name)}</div><div class="s">${t.items.length} exercícios</div></div>${icon('chevR','sm')}</button>`).join('')}</div>`);
  o.addEventListener('click', e => { const b = e.target.closest('[data-pick]'); if (!b) return; const t = Q.workout(b.dataset.pick); Object.assign(St.draft, {name:St.draft.name || t.name, focus:t.focus, items:JSON.parse(JSON.stringify(t.items))}); UI.close(o); App.render(true); });
};
function pickList() {
  const f = St.exq; return Store.d.exercises.filter(e => (!f.g || e.group === f.g) && e.name.toLowerCase().includes(f.q.toLowerCase())).map(e => {
    const n = St.draft ? St.draft.items.filter(i => i.exId === e.id).length : 0;
    return `<button class="item" data-pickex="${e.id}"><div class="avatar sm">${icon('dumbbell','sm')}</div><div class="grow"><div class="t">${esc(e.name)}</div><div class="s">${e.group} · ${e.equip} · ${e.level}</div></div>${n ? `<span class="badge ok">${icon('check','sm')} ${n}</span>` : icon('plus','sm')}</button>`; }).join('') || UI.empty('search','Nenhum exercício');
}
A.drAdd = () => {
  St.exq = {q:'', g:''};
  const o = UI.modal(`<div class="sheet-h"><h2>Biblioteca de exercícios</h2>${closeBtn}</div>
    <div class="search">${icon('search','sm')}<input class="input" placeholder="Buscar exercício" data-in="pickQ"></div>
    <div class="chips" style="margin-top:10px"><button class="chip on" data-act="pickG" data-g="">Todos</button>${GROUPS.map(g => `<button class="chip" data-act="pickG" data-g="${g}">${g}</button>`).join('')}</div>
    <div class="pick" id="pick">${pickList()}</div><div class="sheet-f"><button class="btn primary" id="dn">Concluir</button></div>`, {onClose: () => App.render(true)});
  o.addEventListener('click', e => { const b = e.target.closest('[data-pickex]'); if (!b) return; const ex = Q.ex(b.dataset.pickex); const last = St.draft.items.length ? null : null;
    St.draft.items.push({exId:ex.id, sets:ex.group === 'Cardio' ? 1 : 3, reps:ex.group === 'Cardio' ? '10 min' : '12', rest:ex.group === 'Cardio' ? 0 : 60, load:0, note:''}); $('#pick', o).innerHTML = pickList(); UI.toast('Adicionado: ' + ex.name); });
  $('#dn', o).onclick = () => UI.close(o);
};
I.pickQ = el => { St.exq.q = el.value; $('#pick').innerHTML = pickList(); };
A.pickG = el => { St.exq.g = el.dataset.g; $$('.overlay .chips .chip').forEach(c => c.classList.toggle('on', c === el)); $('#pick').innerHTML = pickList(); };
A.drSave = () => {
  const d = St.draft; if (!d.name.trim()) return UI.toast('Dê um nome ao treino', 'info'); if (!d.tpl && !d.studentId) return UI.toast('Selecione o aluno', 'info'); if (!d.items.length) return UI.toast('Adicione ao menos um exercício', 'info');
  const rec = {name:d.name.trim(), focus:d.focus.trim() || [...new Set(d.items.map(i => Q.ex(i.exId).group))].join(' · '), days:d.days, items:d.items, studentId:d.tpl ? null : d.studentId, tpl:d.tpl};
  if (d.id) { Object.assign(Q.workout(d.id), rec); } else Store.d.workouts.push({id:uid('w'), createdBy:me().id, createdAt:today(), ...rec});
  Store.save(); UI.toast('Treino salvo — o aluno já pode ver no app'); const to = d.tpl ? '#/staff/treinos' : '#/staff/aluno/' + d.studentId; St.draft = null; St.stuTab = 'treinos'; location.hash = to;
};

/* ---------- BIBLIOTECA DE EXERCÍCIOS ---------- */
function exGrid() {
  const f = St.exq, L = Store.d.exercises.filter(e => (!f.g || e.group === f.g) && e.name.toLowerCase().includes(f.q.toLowerCase()));
  return L.length ? `<div class="grid g3">${L.map(e => `<div class="card"><div class="row"><div class="avatar">${icon('dumbbell','sm')}</div><div class="grow"><h3>${esc(e.name)}</h3><div class="muted small">${e.group} · ${e.equip}</div></div><span class="chip">${e.level}</span></div><p class="small muted" style="margin:10px 0;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">${esc(e.steps[0])}</p><div class="row"><button class="btn sm" data-act="exView" data-id="${e.id}">Ver detalhes</button><button class="btn sm ghost" data-act="exEdit" data-id="${e.id}">${icon('edit','sm')}</button></div></div>`).join('')}</div>` : `<div class="card">${UI.empty('search','Nenhum exercício encontrado.')}</div>`;
}
Pages.staff.exercicios = () => UI.head('Exercícios', `${Store.d.exercises.length} exercícios na biblioteca`, `<button class="btn primary" data-act="exEdit">${icon('plus','sm')} Novo exercício</button>`) +
  `<div class="toolbar"><div class="search">${icon('search','sm')}<input class="input" placeholder="Buscar exercício" data-in="exF" value="${esc(St.exq.q)}"></div></div><div class="chips" style="margin-bottom:14px"><button class="chip ${!St.exq.g ? 'on' : ''}" data-act="exG" data-g="">Todos</button>${GROUPS.map(g => `<button class="chip ${St.exq.g === g ? 'on' : ''}" data-act="exG" data-g="${g}">${g}</button>`).join('')}</div><div id="ex-list">${exGrid()}</div>`;
I.exF = el => { St.exq.q = el.value; $('#ex-list').innerHTML = exGrid(); };
A.exG = el => { St.exq.g = el.dataset.g; App.render(true); };
A.exView = el => { const e = Q.ex(el.dataset.id);
  UI.modal(`<div class="sheet-h"><h2>${esc(e.name)}</h2>${closeBtn}</div><div class="ex-pic">${icon('dumbbell','lg')}<span class="tag chip">${e.group} · ${e.equip}</span></div><ol class="steps">${e.steps.map(s => `<li>${esc(s)}</li>`).join('')}</ol>${e.tips.map(t => `<div class="tip">${icon('lightbulb','sm')}<span>${esc(t)}</span></div>`).join('')}`); };
A.exEdit = el => {
  const e = el?.dataset?.id ? Q.ex(el.dataset.id) : null;
  const o = UI.modal(`<div class="sheet-h"><h2>${e ? 'Editar' : 'Novo'} exercício</h2>${closeBtn}</div>
    <div class="field"><label>Nome</label><input class="input" name="name" value="${esc(e?.name || '')}"></div>
    <div class="form-row"><div class="field"><label>Grupo muscular</label><select class="select" name="group">${GROUPS.map(g => `<option ${e?.group === g ? 'selected' : ''}>${g}</option>`).join('')}</select></div><div class="field"><label>Equipamento</label><input class="input" name="equip" value="${esc(e?.equip || '')}"></div></div>
    <div class="field"><label>Nível</label><select class="select" name="level">${['Iniciante','Intermediário','Avançado'].map(g => `<option ${e?.level === g ? 'selected' : ''}>${g}</option>`).join('')}</select></div>
    <div class="field"><label>Passo a passo (um por linha)</label><textarea class="textarea" name="steps">${esc((e?.steps || []).join('\n'))}</textarea></div>
    <div class="field"><label>Dicas (uma por linha)</label><textarea class="textarea" name="tips">${esc((e?.tips || []).join('\n'))}</textarea></div>
    <div class="sheet-f">${e ? `<button class="btn danger" id="dl">${icon('trash','sm')}</button>` : ''}<button class="btn" data-act="close">Cancelar</button><button class="btn primary" id="sv">Salvar</button></div>`);
  const lines = t => t.split('\n').map(x => x.trim()).filter(Boolean);
  $('#sv', o).onclick = () => { const f = UI.form(o); if (!f.name.trim()) return UI.toast('Informe o nome', 'info'); const d = {name:f.name.trim(), group:f.group, equip:f.equip || '—', level:f.level, steps:lines(f.steps), tips:lines(f.tips)}; if (!d.steps.length) return UI.toast('Descreva ao menos um passo', 'info');
    if (e) Object.assign(e, d); else Store.d.exercises.push({id:uid('e'), ...d}); Store.save(); UI.close(o); UI.toast('Exercício salvo'); App.render(true); };
  if (e) $('#dl', o).onclick = () => { if (Store.d.workouts.some(w => w.items.some(i => i.exId === e.id))) return UI.toast('Exercício em uso em treinos', 'lock'); Store.d.exercises = Store.d.exercises.filter(x => x.id !== e.id); Store.save(); UI.close(o); UI.toast('Exercício removido', 'trash'); App.render(true); };
};

/* ---------- AULAS ---------- */
Pages.staff.aulas = () => {
  const T = today(); if (!St.aulasDay) St.aulasDay = T; const day = St.aulasDay, tab = St.aulasTab;
  const strip = Array.from({length:10}, (_, i) => addDays(T, i)).map(d => `<button class="chip ${d === day ? 'on' : ''}" data-act="aulasDay" data-d="${d}">${d === T ? 'Hoje' : WD[wday(d)] + ' ' + dt(d).getDate()}</button>`).join('');
  const dayView = `<div class="chips" style="margin-bottom:14px">${strip}</div><div class="grid g2">${Q.classesOn(day).map(c => { const b = Q.bookedOn(c.id, day); return `<div class="card"><div class="card-h"><div><h3>${c.name}</h3><span class="muted small">${c.time} · ${c.dur} min · ${c.room}</span></div><span class="badge ${b.length >= c.cap ? 'bad' : ''}">${b.length}/${c.cap}</span></div><div class="row small" style="margin-bottom:10px"><div class="avatar sm">${initials(Q.user(c.instructorId)?.name || '?')}</div>${esc(Q.user(c.instructorId)?.name)}</div><div class="progress" style="margin-bottom:12px"><i style="width:${b.length / c.cap * 100}%"></i></div><button class="btn sm" data-act="attendees" data-c="${c.id}" data-d="${day}">${icon('users','sm')} Ver inscritos</button></div>`; }).join('') || `<div class="card">${UI.empty('calendar','Sem aulas neste dia.')}</div>`}</div>`;
  const grade = `<div class="grid g2">${WDL.map((n, i) => ({n, i, cs: Store.d.classes.filter(c => c.days.includes(i)).sort((a,b) => a.time.localeCompare(b.time))})).filter(x => x.cs.length).map(x => `<div class="card"><h3 style="margin-bottom:6px">${x.n}</h3><div class="list">${x.cs.map(c => `<button class="item" data-act="classEdit" data-id="${c.id}"><b class="num" style="width:48px">${c.time}</b><div class="grow"><div class="t">${c.name}</div><div class="s">${esc(Q.user(c.instructorId)?.name)} · ${c.room} · ${c.cap} vagas</div></div>${icon('edit','sm')}</button>`).join('')}</div></div>`).join('')}</div>`;
  return UI.head('Aulas e agenda', 'Grade semanal e reservas', `<button class="btn primary" data-act="classEdit">${icon('plus','sm')} Nova aula</button>`) + `<div class="tabs"><button class="${tab==='dia'?'on':''}" data-act="tab" data-k="aulasTab" data-v="dia">Por dia</button><button class="${tab==='grade'?'on':''}" data-act="tab" data-k="aulasTab" data-v="grade">Grade semanal</button></div>` + (tab === 'dia' ? dayView : grade);
};
A.aulasDay = el => { St.aulasDay = el.dataset.d; App.render(true); };
A.attendees = el => { const c = Q.cls(el.dataset.c), b = Q.bookedOn(c.id, el.dataset.d);
  const o = UI.modal(`<div class="sheet-h"><h2>${c.name} · ${c.time}</h2>${closeBtn}</div><p class="muted small" style="margin-bottom:8px">${fmtD(el.dataset.d)} · ${b.length} de ${c.cap} vagas</p><div class="list">${b.map(x => { const s = Q.user(x.studentId); return `<div class="item"><div class="avatar sm">${initials(s.name)}</div><div class="grow"><div class="t">${esc(s.name)}</div></div><button class="btn sm ghost" data-rm="${x.id}">${icon('x','sm')}</button></div>`; }).join('') || UI.empty('users','Nenhum inscrito')}</div>`);
  o.addEventListener('click', e => { const r = e.target.closest('[data-rm]'); if (!r) return; Store.d.bookings = Store.d.bookings.filter(x => x.id !== r.dataset.rm); Store.save(); UI.close(o); UI.toast('Reserva removida'); App.render(true); });
};
A.classEdit = el => {
  const c = el?.dataset?.id ? Q.cls(el.dataset.id) : null;
  const o = UI.modal(`<div class="sheet-h"><h2>${c ? 'Editar' : 'Nova'} aula</h2>${closeBtn}</div>
    <div class="field"><label>Nome</label><input class="input" name="name" value="${esc(c?.name || '')}"></div>
    <div class="field"><label>Professor</label><select class="select" name="instructorId">${selOpts(Q.profs(), c?.instructorId, p => p.name)}</select></div>
    <div class="form-row"><div class="field"><label>Horário</label><input class="input" type="time" name="time" value="${c?.time || '18:00'}"></div><div class="field"><label>Duração (min)</label><input class="input" type="number" name="dur" value="${c?.dur || 50}"></div></div>
    <div class="form-row"><div class="field"><label>Vagas</label><input class="input" type="number" name="cap" value="${c?.cap || 20}"></div><div class="field"><label>Sala</label><input class="input" name="room" value="${esc(c?.room || 'Studio')}"></div></div>
    <div class="field"><label>Dias</label><div class="chips" id="days">${[1,2,3,4,5,6,0].map(n => `<button class="chip ${c?.days.includes(n) ? 'on' : ''}" data-d="${n}" type="button">${WD[n]}</button>`).join('')}</div></div>
    <div class="sheet-f">${c ? `<button class="btn danger" id="dl">${icon('trash','sm')}</button>` : ''}<button class="btn" data-act="close">Cancelar</button><button class="btn primary" id="sv">Salvar</button></div>`);
  $('#days', o).addEventListener('click', e => e.target.closest('.chip')?.classList.toggle('on'));
  $('#sv', o).onclick = () => { const f = UI.form(o), days = $$('#days .chip.on', o).map(x => +x.dataset.d); if (!f.name.trim() || !days.length) return UI.toast('Informe nome e dias', 'info');
    const d = {name:f.name.trim(), instructorId:f.instructorId, time:f.time, dur:+f.dur, cap:+f.cap, room:f.room, days}; if (c) Object.assign(c, d); else Store.d.classes.push({id:uid('cl'), ...d}); Store.save(); UI.close(o); UI.toast('Aula salva'); App.render(true); };
  if (c) $('#dl', o).onclick = () => { Store.d.classes = Store.d.classes.filter(x => x.id !== c.id); Store.d.bookings = Store.d.bookings.filter(b => b.classId !== c.id); Store.save(); UI.close(o); UI.toast('Aula removida', 'trash'); App.render(true); };
};

/* ---------- CHECK-INS ---------- */
Pages.staff.checkins = () => {
  const T = today(), L = Store.d.checkins.filter(c => iso(new Date(c.ts)) === T).sort((a,b) => b.ts - a.ts);
  const hrs = Array.from({length:12}, (_, i) => i + 6), by = hrs.map(h => L.filter(c => new Date(c.ts).getHours() === h).length);
  return UI.head('Check-ins', `Controle de acesso — ${fmtD(T)}`, `<button class="btn primary" data-act="checkinAdd">${icon('qr','sm')} Registrar entrada</button>`) + `<div class="stack">
    <div class="kpis"><div class="kpi"><div class="l">Entradas hoje</div><div class="v">${L.length}</div></div><div class="kpi"><div class="l">Alunos únicos</div><div class="v">${new Set(L.map(c => c.studentId)).size}</div></div></div>
    <div class="grid split-eq"><div class="card"><div class="card-h"><h3>Fluxo por hora</h3></div>${barChart(by, hrs.map(h => h + 'h'), {hi:by.indexOf(Math.max(...by))})}</div>
    <div class="card"><div class="card-h"><h3>Últimas entradas</h3></div><div class="list">${L.slice(0,12).map(c => { const s = Q.user(c.studentId); return `<a class="item" href="#/staff/aluno/${s.id}"><div class="avatar sm">${initials(s.name)}</div><div class="grow"><div class="t">${esc(s.name)}</div><div class="s">${c.method}</div></div><b class="num">${fmtTime(c.ts)}</b></a>`; }).join('') || UI.empty('qr','Nenhuma entrada ainda.')}</div></div></div></div>`;
};
A.checkinAdd = () => {
  const o = UI.modal(`<div class="sheet-h"><h2>Registrar entrada</h2>${closeBtn}</div><div class="search">${icon('search','sm')}<input class="input" placeholder="Nome do aluno" data-in="ckQ"></div><div class="pick" id="ckl">${ckList('')}</div>`);
  o.addEventListener('click', e => { const b = e.target.closest('[data-ck]'); if (!b) return; const s = Q.user(b.dataset.ck), st = Q.status(s);
    if (['vencido','bloqueado'].includes(st.k)) return UI.toast(`Acesso negado: ${st.label.toLowerCase()}`, 'lock');
    Store.d.checkins.push({id:uid('c'), studentId:s.id, ts:Date.now(), method:'Recepção'}); Store.save(); UI.close(o); UI.toast(`Entrada liberada — ${firstName(s.name)}`); App.render(true); });
};
const ckList = q => Q.students().filter(s => s.name.toLowerCase().includes(q.toLowerCase())).slice(0, 12).map(s => `<button class="item" data-ck="${s.id}"><div class="avatar sm">${initials(s.name)}</div><div class="grow"><div class="t">${esc(s.name)}</div><div class="s">${planName(s.planId)}</div></div>${sBadge(s)}</button>`).join('') || UI.empty('search', 'Ninguém encontrado');
I.ckQ = el => { $('#ckl').innerHTML = ckList(el.value); };

/* ---------- PROFESSORES ---------- */
Pages.staff.professores = () => UI.head('Equipe', 'Professores e administradores', `<button class="btn primary" data-act="profEdit">${icon('plus','sm')} Novo membro</button>`) + `<div class="grid g3">${Q.staff().map(p => `<div class="card"><div class="row"><div class="avatar lg">${initials(p.name)}</div><div class="grow"><h3>${esc(p.name)}</h3><div class="muted small">${esc(p.title || '')}</div><span class="badge" style="margin-top:6px">${p.role === 'admin' ? 'Administrador' : 'Professor'}</span></div></div><div class="divider"></div><div class="row between small"><span class="muted">${icon('users','sm')} ${Q.students().filter(s => s.instructorId === p.id).length} alunos</span><span class="muted">${Store.d.classes.filter(c => c.instructorId === p.id).length} aulas</span></div><div class="small muted" style="margin:6px 0 12px">${esc(p.email)}<br>${esc(p.phone)}</div><button class="btn sm" data-act="profEdit" data-id="${p.id}">${icon('edit','sm')} Editar</button></div>`).join('')}</div>`;
A.profEdit = el => {
  const p = el?.dataset?.id ? Q.user(el.dataset.id) : null;
  const o = UI.modal(`<div class="sheet-h"><h2>${p ? 'Editar' : 'Novo'} membro</h2>${closeBtn}</div>
    <div class="field"><label>Nome</label><input class="input" name="name" value="${esc(p?.name || '')}"></div>
    <div class="form-row"><div class="field"><label>E-mail</label><input class="input" name="email" value="${esc(p?.email || '')}"></div><div class="field"><label>Telefone</label><input class="input" name="phone" value="${esc(p?.phone || '')}"></div></div>
    <div class="form-row"><div class="field"><label>Especialidade</label><input class="input" name="title" value="${esc(p?.title || '')}"></div><div class="field"><label>Perfil</label><select class="select" name="role"><option value="prof" ${p?.role === 'prof' ? 'selected' : ''}>Professor</option><option value="admin" ${p?.role === 'admin' ? 'selected' : ''}>Administrador</option></select></div></div>
    <div class="sheet-f">${p && p.id !== me().id ? `<button class="btn danger" id="dl">${icon('trash','sm')}</button>` : ''}<button class="btn" data-act="close">Cancelar</button><button class="btn primary" id="sv">Salvar</button></div>`);
  $('#sv', o).onclick = () => { const f = UI.form(o); if (!f.name.trim() || !f.email.trim()) return UI.toast('Preencha nome e e-mail', 'info'); if (p) Object.assign(p, f); else Store.d.users.push({id:uid('u_p'), pass:'123456', ...f}); Store.save(); UI.close(o); UI.toast('Membro salvo'); App.render(true); };
  if (p) $('#dl', o)?.addEventListener('click', () => { if (Q.students().some(s => s.instructorId === p.id)) return UI.toast('Reatribua os alunos antes de remover', 'lock'); Store.d.users = Store.d.users.filter(x => x.id !== p.id); Store.save(); UI.close(o); UI.toast('Membro removido', 'trash'); App.render(true); });
};

/* ---------- AVISOS ---------- */
Pages.staff.avisos = () => UI.head('Avisos', 'Comunicados exibidos no app dos alunos', `<button class="btn primary" data-act="annNew">${icon('plus','sm')} Novo aviso</button>`) + `<div class="stack">${Store.d.announcements.slice().sort((a,b) => b.date.localeCompare(a.date)).map(a => `<div class="card"><div class="row between"><div><h3>${esc(a.title)}</h3><div class="muted tiny">${fmtD(a.date)} · ${esc(a.audience)}</div></div><button class="btn sm ghost" data-act="annDel" data-id="${a.id}" aria-label="Excluir">${icon('trash','sm')}</button></div><p class="small" style="margin-top:8px;color:var(--ink-2)">${esc(a.body)}</p></div>`).join('') || `<div class="card">${UI.empty('megaphone','Nenhum aviso publicado.')}</div>`}</div>`;
A.annNew = () => {
  const o = UI.modal(`<div class="sheet-h"><h2>Novo aviso</h2>${closeBtn}</div><div class="field"><label>Título</label><input class="input" name="title"></div><div class="field"><label>Mensagem</label><textarea class="textarea" name="body"></textarea></div><div class="field"><label>Público</label><select class="select" name="audience"><option>Todos</option><option>Pro / Black</option><option>Plano Essencial</option></select></div><div class="sheet-f"><button class="btn" data-act="close">Cancelar</button><button class="btn primary" id="sv">Publicar</button></div>`);
  $('#sv', o).onclick = () => { const f = UI.form(o); if (!f.title.trim()) return UI.toast('Informe o título', 'info'); Store.d.announcements.push({id:uid('a'), date:today(), ...f}); Store.save(); UI.close(o); UI.toast('Aviso publicado'); App.render(true); };
};
A.annDel = el => { Store.d.announcements = Store.d.announcements.filter(a => a.id !== el.dataset.id); Store.save(); App.render(true); };

/* ---------- CONFIGURAÇÕES ---------- */
Pages.staff.config = () => {
  const g = Store.d.gym;
  return UI.head('Configurações') + `<div class="grid g2"><div class="card"><div class="card-h"><h3>Dados da academia</h3></div>
    <div class="field"><label>Nome</label><input class="input" name="gname" value="${esc(g.name)}" data-in="cfg" data-f="name"></div><div class="field"><label>Telefone</label><input class="input" value="${esc(g.phone)}" data-in="cfg" data-f="phone"></div><div class="field"><label>Endereço</label><input class="input" value="${esc(g.address)}" data-in="cfg" data-f="address"></div></div>
    <div class="stack"><div class="card"><div class="card-h"><h3>Dados e demonstração</h3></div><p class="small muted" style="margin-bottom:12px">Todos os dados ficam salvos apenas neste navegador (localStorage). Use as opções abaixo para exportar ou restaurar os dados fictícios.</p><div class="row wrap"><button class="btn" data-act="cfgExport">${icon('download','sm')} Exportar JSON</button><button class="btn danger" data-act="cfgReset">${icon('repeat','sm')} Restaurar demo</button></div></div>
    <div class="card"><div class="card-h"><h3>Aparência</h3></div><button class="btn" data-act="theme">${icon(UI.theme()==='dark'?'sun':'moon','sm')} Alternar tema claro/escuro</button></div></div></div>`;
};
I.cfg = el => { Store.d.gym[el.dataset.f] = el.value; Store.save(); };
A.cfgExport = () => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(Store.d, null, 2)], {type:'application/json'})); a.download = 'atlas-academia-dados.json'; a.click(); };
A.cfgReset = () => UI.confirm('Restaurar todos os dados de demonstração? Alterações feitas serão perdidas.', () => { Store.reset(); Object.keys(localStorage).filter(k => k.startsWith('atlas_run_')).forEach(k => localStorage.removeItem(k)); UI.toast('Dados restaurados', 'repeat'); App.render(true); }, {danger:true, label:'Restaurar'});

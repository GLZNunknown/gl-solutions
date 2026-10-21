/* Núcleo: store (localStorage), seletores, modal/toast, tema e delegação de eventos */
const Store = {
  KEY:'atlas_academia_v1', d:null,
  init(){ try { const r = localStorage.getItem(this.KEY); if (r) { this.d = JSON.parse(r); return; } } catch(e){} this.d = buildSeed(); this.save(); },
  save(){ try { localStorage.setItem(this.KEY, JSON.stringify(this.d)); } catch(e){} },
  reset(){ this.d = buildSeed(); this.save(); }
};
const Auth = {
  get id(){ try { return localStorage.getItem('atlas_auth'); } catch(e){ return null; } },
  set(id){ try { id ? localStorage.setItem('atlas_auth', id) : localStorage.removeItem('atlas_auth'); } catch(e){} },
  get user(){ return Store.d.users.find(u => u.id === this.id) || null; }
};

/* seletores / regras de negócio */
const Q = {
  user:id => Store.d.users.find(u => u.id === id),
  plan:id => Store.d.plans.find(p => p.id === id),
  ex:id => Store.d.exercises.find(e => e.id === id),
  cls:id => Store.d.classes.find(c => c.id === id),
  workout:id => Store.d.workouts.find(w => w.id === id),
  students:() => Store.d.users.filter(u => u.role === 'aluno'),
  staff:() => Store.d.users.filter(u => u.role !== 'aluno'),
  profs:() => Store.d.users.filter(u => u.role === 'prof' || u.role === 'admin'),
  workoutsOf:id => Store.d.workouts.filter(w => w.studentId === id),
  templates:() => Store.d.workouts.filter(w => w.tpl),
  sessionsOf:id => Store.d.sessions.filter(s => s.studentId === id).sort((a,b) => b.date.localeCompare(a.date)),
  paymentsOf:id => Store.d.payments.filter(p => p.studentId === id).sort((a,b) => b.due.localeCompare(a.due)),
  checkinsOf:id => Store.d.checkins.filter(c => c.studentId === id).sort((a,b) => b.ts - a.ts),
  measuresOf:id => (Store.d.measures[id] || []).slice().sort((a,b) => a.date.localeCompare(b.date)),
  status(u){
    if (u.blocked) return {k:'bloqueado', label:'Bloqueado', c:'bad'};
    if (!u.planId) return {k:'inativo', label:'Sem plano', c:''};
    const left = diffDays(u.end, today());
    if (left < 0) return {k:'vencido', label:'Vencido', c:'bad'};
    if (left <= 7) return {k:'vencendo', label:'Vence em ' + left + 'd', c:'warn'};
    return {k:'ativo', label:'Ativo', c:'ok'};
  },
  payStatus(p){ return p.paidAt ? {k:'pago', label:'Pago', c:'ok'} : p.due < today() ? {k:'atrasado', label:'Atrasado', c:'bad'} : {k:'pendente', label:'Pendente', c:'warn'}; },
  exerciseCount:w => w.items.length,
  estMin:w => Math.round(w.items.reduce((a,i) => a + i.sets * (45 + (i.rest||0)) / 60, 0) + 5),
  muscles:w => [...new Set(w.items.map(i => Q.ex(i.exId)?.group).filter(Boolean))],
  todayWorkout(uid, day = today()){ return Q.workoutsOf(uid).find(w => w.days.includes(wday(day))); },
  doneOn(uid, day){ return Store.d.sessions.find(s => s.studentId === uid && s.date === day); },
  streak(uid){
    const ws = Q.workoutsOf(uid); if (!ws.length) return 0;
    const planned = new Set(ws.flatMap(w => w.days)); let n = 0;
    for (let d = 0; d < 200; d++) {
      const day = addDays(today(), -d); if (!planned.has(wday(day))) continue;
      if (Q.doneOn(uid, day)) n++; else if (d > 0) break;
    }
    return n;
  },
  monthSessions:(uid, ym = monthKey(today())) => Store.d.sessions.filter(s => s.studentId === uid && s.date.startsWith(ym)).length,
  revenue:ym => Store.d.payments.filter(p => p.paidAt && p.paidAt.startsWith(ym)).reduce((a,p) => a + p.amount, 0),
  bookedOn:(cid, day) => Store.d.bookings.filter(b => b.classId === cid && b.date === day),
  myBooking:(uid, cid, day) => Store.d.bookings.find(b => b.studentId === uid && b.classId === cid && b.date === day),
  classesOn:day => Store.d.classes.filter(c => c.days.includes(wday(day))).sort((a,b) => a.time.localeCompare(b.time)),
  myStudents:u => u.role === 'admin' ? Q.students() : Q.students().filter(s => s.instructorId === u.id),
  lastLog(uid, exId){ for (const s of Q.sessionsOf(uid)) if (s.log && s.log[exId]) return s.log[exId]; return null; },
  prs(uid){
    const best = {};
    Q.sessionsOf(uid).forEach(s => s.log && Object.entries(s.log).forEach(([ex, sets]) => sets.forEach(x => { if (!best[ex] || x.l > best[ex].l) best[ex] = {l:x.l, date:s.date}; })));
    return Object.entries(best).filter(([,v]) => v.l > 0).map(([ex, v]) => ({ex:Q.ex(ex), ...v})).sort((a,b) => b.l - a.l);
  },
  badges(uid){
    const total = Q.sessionsOf(uid).length, st = Q.streak(uid), m = Q.measuresOf(uid);
    const early = Store.d.checkins.filter(c => c.studentId === uid && new Date(c.ts).getHours() < 8).length;
    return [
      {n:'Primeiro treino', i:'play', ok: total >= 1},
      {n:'10 treinos', i:'dumbbell', ok: total >= 10},
      {n:'25 treinos', i:'trophy', ok: total >= 25},
      {n:'Sequência de 5', i:'flame', ok: st >= 5},
      {n:'Sequência de 10', i:'zap', ok: st >= 10},
      {n:'Madrugador', i:'sun', ok: early >= 5},
      {n:'Mês completo', i:'calendar', ok: Q.monthSessions(uid) >= 12},
      {n:'Evolução', i:'target', ok: m.length >= 3}
    ];
  },
  notifications(u){
    const out = [];
    Store.d.announcements.slice().sort((a,b) => b.date.localeCompare(a.date)).forEach(a => out.push({t:a.title, s:a.body, d:a.date, i:'megaphone'}));
    if (u.role === 'aluno') {
      const left = diffDays(u.end, today());
      if (left <= 7) out.unshift({t: left < 0 ? 'Plano vencido' : 'Seu plano vence em breve', s: left < 0 ? 'Renove na recepção para continuar treinando.' : `Faltam ${left} dia(s) para o vencimento.`, d:today(), i:'wallet'});
      const nb = Store.d.bookings.filter(b => b.studentId === u.id && b.date >= today()).sort((a,b) => a.date.localeCompare(b.date))[0];
      if (nb) out.unshift({t:'Aula reservada', s:`${Q.cls(nb.classId).name} — ${fmtS(nb.date)} às ${Q.cls(nb.classId).time}`, d:nb.date, i:'calendar'});
    }
    return out;
  }
};

/* ---------- UI helpers ---------- */
const A = {};   /* ações via data-act */
const I = {};   /* handlers de input via data-in */
const UI = {
  modal(html, {wide=false, onClose} = {}){
    const o = document.createElement('div'); o.className = 'overlay';
    o.innerHTML = `<div class="sheet ${wide ? 'wide' : ''}" role="dialog" aria-modal="true"><div class="grab"></div>${html}</div>`;
    o.addEventListener('mousedown', e => { if (e.target === o) UI.close(o); });
    o._onClose = onClose; document.body.appendChild(o); document.body.style.overflow = 'hidden';
    const f = o.querySelector('input,select,textarea'); if (f && matchMedia('(min-width:900px)').matches) f.focus();
    return o;
  },
  close(o){ o = o || [...document.querySelectorAll('.overlay')].pop(); if (!o) return; o._onClose && o._onClose(); o.remove(); if (!document.querySelector('.overlay')) document.body.style.overflow = ''; },
  toast(msg, ic='check'){
    let w = $('.toast-wrap'); if (!w) { w = document.createElement('div'); w.className = 'toast-wrap'; document.body.appendChild(w); }
    const t = document.createElement('div'); t.className = 'toast'; t.innerHTML = icon(ic, 'sm') + esc(msg); w.appendChild(t);
    setTimeout(() => t.remove(), 2600);
  },
  confirm(msg, yes, {label='Confirmar', danger=false} = {}){
    const o = UI.modal(`<div class="sheet-h"><h2>Confirmar</h2></div><p class="muted">${msg}</p><div class="sheet-f"><button class="btn" data-act="close">Cancelar</button><button class="btn ${danger ? 'danger' : 'primary'}" id="cfm">${label}</button></div>`);
    $('#cfm', o).onclick = () => { UI.close(o); yes(); };
  },
  form(root){ const o = {}; $$('[name]', root).forEach(el => { o[el.name] = el.type === 'checkbox' ? el.checked : el.value; }); return o; },
  head(title, sub, acts=''){ return `<div class="page-head"><div><h1>${title}</h1>${sub ? `<div class="sub">${sub}</div>` : ''}</div>${acts ? `<div class="acts">${acts}</div>` : ''}</div>`; },
  empty(ic, msg){ return `<div class="empty">${icon(ic)}<div>${msg}</div></div>`; },
  theme(){ return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'; },
  setTheme(t){ document.documentElement.dataset.theme = t; try { localStorage.setItem('atlas_theme', t); } catch(e){} },
  initTheme(){ let t = null; try { t = localStorage.getItem('atlas_theme'); } catch(e){} if (!t) t = document.documentElement.dataset.theme; if (!t) t = matchMedia('(prefers-color-scheme:dark)').matches ? 'dark' : 'light'; document.documentElement.dataset.theme = t; },
  wa(phone, text=''){ return 'https://wa.me/55' + String(phone).replace(/\D/g,'') + (text ? '?text=' + encodeURIComponent(text) : ''); }
};
A.close = (el) => UI.close(el.closest('.overlay'));
A.theme = () => { UI.setTheme(UI.theme() === 'dark' ? 'light' : 'dark'); App.render(); };

document.addEventListener('click', e => {
  const a = e.target.closest('[data-act]'); if (!a) return;
  const fn = A[a.dataset.act]; if (fn) { if (a.tagName === 'A' && a.getAttribute('href') === '#') e.preventDefault(); fn(a, e); }
});
document.addEventListener('input', e => { const a = e.target.closest('[data-in]'); if (a && I[a.dataset.in]) I[a.dataset.in](a, e); });
document.addEventListener('change', e => { const a = e.target.closest('[data-ch]'); if (a && I[a.dataset.ch]) I[a.dataset.ch](a, e); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') UI.close(); });

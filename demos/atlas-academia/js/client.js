/* Área do aluno — mobile-first */
const Pages = { aluno:{}, staff:{} };
const St = { treinoTab:'treinos', cal:null, progMetric:'weight' };

const Run = {
  key:id => 'atlas_run_' + id,
  get(id){ try { const r = JSON.parse(localStorage.getItem(this.key(id))); if (r) return r; } catch(e){} return {start:null, done:{}, vals:{}}; },
  save(id, r){ try { localStorage.setItem(this.key(id), JSON.stringify(r)); } catch(e){} },
  clear(id){ try { localStorage.removeItem(this.key(id)); } catch(e){} }
};
const Rest = {
  iv:null, end:0,
  start(sec){
    this.stop(); this.end = Date.now() + sec*1000;
    const el = document.createElement('div'); el.className = 'rest'; el.id = 'rest';
    el.innerHTML = `${icon('timer')}<span class="small">Descanso</span><b id="restT">${mmss(sec)}</b><button data-act="restSkip">Pular</button>`;
    document.body.appendChild(el);
    this.iv = setInterval(() => {
      const left = Math.max(0, Math.ceil((this.end - Date.now())/1000)); const t = $('#restT'); if (t) t.textContent = mmss(left);
      if (left <= 0) { this.stop(); UI.toast('Descanso finalizado — próxima série!', 'zap'); try { navigator.vibrate && navigator.vibrate(200); } catch(e){} }
    }, 250);
  },
  stop(){ clearInterval(this.iv); this.iv = null; $('#rest')?.remove(); }
};
A.restSkip = () => Rest.stop();

const letterOf = w => (w.name.match(/Treino ([A-Z])\b/) || [])[1] || w.name[0];
const greet = () => { const h = new Date().getHours(); return h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite'; };
const weekStart = d => addDays(d, -((wday(d)+6)%7));
const firstInt = s => parseInt(String(s).match(/\d+/)?.[0] || 10, 10);
const isTimed = r => /min|s$/i.test(String(r).trim());
const dayChips = days => days.length ? days.slice().sort().map(d => `<span class="chip">${WD[d]}</span>`).join('') : '<span class="muted small">Sem dias fixos</span>';

/* ---------- INÍCIO ---------- */
Pages.aluno.home = () => {
  const u = Auth.user, T = today(), w = Q.todayWorkout(u.id), done = Q.doneOn(u.id, T), left = diffDays(u.end, T), plan = Q.plan(u.planId);
  const ws = weekStart(T);
  const week = Array.from({length:7}, (_, i) => { const d = addDays(ws, i), planned = Q.todayWorkout(u.id, d), dn = Q.doneOn(u.id, d);
    return `<div class="d ${d === T ? 'today' : ''}">${WD[wday(d)]}<b>${dt(d).getDate()}</b><i class="${dn ? 'done' : planned ? 'plan' : ''}"></i></div>`; }).join('');
  let hero;
  if (done) hero = `<div class="row" style="margin-bottom:6px">${icon('check')}<b>Treino de hoje concluído</b></div><h2 style="font-size:1.4rem">${esc(done.workoutId ? Q.workout(done.workoutId)?.name || '' : '')}</h2><p class="muted small" style="margin-top:6px">${done.min} min · ${Math.round(done.vol).toLocaleString('pt-BR')} kg de volume. Ótimo trabalho, descanse bem!</p>`;
  else if (w) hero = `<div class="muted small" style="margin-bottom:4px">Treino de hoje · prescrito por ${esc(Q.user(w.createdBy)?.name || 'Professor')}</div><h2 style="font-size:1.4rem">${esc(w.name)}</h2><div class="row wrap" style="margin:10px 0 16px;gap:6px">${Q.muscles(w).map(m => `<span class="chip" style="background:rgba(255,255,255,.14);color:inherit">${m}</span>`).join('')}</div><div class="row between"><span class="muted small">${w.items.length} exercícios · ~${Q.estMin(w)} min</span><a class="btn" style="background:var(--accent-ink);color:var(--accent);border-color:transparent" href="#/aluno/treino/${w.id}">${icon('play','sm')} Iniciar</a></div>`;
  else { const nx = [1,2,3,4,5,6,7].map(n => addDays(T, n)).find(d => Q.todayWorkout(u.id, d)); const nw = nx && Q.todayWorkout(u.id, nx);
    hero = `<div class="row" style="margin-bottom:6px">${icon('moon')}<b>Dia de descanso</b></div><p class="muted small">A recuperação também faz parte do resultado.${nw ? ` Próximo treino: <b>${esc(nw.name)}</b> (${WDL[wday(nx)]}).` : ''}</p>`; }
  const nb = Store.d.bookings.filter(b => b.studentId === u.id && b.date >= T).sort((a,b) => (a.date + Q.cls(a.classId).time).localeCompare(b.date + Q.cls(b.classId).time))[0];
  const ann = Store.d.announcements.slice().sort((a,b) => b.date.localeCompare(a.date)).slice(0,2);
  return `
  <div class="page-head"><div><div class="muted small">${greet()},</div><h1>${esc(u.name.split(' ')[0])} 👋</h1></div>
    <span class="chip">${icon('flame','sm')} ${Q.streak(u.id)} em sequência</span></div>
  <div class="stack">
    <div class="card dark">${hero}</div>
    <div class="card"><div class="card-h"><h3>Esta semana</h3><a class="small muted" href="#/aluno/agenda">Ver agenda</a></div><div class="week">${week}</div></div>
    <div class="kpis">
      <div class="kpi"><div class="l">${icon('dumbbell','sm')} Treinos no mês</div><div class="v">${Q.monthSessions(u.id)}</div></div>
      <div class="kpi"><div class="l">${icon('flame','sm')} Sequência</div><div class="v">${Q.streak(u.id)}</div><div class="d">treinos planejados</div></div>
    </div>
    <div class="grid split-eq">
      <div class="card"><div class="card-h"><h3>Próxima aula</h3><a class="small muted" href="#/aluno/agenda">Aulas</a></div>
        ${nb ? (() => { const c = Q.cls(nb.classId); return `<div class="item" style="padding-top:0"><div class="avatar">${icon('calendar')}</div><div class="grow"><div class="t">${c.name}</div><div class="s">${nb.date === T ? 'Hoje' : WDL[wday(nb.date)] + ', ' + fmtS(nb.date)} · ${c.time} · ${c.room}</div></div></div>`; })() : `<p class="muted small">Você ainda não reservou aulas. <a href="#/aluno/agenda" style="text-decoration:underline">Ver horários</a></p>`}
      </div>
      <div class="card"><div class="card-h"><h3>Meu plano</h3><span class="badge ${Q.status(u).c}">${Q.status(u).label}</span></div>
        <div class="row between small"><b>${plan?.name || '—'}</b><span class="muted">até ${fmtD(u.end)}</span></div>
        <div class="progress" style="margin-top:10px"><i style="width:${plan ? clamp(100 - left / (plan.months*30) * 100, 0, 100) : 0}%"></i></div>
        <div class="muted tiny" style="margin-top:6px">${left >= 0 ? left + ' dias restantes' : 'Plano vencido'}</div>
      </div>
    </div>
    <div class="card"><div class="card-h"><h3>Avisos da academia</h3></div><div class="list">${ann.map(a => `<div class="item"><div class="avatar sm">${icon('megaphone','sm')}</div><div class="grow"><div class="t">${esc(a.title)}</div><div class="s">${esc(a.body)}</div></div></div>`).join('')}</div></div>
  </div>`;
};

/* ---------- TREINOS ---------- */
Pages.aluno.treinos = () => {
  const u = Auth.user, ws = Q.workoutsOf(u.id), tab = St.treinoTab;
  const tabs = `<div class="tabs"><button class="${tab==='treinos'?'on':''}" data-act="tab" data-k="treinoTab" data-v="treinos">Meus treinos</button><button class="${tab==='hist'?'on':''}" data-act="tab" data-k="treinoTab" data-v="hist">Histórico</button></div>`;
  let body;
  if (tab === 'treinos') body = ws.length ? `<div class="grid g2">${ws.map(w => { const dn = Q.doneOn(u.id, today()), isToday = w.days.includes(wday(today()));
    return `<a class="card wk-card" href="#/aluno/treino/${w.id}"><div class="row"><div class="wk-letter">${esc(letterOf(w))}</div><div class="grow"><h3>${esc(w.name.replace(/^Treino [A-Z] — /,''))}</h3><div class="muted small">${esc(w.focus)}</div></div>${isToday ? `<span class="badge ${dn?'ok':''}">${dn ? 'Feito hoje' : 'Hoje'}</span>` : ''}${icon('chevR')}</div>
      <div class="row wrap" style="gap:6px">${dayChips(w.days)}</div>
      <div class="row between small muted"><span>${icon('dumbbell','sm')} ${w.items.length} exercícios · ~${Q.estMin(w)} min</span><span>Prof. ${esc(Q.user(w.createdBy)?.name.split(' ')[0] || '')}</span></div></a>`; }).join('')}</div>`
    : `<div class="card">${UI.empty('dumbbell','Seu professor ainda não montou seu treino.')}</div>`;
  else { const ss = Q.sessionsOf(u.id).slice(0, 30);
    body = `<div class="card">${ss.length ? `<div class="list">${ss.map(s => { const w = Q.workout(s.workoutId); return `<div class="item"><div class="wk-letter" style="width:40px;height:40px">${w ? esc(letterOf(w)) : '?'}</div><div class="grow"><div class="t">${esc(w?.name || 'Treino')}</div><div class="s">${WDL[wday(s.date)]}, ${fmtD(s.date)}</div></div><div style="text-align:right" class="small"><b>${s.min} min</b><div class="muted tiny">${Math.round(s.vol).toLocaleString('pt-BR')} kg</div></div></div>`; }).join('')}</div>` : UI.empty('clock','Nenhum treino registrado ainda.')}</div>`; }
  return UI.head('Treinos', `${ws.length} treino(s) montados por seus professores`) + tabs + body;
};

Pages.aluno.treino = (id) => {
  const w = Q.workout(id), u = Auth.user;
  if (!w || w.studentId !== u.id) return UI.empty('info', 'Treino não encontrado.');
  const run = Run.get(w.id), prof = Q.user(w.createdBy);
  const total = w.items.reduce((a, i) => a + i.sets, 0);
  const exs = w.items.map((it, i) => {
    const ex = Q.ex(it.exId); if (!ex) return '';
    const last = Q.lastLog(u.id, it.exId), timed = isTimed(it.reps), doneAll = Array.from({length:it.sets}).every((_, s) => run.done[`${i}-${s}`]);
    const rows = Array.from({length:it.sets}, (_, s) => { const k = `${i}-${s}`, v = run.vals[k] || {};
      const l = v.l ?? last?.[s]?.l ?? it.load, r = v.r ?? firstInt(it.reps);
      return `<tr><td class="muted small">${s+1}</td>${timed ? `<td class="small muted">${esc(it.reps)}</td>` : `<td><input inputmode="decimal" data-in="setVal" data-i="${i}" data-s="${s}" data-f="l" value="${l}"></td><td><input inputmode="numeric" data-in="setVal" data-i="${i}" data-s="${s}" data-f="r" value="${r}"></td>`}<td><button class="setchk ${run.done[k] ? 'on' : ''}" data-act="setChk" data-i="${i}" data-s="${s}" aria-label="Concluir série ${s+1}">${icon('check','sm')}</button></td></tr>`; }).join('');
    return `<div class="ex ${doneAll ? 'done' : ''}" data-ex="${i}">
      <button class="ex-h" data-act="exToggle"><span class="ex-n">${doneAll ? icon('check','sm') : i+1}</span><span class="grow"><b>${esc(ex.name)}</b><div class="muted small">${it.sets} × ${esc(it.reps)}${it.rest ? ' · ' + it.rest + 's descanso' : ''}${it.load ? ' · ' + it.load + ' kg' : ''}</div></span><span class="chev">${icon('chevR')}</span></button>
      <div class="ex-b">
        <div class="ex-pic">${icon('dumbbell','lg')}<span class="tag chip">${ex.group} · ${ex.equip}</span></div>
        ${it.note ? `<div class="tip" style="background:var(--soft);color:var(--ink)">${icon('user','sm')}<span><b>Recado do professor:</b> ${esc(it.note)}</span></div>` : ''}
        <h4 style="margin:12px 0 4px">Como executar</h4>
        <ol class="steps">${ex.steps.map(s => `<li>${esc(s)}</li>`).join('')}</ol>
        ${ex.tips.map(t => `<div class="tip">${icon('lightbulb','sm')}<span>${esc(t)}</span></div>`).join('')}
        <div class="row" style="margin-top:12px"><a class="btn sm" target="_blank" rel="noopener" href="https://www.youtube.com/results?search_query=${encodeURIComponent('como fazer ' + ex.name)}">${icon('video','sm')} Ver vídeo</a><span class="chip">${ex.level}</span></div>
        <table class="sets"><thead><tr><th>Série</th>${timed ? '<th>Meta</th>' : '<th>Carga (kg)</th><th>Reps</th>'}<th></th></tr></thead><tbody>${rows}</tbody></table>
        ${last ? `<div class="muted tiny" style="margin-top:8px">Último treino: ${last.map(x => x.l + 'kg×' + x.r).join(' · ')}</div>` : ''}
      </div></div>`; }).join('');
  return `
  <div class="row" style="margin-bottom:12px"><a class="icon-btn" href="#/aluno/treinos" aria-label="Voltar">${icon('chevL')}</a><span class="muted small">Treinos</span></div>
  <div class="page-head"><div><h1>${esc(w.name)}</h1><div class="sub">${esc(w.focus)} · ${w.items.length} exercícios · ~${Q.estMin(w)} min · por ${esc(prof?.name || '')}</div></div></div>
  <div class="card" style="margin-bottom:14px"><div class="row between small" style="margin-bottom:8px"><span id="wk-ptxt"></span><span id="wk-elapsed" class="num muted"></span></div><div class="progress"><i id="wk-pbar" style="width:0"></i></div></div>
  <div>${exs}</div>
  <div class="sticky-bar" style="margin-top:16px"><div id="wk-cta"></div></div>`;
};
Pages.aluno.treinoAfter = (id) => {
  const w = Q.workout(id); if (!w) return;
  const total = w.items.reduce((a, i) => a + i.sets, 0);
  const sync = () => {
    const run = Run.get(w.id), n = Object.values(run.done).filter(Boolean).length;
    $('#wk-ptxt').innerHTML = `<b>${n}</b> de ${total} séries`; $('#wk-pbar').style.width = (total ? n/total*100 : 0) + '%';
    $('#wk-elapsed').textContent = run.start ? '⏱ ' + mmss(Math.floor((Date.now() - run.start)/1000)) : '';
    $('#wk-cta').innerHTML = run.start ? `<button class="btn primary block" data-act="runFinish" data-id="${w.id}">${icon('check','sm')} Finalizar treino</button>` : `<button class="btn primary block" data-act="runStart" data-id="${w.id}">${icon('play','sm')} Iniciar treino</button>`;
    $$('.ex').forEach((el, i) => { const all = Array.from({length:w.items[i].sets}).every((_, s) => run.done[`${i}-${s}`]); el.classList.toggle('done', all); $('.ex-n', el).innerHTML = all ? icon('check','sm') : i+1; });
  };
  Pages.aluno._sync = sync; Pages.aluno._wid = w.id; sync();
  App.timers.push(setInterval(() => { const run = Run.get(w.id); const e = $('#wk-elapsed'); if (e && run.start) e.textContent = '⏱ ' + mmss(Math.floor((Date.now() - run.start)/1000)); }, 1000));
  if (new URLSearchParams(location.hash.split('?')[1] || '').get('open') !== null) $('.ex')?.classList.add('open');
  else $('.ex')?.classList.add('open');
};
A.exToggle = el => el.closest('.ex').classList.toggle('open');
A.runStart = el => { const r = Run.get(el.dataset.id); r.start = Date.now(); Run.save(el.dataset.id, r); Pages.aluno._sync(); UI.toast('Bom treino! Cronômetro iniciado.', 'play'); };
A.setChk = el => {
  const wid = Pages.aluno._wid, w = Q.workout(wid), r = Run.get(wid), k = `${el.dataset.i}-${el.dataset.s}`;
  r.done[k] = !r.done[k]; if (!r.start) r.start = Date.now(); Run.save(wid, r);
  el.classList.toggle('on', r.done[k]);
  const it = w.items[el.dataset.i]; if (r.done[k] && it.rest > 0 && !isTimed(it.reps)) Rest.start(it.rest); else if (!r.done[k]) Rest.stop();
  Pages.aluno._sync();
};
I.setVal = el => { const wid = Pages.aluno._wid, r = Run.get(wid), k = `${el.dataset.i}-${el.dataset.s}`; r.vals[k] = r.vals[k] || {}; r.vals[k][el.dataset.f] = parseFloat(String(el.value).replace(',', '.')) || 0; Run.save(wid, r); };
A.runFinish = el => {
  const w = Q.workout(el.dataset.id), r = Run.get(w.id), n = Object.values(r.done).filter(Boolean).length, total = w.items.reduce((a, i) => a + i.sets, 0);
  UI.confirm(n < total ? `Você concluiu <b>${n} de ${total}</b> séries. Deseja finalizar mesmo assim?` : 'Todas as séries concluídas! Registrar este treino?', () => {
    const log = {}; let vol = 0;
    w.items.forEach((it, i) => { log[it.exId] = []; for (let s = 0; s < it.sets; s++) { const k = `${i}-${s}`; if (!r.done[k]) continue; const v = r.vals[k] || {}; const l = v.l ?? Q.lastLog(w.studentId, it.exId)?.[s]?.l ?? it.load, rp = v.r ?? firstInt(it.reps); log[it.exId].push({l, r:rp}); vol += l * rp; } if (!log[it.exId].length) delete log[it.exId]; });
    Store.d.sessions.push({id:uid('s'), studentId:w.studentId, workoutId:w.id, date:today(), min:Math.max(1, Math.round((Date.now() - (r.start || Date.now()))/60000)), vol, log});
    if (!Store.d.checkins.some(c => c.studentId === w.studentId && iso(new Date(c.ts)) === today())) Store.d.checkins.push({id:uid('c'), studentId:w.studentId, ts:Date.now(), method:'App'});
    Store.save(); Run.clear(w.id); Rest.stop(); UI.toast('Treino registrado! 💪', 'trophy'); location.hash = '#/aluno/home';
  }, {label:'Finalizar'});
};

/* ---------- AGENDA ---------- */
Pages.aluno.agenda = () => {
  const u = Auth.user, T = today();
  if (!St.cal) St.cal = {y:new Date().getFullYear(), m:new Date().getMonth(), sel:T};
  const {y, m, sel} = St.cal, first = new Date(y, m, 1), startOff = first.getDay(), dim = new Date(y, m+1, 0).getDate();
  let cells = WD.map(d => `<div class="h">${d[0]}</div>`).join('');
  for (let i = 0; i < startOff + dim; i++) {
    if (i < startOff) { cells += '<span></span>'; continue; }
    const d = iso(new Date(y, m, i - startOff + 1)), planned = d >= u.start && d <= u.end && Q.todayWorkout(u.id, d), dn = Q.doneOn(u.id, d), bk = Store.d.bookings.some(b => b.studentId === u.id && b.date === d);
    cells += `<button class="${d === T ? 'today' : ''} ${d === sel ? 'sel' : ''}" data-act="calSel" data-d="${d}">${i - startOff + 1}<span class="dots">${dn ? '<i class="ok"></i>' : planned ? '<i></i>' : ''}${bk ? '<i class="cls"></i>' : ''}</span></button>`;
  }
  const w = Q.todayWorkout(u.id, sel), dn = Q.doneOn(u.id, sel), cls = Q.classesOn(sel), ci = Q.checkinsOf(u.id).filter(c => iso(new Date(c.ts)) === sel);
  const detail = `
    <div class="card"><div class="card-h"><h3>${WDL[wday(sel)]}, ${fmtD(sel)}</h3>${sel === T ? '<span class="badge">Hoje</span>' : ''}</div>
      <div class="list">
        ${dn ? `<div class="item"><div class="avatar sm" style="background:var(--ok-bg);color:var(--ok)">${icon('check','sm')}</div><div class="grow"><div class="t">${esc(Q.workout(dn.workoutId)?.name || 'Treino')}</div><div class="s">Concluído · ${dn.min} min</div></div></div>`
          : w && sel >= u.start && sel <= u.end ? `<a class="item" href="#/aluno/treino/${w.id}"><div class="avatar sm">${icon('dumbbell','sm')}</div><div class="grow"><div class="t">${esc(w.name)}</div><div class="s">${sel < T ? 'Não realizado' : 'Treino previsto'} · ${w.items.length} exercícios</div></div>${icon('chevR','sm')}</a>` : ''}
        ${ci.map(c => `<div class="item"><div class="avatar sm">${icon('qr','sm')}</div><div class="grow"><div class="t">Check-in às ${fmtTime(c.ts)}</div><div class="s">${c.method}</div></div></div>`).join('')}
        ${cls.map(c => classRow(c, sel, u)).join('')}
        ${!w && !dn && !cls.length ? UI.empty('moon', 'Nada programado para este dia.') : ''}
      </div></div>`;
  const upcoming = [];
  for (let d = 0; d < 7 && upcoming.length < 6; d++) { const day = addDays(T, d); Q.classesOn(day).forEach(c => { if (!(d === 0 && c.time < fmtTime(Date.now()))) upcoming.push([day, c]); }); }
  return UI.head('Agenda', 'Seus treinos, aulas e check-ins') + `
  <div class="grid split">
    <div class="stack">
      <div class="card">
        <div class="card-h"><button class="icon-btn" data-act="calNav" data-n="-1" aria-label="Mês anterior">${icon('chevL')}</button><h2>${MONTHS[m]} ${y}</h2><button class="icon-btn" data-act="calNav" data-n="1" aria-label="Próximo mês">${icon('chevR')}</button></div>
        <div class="cal">${cells}</div>
        <div class="legend" style="margin-top:12px"><span><i></i>Treino previsto</span><span><i class="ok"></i>Realizado</span><span><i class="cls"></i>Aula reservada</span></div>
      </div>
      ${detail}
    </div>
    <div class="card"><div class="card-h"><h3>Próximas aulas</h3></div><div class="list">${upcoming.map(([d, c]) => classRow(c, d, u, true)).join('')}</div></div>
  </div>`;
};
function classRow(c, day, u, showDay) {
  const bk = Q.myBooking(u.id, c.id, day), n = Q.bookedOn(c.id, day).length, full = n >= c.cap && !bk, past = day < today();
  return `<div class="item"><div class="avatar sm">${icon('zap','sm')}</div><div class="grow"><div class="t">${c.name}</div><div class="s">${showDay ? (day === today() ? 'Hoje' : WD[wday(day)] + ' ' + fmtS(day)) + ' · ' : ''}${c.time} · ${c.dur} min · ${esc(Q.user(c.instructorId)?.name.split(' ')[0])} · ${n}/${c.cap}</div></div>
    ${past ? '' : bk ? `<button class="btn sm" data-act="unbook" data-c="${c.id}" data-d="${day}">${icon('check','sm')} Reservado</button>` : full ? '<span class="badge bad">Lotada</span>' : `<button class="btn sm primary" data-act="book" data-c="${c.id}" data-d="${day}">Reservar</button>`}</div>`;
}
A.calSel = el => { St.cal.sel = el.dataset.d; App.render(true); };
A.calNav = el => { let {y, m} = St.cal; m += +el.dataset.n; if (m < 0) { m = 11; y--; } if (m > 11) { m = 0; y++; } St.cal.y = y; St.cal.m = m; App.render(true); };
A.book = el => { const u = Auth.user; if (Q.status(u).k === 'vencido') return UI.toast('Plano vencido — renove para reservar', 'lock'); Store.d.bookings.push({id:uid('bk'), classId:el.dataset.c, date:el.dataset.d, studentId:u.id}); Store.save(); UI.toast('Aula reservada!'); App.render(true); };
A.unbook = el => { Store.d.bookings = Store.d.bookings.filter(b => !(b.studentId === Auth.id && b.classId === el.dataset.c && b.date === el.dataset.d)); Store.save(); UI.toast('Reserva cancelada', 'x'); App.render(true); };
A.tab = el => { St[el.dataset.k] = el.dataset.v; App.render(true); };

/* ---------- PROGRESSO ---------- */
Pages.aluno.progresso = () => {
  const u = Auth.user, m = Q.measuresOf(u.id), last = m[m.length-1], prev = m[m.length-2], first = m[0];
  const MET = {weight:['Peso','kg'], fat:['Gordura','%'], waist:['Cintura','cm']}, met = St.progMetric;
  const delta = (k) => last && first && m.length > 1 ? (last[k] - first[k]).toFixed(1) : null;
  const weeks = Array.from({length:8}, (_, i) => { const s = addDays(weekStart(today()), -(7-i)*7), e = addDays(s, 6); return Store.d.sessions.filter(x => x.studentId === u.id && x.date >= s && x.date <= e).length; });
  const wl = Array.from({length:8}, (_, i) => fmtS(addDays(weekStart(today()), -(7-i)*7)).slice(0,5));
  const prs = Q.prs(u.id).slice(0, 5), badges = Q.badges(u.id);
  return UI.head('Progresso', 'Sua evolução ao longo do tempo', `<button class="btn primary" data-act="addMeasure">${icon('plus','sm')} Medidas</button>`) + `
  <div class="stack">
    <div class="kpis">
      <div class="kpi"><div class="l">${icon('scale','sm')} Peso atual</div><div class="v">${last ? last.weight + ' kg' : '—'}</div><div class="d">${delta('weight') !== null ? (delta('weight') > 0 ? '+' : '') + delta('weight') + ' kg desde o início' : 'Registre suas medidas'}</div></div>
      <div class="kpi"><div class="l">${icon('target','sm')} Gordura</div><div class="v">${last ? last.fat + '%' : '—'}</div><div class="d">${delta('fat') !== null ? (delta('fat') > 0 ? '+' : '') + delta('fat') + ' p.p.' : ''}</div></div>
      <div class="kpi"><div class="l">${icon('dumbbell','sm')} Treinos totais</div><div class="v">${Q.sessionsOf(u.id).length}</div></div>
      <div class="kpi"><div class="l">${icon('flame','sm')} Frequência/sem.</div><div class="v">${(weeks.reduce((a,b)=>a+b,0)/8).toFixed(1)}</div><div class="d">média 8 semanas</div></div>
    </div>
    <div class="grid split-eq">
      <div class="card"><div class="card-h"><h3>Evolução corporal</h3></div>
        <div class="chips" style="margin-bottom:8px">${Object.entries(MET).map(([k, v]) => `<button class="chip ${met===k?'on':''}" data-act="tab" data-k="progMetric" data-v="${k}">${v[0]}</button>`).join('')}</div>
        ${lineChart(m.map(x => x[met]), m.map(x => fmtS(x.date).slice(0,5)))}</div>
      <div class="card"><div class="card-h"><h3>Treinos por semana</h3></div>${barChart(weeks, wl, {hi:7})}</div>
    </div>
    <div class="grid split-eq">
      <div class="card"><div class="card-h"><h3>Recordes de carga</h3>${icon('trophy','sm')}</div>${prs.length ? `<div class="list">${prs.map(p => `<div class="item"><div class="grow"><div class="t">${esc(p.ex.name)}</div><div class="s">${fmtD(p.date)}</div></div><b class="num">${p.l} kg</b></div>`).join('')}</div>` : UI.empty('trophy','Conclua treinos para registrar recordes.')}</div>
      <div class="card"><div class="card-h"><h3>Histórico de medidas</h3></div>${m.length ? `<div class="list">${m.slice().reverse().slice(0,5).map(x => `<div class="item"><div class="grow"><div class="t">${fmtD(x.date)}</div><div class="s">Cintura ${x.waist} cm · Braço ${x.arm} cm</div></div><div style="text-align:right"><b class="num">${x.weight} kg</b><div class="s">${x.fat}% gord.</div></div></div>`).join('')}</div>` : UI.empty('scale','Sem medidas registradas.')}</div>
    </div>
    <div class="card"><div class="card-h"><h3>Conquistas</h3><span class="muted small">${badges.filter(b => b.ok).length}/${badges.length}</span></div>
      <div class="grid g4" style="grid-template-columns:repeat(auto-fill,minmax(110px,1fr))">${badges.map(b => `<div class="badge-ach ${b.ok ? '' : 'lock'}"><div class="ic">${icon(b.ok ? b.i : 'lock')}</div>${b.n}</div>`).join('')}</div></div>
  </div>`;
};
A.addMeasure = () => {
  const l = Q.measuresOf(Auth.id).slice(-1)[0] || {};
  const o = UI.modal(`<div class="sheet-h"><h2>Registrar medidas</h2><button class="icon-btn" data-act="close">${icon('x')}</button></div>
    <div class="form-row"><div class="field"><label>Peso (kg)</label><input class="input" name="weight" inputmode="decimal" value="${l.weight || ''}"></div><div class="field"><label>Gordura (%)</label><input class="input" name="fat" inputmode="decimal" value="${l.fat || ''}"></div></div>
    <div class="form-row"><div class="field"><label>Cintura (cm)</label><input class="input" name="waist" inputmode="decimal" value="${l.waist || ''}"></div><div class="field"><label>Braço (cm)</label><input class="input" name="arm" inputmode="decimal" value="${l.arm || ''}"></div></div>
    <div class="field"><label>Peito (cm)</label><input class="input" name="chest" inputmode="decimal" value="${l.chest || ''}"></div>
    <div class="sheet-f"><button class="btn" data-act="close">Cancelar</button><button class="btn primary" id="sv">Salvar</button></div>`);
  $('#sv', o).onclick = () => { const f = UI.form(o), n = k => parseFloat(String(f[k]).replace(',', '.')) || 0; if (!n('weight')) return UI.toast('Informe o peso', 'info');
    (Store.d.measures[Auth.id] = Store.d.measures[Auth.id] || []).push({date:today(), weight:n('weight'), fat:n('fat'), waist:n('waist'), arm:n('arm'), chest:n('chest')}); Store.save(); UI.close(o); UI.toast('Medidas salvas'); App.render(true); };
};

/* ---------- PERFIL ---------- */
Pages.aluno.perfil = () => {
  const u = Auth.user, plan = Q.plan(u.planId), left = diffDays(u.end, today()), pays = Q.paymentsOf(u.id), inst = Q.user(u.instructorId), ci = Q.checkinsOf(u.id);
  return UI.head('Perfil') + `
  <div class="stack">
    <div class="card"><div class="row"><div class="avatar lg">${initials(u.name)}</div><div class="grow"><h2>${esc(u.name)}</h2><div class="muted small">${esc(u.email)}</div><div class="row wrap" style="margin-top:8px;gap:6px"><span class="chip">${icon('target','sm')} ${esc(u.goal)}</span><span class="chip">Prof. ${esc(inst?.name.split(' ')[0] || '—')}</span></div></div><button class="icon-btn" data-act="editMe" aria-label="Editar">${icon('edit')}</button></div></div>
    <div class="grid split-eq">
      <div class="card" style="text-align:center"><h3 style="margin-bottom:12px">Check-in</h3>${fakeQR(u.id + u.email)}<p class="muted small" style="margin:12px 0">Aproxime o código da catraca para entrar</p><button class="btn primary block" data-act="selfCheckin">${icon('check','sm')} Fazer check-in agora</button>${ci[0] ? `<div class="muted tiny" style="margin-top:8px">Último: ${fmtD(iso(new Date(ci[0].ts)))} às ${fmtTime(ci[0].ts)}</div>` : ''}</div>
      <div class="stack">
        <div class="card"><div class="card-h"><h3>Plano ${plan?.name || ''}</h3><span class="badge ${Q.status(u).c}">${Q.status(u).label}</span></div>
          <ul class="muted small" style="margin:0 0 12px;padding-left:18px;line-height:1.7">${(plan?.perks || []).map(p => `<li>${esc(p)}</li>`).join('')}</ul>
          <div class="row between small"><span class="muted">Início ${fmtD(u.start)}</span><span class="muted">Fim ${fmtD(u.end)}</span></div>
          <div class="progress" style="margin-top:8px"><i style="width:${plan ? clamp(100 - left/(plan.months*30)*100, 0, 100) : 0}%"></i></div></div>
        <div class="card"><div class="card-h"><h3>Aparência</h3></div><button class="btn block" data-act="theme">${icon(UI.theme()==='dark'?'sun':'moon','sm')} Modo ${UI.theme()==='dark'?'claro':'escuro'}</button></div>
      </div>
    </div>
    <div class="card"><div class="card-h"><h3>Pagamentos</h3></div><div class="list">${pays.slice(0,6).map(p => { const s = Q.payStatus(p); return `<div class="item"><div class="avatar sm">${icon('wallet','sm')}</div><div class="grow"><div class="t">${esc(p.desc)}</div><div class="s">Venc. ${fmtD(p.due)}${p.paidAt ? ' · pago em ' + fmtD(p.paidAt) : ''}</div></div><div style="text-align:right"><b class="num">${brl(p.amount)}</b><div><span class="badge ${s.c}">${s.label}</span></div></div>${!p.paidAt ? `<button class="btn sm primary" data-act="payPix" data-id="${p.id}">Pagar</button>` : ''}</div>`; }).join('') || UI.empty('wallet','Sem cobranças.')}</div></div>
    <div class="card"><div class="card-h"><h3>Academia</h3></div><div class="small muted">${esc(Store.d.gym.address)}<br>${esc(Store.d.gym.phone)}</div></div>
    <button class="btn block danger" data-act="logout">${icon('logout','sm')} Sair da conta</button>
  </div>`;
};
A.selfCheckin = () => { const u = Auth.user; if (['vencido','bloqueado'].includes(Q.status(u).k)) return UI.toast('Acesso bloqueado — procure a recepção', 'lock'); Store.d.checkins.push({id:uid('c'), studentId:u.id, ts:Date.now(), method:'QR Code'}); Store.save(); UI.toast('Check-in realizado! Bom treino 💪'); App.render(true); };
A.editMe = () => {
  const u = Auth.user;
  const o = UI.modal(`<div class="sheet-h"><h2>Meus dados</h2><button class="icon-btn" data-act="close">${icon('x')}</button></div>
    <div class="field"><label>Nome</label><input class="input" name="name" value="${esc(u.name)}"></div>
    <div class="form-row"><div class="field"><label>Telefone</label><input class="input" name="phone" value="${esc(u.phone)}"></div><div class="field"><label>Nascimento</label><input class="input" type="date" name="birth" value="${u.birth || ''}"></div></div>
    <div class="field"><label>Objetivo</label><select class="select" name="goal">${GOALS.map(g => `<option ${g===u.goal?'selected':''}>${g}</option>`).join('')}</select></div>
    <div class="sheet-f"><button class="btn" data-act="close">Cancelar</button><button class="btn primary" id="sv">Salvar</button></div>`);
  $('#sv', o).onclick = () => { Object.assign(u, UI.form(o)); Store.save(); UI.close(o); UI.toast('Dados atualizados'); App.render(true); };
};
A.payPix = el => {
  const p = Store.d.payments.find(x => x.id === el.dataset.id), code = '00020126580014br.gov.bcb.pix0136atlas-academia-demo-' + p.id.slice(-6) + '5204000053039865802BR5913ATLAS ACADEMIA6009SAO PAULO';
  const o = UI.modal(`<div class="sheet-h"><h2>Pagar com PIX</h2><button class="icon-btn" data-act="close">${icon('x')}</button></div>
    <div style="text-align:center">${fakeQR(code)}<h2 style="margin-top:12px">${brl(p.amount)}</h2><p class="muted small">${esc(p.desc)}</p></div>
    <div class="field" style="margin-top:12px"><label>PIX copia e cola</label><textarea class="textarea" readonly style="min-height:70px;font-size:.75rem">${code}</textarea></div>
    <div class="sheet-f"><button class="btn" id="cp">${icon('copy','sm')} Copiar</button><button class="btn primary" id="pg">Simular pagamento</button></div><p class="muted tiny" style="text-align:center;margin-top:10px">Demonstração — nenhum pagamento real é processado.</p>`);
  $('#cp', o).onclick = () => { navigator.clipboard?.writeText(code); UI.toast('Código copiado', 'copy'); };
  $('#pg', o).onclick = () => { p.paidAt = today(); p.method = 'PIX'; const u = Q.user(p.studentId); if (p.due >= u.end) { u.end = addMonths(u.end, Q.plan(p.planId)?.months || 1); } Store.save(); UI.close(o); UI.toast('Pagamento confirmado!'); App.render(true); };
};
A.bell = () => {
  const n = Q.notifications(Auth.user);
  UI.modal(`<div class="sheet-h"><h2>Notificações</h2><button class="icon-btn" data-act="close">${icon('x')}</button></div><div class="list">${n.map(x => `<div class="item"><div class="avatar sm">${icon(x.i,'sm')}</div><div class="grow"><div class="t" style="white-space:normal">${esc(x.t)}</div><div class="s">${esc(x.s)}</div></div><span class="tiny muted">${fmtS(x.d)}</span></div>`).join('') || UI.empty('bell','Tudo em dia!')}</div>`);
};

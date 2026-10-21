/* Núcleo: store, consultas, disponibilidade de horários e helpers de interface */
const Store = {
  KEY:'glatende_v1', d:null,
  init(){ try { const r = localStorage.getItem(this.KEY); if (r) { this.d = JSON.parse(r); return; } } catch(e){} this.d = buildSeed('barbearia'); this.save(); },
  save(){ try { localStorage.setItem(this.KEY, JSON.stringify(this.d)); } catch(e){} },
  reset(seg){ this.d = buildSeed(seg || this.d.seg); this.save(); }
};
const STATUS = {
  agendado:{l:'Agendado', c:'', ic:'clock'}, confirmado:{l:'Confirmado', c:'ok', ic:'check'}, concluido:{l:'Concluído', c:'', ic:'check'},
  faltou:{l:'Faltou', c:'bad', ic:'x'}, cancelado:{l:'Cancelado', c:'warn', ic:'x'}
};
const ACTIVE = ['agendado','confirmado'];

const Q = {
  pro:id => Store.d.pros.find(p => p.id === id), svc:id => Store.d.services.find(s => s.id === id), client:id => Store.d.clients.find(c => c.id === id),
  conv:id => Store.d.convs.find(c => c.id === id), appt:id => Store.d.appts.find(a => a.id === id),
  apptsOn:date => Store.d.appts.filter(a => a.date === date).sort((a, b) => a.time.localeCompare(b.time)),
  apptsOf:id => Store.d.appts.filter(a => a.clientId === id).sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time)),
  upcoming(clientId){ const n = today(), nowT = fromMin(new Date().getHours()*60 + new Date().getMinutes()); return Store.d.appts.filter(a => a.clientId === clientId && ACTIVE.includes(a.status) && (a.date > n || (a.date === n && a.time >= nowT))).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time)); },
  clientByPhone:ph => Store.d.clients.find(c => c.phone.replace(/\D/g, '') === String(ph).replace(/\D/g, '')),
  isOpen:date => !!Store.d.hours[wday(date)],
  end:a => fromMin(toMin(a.time) + (Q.svc(a.serviceId)?.dur || 30)),
  visits:id => Store.d.appts.filter(a => a.clientId === id && a.status === 'concluido').length,
  misses:id => Store.d.appts.filter(a => a.clientId === id && a.status === 'faltou').length,
  needsHuman:() => Store.d.convs.filter(c => c.needsHuman),
  fmt(tpl, ap){
    const c = Q.client(ap.clientId), S = Q.svc(ap.serviceId), p = Q.pro(ap.proId), b = Store.d.biz;
    const dd = ap.date === today() ? 'hoje' : ap.date === addDays(today(), 1) ? 'amanhã' : `${WD[wday(ap.date)].toLowerCase()}, ${fmtD(ap.date).slice(0, 5)}`;
    return tpl.replace(/\{nome\}/g, (c?.name || 'cliente').split(' ')[0]).replace(/\{servico\}/g, S?.name || '').replace(/\{data\}/g, dd).replace(/\{hora\}/g, ap.time).replace(/\{profissional\}/g, (p?.name || '').split(' ')[0]).replace(/\{endereco\}/g, b.address).replace(/\{negocio\}/g, b.name);
  },
  hoursText(){
    const H = Store.d.hours, groups = []; const label = r => r.map(x => x.join('–')).join(' e ');
    [1,2,3,4,5,6,0].forEach(d => { const r = H[d] ? label(H[d]) : 'fechado'; const last = groups[groups.length - 1]; if (last && last.r === r) last.to = d; else groups.push({from:d, to:d, r}); });
    return groups.filter(g => g.r !== 'fechado').map(g => `${g.from === g.to ? WDL[g.from] : WD[g.from] + ' a ' + WD[g.to]}: ${g.r.replace(/(\d\d):00/g, '$1h')}`).join('\n');
  }
};

/* horários livres para um serviço (proId = null → qualquer profissional) */
function slotsFor(date, svcId, proId, ignoreId) {
  const S = Q.svc(svcId), ranges = Store.d.hours[wday(date)]; if (!S || !ranges) return [];
  const pros = (proId ? [proId] : S.pros).filter(id => Q.pro(id)?.active !== false), out = {}, now = new Date(), step = Store.d.biz.step || 30;
  const nowM = date === today() ? now.getHours()*60 + now.getMinutes() + (Store.d.biz.lead || 0) : -1;
  if (date < today()) return [];
  const load = id => Store.d.appts.filter(a => a.proId === id && a.date === date && ACTIVE.includes(a.status)).length;
  ranges.forEach(([a, b]) => { for (let t = toMin(a); t + S.dur <= toMin(b); t += step) {
    if (t < nowM) continue;
    const free = pros.filter(id => !Store.d.appts.some(x => x.id !== ignoreId && x.proId === id && x.date === date && ACTIVE.includes(x.status) && toMin(x.time) < t + S.dur && toMin(x.time) + (Q.svc(x.serviceId)?.dur || 30) > t) &&
      !Store.d.blocks.some(x => x.proId === id && x.date === date && toMin(x.from) < t + S.dur && toMin(x.to) > t));
    if (free.length) out[fromMin(t)] = free.sort((x, y) => load(x) - load(y))[0];
  } });
  return Object.entries(out).map(([time, proId]) => ({time, proId}));
}
function nextOpenDays(n, svcId, proId, from) { const out = []; for (let i = 0; i < 21 && out.length < n; i++) { const d = addDays(from || today(), i); if (slotsFor(d, svcId, proId).length) out.push(d); } return out; }
const dayLabel = d => d === today() ? 'Hoje' : d === addDays(today(), 1) ? 'Amanhã' : `${WD[wday(d)]} ${fmtD(d).slice(0, 5)}`;
const firstName = n => String(n || '').split(' ')[0];
const money = n => n ? brl(n) : 'Gratuito';
const norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9: ]+/g, ' ').replace(/\s+/g, ' ').trim();

function createAppt({clientId, serviceId, proId, date, time, source, status = 'agendado', notes = ''}) {
  const ap = {id:uid('a'), clientId, serviceId, proId, date, time, status, source, created:today(), notes}; Store.d.appts.push(ap);
  if (source === 'Assistente') { const h = Store.d.hist[Store.d.hist.length - 1]; if (h && h.date === today()) h.booked++; }
  Store.save(); return ap;
}

/* ---------- interface ---------- */
const A = {}, I = {}, Pages = {painel:{}};
const UI = {
  modal(html, {wide = false, onClose} = {}){
    const o = document.createElement('div'); o.className = 'overlay';
    o.innerHTML = `<div class="sheet ${wide ? 'wide' : ''}" role="dialog" aria-modal="true"><div class="grab"></div>${html}</div>`;
    o.addEventListener('mousedown', e => { if (e.target === o) UI.close(o); });
    o._onClose = onClose; document.body.appendChild(o); document.body.style.overflow = 'hidden';
    const f = o.querySelector('input,select,textarea'); if (f && matchMedia('(min-width:900px)').matches) f.focus();
    return o;
  },
  close(o){ o = o || [...document.querySelectorAll('.overlay')].pop(); if (!o) return; o._onClose && o._onClose(); o.remove(); if (!document.querySelector('.overlay')) document.body.style.overflow = ''; },
  toast(msg, ic = 'check'){
    let w = $('.toast-wrap'); if (!w) { w = document.createElement('div'); w.className = 'toast-wrap'; document.body.appendChild(w); }
    const t = document.createElement('div'); t.className = 'toast'; t.innerHTML = icon(ic, 'sm') + esc(msg); w.appendChild(t); setTimeout(() => t.remove(), 2600);
  },
  confirm(msg, yes, {label = 'Confirmar', danger = false} = {}){
    const o = UI.modal(`<div class="sheet-h"><h2>Confirmar</h2></div><p class="muted">${msg}</p><div class="sheet-f"><button class="btn" data-act="close">Voltar</button><button class="btn ${danger ? 'danger' : 'primary'}" id="cfm">${label}</button></div>`);
    $('#cfm', o).onclick = () => { UI.close(o); yes(); };
  },
  form(root){ const o = {}; $$('[name]', root).forEach(el => { o[el.name] = el.type === 'checkbox' ? el.checked : el.value; }); return o; },
  head(title, sub, acts = ''){ return `<div class="page-head"><div><h1>${title}</h1>${sub ? `<div class="sub">${sub}</div>` : ''}</div>${acts ? `<div class="acts">${acts}</div>` : ''}</div>`; },
  empty(ic, msg){ return `<div class="empty">${icon(ic)}<div>${msg}</div></div>`; },
  theme(){ return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'; },
  setTheme(t){ document.documentElement.dataset.theme = t; try { localStorage.setItem('glatende_theme', t); } catch(e){} },
  initTheme(){ let t = null; try { t = localStorage.getItem('glatende_theme'); } catch(e){} if (!t) t = document.documentElement.dataset.theme; if (!t) t = matchMedia('(prefers-color-scheme:dark)').matches ? 'dark' : 'light'; document.documentElement.dataset.theme = t; },
  wa:(phone, text = '') => 'https://wa.me/55' + String(phone).replace(/\D/g, '') + (text ? '?text=' + encodeURIComponent(text) : ''),
  badge:s => `<span class="badge st-${s}">${icon(STATUS[s].ic, 'sm')}${STATUS[s].l}</span>`
};
const closeBtn = `<button class="icon-btn" data-act="close" aria-label="Fechar">${icon('x')}</button>`;
const selOpts = (arr, cur, fn) => arr.map(x => `<option value="${x.id}" ${x.id === cur ? 'selected' : ''}>${esc(fn(x))}</option>`).join('');
A.close = el => UI.close(el.closest('.overlay'));
A.theme = () => { UI.setTheme(UI.theme() === 'dark' ? 'light' : 'dark'); App.render(true); };

document.addEventListener('click', e => { const a = e.target.closest('[data-act]'); if (!a) return; const fn = A[a.dataset.act]; if (fn) fn(a, e); });
document.addEventListener('input', e => { const a = e.target.closest('[data-in]'); if (a && I[a.dataset.in]) I[a.dataset.in](a, e); });
document.addEventListener('change', e => { const a = e.target.closest('[data-ch]'); if (a && I[a.dataset.ch]) I[a.dataset.ch](a, e); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') UI.close(); });

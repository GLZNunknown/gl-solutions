/* Núcleo: store, regras de negócio (estoque, vendas, fiado) e helpers de interface */
const Store = {
  KEY:'glestoque_v1', d:null,
  init(){ try { const r = localStorage.getItem(this.KEY); if (r) { this.d = JSON.parse(r); return; } } catch(e){} this.d = buildSeed(); this.save(); },
  save(){ try { localStorage.setItem(this.KEY, JSON.stringify(this.d)); } catch(e){} },
  reset(){ this.d = buildSeed(); this.save(); }
};
const r2 = n => Math.round((+n || 0) * 100) / 100;
const fq = n => Number.isInteger(+n) ? String(n) : (+n).toFixed(2).replace('.', ',');
const firstName = n => String(n || '').split(' ')[0];
const norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();
const num = v => parseFloat(String(v).replace(/\./g, '').replace(',', '.')) || 0;
const numIn = v => parseFloat(String(v).replace(',', '.')) || 0;

const Q = {
  prod:id => Store.d.products.find(p => p.id === id), cust:id => Store.d.customers.find(c => c.id === id), sup:id => Store.d.suppliers.find(f => f.id === id),
  sale:id => Store.d.sales.find(s => s.id === id), quote:id => Store.d.quotes.find(q => q.id === id), drv:id => Store.d.drivers.find(d => d.id === id), dlv:id => Store.d.deliveries.find(d => d.id === id),
  paid:s => r2(s.pays.reduce((a, p) => a + p.amount, 0)),
  balance:s => s.canceled ? 0 : Math.max(0, r2(s.total - Q.paid(s))),
  saleSt(s){
    if (s.canceled) return {k:'cancelada', l:'Cancelada', c:'bad'};
    if (Q.balance(s) <= .005) return {k:'pago', l:'Pago', c:'ok'};
    if (s.due && s.due < today()) return {k:'atrasado', l:'Atrasado', c:'bad'};
    return {k:'aprazo', l:'A prazo', c:'warn'};
  },
  payLabel(s){ if (s.canceled) return '—'; const m = [...new Set(s.pays.map(p => p.method))]; return Q.balance(s) > .005 ? (m.length ? 'Parcial + Fiado' : 'Fiado') : (m.join(' + ') || '—'); },
  open:() => Store.d.sales.filter(s => !s.canceled && Q.balance(s) > .005),
  custSales:id => Store.d.sales.filter(s => s.customerId === id && !s.canceled).sort((a, b) => b.ts - a.ts),
  custBalance:id => r2(Store.d.sales.filter(s => s.customerId === id).reduce((a, s) => a + Q.balance(s), 0)),
  stockSt(p){ return p.stock <= 0 ? {k:'zerado', l:'Sem estoque', c:'bad'} : p.stock <= p.min ? {k:'baixo', l:'Estoque baixo', c:'warn'} : {k:'ok', l:'Em estoque', c:'ok'}; },
  low:() => Store.d.products.filter(p => p.active && p.stock <= p.min).sort((a, b) => (a.stock / (a.min || 1)) - (b.stock / (b.min || 1))),
  itemsTotal:items => r2(items.reduce((a, x) => a + x.qty * x.price, 0)),
  revenue:(from, to) => r2(Store.d.sales.filter(s => !s.canceled && s.date >= from && s.date <= to).reduce((a, s) => a + s.total, 0)),
  profit:(from, to) => r2(Store.d.sales.filter(s => !s.canceled && s.date >= from && s.date <= to).reduce((a, s) => a + s.total - s.freight - s.items.reduce((c, x) => c + x.qty * x.cost, 0), 0)),
  received:(from, to) => r2(Store.d.sales.filter(s => !s.canceled).reduce((a, s) => a + s.pays.filter(p => p.date >= from && p.date <= to).reduce((b, p) => b + p.amount, 0), 0)),
  salesOn:date => Store.d.sales.filter(s => s.date === date && !s.canceled),
  lineName:x => Q.prod(x.pid)?.name || 'Produto',
  deliveryOf:s => s.deliveryId ? Q.dlv(s.deliveryId) : null,
  saleItemsText:s => s.items.map(x => `${fq(x.qty)} ${Q.prod(x.pid)?.unit || ''} ${Q.lineName(x)}`).join('; ')
};

/* ---------- operações ---------- */
function adjustStock(items, sign, ref, type) {
  items.forEach(x => { const p = Q.prod(x.pid); if (!p) return; p.stock = r2(p.stock + sign * x.qty); Store.d.moves.unshift({id:uid('m'), ts:Date.now(), pid:p.id, type:type || (sign < 0 ? 'saida' : 'entrada'), qty:x.qty, ref, note:''}); });
}
function createSale({customerId, items, discount = 0, freight = 0, pay, due, received, delivery, quoteId}) {
  const sub = Q.itemsTotal(items), total = r2(sub - discount + freight), D = Store.d;
  const s = {id:'s' + D.seq.sale, num:D.seq.sale++, date:today(), ts:Date.now(), customerId:customerId || null, items:items.map(x => ({...x})), subtotal:sub, discount:r2(discount), freight:r2(freight), total, pays:[], due:null, canceled:false, deliveryId:null, seller:'Seu Antônio'};
  if (pay === 'Fiado') { s.due = due || addDays(today(), 30); const rc = Math.min(total, r2(received)); if (rc > 0) s.pays.push({method:'Dinheiro', amount:rc, date:today()}); }
  else s.pays.push({method:pay, amount:total, date:today()});
  if (delivery) { const dv = {id:'e' + (D.deliveries.length + 1 + Math.floor(Math.random() * 1e4)), saleId:s.id, address:delivery.address, status:'separando', driverId:'', window:delivery.window || 'Tarde', ts:Date.now(), notes:''}; D.deliveries.push(dv); s.deliveryId = dv.id; }
  D.sales.push(s); adjustStock(s.items, -1, 'Venda #' + s.num);
  if (quoteId) { const q = Q.quote(quoteId); if (q) { q.status = 'convertido'; q.saleId = s.id; } }
  Store.save(); return s;
}
function cancelSale(s) { if (s.canceled) return; s.canceled = true; adjustStock(s.items, +1, 'Cancelamento #' + s.num, 'entrada'); const dv = Q.deliveryOf(s); if (dv) dv.status = 'cancelada'; Store.save(); }
function receivePayment(s, amount, method) { amount = Math.min(r2(amount), Q.balance(s)); if (amount <= 0) return 0; s.pays.push({method, amount, date:today()}); Store.save(); return amount; }

/* ---------- interface ---------- */
const A = {}, I = {}, Pages = {};
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
    const t = document.createElement('div'); t.className = 'toast'; t.innerHTML = icon(ic, 'sm') + esc(msg); w.appendChild(t); setTimeout(() => t.remove(), 2800);
  },
  confirm(msg, yes, {label = 'Confirmar', danger = false} = {}){
    const o = UI.modal(`<div class="sheet-h"><h2>Confirmar</h2></div><p class="muted">${msg}</p><div class="sheet-f"><button class="btn" data-act="close">Voltar</button><button class="btn ${danger ? 'danger' : 'primary'}" id="cfm">${label}</button></div>`);
    $('#cfm', o).onclick = () => { UI.close(o); yes(); };
  },
  form(root){ const o = {}; $$('[name]', root).forEach(el => { o[el.name] = el.type === 'checkbox' ? el.checked : el.value; }); return o; },
  head(title, sub, acts = ''){ return `<div class="page-head"><div><h1>${title}</h1>${sub ? `<div class="sub">${sub}</div>` : ''}</div>${acts ? `<div class="acts">${acts}</div>` : ''}</div>`; },
  empty(ic, msg){ return `<div class="empty">${icon(ic)}<div>${msg}</div></div>`; },
  theme(){ return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'; },
  setTheme(t){ document.documentElement.dataset.theme = t; try { localStorage.setItem('glestoque_theme', t); } catch(e){} },
  initTheme(){ let t = null; try { t = localStorage.getItem('glestoque_theme'); } catch(e){} if (!t) t = document.documentElement.dataset.theme; if (!t) t = matchMedia('(prefers-color-scheme:dark)').matches ? 'dark' : 'light'; document.documentElement.dataset.theme = t; },
  wa:(phone, text = '') => 'https://wa.me/55' + String(phone || '').replace(/\D/g, '') + (text ? '?text=' + encodeURIComponent(text) : ''),
  badge:(st) => `<span class="badge ${st.c}">${st.l}</span>`
};
const closeBtn = `<button class="icon-btn" data-act="close" aria-label="Fechar">${icon('x')}</button>`;
const selOpts = (arr, cur, fn) => arr.map(x => `<option value="${x.id}" ${x.id === cur ? 'selected' : ''}>${esc(fn(x))}</option>`).join('');
A.close = el => UI.close(el.closest('.overlay'));
A.theme = () => { UI.setTheme(UI.theme() === 'dark' ? 'light' : 'dark'); App.render(true); };
A.go = el => { location.hash = el.dataset.to; };

document.addEventListener('click', e => { const a = e.target.closest('[data-act]'); if (!a) return; const fn = A[a.dataset.act]; if (fn) fn(a, e); });
document.addEventListener('input', e => { const a = e.target.closest('[data-in]'); if (a && I[a.dataset.in]) I[a.dataset.in](a, e); });
document.addEventListener('change', e => { const a = e.target.closest('[data-ch]'); if (a && I[a.dataset.ch]) I[a.dataset.ch](a, e); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') UI.close(); });

/* Utilitários: ícones, datas, formatação, gráficos SVG */
const P = {
  home:'<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/>',
  dumbbell:'<path d="M6 7v10M3 10v4M18 7v10M21 10v4M6 12h12"/>',
  calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  chart:'<path d="M4 20V11M10 20V4M16 20v-7M22 20H2"/>',
  user:'<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>',
  users:'<circle cx="9" cy="8" r="3.5"/><path d="M2 20c0-3.5 3-5.5 7-5.5s7 2 7 5.5"/><circle cx="17" cy="9" r="2.5"/><path d="M17 14c3 0 5 1.5 5 4"/>',
  tag:'<path d="M3 12V4h8l10 10-8 8L3 12z"/><circle cx="7.5" cy="8.5" r="1.2"/>',
  wallet:'<rect x="3" y="6" width="18" height="14" rx="2"/><path d="M3 10h18M16 15h2"/>',
  bell:'<path d="M6 16v-5a6 6 0 0112 0v5l2 2H4l2-2zM10 21h4"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  search:'<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
  check:'<path d="M5 12l5 5 9-10"/>',
  x:'<path d="M6 6l12 12M18 6L6 18"/>',
  chevR:'<path d="M9 5l7 7-7 7"/>', chevL:'<path d="M15 5l-7 7 7 7"/>', chevD:'<path d="M5 9l7 7 7-7"/>',
  clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  play:'<path d="M7 4l13 8-13 8z"/>',
  qr:'<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><path d="M14 14h3v3h-3zM20 14v7M14 20h3"/>',
  logout:'<path d="M9 4H4v16h5M16 8l4 4-4 4M20 12H9"/>',
  sliders:'<path d="M4 6h10M18 6h2M4 12h2M10 12h10M4 18h12M20 18h0"/><circle cx="16" cy="6" r="2"/><circle cx="8" cy="12" r="2"/><circle cx="18" cy="18" r="2"/>',
  grid:'<rect x="4" y="4" width="6" height="6" rx="1.5"/><rect x="14" y="4" width="6" height="6" rx="1.5"/><rect x="4" y="14" width="6" height="6" rx="1.5"/><rect x="14" y="14" width="6" height="6" rx="1.5"/>',
  megaphone:'<path d="M3 11v3a1 1 0 001 1h2l5 4V6L6 10H4a1 1 0 00-1 1zM15 8a5 5 0 010 8"/>',
  trophy:'<path d="M8 4h8v6a4 4 0 01-8 0V4zM8 6H4v1a3 3 0 003 3M16 6h4v1a3 3 0 01-3 3M12 14v4M8 20h8"/>',
  flame:'<path d="M12 3c1 4 5 5 5 10a5 5 0 01-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-6 1-9z"/>',
  edit:'<path d="M4 20h4L19 9l-4-4L4 16v4z"/>',
  trash:'<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
  moon:'<path d="M20 14a8 8 0 01-10-10 8 8 0 1010 10z"/>',
  sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5"/>',
  video:'<rect x="3" y="6" width="13" height="12" rx="2"/><path d="M16 10l5-3v10l-5-3"/>',
  timer:'<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2M9 2h6"/>',
  target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
  lightbulb:'<path d="M9 18h6M10 21h4M12 3a6 6 0 00-4 10.5c.7.7 1 1.5 1 2.5h6c0-1 .3-1.8 1-2.5A6 6 0 0012 3z"/>',
  arrowUp:'<path d="M12 19V5M5 12l7-7 7 7"/>', arrowDown:'<path d="M12 5v14M5 12l7 7 7-7"/>',
  phone:'<path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z"/>',
  download:'<path d="M12 4v11M7 11l5 5 5-5M5 20h14"/>',
  repeat:'<path d="M4 12V9a3 3 0 013-3h11M15 3l3 3-3 3M20 12v3a3 3 0 01-3 3H6M9 21l-3-3 3-3"/>',
  copy:'<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2h2"/>',
  lock:'<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 018 0v3"/>',
  heart:'<path d="M12 20s-8-5-8-11a4.5 4.5 0 018-2.5A4.5 4.5 0 0120 9c0 6-8 11-8 11z"/>',
  scale:'<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M8 9a4 4 0 018 0M12 9l2-2"/>',
  zap:'<path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z"/>',
  chat:'<path d="M21 12a8 8 0 01-11.6 7.1L4 20l1-4.6A8 8 0 1121 12z"/>',
  send:'<path d="M21 3L10 14M21 3l-7 18-4-7-7-4 18-7z"/>',
  bot:'<rect x="4" y="8" width="16" height="12" rx="3"/><path d="M12 4v4M9 13h0M15 13h0M9 17h6"/>',
  pin:'<path d="M12 21s7-6 7-11a7 7 0 10-14 0c0 5 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/>',
  inbox:'<path d="M4 13l3-8h10l3 8v6H4v-6zM4 13h5l1 2h4l1-2h5"/>',
  scissors:'<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M8.5 8L20 19M8.5 16L20 5"/>',
  list:'<path d="M8 6h13M8 12h13M8 18h13M3 6h0M3 12h0M3 18h0"/>',
  more:'<circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/>',
  info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h0"/>',
  star:'<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9L12 3z"/>'
};
const icon = (n, c='') => `<svg class="i ${c}" viewBox="0 0 24 24" aria-hidden="true">${P[n] || ''}</svg>`;

const $  = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uid = (p='id') => p + '_' + Math.random().toString(36).slice(2, 9);
const initials = n => n.split(' ').filter(Boolean).slice(0,2).map(w => w[0]).join('').toUpperCase();
const brl = n => (n||0).toLocaleString('pt-BR', {style:'currency', currency:'BRL'});
const clamp = (n,a,b) => Math.min(b, Math.max(a, n));

/* datas — sempre ISO local 'YYYY-MM-DD' */
const WD = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
const WDL = ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'];
const MONTHS = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
const pad = n => String(n).padStart(2,'0');
const iso = d => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const dt  = s => { const [y,m,d] = s.split('-').map(Number); return new Date(y, m-1, d, 12); };
const today = () => iso(new Date());
const addDays = (s, n) => { const d = dt(s); d.setDate(d.getDate()+n); return iso(d); };
const addMonths = (s, n) => { const d = dt(s); d.setMonth(d.getMonth()+n); return iso(d); };
const diffDays = (a, b) => Math.round((dt(a) - dt(b)) / 864e5);
const fmtD = s => s ? s.split('-').reverse().join('/') : '—';
const fmtS = s => { const d = dt(s); return `${pad(d.getDate())} ${MONTHS[d.getMonth()].slice(0,3).toLowerCase()}`; };
const wday = s => dt(s).getDay();
const fmtTime = ts => { const d = new Date(ts); return `${pad(d.getHours())}:${pad(d.getMinutes())}`; };
const mmss = sec => `${pad(Math.floor(sec/60))}:${pad(sec%60)}`;
const monthKey = s => s.slice(0,7);

/* gráficos SVG minimalistas, cores via CSS */
function lineChart(vals, labels, {h=150, unit=''} = {}) {
  if (!vals.length) return '<div class="empty small">Sem dados ainda</div>';
  const W = 320, H = h, pl = 30, pr = 8, pt = 12, pb = 22;
  const mn = Math.min(...vals), mx = Math.max(...vals), span = (mx - mn) || 1;
  const lo = mn - span * .2, hi = mx + span * .2;
  const x = i => pl + (vals.length === 1 ? (W-pl-pr)/2 : i * (W-pl-pr) / (vals.length-1));
  const y = v => pt + (H-pt-pb) * (1 - (v-lo)/(hi-lo));
  const pts = vals.map((v,i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`);
  const area = `M${x(0)},${H-pb} L${pts.join(' L')} L${x(vals.length-1)},${H-pb}Z`;
  let g = '';
  for (let k = 0; k < 3; k++) { const v = lo + (hi-lo) * k/2; g += `<line class="grid" x1="${pl}" x2="${W-pr}" y1="${y(v)}" y2="${y(v)}"/><text x="0" y="${y(v)+3}">${v.toFixed(0)}</text>`; }
  const step = Math.ceil(labels.length / 6);
  const lb = labels.map((l,i) => i % step === 0 || i === labels.length-1 ? `<text x="${x(i)}" y="${H-5}" text-anchor="middle">${l}</text>` : '').join('');
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img">${g}<path d="${area}" fill="var(--c4)" opacity=".35"/><polyline points="${pts.join(' ')}" fill="none" stroke="var(--c1)" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/>${vals.map((v,i)=>`<circle cx="${x(i)}" cy="${y(v)}" r="3.2" fill="var(--surface)" stroke="var(--c1)" stroke-width="2"/>`).join('')}${lb}</svg>`;
}
function barChart(vals, labels, {h=150, hi=-1, fmt=v=>v} = {}) {
  const W = 320, H = h, pl = 4, pb = 22, pt = 18;
  const mx = Math.max(...vals, 1), n = vals.length, bw = (W-pl*2) / n;
  const bars = vals.map((v,i) => {
    const bh = Math.max(2, (H-pb-pt) * v / mx), bx = pl + i*bw + bw*.18, w = bw*.64;
    return `<rect class="bar ${hi>=0 && i!==hi ? 'alt' : ''}" x="${bx}" y="${H-pb-bh}" width="${w}" height="${bh}" rx="5"/>` +
      (v ? `<text x="${bx+w/2}" y="${H-pb-bh-5}" text-anchor="middle" style="fill:var(--ink-2);font-weight:600">${fmt(v)}</text>` : '') +
      `<text x="${bx+w/2}" y="${H-6}" text-anchor="middle">${labels[i]}</text>`;
  }).join('');
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img"><line class="grid" x1="0" x2="${W}" y1="${H-pb}" y2="${H-pb}"/>${bars}</svg>`;
}
function donut(parts, label='total') {
  const tot = parts.reduce((a,p) => a+p.v, 0) || 1, R = 46, C = 2*Math.PI*R, cols = ['var(--c1)','var(--c2)','var(--c3)','var(--c4)'];
  let off = 0;
  const segs = parts.map((p,i) => { const len = C * p.v / tot, s = `<circle cx="60" cy="60" r="${R}" fill="none" stroke="${cols[i%4]}" stroke-width="16" stroke-dasharray="${len} ${C-len}" stroke-dashoffset="${-off}" transform="rotate(-90 60 60)"/>`; off += len; return s; }).join('');
  const leg = parts.map((p,i) => `<div><i style="background:${cols[i%4]}"></i><span class="grow">${esc(p.l)}</span><b class="num">${p.v}</b></div>`).join('');
  return `<div class="donut-wrap"><svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="${R}" fill="none" stroke="var(--soft)" stroke-width="16"/>${segs}<text x="60" y="58" text-anchor="middle" style="font-size:20px;font-weight:700;fill:var(--ink)">${tot}</text><text x="60" y="73" text-anchor="middle" style="font-size:9px;fill:var(--muted)">${label}</text></svg><div class="leg">${leg}</div></div>`;
}
/* QR decorativo determinístico (demonstração) */
function fakeQR(seed) {
  let h = 2166136261; for (const c of seed) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); }
  const rnd = () => (h = Math.imul(h ^ (h>>>15), 2246822507), (h>>>0) / 4294967296);
  const N = 25; let r = '';
  const finder = (x,y) => `<rect x="${x}" y="${y}" width="7" height="7" fill="#111"/><rect x="${x+1}" y="${y+1}" width="5" height="5" fill="#fff"/><rect x="${x+2}" y="${y+2}" width="3" height="3" fill="#111"/>`;
  for (let y=0;y<N;y++) for (let x=0;x<N;x++) {
    if ((x<8&&y<8)||(x>N-9&&y<8)||(x<8&&y>N-9)) continue;
    if (rnd() > .52) r += `<rect x="${x}" y="${y}" width="1" height="1" fill="#111"/>`;
  }
  return `<svg class="qr" viewBox="-1 -1 ${N+2} ${N+2}" shape-rendering="crispEdges">${r}${finder(0,0)}${finder(N-7,0)}${finder(0,N-7)}</svg>`;
}

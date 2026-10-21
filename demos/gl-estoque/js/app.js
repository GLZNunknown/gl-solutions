/* Rotas e layout */
const NAV = [
  ['inicio', 'Início', 'grid', 'Operação'], ['balcao', 'Balcão', 'cart'], ['orcamentos', 'Orçamentos', 'receipt'], ['vendas', 'Vendas', 'cash'], ['entregas', 'Entregas', 'truck'],
  ['estoque', 'Estoque', 'box', 'Estoque e clientes'], ['clientes', 'Clientes', 'users'], ['areceber', 'A receber', 'wallet'],
  ['caixa', 'Caixa', 'cash', 'Gestão'], ['relatorios', 'Relatórios', 'chart'], ['config', 'Configurações', 'sliders']
];
const MOBILE_NAV = ['inicio', 'balcao', 'estoque', 'entregas'];
const App = {
  route(){ const [path] = location.hash.slice(2).split('?'); const [page] = path.split('/'); return page || 'inicio'; },
  render(keep){
    const y = window.scrollY, page = this.route(), root = $('#app');
    if (!Pages[page]) { location.replace('#/inicio'); return; }
    root.innerHTML = shell(page, Pages[page]());
    window.scrollTo(0, keep ? y : 0);
  }
};
const badgeFor = k => {
  if (k === 'estoque') { const n = Q.low().length; return n ? `<span class="count">${n}</span>` : ''; }
  if (k === 'areceber') { const n = Q.open().filter(s => s.due < today()).length; return n ? `<span class="count red">${n}</span>` : ''; }
  if (k === 'entregas') { const n = Store.d.deliveries.filter(d => ['separando', 'em_rota'].includes(d.status)).length; return n ? `<span class="count">${n}</span>` : ''; }
  return '';
};
function shell(page, html) {
  const tools = `<button class="icon-btn" data-act="theme" aria-label="Alternar tema">${icon(UI.theme() === 'dark' ? 'sun' : 'moon')}</button>`, co = Store.d.co;
  let side = ''; NAV.forEach(n => { if (n[3]) side += `<div class="grp">${n[3]}</div>`; side += `<a href="#/${n[0]}" class="${page === n[0] ? 'on' : ''}">${icon(n[2])}${n[1]}${badgeFor(n[0])}</a>`; });
  const bottom = MOBILE_NAV.map(k => { const n = NAV.find(x => x[0] === k), b = badgeFor(k).replace('class="count', 'class="count dot'); return `<a href="#/${k}" class="${page === k ? 'on' : ''}">${icon(n[2])}${n[1]}${k === 'balcao' ? '' : b}</a>`; }).join('') + `<button data-act="more" class="${MOBILE_NAV.includes(page) ? '' : 'on'}">${icon('more')}Mais</button>`;
  return `<div class="shell"><aside class="sidebar"><div class="brand"><div class="logo">GL</div>GL Estoque</div><nav>${side}</nav>
      <div class="me"><div class="avatar sm">${initials(co.name)}</div><div class="who"><b>${esc(co.name)}</b><span class="muted tiny">${esc(co.owner)}</span></div>${tools}</div></aside>
    <div class="main"><header class="topbar"><div class="brand"><div class="logo">GL</div>GL Estoque</div><span class="sp"></span>${tools}</header><main class="content" id="page">${html}</main></div>
    <nav class="bottomnav" aria-label="Navegação">${bottom}</nav></div>`;
}
A.more = () => {
  const items = NAV.filter(n => !MOBILE_NAV.includes(n[0]));
  UI.modal(`<div class="sheet-h"><h2>Mais opções</h2>${closeBtn}</div><div class="list">${items.map(n => `<a class="item" href="#/${n[0]}" data-act="close"><div class="avatar sm">${icon(n[2], 'sm')}</div><div class="grow t">${n[1]}</div>${badgeFor(n[0])}${icon('chevR', 'sm')}</a>`).join('')}<button class="item" data-act="theme"><div class="avatar sm">${icon(UI.theme() === 'dark' ? 'sun' : 'moon', 'sm')}</div><div class="grow t">Tema ${UI.theme() === 'dark' ? 'claro' : 'escuro'}</div></button></div>`);
};
window.addEventListener('hashchange', () => { document.querySelectorAll('.overlay').forEach(o => o.remove()); document.body.style.overflow = ''; St.cartOpen = false; App.render(); });
window.addEventListener('DOMContentLoaded', () => { UI.initTheme(); Store.init(); App.render(); });

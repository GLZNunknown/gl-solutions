/* Roteador e layout: chat do cliente (#/chat) e painel do negócio (#/painel/...) */
const NAV = [
  ['inicio', 'Início', 'grid', 'Atendimento'], ['agenda', 'Agenda', 'calendar'], ['conversas', 'Conversas', 'chat'], ['clientes', 'Clientes', 'users'],
  ['servicos', 'Serviços', 'tag', 'Negócio'], ['equipe', 'Equipe e horários', 'clock'], ['respostas', 'Assistente', 'bot'], ['relatorios', 'Relatórios', 'chart'], ['config', 'Configurações', 'sliders']
];
const MOBILE_NAV = ['inicio', 'agenda', 'conversas', 'clientes'];

const App = {
  route(){ const [path] = location.hash.slice(2).split('?'); const [area, page, arg] = path.split('/'); return {area:area || 'chat', page, arg}; },
  render(keep){
    const y = window.scrollY, root = $('#app'), {area, page} = this.route();
    if (area === 'chat') { root.innerHTML = chatShell(); Chat.after(); window.scrollTo(0, 0); return; }
    if (area !== 'painel' || !Pages.painel[page]) { location.replace(area === 'painel' ? '#/painel/inicio' : '#/chat'); return; }
    root.innerHTML = panelShell(page, Pages.painel[page]());
    if (page === 'conversas') Pages.painel.conversasAfter(); if (page === 'respostas') Pages.painel.respostasAfter();
    window.scrollTo(0, keep ? y : 0);
  }
};
const segSelect = () => `<select class="select seg" data-ch="segSel" aria-label="Tipo de negócio na demonstração">${SEG_ORDER.map(k => `<option value="${k}" ${Store.d.seg === k ? 'selected' : ''}>${SEG[k].label}</option>`).join('')}</select>`;
I.segSel = el => { Store.reset(el.value); Chat.events = []; UI.toast(`Demonstração de ${SEG[el.value].label.toLowerCase()} carregada`); App.render(); };
const tools = () => `<button class="icon-btn" data-act="theme" aria-label="Alternar tema">${icon(UI.theme() === 'dark' ? 'sun' : 'moon')}</button>`;

function chatShell() {
  return `<div class="demo-bar"><div class="brand"><div class="logo">GL</div><b>GL Atende</b></div><span class="grow"></span>${segSelect()}<a class="btn sm primary" href="#/painel/inicio">${icon('grid', 'sm')}<span class="hide-s"> Painel do negócio</span></a>${tools()}</div>${Pages.chat()}`;
}
function panelShell(page, html) {
  const nh = Q.needsHuman().length, cur = page;
  let side = ''; NAV.forEach(n => { if (n[3]) side += `<div class="grp">${n[3]}</div>`; side += `<a href="#/painel/${n[0]}" class="${cur === n[0] ? 'on' : ''}">${icon(n[2])}${n[1]}${n[0] === 'conversas' && nh ? `<span class="count">${nh}</span>` : ''}</a>`; });
  const bottom = MOBILE_NAV.map(k => { const n = NAV.find(x => x[0] === k); return `<a href="#/painel/${k}" class="${cur === k ? 'on' : ''}">${icon(n[2])}${n[1]}${k === 'conversas' && nh ? `<span class="count dot">${nh}</span>` : ''}</a>`; }).join('') + `<button data-act="more" class="${MOBILE_NAV.includes(cur) ? '' : 'on'}">${icon('more')}Mais</button>`;
  return `<div class="shell">
    <aside class="sidebar"><div class="brand"><div class="logo">GL</div>GL Atende</div><div style="padding:0 6px 12px">${segSelect()}</div><nav>${side}<div class="grp">Demonstração</div><a href="#/chat">${icon('send')}Ver como cliente</a></nav>
      <div class="me"><div class="avatar sm">${initials(Store.d.biz.name)}</div><div class="who"><b>${esc(Store.d.biz.name)}</b><span class="muted tiny">Painel do negócio</span></div>${tools()}</div></aside>
    <div class="main"><header class="topbar"><div class="brand"><div class="logo">GL</div>GL Atende</div><span class="sp"></span>${segSelect()}<a class="icon-btn" href="#/chat" aria-label="Ver como cliente">${icon('send')}</a>${tools()}</header>
      <main class="content" id="page">${html}</main></div>
    <nav class="bottomnav" aria-label="Navegação">${bottom}</nav></div>`;
}
A.more = () => {
  const items = NAV.filter(n => !MOBILE_NAV.includes(n[0]));
  UI.modal(`<div class="sheet-h"><h2>Mais opções</h2>${closeBtn}</div><div class="list">${items.map(n => `<a class="item" href="#/painel/${n[0]}" data-act="close"><div class="avatar sm">${icon(n[2], 'sm')}</div><div class="grow t">${n[1]}</div>${icon('chevR', 'sm')}</a>`).join('')}<a class="item" href="#/chat" data-act="close"><div class="avatar sm">${icon('send', 'sm')}</div><div class="grow t">Ver como cliente</div>${icon('chevR', 'sm')}</a></div>`);
};
window.addEventListener('hashchange', () => { document.querySelectorAll('.overlay').forEach(o => o.remove()); document.body.style.overflow = ''; App.render(); });
window.addEventListener('DOMContentLoaded', () => { UI.initTheme(); Store.init(); App.render(); });

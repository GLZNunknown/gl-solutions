/* Roteador, shells (aluno / equipe) e login */
const CLIENT_NAV = [['home','Início','home'],['treinos','Treinos','dumbbell'],['agenda','Agenda','calendar'],['progresso','Progresso','chart'],['perfil','Perfil','user']];
const STAFF_NAV = [
  ['dashboard','Painel','grid','Visão geral'],['alunos','Alunos','users'],['treinos','Treinos','dumbbell'],['exercicios','Exercícios','target'],
  ['aulas','Aulas','calendar'],['checkins','Check-ins','qr'],
  ['planos','Planos','tag','Gestão',1],['financeiro','Financeiro','wallet','',1],['professores','Equipe','user','',1],['avisos','Avisos','megaphone'],['config','Configurações','sliders','',1]
];
const ADMIN_ONLY = new Set(['planos','financeiro','professores','config']);
const GROUP_OF = {aluno:'alunos', treino:'treinos'};

const App = {
  timers:[],
  route(){ const [path] = location.hash.slice(2).split('?'); const [area, page, arg] = path.split('/'); return {area, page, arg}; },
  render(keep){
    const y = window.scrollY; this.timers.forEach(clearInterval); this.timers = [];
    const root = $('#app'), u = Auth.user;
    if (!u) { root.innerHTML = loginView(); return; }
    const want = u.role === 'aluno' ? 'aluno' : 'staff';
    let {area, page, arg} = this.route();
    if (area !== want || !Pages[want][page]) { if (area !== want || !page) { location.replace('#/' + want + '/' + (want === 'aluno' ? 'home' : 'dashboard')); return; } }
    if (want === 'staff' && ADMIN_ONLY.has(page) && u.role !== 'admin') { location.replace('#/staff/dashboard'); return; }
    const fn = Pages[want][page];
    const html = fn ? fn(arg) : UI.empty('info', 'Página não encontrada.');
    root.innerHTML = shell(u, want, page, html);
    if (want === 'aluno' && page === 'treino') Pages.aluno.treinoAfter(arg);
    window.scrollTo(0, keep ? y : 0);
  }
};

function shell(u, area, page, html) {
  const nav = area === 'aluno' ? CLIENT_NAV : STAFF_NAV.filter(n => !n[4] || u.role === 'admin');
  const cur = GROUP_OF[page] && area === 'staff' ? GROUP_OF[page] : (area === 'aluno' && page === 'treino' ? 'treinos' : page);
  const href = k => `#/${area}/${k}`;
  const gym = Store.d.gym.name, hasN = Q.notifications(u).length > 0;
  let side = '', lastGrp = '';
  nav.forEach(n => { if (n[3]) side += `<div class="grp">${n[3]}</div>`; side += `<a href="${href(n[0])}" class="${cur === n[0] ? 'on' : ''}">${icon(n[2])}${n[1]}</a>`; });
  const mobile = area === 'aluno' ? CLIENT_NAV : [STAFF_NAV[0], STAFF_NAV[1], STAFF_NAV[2], STAFF_NAV[4]];
  const bottom = mobile.map(n => `<a href="${href(n[0])}" class="${cur === n[0] ? 'on' : ''}">${icon(n[2])}${n[1]}</a>`).join('') +
    (area === 'staff' ? `<button data-act="more" class="${['exercicios','checkins','planos','financeiro','professores','avisos','config'].includes(cur) ? 'on' : ''}">${icon('more')}Mais</button>` : '');
  const tools = `<button class="icon-btn" data-act="bell" aria-label="Notificações">${icon('bell')}${hasN ? '<i class="dot"></i>' : ''}</button><button class="icon-btn" data-act="theme" aria-label="Alternar tema">${icon(UI.theme() === 'dark' ? 'sun' : 'moon')}</button>`;
  return `<div class="shell">
    <aside class="sidebar"><div class="brand"><div class="logo">A</div>${esc(gym)}</div><nav>${side}</nav>
      <div class="me"><div class="avatar sm">${initials(u.name)}</div><div class="who"><b>${esc(u.name)}</b><span class="muted tiny">${u.role === 'admin' ? 'Administrador' : u.role === 'prof' ? 'Professor' : 'Aluno'}</span></div><button class="icon-btn" style="width:34px;height:34px" data-act="logout" aria-label="Sair">${icon('logout','sm')}</button></div></aside>
    <div class="main"><header class="topbar"><div class="brand"><div class="logo">A</div>${esc(gym)}</div><span class="sp"></span>${tools}</header>
      <div class="desk-bar">${tools}</div><main class="content" id="page">${html}</main></div>
    <nav class="bottomnav" aria-label="Navegação">${bottom}</nav></div>`;
}

A.more = () => {
  const u = Auth.user, items = STAFF_NAV.filter(n => ['exercicios','checkins','planos','financeiro','professores','avisos','config'].includes(n[0]) && (!n[4] || u.role === 'admin'));
  const o = UI.modal(`<div class="sheet-h"><h2>Mais opções</h2><button class="icon-btn" data-act="close">${icon('x')}</button></div><div class="list">${items.map(n => `<a class="item" href="#/staff/${n[0]}" data-act="close"><div class="avatar sm">${icon(n[2],'sm')}</div><div class="grow t">${n[1]}</div>${icon('chevR','sm')}</a>`).join('')}
    <button class="item" data-act="theme"><div class="avatar sm">${icon(UI.theme()==='dark'?'sun':'moon','sm')}</div><div class="grow t">Tema ${UI.theme()==='dark'?'claro':'escuro'}</div></button>
    <button class="item" data-act="logout"><div class="avatar sm">${icon('logout','sm')}</div><div class="grow t">Sair</div></button></div>`);
};
A.logout = () => { document.querySelectorAll('.overlay').forEach(o => o.remove()); document.body.style.overflow = ''; Rest.stop(); Auth.set(null); location.hash = ''; App.render(); };

/* ---------- login ---------- */
function loginView() {
  const demos = [['u_s1','Aluno','Veja treinos, agenda, progresso e pagamentos','user'],['u_p1','Professor','Monte treinos e acompanhe seus alunos','dumbbell'],['u_admin','Administrador','Alunos, planos, financeiro e equipe','grid']];
  return `<div class="login">
    <div class="login-art"><div class="row" style="font-weight:700;font-size:1.1rem"><div class="logo" style="background:var(--accent-ink);color:var(--accent)">A</div>${esc(Store.d.gym.name)}</div>
      <div><h2>Gestão de academia simples, completa e feita para o celular.</h2>
      <div class="feat">${['Treinos com passo a passo e cronômetro de descanso','Agenda de aulas com reservas','Planos, vendas e financeiro em um só lugar','Painel com indicadores em tempo real'].map(t => `<div>${icon('check','sm')}${t}</div>`).join('')}</div></div>
      <div class="small" style="opacity:.6">Projeto de portfólio — dados fictícios</div></div>
    <div class="login-box"><div class="row" style="margin-bottom:6px"><div class="logo">A</div><b>${esc(Store.d.gym.name)}</b></div>
      <h1 style="margin-top:14px">Bem-vindo(a)</h1><p class="muted">Escolha um perfil para explorar a demonstração.</p>
      <div class="roles">${demos.map(d => `<button class="role" data-act="demoLogin" data-id="${d[0]}"><div class="ic">${icon(d[3])}</div><div class="grow"><b>${d[1]}</b><div class="muted small">${d[2]}</div></div>${icon('chevR','sm')}</button>`).join('')}</div>
      <div class="divider"></div><form id="lf"><div class="field"><label>E-mail</label><input class="input" name="email" type="email" autocomplete="username" placeholder="marina@email.com"></div><div class="field"><label>Senha</label><input class="input" name="pass" type="password" autocomplete="current-password" placeholder="123456"></div><button class="btn primary block" type="submit">Entrar</button></form>
      <p class="muted tiny" style="margin-top:14px;text-align:center">Senha de todos os usuários da demo: <b>123456</b></p></div></div>`;
}
A.demoLogin = el => { Auth.set(el.dataset.id); const u = Auth.user; location.hash = u.role === 'aluno' ? '#/aluno/home' : '#/staff/dashboard'; App.render(); };
document.addEventListener('submit', e => {
  if (e.target.id !== 'lf') return; e.preventDefault();
  const f = UI.form(e.target), u = Store.d.users.find(x => x.email.toLowerCase() === f.email.trim().toLowerCase() && x.pass === f.pass);
  if (!u) return UI.toast('E-mail ou senha incorretos', 'lock');
  Auth.set(u.id); location.hash = u.role === 'aluno' ? '#/aluno/home' : '#/staff/dashboard'; App.render();
});

window.addEventListener('hashchange', () => App.render());
window.addEventListener('DOMContentLoaded', () => { UI.initTheme(); Store.init(); App.render(); });

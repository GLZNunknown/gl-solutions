/* Balcão (venda rápida), orçamentos e documentos */
const St = {pq:'', pc:'', cart:null, cartOpen:false, qf:'todos'};
const newCart = () => ({items:[], customerId:'', discount:0, freight:0, delivery:false, addr:'', win:'Tarde', pay:'Dinheiro', due:addDays(today(), 30), recv:0, quoteId:null});
St.cart = newCart();
const cartTotal = c => r2(Q.itemsTotal(c.items.map(i => ({qty:i.qty, price:Q.prod(i.pid).price}))) - c.discount + (c.delivery ? c.freight : 0));
const cartLines = c => c.items.map(i => { const p = Q.prod(i.pid); return {pid:p.id, qty:i.qty, price:p.price, cost:p.cost}; });

/* ---------- documento imprimível ---------- */
function docHtml({title, num, date, validade, customer, lines, discount, freight, total, pay, address, notes, foot}) {
  const co = Store.d.co;
  return `<div class="doc print-area"><div class="doc-h"><div><b class="doc-co">${esc(co.name)}</b><div class="tiny muted">${esc(co.address)} · ${esc(co.phone)}</div></div><div style="text-align:right"><b>${title} #${num}</b><div class="tiny muted">${fmtD(date)}${validade ? ' · válido até ' + fmtD(validade) : ''}</div></div></div>
    <div class="small" style="margin:10px 0"><b>Cliente:</b> ${esc(customer?.name || 'Consumidor final')}${customer?.phone ? ' · ' + esc(customer.phone) : ''}${address ? `<br><b>Entrega:</b> ${esc(address)}` : ''}</div>
    <table class="doc-t"><thead><tr><th>Item</th><th>Qtd</th><th>Unit.</th><th style="text-align:right">Total</th></tr></thead><tbody>${lines.map(x => `<tr><td>${esc(Q.lineName(x))}</td><td>${fq(x.qty)} ${esc(Q.prod(x.pid)?.unit || '')}</td><td>${brl(x.price)}</td><td style="text-align:right">${brl(x.qty * x.price)}</td></tr>`).join('')}</tbody></table>
    <div class="doc-tot"><div><span>Subtotal</span><b>${brl(Q.itemsTotal(lines))}</b></div>${discount ? `<div><span>Desconto</span><b>− ${brl(discount)}</b></div>` : ''}${freight ? `<div><span>Frete</span><b>${brl(freight)}</b></div>` : ''}<div class="big"><span>Total</span><b>${brl(total)}</b></div></div>
    ${pay ? `<div class="small" style="margin-top:8px"><b>Pagamento:</b> ${esc(pay)}</div>` : ''}${notes ? `<div class="small muted" style="margin-top:6px">${esc(notes)}</div>` : ''}<div class="tiny muted" style="margin-top:12px;text-align:center">${foot || 'Obrigado pela preferência!'}</div></div>`;
}
const saleText = s => { const c = Q.cust(s.customerId), co = Store.d.co; return `*${co.name}* — Venda #${s.num}\n${fmtD(s.date)}\n\n${s.items.map(x => `• ${fq(x.qty)} ${Q.prod(x.pid)?.unit} ${Q.lineName(x)} — ${brl(x.qty * x.price)}`).join('\n')}\n\n${s.discount ? 'Desconto: ' + brl(s.discount) + '\n' : ''}${s.freight ? 'Frete: ' + brl(s.freight) + '\n' : ''}*Total: ${brl(s.total)}*\nPagamento: ${Q.payLabel(s)}${Q.balance(s) > 0 ? '\nSaldo a pagar: ' + brl(Q.balance(s)) + ' até ' + fmtD(s.due) : ''}\n\nObrigado, ${firstName(c?.name || 'cliente')}!`; };
const quoteText = q => { const c = Q.cust(q.customerId), co = Store.d.co, tot = r2(q.subtotal - q.discount + q.freight); return `*${co.name}* — Orçamento #${q.num}\nVálido até ${fmtD(q.valid)}\n\n${q.items.map(x => `• ${fq(x.qty)} ${Q.prod(x.pid)?.unit} ${Q.lineName(x)} — ${brl(x.qty * x.price)}`).join('\n')}\n\n${q.discount ? 'Desconto: ' + brl(q.discount) + '\n' : ''}${q.freight ? 'Frete: ' + brl(q.freight) + '\n' : ''}*Total: ${brl(tot)}*\n\nOlá, ${firstName(c?.name || 'cliente')}! Posso separar o material para você?`; };

/* ---------- BALCÃO ---------- */
function prodRows() {
  const q = norm(St.pq); let L = Store.d.products.filter(p => p.active && (!St.pc || p.cat === St.pc) && (!q || norm(p.name).includes(q) || p.code.includes(q)));
  if (!L.length) return UI.empty('search', 'Nenhum produto encontrado.');
  return L.slice(0, 60).map(p => { const st = Q.stockSt(p), inCart = St.cart.items.find(i => i.pid === p.id);
    return `<button class="prow ${inCart ? 'in' : ''}" data-act="addCart" data-id="${p.id}"><div class="grow"><div class="t">${esc(p.name)}</div><div class="s">cód. ${p.code} · ${fq(p.stock)} ${esc(p.unit)} ${st.k !== 'ok' ? `<span class="badge ${st.c}">${st.l}</span>` : ''}</div></div><div style="text-align:right"><b class="num">${brl(p.price)}</b><div class="tiny muted">/${esc(p.unit)}</div></div><span class="plus">${inCart ? fq(inCart.qty) : icon('plus', 'sm')}</span></button>`; }).join('');
}
Pages.balcao = () => {
  const total = cartTotal(St.cart), n = St.cart.items.length;
  return UI.head('Balcão', 'Venda rápida: toque nos produtos para adicionar ao carrinho', St.cart.quoteId ? `<span class="chip">Convertendo orçamento #${Q.quote(St.cart.quoteId)?.num}</span>` : '') + `<div class="pdv">
    <section class="pdv-prod"><div class="toolbar"><div class="search">${icon('search', 'sm')}<input class="input" id="pq" placeholder="Buscar produto por nome ou código" data-in="pq" value="${esc(St.pq)}" autocomplete="off"></div></div>
      <div class="chips" style="margin-bottom:10px"><button class="chip ${!St.pc ? 'on' : ''}" data-act="pc" data-v="">Todos</button>${CATS.map(c => `<button class="chip ${St.pc === c ? 'on' : ''}" data-act="pc" data-v="${esc(c)}">${c}</button>`).join('')}</div>
      <div class="card flat" style="padding:4px 8px"><div id="plist">${prodRows()}</div></div></section>
    <aside class="cart ${St.cartOpen ? 'open' : ''}" id="cart">${cartHtml()}</aside></div>
    <button class="cartbar" data-act="cartOpen" id="cartbar" ${n ? '' : 'hidden'}><span>${icon('cart')} <b id="cb-n">${n}</b> ite${n === 1 ? 'm' : 'ns'}</span><b class="num" id="cb-t">${brl(total)}</b><span>Ver carrinho ${icon('chevR', 'sm')}</span></button>`;
};
function cartHtml() {
  const c = St.cart, cu = Q.cust(c.customerId), items = c.items, total = cartTotal(c), bal = cu ? Q.custBalance(cu.id) : 0;
  const lines = items.map((it, i) => { const p = Q.prod(it.pid), short = it.qty > p.stock;
    return `<div class="cl"><div class="grow"><div class="t">${esc(p.name)}</div><div class="s">${brl(p.price)} / ${esc(p.unit)}${short ? ` · <span style="color:var(--bad)">estoque ${fq(p.stock)}</span>` : ''}</div></div>
      <div class="qty"><button data-act="qtyStep" data-i="${i}" data-n="-1" aria-label="Diminuir">${icon('minus', 'sm')}</button><input inputmode="decimal" data-in="qtyIn" data-i="${i}" value="${fq(it.qty)}" aria-label="Quantidade"><button data-act="qtyStep" data-i="${i}" data-n="1" aria-label="Aumentar">${icon('plus', 'sm')}</button></div>
      <b class="num lt" id="lt-${i}">${brl(it.qty * p.price)}</b><button class="icon-btn ghost" style="width:32px;height:32px;border:0" data-act="rmItem" data-i="${i}" aria-label="Remover">${icon('x', 'sm')}</button></div>`; }).join('');
  return `<div class="cart-h"><h3>${icon('cart')} Carrinho</h3><div class="row" style="gap:6px">${items.length ? `<button class="btn sm ghost" data-act="cartClear">Limpar</button>` : ''}<button class="icon-btn only-mobile" style="width:34px;height:34px" data-act="cartClose" aria-label="Fechar">${icon('x', 'sm')}</button></div></div>
  <div class="cart-body">
    <div class="field"><label>Cliente</label><div class="row" style="gap:6px"><select class="select" data-ch="cartCust"><option value="">Consumidor final</option>${selOpts(Store.d.customers.slice().sort((a, b) => a.name.localeCompare(b.name)), c.customerId, x => x.name)}</select><button class="btn" data-act="custNew" aria-label="Novo cliente" style="padding:0 12px">${icon('plus', 'sm')}</button></div>${cu && bal > 0 ? `<div class="tiny" style="color:var(--warn)">Saldo devedor: ${brl(bal)} · limite ${brl(cu.limit)}</div>` : ''}</div>
    <div class="cl-list">${lines || UI.empty('cart', 'Carrinho vazio. Toque em um produto.')}</div>
    <div class="cart-opt"><label class="row between small"><span class="row" style="gap:8px">${icon('truck', 'sm')} Entregar no endereço</span><span class="switch"><input type="checkbox" data-ch="cartDel" ${c.delivery ? 'checked' : ''}><i></i></span></label>
      ${c.delivery ? `<div class="field" style="margin:10px 0 0"><input class="input" placeholder="Endereço de entrega" data-in="cartF" data-f="addr" value="${esc(c.addr)}"><div class="form-row" style="margin-top:8px"><div class="chips">${['Manhã', 'Tarde'].map(w => `<button class="chip ${c.win === w ? 'on' : ''}" data-act="cartWin" data-v="${w}">${w}</button>`).join('')}</div><input class="input" inputmode="decimal" placeholder="Frete R$" data-in="cartF" data-f="freight" value="${c.freight || ''}"></div></div>` : ''}</div>
    <div class="field" style="margin-top:10px"><label>Desconto (R$)</label><input class="input" inputmode="decimal" data-in="cartF" data-f="discount" value="${c.discount || ''}" placeholder="0,00"></div>
    <div class="field"><label>Pagamento</label><div class="chips pay">${PAY.map(m => `<button class="chip ${c.pay === m ? 'on' : ''}" data-act="cartPay" data-v="${m}">${m}</button>`).join('')}</div></div>
    ${c.pay === 'Fiado' ? `<div class="form-row"><div class="field"><label>Vencimento</label><input class="input" type="date" data-in="cartF" data-f="due" value="${c.due}"></div><div class="field"><label>Entrada (R$)</label><input class="input" inputmode="decimal" data-in="cartF" data-f="recv" value="${c.recv || ''}" placeholder="0,00"></div></div>${cu ? `<div class="tiny muted">Crédito disponível: ${brl(Math.max(0, cu.limit - bal))}</div>` : '<div class="tiny" style="color:var(--bad)">Selecione um cliente para vender fiado.</div>'}` : ''}
    ${c.pay === 'Dinheiro' ? `<div class="field"><label>Valor recebido (R$)</label><input class="input" inputmode="decimal" data-in="cartF" data-f="recv" value="${c.recv || ''}" placeholder="Para calcular o troco"></div>` : ''}</div>
  <div class="cart-f"><div id="cart-tot">${totalsHtml()}</div><div class="row" style="gap:8px;margin-top:10px"><button class="btn" data-act="saveQuote" ${items.length ? '' : 'disabled'}>${icon('receipt', 'sm')} Orçamento</button><button class="btn primary grow" data-act="finishSale" ${items.length ? '' : 'disabled'}>${icon('check', 'sm')} Finalizar venda</button></div></div>`;
}
function totalsHtml() {
  const c = St.cart, sub = Q.itemsTotal(cartLines(c)), tot = cartTotal(c), troco = c.pay === 'Dinheiro' && numIn(c.recv) > tot ? r2(numIn(c.recv) - tot) : 0;
  return `<div class="tl"><span>Subtotal</span><b class="num">${brl(sub)}</b></div>${c.discount ? `<div class="tl"><span>Desconto</span><b class="num">− ${brl(c.discount)}</b></div>` : ''}${c.delivery && c.freight ? `<div class="tl"><span>Frete</span><b class="num">${brl(c.freight)}</b></div>` : ''}<div class="tl big"><span>Total</span><b class="num">${brl(tot)}</b></div>${troco ? `<div class="tl"><span>Troco</span><b class="num" style="color:var(--ok)">${brl(troco)}</b></div>` : ''}`;
}
function refreshCart(full = true) {
  const el = $('#cart'); if (!el) return; if (full) el.innerHTML = cartHtml(); else { const t = $('#cart-tot'); if (t) t.innerHTML = totalsHtml(); St.cart.items.forEach((it, i) => { const l = $('#lt-' + i); if (l) l.textContent = brl(it.qty * Q.prod(it.pid).price); }); }
  const n = St.cart.items.length, b = $('#cartbar'); if (b) { b.hidden = !n; $('#cb-n').textContent = n; $('#cb-t').textContent = brl(cartTotal(St.cart)); }
  const pl = $('#plist'); if (pl) pl.innerHTML = prodRows();
}
I.pq = el => { St.pq = el.value; $('#plist').innerHTML = prodRows(); };
A.pc = el => { St.pc = el.dataset.v; App.render(true); };
A.addCart = el => { const it = St.cart.items.find(i => i.pid === el.dataset.id); if (it) it.qty = r2(it.qty + 1); else St.cart.items.push({pid:el.dataset.id, qty:1}); refreshCart(); };
A.qtyStep = el => { const it = St.cart.items[+el.dataset.i]; it.qty = r2(Math.max(0, it.qty + +el.dataset.n)); if (it.qty <= 0) St.cart.items.splice(+el.dataset.i, 1); refreshCart(); };
I.qtyIn = el => { const it = St.cart.items[+el.dataset.i]; it.qty = Math.max(0, numIn(el.value)); refreshCart(false); };
A.rmItem = el => { St.cart.items.splice(+el.dataset.i, 1); refreshCart(); };
A.cartClear = () => { St.cart = newCart(); refreshCart(); };
A.cartOpen = () => { St.cartOpen = true; $('#cart').classList.add('open'); };
A.cartClose = () => { St.cartOpen = false; $('#cart').classList.remove('open'); };
I.cartCust = el => { St.cart.customerId = el.value; const c = Q.cust(el.value); if (c && St.cart.delivery) St.cart.addr = c.address; refreshCart(); };
I.cartDel = el => { St.cart.delivery = el.checked; const c = Q.cust(St.cart.customerId); if (el.checked && !St.cart.addr && c) St.cart.addr = c.address; refreshCart(); };
A.cartWin = el => { St.cart.win = el.dataset.v; refreshCart(); };
A.cartPay = el => { St.cart.pay = el.dataset.v; St.cart.recv = 0; refreshCart(); };
I.cartF = el => { const f = el.dataset.f, c = St.cart; c[f] = ['discount', 'freight', 'recv'].includes(f) ? Math.max(0, numIn(el.value)) : el.value; refreshCart(false); };
A.custNew = () => custForm(null, c => { St.cart.customerId = c.id; refreshCart(); });

A.finishSale = () => {
  const c = St.cart, tot = cartTotal(c), cu = Q.cust(c.customerId);
  if (!c.items.length) return;
  const short = c.items.find(i => i.qty > Q.prod(i.pid).stock); if (short) return UI.toast(`Estoque insuficiente: ${Q.prod(short.pid).name} (${fq(Q.prod(short.pid).stock)} disponível)`, 'alert');
  if (c.delivery && !c.addr.trim()) return UI.toast('Informe o endereço de entrega', 'info');
  if (c.pay === 'Fiado') { if (!cu) return UI.toast('Selecione um cliente para vender fiado', 'info'); const novo = tot - Math.min(tot, c.recv); if (Q.custBalance(cu.id) + novo > cu.limit) return UI.toast(`Limite de crédito excedido (${brl(cu.limit)})`, 'alert'); }
  const s = createSale({customerId:c.customerId, items:cartLines(c), discount:c.discount, freight:c.delivery ? c.freight : 0, pay:c.pay, due:c.due, received:c.recv, delivery:c.delivery ? {address:c.addr, window:c.win} : null, quoteId:c.quoteId});
  St.cart = newCart(); St.cartOpen = false; UI.toast(`Venda #${s.num} registrada: ${brl(s.total)}`); App.render(true); showReceipt(s.id);
};
function showReceipt(id) {
  const s = Q.sale(id), cu = Q.cust(s.customerId), dv = Q.deliveryOf(s);
  UI.modal(`<div class="sheet-h"><h2>Venda #${s.num}</h2>${closeBtn}</div>${docHtml({title:'Cupom', num:s.num, date:s.date, customer:cu, lines:s.items, discount:s.discount, freight:s.freight, total:s.total, pay:Q.payLabel(s) + (Q.balance(s) > 0 ? ` · saldo ${brl(Q.balance(s))} até ${fmtD(s.due)}` : ''), address:dv?.address})}
    <div class="sheet-f" style="flex-wrap:wrap"><button class="btn" data-act="printDoc">${icon('receipt', 'sm')} Imprimir</button><a class="btn" target="_blank" rel="noopener" href="${UI.wa(cu?.phone, saleText(s))}">${icon('phone', 'sm')} WhatsApp</a><button class="btn primary" data-act="close">Concluir</button></div>`);
}
A.printDoc = () => window.print();
A.showSale = el => showReceipt(el.dataset.id);

/* ---------- ORÇAMENTOS ---------- */
A.saveQuote = () => {
  const c = St.cart; if (!c.items.length) return; if (!c.customerId) return UI.toast('Selecione o cliente para salvar o orçamento', 'info');
  const D = Store.d, q = {id:'q' + D.seq.quote, num:D.seq.quote++, date:today(), valid:addDays(today(), 7), customerId:c.customerId, items:cartLines(c), discount:c.discount, freight:c.delivery ? c.freight : 0, subtotal:Q.itemsTotal(cartLines(c)), notes:'', status:'aberto', saleId:null};
  D.quotes.push(q); Store.save(); St.cart = newCart(); St.cartOpen = false; UI.toast(`Orçamento #${q.num} salvo`, 'receipt'); location.hash = '#/orcamentos'; showQuote(q.id);
};
const quoteSt = q => q.status === 'aberto' && q.valid < today() ? {k:'vencido', l:'Vencido', c:'warn'} : ({aberto:{k:'aberto', l:'Aberto', c:''}, aprovado:{k:'aprovado', l:'Aprovado', c:'ok'}, convertido:{k:'convertido', l:'Virou venda', c:'ok'}, recusado:{k:'recusado', l:'Recusado', c:'bad'}})[q.status];
Pages.orcamentos = () => {
  const f = St.qf, L = Store.d.quotes.slice().sort((a, b) => b.num - a.num).filter(q => f === 'todos' || quoteSt(q).k === f);
  const open = Store.d.quotes.filter(q => quoteSt(q).k === 'aberto');
  return UI.head('Orçamentos', `${open.length} aberto(s) · ${brl(open.reduce((a, q) => a + q.subtotal - q.discount + q.freight, 0))} em propostas`, `<button class="btn primary" data-act="newQuote">${icon('plus', 'sm')} Novo orçamento</button>`) + `
    <div class="chips" style="margin-bottom:12px">${[['todos', 'Todos'], ['aberto', 'Abertos'], ['aprovado', 'Aprovados'], ['convertido', 'Viraram venda'], ['vencido', 'Vencidos'], ['recusado', 'Recusados']].map(([k, l]) => `<button class="chip ${f === k ? 'on' : ''}" data-act="qFilter" data-v="${k}">${l}</button>`).join('')}</div>
    ${L.length ? `<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Orçamento</th><th>Cliente</th><th>Validade</th><th>Total</th><th>Status</th></tr></thead><tbody>${L.map(q => `<tr class="click" data-act="quoteOpen" data-id="${q.id}"><td class="main"><b>#${q.num}</b> <span class="muted small">${fmtD(q.date)}</span></td><td data-l="Cliente">${esc(Q.cust(q.customerId)?.name)}</td><td data-l="Validade">${fmtD(q.valid)}</td><td data-l="Total"><b class="num">${brl(q.subtotal - q.discount + q.freight)}</b></td><td data-l="Status">${UI.badge(quoteSt(q))}</td></tr>`).join('')}</tbody></table></div>` : `<div class="card">${UI.empty('receipt', 'Nenhum orçamento neste filtro.')}</div>`}`;
};
A.qFilter = el => { St.qf = el.dataset.v; App.render(true); };
A.newQuote = () => { St.cart = newCart(); location.hash = '#/balcao'; UI.toast('Monte os itens e toque em "Orçamento"', 'receipt'); };
A.quoteOpen = el => showQuote(el.dataset.id);
function showQuote(id) {
  const q = Q.quote(id), cu = Q.cust(q.customerId), st = quoteSt(q), tot = r2(q.subtotal - q.discount + q.freight), canAct = ['aberto', 'aprovado'].includes(q.status);
  UI.modal(`<div class="sheet-h"><h2>Orçamento #${q.num}</h2>${closeBtn}</div><div class="row" style="margin-bottom:10px">${UI.badge(st)}</div>${docHtml({title:'Orçamento', num:q.num, date:q.date, validade:q.valid, customer:cu, lines:q.items, discount:q.discount, freight:q.freight, total:tot, foot:'Valores sujeitos a alteração de estoque e preço após a validade.'})}
    <div class="row wrap" style="gap:8px;margin-top:14px">${canAct ? `<button class="btn primary" data-act="quoteToSale" data-id="${q.id}">${icon('cart', 'sm')} Converter em venda</button>` : ''}${q.status === 'aberto' ? `<button class="btn" data-act="quoteSt" data-id="${q.id}" data-s="aprovado">Marcar aprovado</button><button class="btn danger" data-act="quoteSt" data-id="${q.id}" data-s="recusado">Recusado</button>` : ''}<a class="btn" target="_blank" rel="noopener" href="${UI.wa(cu?.phone, quoteText(q))}">${icon('phone', 'sm')} WhatsApp</a><button class="btn" data-act="printDoc">Imprimir</button>${q.status !== 'convertido' ? `<button class="btn ghost" data-act="quoteDel" data-id="${q.id}" aria-label="Excluir">${icon('trash', 'sm')}</button>` : ''}</div>`);
}
A.quoteSt = el => { Q.quote(el.dataset.id).status = el.dataset.s; Store.save(); UI.close(); UI.toast('Orçamento atualizado'); App.render(true); };
A.quoteDel = el => { Store.d.quotes = Store.d.quotes.filter(q => q.id !== el.dataset.id); Store.save(); UI.close(); UI.toast('Orçamento excluído', 'trash'); App.render(true); };
A.quoteToSale = el => { const q = Q.quote(el.dataset.id), c = newCart(); c.items = q.items.map(x => ({pid:x.pid, qty:x.qty})); c.customerId = q.customerId; c.discount = q.discount; c.freight = q.freight; c.delivery = q.freight > 0; c.addr = Q.cust(q.customerId)?.address || ''; c.quoteId = q.id; St.cart = c; UI.close(); location.hash = '#/balcao'; UI.toast('Itens carregados no carrinho. Confira e finalize.', 'cart'); };

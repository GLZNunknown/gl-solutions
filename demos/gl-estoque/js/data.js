/* Catálogo e gerador de dados de demonstração — depósito de material de construção */
const CATS = ['Cimento e argamassa','Areia e pedra','Alvenaria','Ferragens','Hidráulica','Elétrica','Tintas','Pisos e revestimentos','Ferramentas','Segurança'];
const SUPPLIERS = [
  ['Cimentos Planalto','(11) 4400-1100','Marcos'], ['Areial São Jorge','(11) 4400-2200','Sr. Jorge'], ['Ferro e Aço Forte','(11) 4400-3300','Patrícia'],
  ['Tubos e Conexões Vale','(11) 4400-4400','Renato'], ['Elétrica Bandeirantes','(11) 4400-5500','Lúcia'], ['Tintas Horizonte','(11) 4400-6600','Fábio'], ['Cerâmica Santa Rita','(11) 4400-7700','Dona Rita'], ['Ferramentas Central','(11) 4400-8800','Cláudio']
];
// [nome, categoria, unidade, custo, preço, estoque, mínimo, fornecedor(index)]
const PRODUCTS = [
 ['Cimento CP-II 50 kg','Cimento e argamassa','saco',31.5,39.9,184,80,0],['Cimento CP-III 50 kg','Cimento e argamassa','saco',33,42.5,96,40,0],['Argamassa AC-I 20 kg','Cimento e argamassa','saco',11.2,16.9,120,50,0],['Argamassa AC-II 20 kg','Cimento e argamassa','saco',16.5,24.9,64,40,0],['Cal hidratada 20 kg','Cimento e argamassa','saco',12.8,18.5,38,30,0],['Rejunte 1 kg','Cimento e argamassa','pacote',3.9,7.9,52,25,0],
 ['Areia média','Areia e pedra','m³',78,130,22,10,1],['Areia fina','Areia e pedra','m³',82,138,14,8,1],['Brita 1','Areia e pedra','m³',96,155,6,8,1],['Pedrisco','Areia e pedra','m³',92,148,9,5,1],['Pó de pedra','Areia e pedra','m³',70,118,11,5,1],
 ['Tijolo baiano 8 furos','Alvenaria','milheiro',620,890,9,4,6],['Bloco de concreto 14x19x39','Alvenaria','un',2.9,4.5,1450,600,6],['Bloco cerâmico 9x19x19','Alvenaria','un',1.1,1.8,2400,800,6],['Telha cerâmica colonial','Alvenaria','un',1.8,2.9,860,300,6],['Telha fibrocimento 2,44 m','Alvenaria','un',46,69,48,20,6],
 ['Vergalhão 8 mm 12 m','Ferragens','barra',34,49.9,86,40,2],['Vergalhão 10 mm 12 m','Ferragens','barra',52,74.9,60,30,2],['Arame recozido nº 18','Ferragens','kg',11.5,17.9,45,20,2],['Prego 18x27','Ferragens','kg',12.5,19.9,34,15,2],['Tela soldada Q-92','Ferragens','painel',118,169,12,6,2],['Dobradiça 3"','Ferragens','par',5.6,11.9,70,25,7],['Fechadura externa','Ferragens','un',38,69.9,18,8,7],['Cadeado 35 mm','Ferragens','un',12.5,24.9,40,15,7],
 ['Tubo PVC esgoto 100 mm 6 m','Hidráulica','barra',58,89.9,22,10,3],['Tubo PVC soldável 25 mm 6 m','Hidráulica','barra',19,32.9,48,20,3],['Joelho 90° 25 mm','Hidráulica','un',0.9,2.4,320,100,3],['Registro de gaveta 3/4"','Hidráulica','un',24,44.9,26,10,3],['Caixa d’água 1000 L','Hidráulica','un',310,469,5,3,3],['Cola para PVC 175 g','Hidráulica','un',9.5,16.9,34,15,3],['Torneira de jardim','Hidráulica','un',9,19.9,28,10,3],['Vaso sanitário com caixa','Hidráulica','un',210,329,7,4,3],
 ['Fio flexível 2,5 mm 100 m','Elétrica','rolo',138,209,14,8,4],['Fio flexível 4 mm 100 m','Elétrica','rolo',215,319,9,5,4],['Disjuntor 20 A','Elétrica','un',11,21.9,42,15,4],['Tomada 10 A com placa','Elétrica','un',6.2,13.9,90,30,4],['Interruptor simples','Elétrica','un',5.1,11.9,75,30,4],['Lâmpada LED 9 W','Elétrica','un',4.2,9.9,160,60,4],['Eletroduto corrugado 3/4"','Elétrica','rolo',46,74.9,16,8,4],
 ['Tinta acrílica branca 18 L','Tintas','lata',212,329,12,6,5],['Tinta acrílica 3,6 L','Tintas','lata',58,94.9,24,10,5],['Selador acrílico 18 L','Tintas','lata',118,179,6,5,5],['Massa corrida 25 kg','Tintas','lata',58,89.9,15,8,5],['Rolo de lã 23 cm','Tintas','un',9.5,18.9,45,15,5],['Lixa d’água nº 150','Tintas','un',0.9,2.5,200,60,5],
 ['Porcelanato 60x60 (caixa 2,2 m²)','Pisos e revestimentos','caixa',92,149,35,15,6],['Piso cerâmico 45x45 (caixa 2,5 m²)','Pisos e revestimentos','caixa',54,89.9,40,15,6],['Revestimento 33x45 (caixa 2,0 m²)','Pisos e revestimentos','caixa',48,79.9,28,12,6],['Argamassa colante AC-III 20 kg','Pisos e revestimentos','saco',22,35.9,44,25,0],
 ['Carrinho de mão','Ferramentas','un',118,189,8,3,7],['Pá quadrada','Ferramentas','un',24,42.9,16,6,7],['Enxada','Ferragens','un',22,39.9,14,6,7],['Trena 5 m','Ferramentas','un',9,19.9,36,12,7],['Nível de bolha 40 cm','Ferramentas','un',14,29.9,18,6,7],['Martelo unha 27 mm','Ferramentas','un',22,39.9,20,8,7],['Colher de pedreiro','Ferramentas','un',12,24.9,26,10,7],['Furadeira de impacto 650 W','Ferramentas','un',165,259,6,3,7],
 ['Luva de raspa','Segurança','par',6.5,14.9,60,25,7],['Capacete de obra','Segurança','un',9,19.9,32,12,7],['Bota de segurança','Segurança','par',42,79.9,15,8,7],['Óculos de proteção','Segurança','un',3.2,8.9,48,20,7]
];
const DRIVERS = [['Valdir','Caminhão baú · ABC-1D23','(11) 97700-1111'],['Anderson','Pickup · FGH-4J56','(11) 97700-2222']];
const CUSTOMERS = [
 ['Construtora Alvorada','Construtora','(11) 98100-1010','12.345.678/0001-90','Rua das Indústrias, 450 — Santo André',20000],['Reformas Silva','Pedreiro','(11) 98100-2020','','Av. Industrial, 1200 — Santo André',3000],['Edivaldo Pereira (pedreiro)','Pedreiro','(11) 98100-3030','','Rua Bartolomeu, 87 — Santo André',2000],['Marcos Antunes','Particular','(11) 98100-4040','','Rua dos Ipês, 33 — São Bernardo',1000],['Casa & Obra Engenharia','Construtora','(11) 98100-5050','23.456.789/0001-01','Av. dos Estados, 2300 — Santo André',15000],
 ['Josiane Lima','Particular','(11) 98100-6060','','Rua Oratório, 150 — Mauá',800],['Pedro Tavares (eletricista)','Pedreiro','(11) 98100-7070','','Rua Cuba, 70 — Santo André',1500],['Condomínio Jardim das Flores','Empresa','(11) 98100-8080','34.567.890/0001-12','Rua Flores, 10 — Santo André',6000],['Marcelo Bueno','Particular','(11) 98100-9090','','Rua Pinheiros, 98 — Santo André',1000],['Pintura Rápida ME','Empresa','(11) 98200-1010','45.678.901/0001-23','Rua Sergipe, 421 — Santo André',4000],
 ['Rogério Alves (mestre de obras)','Pedreiro','(11) 98200-2020','','Rua Paraná, 12 — Santo André',3500],['Ana Paula Ribeiro','Particular','(11) 98200-3030','','Rua Goiás, 301 — Santo André',700],['Eduardo Fonseca','Particular','(11) 98200-4040','','Rua Bahia, 77 — São Caetano',900],['Hidráulica Santos','Empresa','(11) 98200-5050','56.789.012/0001-34','Av. Kennedy, 800 — São Bernardo',5000],['Igreja Nova Vida','Empresa','(11) 98200-6060','','Rua Esperança, 5 — Santo André',2500],
 ['Lucas Moreira','Particular','(11) 98200-7070','','Rua Alagoas, 66 — Santo André',600],['Sebastião Gomes (pedreiro)','Pedreiro','(11) 98200-8080','','Rua Piauí, 140 — Mauá',2000],['Padaria Pão Quente','Empresa','(11) 98200-9090','67.890.123/0001-45','Rua Ceará, 9 — Santo André',1500],['Cláudia Souza','Particular','(11) 98300-1010','','Rua Amazonas, 210 — Santo André',500],['Tadeu Construções','Construtora','(11) 98300-2020','78.901.234/0001-56','Rua Minas, 600 — Santo André',9000]
];
const PAY = ['Dinheiro','PIX','Cartão','Fiado'];
function mulberry(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}

function buildSeed() {
  const rnd = mulberry(4242), R = (a, b) => a + Math.floor(rnd()*(b-a+1)), pick = a => a[Math.floor(rnd()*a.length)], T = today();
  const D = {v:1, co:{name:'Depósito Modelo', phone:'(11) 4500-1000', address:'Av. Industrial, 1500 — Santo André', owner:'Seu Antônio', pix:'financeiro@depositomodelo.com.br'}, seq:{sale:1000, quote:300}};
  D.suppliers = SUPPLIERS.map((s, i) => ({id:'f'+(i+1), name:s[0], phone:s[1], contact:s[2]}));
  D.products = PRODUCTS.map((p, i) => ({id:'p'+(i+1), code:String(1001 + i), name:p[0], cat:p[1], unit:p[2], cost:p[3], price:p[4], stock:p[5], min:p[6], sup:'f'+(p[7]+1), active:true}));
  [[4, 12], [7, 5], [18, 9], [20, 3], [33, 3], [41, 2], [49, 1], [59, 0], [10, 3]].forEach(([i, s]) => { D.products[i].stock = s; });
  D.customers = CUSTOMERS.map((c, i) => ({id:'c'+(i+1), name:c[0], type:c[1], phone:c[2], doc:c[3], address:c[4], limit:c[5], notes:'', created:addDays(T, -R(60, 700))}));
  D.drivers = DRIVERS.map((d, i) => ({id:'d'+(i+1), name:d[0], vehicle:d[1], phone:d[2]}));
  D.sales = []; D.quotes = []; D.deliveries = []; D.moves = []; D.cash = [];
  const hot = [0, 0, 6, 12, 12, 6, 16, 16, 0, 2, 14, 17, 18, 20, 21, 28, 38, 42, 46, 3]; // produtos mais vendidos
  const qtyFor = p => { const u = p.unit; return u === 'm³' ? R(1, 5) : u === 'milheiro' ? R(1, 3) : u === 'un' && p.price < 6 ? R(20, 200) : u === 'saco' ? R(2, 24) : u === 'barra' ? R(4, 24) : u === 'kg' ? R(2, 10) : u === 'caixa' ? R(4, 18) : R(1, 4); };
  const mkItems = () => { const n = R(1, 4), set = new Set(); while (set.size < n) set.add(rnd() < .55 ? pick(hot) : R(0, D.products.length - 1)); return [...set].map(i => { const p = D.products[i]; return {pid:p.id, qty:qtyFor(p), price:p.price, cost:p.cost}; }); };
  for (let d = -45; d <= 0; d++) {
    const date = addDays(T, d), wd = wday(date); if (wd === 0) continue;
    const n = wd === 6 ? R(5, 9) : R(8, 15) - (d === 0 ? 4 : 0);
    for (let i = 0; i < n; i++) {
      const items = mkItems(), sub = items.reduce((a, x) => a + x.qty * x.price, 0), cust = rnd() < .5 ? null : pick(D.customers), disc = rnd() < .15 ? Math.round(sub * .05) : 0;
      const wantsDel = sub > 350 && rnd() < .5, freight = wantsDel ? pick([0, 40, 60, 80]) : 0, total = Math.round((sub - disc + freight) * 100) / 100;
      let method = pick(['Dinheiro', 'PIX', 'PIX', 'Cartão', 'Cartão', 'Fiado', 'Fiado']); if (method === 'Fiado' && !cust) method = 'PIX';
      if (method === 'Fiado') { const owed = D.sales.filter(x => x.customerId === cust.id).reduce((a, x) => a + Math.max(0, x.total - x.pays.reduce((b, p) => b + p.amount, 0)), 0); if (owed + total > cust.limit * .8) method = pick(['PIX', 'Cartão']); }
      const ts = new Date(dt(date).setHours(R(7, 17), R(0, 59))).getTime(), sale = {id:'s' + (D.seq.sale), num:D.seq.sale++, date, ts, customerId:cust?.id || null, items, subtotal:Math.round(sub*100)/100, discount:disc, freight, total, pays:[], due:null, canceled:false, deliveryId:null, seller:pick(['Seu Antônio', 'Marta', 'Júnior'])};
      if (method === 'Fiado') { sale.due = addDays(date, pick([15, 30, 30, 45])); if (rnd() < .35 && sale.due < T) sale.pays.push({method:pick(['PIX', 'Dinheiro']), amount:total, date:sale.due}); else if (rnd() < .2) { const part = Math.round(total * .4); sale.pays.push({method:'Dinheiro', amount:part, date}); } }
      else sale.pays.push({method, amount:total, date});
      if (wantsDel) { const dv = {id:'e' + (D.deliveries.length + 1), saleId:sale.id, address:cust?.address || pick(['Rua das Acácias, 45 — Santo André', 'Rua Ceará, 330 — Santo André', 'Av. Pedro Américo, 90 — Mauá']), status:'entregue', driverId:pick(D.drivers).id, window:pick(['Manhã', 'Tarde']), ts, notes:''}; if (d === 0) dv.status = pick(['separando', 'separando', 'em_rota', 'em_rota', 'entregue']); if (d === 0 && dv.status !== 'entregue') dv.driverId = pick(['d1', 'd2']); D.deliveries.push(dv); sale.deliveryId = dv.id; }
      D.sales.push(sale);
      if (d >= -6) items.forEach(x => D.moves.push({id:uid('m'), ts, pid:x.pid, type:'saida', qty:x.qty, ref:'Venda #' + sale.num, note:''}));
    }
  }
  // entregas futuras (agendadas para hoje/amanhã) com pedidos do dia
  /* orçamentos */
  const stat = ['aberto', 'aberto', 'aberto', 'aprovado', 'recusado', 'aberto'];
  stat.forEach((s, i) => { const items = mkItems(), sub = items.reduce((a, x) => a + x.qty * x.price, 0), cust = pick(D.customers), date = addDays(T, -R(0, 6)); D.quotes.push({id:'q' + (D.seq.quote), num:D.seq.quote++, date, valid:addDays(date, 7), customerId:cust.id, items, discount:0, freight:rnd() < .4 ? 60 : 0, subtotal:Math.round(sub*100)/100, notes:'', status:s, saleId:null}); });
  /* compras (entradas) */
  [[0, 100, -3], [6, 8, -5], [16, 60, -4], [24, 30, -6], [36, 20, -2]].forEach(([pi, q, d]) => { const p = D.products[pi]; D.moves.push({id:uid('m'), ts:new Date(dt(addDays(T, d)).setHours(10, 20)).getTime(), pid:p.id, type:'entrada', qty:q, ref:'Compra · ' + D.suppliers.find(f => f.id === p.sup).name, note:''}); });
  /* caixa de hoje */
  D.cash.push({id:uid('x'), date:T, ts:new Date().setHours(7, 0), type:'abertura', amount:300, note:'Troco inicial'});
  D.cash.push({id:uid('x'), date:T, ts:new Date().setHours(11, 30), type:'despesa', amount:48.5, note:'Almoço da equipe'});
  D.cash.push({id:uid('x'), date:T, ts:new Date().setHours(9, 40), type:'suprimento', amount:100, note:'Reforço de troco'});
  D.sales.sort((a, b) => a.ts - b.ts); D.moves.sort((a, b) => b.ts - a.ts);
  return D;
}

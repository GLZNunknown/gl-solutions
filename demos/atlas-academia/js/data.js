/* Biblioteca de exercícios, modelos de treino e gerador de dados de demonstração */
const GROUPS = ['Peito','Costas','Ombros','Bíceps','Tríceps','Pernas','Glúteos','Abdômen','Cardio'];

const EX_LIB = [
 // [nome, grupo, equipamento, nível, passos[], dicas[]]
 ['Supino reto com barra','Peito','Barra','Intermediário',['Deite no banco com os pés firmes no chão e as escápulas aproximadas.','Segure a barra um pouco mais aberto que a largura dos ombros.','Desça a barra de forma controlada até tocar de leve o peito.','Empurre para cima estendendo os cotovelos sem travá-los.'],['Mantenha punhos alinhados com os cotovelos.','Não tire o quadril do banco.']],
 ['Supino inclinado com halteres','Peito','Halteres','Intermediário',['Ajuste o banco entre 30° e 45° e sente com as costas apoiadas.','Leve os halteres à altura do peito, cotovelos a 45° do tronco.','Empurre em arco até os halteres quase se encontrarem.','Desça devagar até sentir o alongamento do peito.'],['Controle a descida em 2–3 segundos.']],
 ['Crucifixo na máquina (peck deck)','Peito','Máquina','Iniciante',['Ajuste o banco para que as mãos fiquem na altura do peito.','Mantenha as costas coladas no encosto e os cotovelos levemente flexionados.','Una os braços à frente contraindo o peito.','Retorne devagar sem deixar o peso apoiar.'],['Evite elevar os ombros durante o movimento.']],
 ['Flexão de braços','Peito','Peso corporal','Iniciante',['Apoie as mãos no chão um pouco além da largura dos ombros.','Mantenha o corpo em linha reta, abdômen contraído.','Desça o peito até quase tocar o chão.','Empurre o chão e volte à posição inicial.'],['Com dificuldade, apoie os joelhos no chão.']],
 ['Crossover na polia','Peito','Polia','Intermediário',['Posicione as polias na altura dos ombros e dê um passo à frente.','Mantenha leve inclinação do tronco e cotovelos semiflexionados.','Cruze as mãos à frente do corpo em arco.','Volte lentamente sentindo o peito alongar.'],['Pare 1 segundo na contração máxima.']],
 ['Puxada frontal na polia','Costas','Polia','Iniciante',['Sente com as coxas travadas sob o apoio e segure a barra aberta.','Incline levemente o tronco para trás e peito aberto.','Puxe a barra até a altura do queixo levando os cotovelos para baixo.','Retorne devagar até estender os braços.'],['Pense em "puxar com os cotovelos", não com as mãos.']],
 ['Remada curvada com barra','Costas','Barra','Intermediário',['Em pé, joelhos levemente flexionados, incline o tronco a ~45°.','Segure a barra com pegada pronada na largura dos ombros.','Puxe a barra em direção ao abdômen, cotovelos junto ao corpo.','Desça controlando, mantendo a coluna neutra.'],['Não arredonde a lombar.']],
 ['Remada baixa sentada','Costas','Polia','Iniciante',['Sente com os pés apoiados e joelhos levemente flexionados.','Mantenha o tronco ereto e peito aberto.','Puxe o triângulo até o abdômen aproximando as escápulas.','Retorne alongando as costas sem arredondar.'],['Evite balançar o tronco para ganhar impulso.']],
 ['Barra fixa assistida','Costas','Máquina','Intermediário',['Ajuste o contrapeso conforme seu nível.','Segure a barra com pegada pronada, mais aberta que os ombros.','Suba até o queixo passar da barra.','Desça devagar até estender totalmente os braços.'],['Reduza gradualmente a assistência a cada semana.']],
 ['Remada unilateral com halter','Costas','Halter','Iniciante',['Apoie joelho e mão do mesmo lado no banco.','Com a outra mão, segure o halter com o braço estendido.','Puxe o halter em direção ao quadril.','Desça devagar e repita antes de trocar de lado.'],['Mantenha o tronco paralelo ao chão.']],
 ['Desenvolvimento com halteres','Ombros','Halteres','Intermediário',['Sentado, leve os halteres à altura das orelhas.','Cotovelos levemente à frente do tronco.','Empurre para cima sem bater os halteres.','Desça de forma controlada até a altura do queixo.'],['Contraia o abdômen para proteger a lombar.']],
 ['Elevação lateral','Ombros','Halteres','Iniciante',['Em pé, halteres ao lado do corpo e cotovelos levemente flexionados.','Eleve os braços lateralmente até a linha dos ombros.','Pause por um instante no topo.','Desça devagar sem balançar o corpo.'],['Use carga leve e foque na técnica.']],
 ['Elevação frontal','Ombros','Halteres','Iniciante',['Em pé, segure os halteres à frente das coxas.','Eleve um braço de cada vez até a altura dos ombros.','Controle a descida.','Alterne os lados.'],['Não use impulso do tronco.']],
 ['Face pull','Ombros','Polia','Intermediário',['Ajuste a polia na altura do rosto com a corda.','Puxe a corda em direção ao rosto abrindo os cotovelos.','Aproxime as escápulas no final do movimento.','Retorne devagar.'],['Ótimo para a postura e a saúde do ombro.']],
 ['Rosca direta com barra W','Bíceps','Barra','Iniciante',['Em pé, segure a barra com pegada supinada na largura dos ombros.','Cotovelos fixos junto ao tronco.','Flexione os cotovelos levando a barra até o peito.','Desça devagar até estender os braços.'],['Evite balançar o tronco.']],
 ['Rosca martelo','Bíceps','Halteres','Iniciante',['Em pé, segure os halteres com as palmas voltadas uma para a outra.','Flexione o cotovelo sem girar o punho.','Suba até a altura do ombro.','Desça controlando.'],['Trabalha também o antebraço.']],
 ['Rosca scott na máquina','Bíceps','Máquina','Iniciante',['Ajuste o banco para que as axilas apoiem no topo do suporte.','Segure as manoplas com pegada supinada.','Flexione os cotovelos até contrair o bíceps.','Retorne sem estender totalmente.'],['Mantenha tensão constante no músculo.']],
 ['Tríceps pulley com corda','Tríceps','Polia','Iniciante',['Em pé, de frente para a polia, segure a corda.','Cotovelos junto ao corpo.','Estenda os braços para baixo abrindo a corda no final.','Retorne até 90° de flexão do cotovelo.'],['Não deixe os cotovelos "abrirem".']],
 ['Tríceps testa','Tríceps','Barra W','Intermediário',['Deitado, segure a barra W com os braços estendidos acima do peito.','Flexione apenas os cotovelos levando a barra em direção à testa.','Estenda os braços de volta.','Mantenha os cotovelos apontados para o teto.'],['Comece leve para proteger os cotovelos.']],
 ['Mergulho no banco','Tríceps','Peso corporal','Iniciante',['Apoie as mãos no banco atrás do corpo, pernas à frente.','Flexione os cotovelos descendo o quadril.','Desça até ~90° de flexão.','Empurre de volta à posição inicial.'],['Mantenha as costas próximas ao banco.']],
 ['Agachamento livre','Pernas','Barra','Intermediário',['Posicione a barra sobre o trapézio, pés na largura dos ombros.','Contraia o abdômen e inicie levando o quadril para trás.','Desça até as coxas ficarem paralelas ao chão.','Suba empurrando o chão com os calcanhares.'],['Joelhos acompanham a direção dos pés.','Mantenha a coluna neutra.']],
 ['Leg press 45°','Pernas','Máquina','Iniciante',['Sente com as costas e o quadril totalmente apoiados.','Pés na largura dos ombros no meio da plataforma.','Flexione os joelhos até ~90° de forma controlada.','Empurre sem travar os joelhos no topo.'],['Não deixe o quadril descolar do banco.']],
 ['Cadeira extensora','Pernas','Máquina','Iniciante',['Ajuste o encosto e o apoio para as canelas.','Estenda os joelhos até contrair o quadríceps.','Segure 1 segundo no topo.','Desça devagar.'],['Evite carga que force os joelhos.']],
 ['Mesa flexora','Pernas','Máquina','Iniciante',['Deite de bruços e ajuste o rolo logo acima dos calcanhares.','Flexione os joelhos trazendo o rolo em direção ao glúteo.','Contraia a parte posterior da coxa.','Retorne lentamente.'],['Mantenha o quadril colado no banco.']],
 ['Afundo (passada)','Pernas','Halteres','Intermediário',['Em pé, dê um passo largo à frente.','Desça o joelho de trás em direção ao chão.','Mantenha o tronco ereto e o joelho da frente alinhado ao pé.','Empurre para voltar e alterne as pernas.'],['Passos maiores trabalham mais o glúteo.']],
 ['Panturrilha em pé','Pernas','Máquina','Iniciante',['Posicione os ombros sob os apoios e a ponta dos pés na plataforma.','Eleve os calcanhares o máximo possível.','Pause no topo.','Desça alongando totalmente.'],['Amplitude completa faz a diferença.']],
 ['Elevação pélvica','Glúteos','Barra','Intermediário',['Apoie as costas no banco com a barra sobre o quadril (use apoio macio).','Pés firmes na largura dos ombros.','Eleve o quadril até o tronco ficar alinhado com as coxas.','Contraia o glúteo no topo e desça controlando.'],['Queixo levemente contraído, olhar à frente.']],
 ['Stiff com barra','Glúteos','Barra','Intermediário',['Em pé, segure a barra à frente das coxas.','Joelhos levemente flexionados e coluna reta.','Leve o quadril para trás deslizando a barra pelas pernas.','Volte contraindo glúteos e posteriores.'],['Movimento é de quadril, não de coluna.']],
 ['Cadeira abdutora','Glúteos','Máquina','Iniciante',['Sente com as costas apoiadas e joelhos contra as almofadas.','Abra as pernas contra a resistência.','Segure 1 segundo.','Retorne devagar.'],['Incline o tronco levemente à frente para focar no glúteo.']],
 ['Glúteo na polia (coice)','Glúteos','Polia','Iniciante',['Prenda a tornozeleira e apoie as mãos na máquina.','Mantenha o tronco firme.','Estenda a perna para trás contraindo o glúteo.','Volte sem encostar o peso.'],['Não arqueie a lombar.']],
 ['Abdominal crunch','Abdômen','Peso corporal','Iniciante',['Deitado, joelhos flexionados e mãos ao lado da cabeça.','Eleve os ombros do chão contraindo o abdômen.','Expire no topo.','Desça devagar sem relaxar totalmente.'],['Não puxe o pescoço com as mãos.']],
 ['Prancha isométrica','Abdômen','Peso corporal','Iniciante',['Apoie antebraços e pontas dos pés no chão.','Corpo em linha reta, glúteos e abdômen contraídos.','Mantenha o olhar para o chão.','Respire normalmente durante o tempo.'],['Se a lombar cair, interrompa a série.']],
 ['Elevação de pernas','Abdômen','Peso corporal','Intermediário',['Deite com as mãos sob o quadril.','Eleve as pernas estendidas até 90°.','Desça devagar sem encostar no chão.','Mantenha a lombar colada.'],['Flexione os joelhos para facilitar.']],
 ['Russian twist','Abdômen','Anilha','Intermediário',['Sente com o tronco inclinado e pés levemente elevados.','Segure a anilha à frente do peito.','Gire o tronco para um lado e depois para o outro.','Mantenha a coluna alongada.'],['Pés no chão tornam o exercício mais fácil.']],
 ['Esteira — caminhada/corrida','Cardio','Esteira','Iniciante',['Comece com 3 min de aquecimento em ritmo leve.','Aumente gradualmente até a intensidade alvo.','Mantenha postura ereta e passadas naturais.','Finalize com 3 min de desaceleração.'],['Controle pela frequência cardíaca ou percepção de esforço.']],
 ['Bicicleta ergométrica','Cardio','Bike','Iniciante',['Ajuste o selim na altura do quadril.','Pedale com cadência constante.','Mantenha a coluna neutra e ombros relaxados.','Varie a resistência conforme o treino.'],['Joelho levemente flexionado no ponto mais baixo.']],
 ['Remo ergométrico','Cardio','Remo','Intermediário',['Prenda os pés e segure a alça.','Empurre com as pernas, depois incline o tronco e puxe com os braços.','Retorne na ordem inversa: braços, tronco, pernas.','Mantenha ritmo constante.'],['A força vem das pernas (~60%).']],
 ['Burpee','Cardio','Peso corporal','Avançado',['Em pé, agache e apoie as mãos no chão.','Jogue os pés para trás em posição de prancha.','Faça uma flexão (opcional) e traga os pés de volta.','Salte esticando o corpo e bata as mãos acima da cabeça.'],['Adapte sem o salto ou a flexão se necessário.']],
 ['Kettlebell swing','Cardio','Kettlebell','Intermediário',['Pés na largura dos ombros, kettlebell à frente.','Jogue o quadril para trás e balance o peso entre as pernas.','Estenda o quadril com força levando o kettlebell à altura do peito.','Deixe-o voltar e repita fluindo.'],['O movimento vem do quadril, não dos braços.']],
 ['Corda naval','Cardio','Corda','Avançado',['Segure as pontas da corda com firmeza.','Agache levemente e inicie ondas alternadas com os braços.','Mantenha o ritmo e o core firme.','Respire de forma constante.'],['Faça em blocos de 20–30 segundos.']]
];

/* Modelos [nome, foco, [[exercício, séries, reps, descanso(s), carga]]] */
const TEMPLATES = [
 ['Treino A — Peito e Tríceps','Peito · Tríceps',[['Supino reto com barra',4,'8–10',90,40],['Supino inclinado com halteres',3,'10–12',75,16],['Crossover na polia',3,'12',60,15],['Tríceps pulley com corda',3,'12',60,25],['Tríceps testa',3,'10–12',60,20],['Prancha isométrica',3,'40s',45,0]]],
 ['Treino B — Costas e Bíceps','Costas · Bíceps',[['Puxada frontal na polia',4,'8–10',90,45],['Remada baixa sentada',3,'10–12',75,40],['Remada unilateral com halter',3,'12',60,16],['Rosca direta com barra W',3,'10–12',60,20],['Rosca martelo',3,'12',60,10],['Abdominal crunch',3,'15',45,0]]],
 ['Treino C — Pernas e Ombros','Pernas · Ombros',[['Agachamento livre',4,'8–10',120,50],['Leg press 45°',3,'12',90,120],['Mesa flexora',3,'12',60,35],['Desenvolvimento com halteres',3,'10',75,14],['Elevação lateral',3,'12–15',45,6],['Panturrilha em pé',4,'15',45,60]]],
 ['Full Body — Circuito 1','Corpo inteiro',[['Agachamento livre',3,'12',60,30],['Flexão de braços',3,'10',45,0],['Remada baixa sentada',3,'12',60,35],['Afundo (passada)',3,'10 cada',60,10],['Prancha isométrica',3,'30s',30,0],['Bicicleta ergométrica',1,'10 min',0,0]]],
 ['Full Body — Circuito 2','Corpo inteiro · Cardio',[['Leg press 45°',3,'15',60,100],['Supino inclinado com halteres',3,'12',60,12],['Puxada frontal na polia',3,'12',60,40],['Elevação pélvica',3,'12',60,40],['Kettlebell swing',3,'15',45,12],['Esteira — caminhada/corrida',1,'15 min',0,0]]],
 ['Full Body — Iniciante','Adaptação',[['Leg press 45°',3,'12',60,60],['Crucifixo na máquina (peck deck)',3,'12',60,25],['Puxada frontal na polia',3,'12',60,30],['Cadeira extensora',2,'12',45,25],['Abdominal crunch',2,'15',30,0],['Esteira — caminhada/corrida',1,'10 min',0,0]]],
 ['Glúteos e Posteriores','Glúteos · Posteriores',[['Elevação pélvica',4,'10–12',75,60],['Stiff com barra',3,'10',75,30],['Glúteo na polia (coice)',3,'12 cada',45,15],['Cadeira abdutora',3,'15',45,40],['Mesa flexora',3,'12',60,30]]]
];

const STUDENTS = ['Marina Duarte','Lucas Andrade','Beatriz Fonseca','Thiago Almeida','Fernanda Lopes','Gabriel Nunes','Larissa Campos','Pedro Henrique Souza','Aline Barbosa','Rodrigo Pacheco','Camila Ferraz','Diego Martins','Patrícia Viana','Felipe Cardoso','Juliana Peixoto','Vinícius Ramos','Renata Azevedo','André Luiz Prado','Bianca Teixeira','Marcelo Duarte','Isabela Moraes','Leonardo Siqueira','Carolina Dias','Gustavo Farias','Natália Borges','Eduardo Lima','Priscila Mendes','Rafael Antunes','Amanda Cavalcante','Henrique Rezende','Tatiane Brito','Matheus Gouveia'];
const GOALS = ['Hipertrofia','Emagrecimento','Condicionamento','Saúde e bem-estar','Força'];

function mulberry(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}

function buildSeed() {
  const rnd = mulberry(20260);
  const R = (a,b) => a + Math.floor(rnd()*(b-a+1));
  const pick = arr => arr[Math.floor(rnd()*arr.length)];
  const T = today();
  const D = { v:1, gym:{ name:'Atlas Academia', phone:'(11) 4000-1234', address:'Av. Dom Pedro I, 1200 — Santo André' } };

  D.plans = [
    {id:'p1', name:'Essencial', months:1,  price:99.9,  active:true, perks:['Acesso à musculação','App com treinos','Avaliação inicial']},
    {id:'p2', name:'Plus',      months:3,  price:269,   active:true, perks:['Musculação + aulas coletivas','App com treinos','1 avaliação física','Trazer 1 convidado/mês']},
    {id:'p3', name:'Pro',       months:6,  price:479,   active:true, perks:['Tudo do Plus','Avaliação física mensal','Treino personalizado','Vestiário premium']},
    {id:'p4', name:'Black',     months:12, price:849,   active:true, perks:['Tudo do Pro','Acompanhamento prioritário','Convidados ilimitados','Congelamento até 30 dias']}
  ];

  D.exercises = EX_LIB.map((e,i) => ({id:'e'+pad(i+1), name:e[0], group:e[1], equip:e[2], level:e[3], steps:e[4], tips:e[5]}));
  const exId = n => D.exercises.find(e => e.name === n).id;

  D.users = [
    {id:'u_admin', role:'admin', name:'Carla Nogueira', email:'admin@atlas.fit', phone:'(11) 98888-0001', pass:'123456', title:'Gerente'},
    {id:'u_p1', role:'prof', name:'Rafael Moreira', email:'rafael@atlas.fit', phone:'(11) 98888-0002', pass:'123456', title:'Personal · Musculação'},
    {id:'u_p2', role:'prof', name:'Juliana Prado', email:'juliana@atlas.fit', phone:'(11) 98888-0003', pass:'123456', title:'Aulas coletivas'},
    {id:'u_p3', role:'prof', name:'Bruno Tavares', email:'bruno@atlas.fit', phone:'(11) 98888-0004', pass:'123456', title:'Funcional · HIIT'},
    {id:'u_p4', role:'prof', name:'Camila Rocha', email:'camila@atlas.fit', phone:'(11) 98888-0005', pass:'123456', title:'Yoga · Pilates'}
  ];

  /* modelos */
  D.workouts = TEMPLATES.map((t,i) => ({id:'t'+(i+1), tpl:true, studentId:null, name:t[0], focus:t[1], days:[], createdBy:'u_p1', createdAt:addDays(T,-120), items:t[2].map(x => ({exId:exId(x[0]), sets:x[1], reps:x[2], rest:x[3], load:x[4], note:''}))}));
  const tpl = id => D.workouts.find(w => w.id === id);
  const programs = {
    abc:[['t1',[1]],['t2',[3]],['t3',[5]]],
    ab:[['t4',[2]],['t5',[4]]],
    ini:[['t6',[1,3,5]]],
    glu:[['t7',[2,4]],['t3',[6]]]
  };
  const progFor = {Hipertrofia:'abc', Força:'abc', Emagrecimento:'ab', Condicionamento:'ab', 'Saúde e bem-estar':'ini'};

  D.payments = []; D.sessions = []; D.checkins = []; D.measures = {}; D.bookings = [];
  const plansW = ['p1','p1','p1','p1','p2','p2','p2','p3','p3','p4'];
  const methods = ['PIX','PIX','Cartão','Cartão','Boleto','Dinheiro'];

  STUDENTS.forEach((name, i) => {
    const id = 'u_s' + (i+1);
    const demo = i === 0;
    const planId = demo ? 'p3' : pick(plansW);
    const plan = D.plans.find(p => p.id === planId);
    const dl = demo ? 118 : (rnd() < .12 ? R(-24,-3) : rnd() < .16 ? R(0,7) : R(8, plan.months*30));
    const lastEnd = addDays(T, dl);
    const n = plan.months === 1 ? R(2,8) : plan.months <= 3 ? R(1,3) : R(1,2);
    const goal = demo ? 'Hipertrofia' : pick(GOALS);
    const prof = demo ? 'u_p1' : pick(['u_p1','u_p1','u_p2','u_p3','u_p4']);
    let first = null;
    for (let k = 0; k < n; k++) {
      const end = addMonths(lastEnd, -k*plan.months), start = addMonths(end, -plan.months);
      first = start;
      const isLast = k === 0;
      let paidAt = addDays(start, R(0,2)); if (paidAt > T) paidAt = T;
      let pend = false;
      if (isLast && !demo && rnd() < .1 && diffDays(T, start) >= 3) { paidAt = null; pend = true; }
      D.payments.push({id:'pg_'+id+'_'+k, studentId:id, planId, amount:plan.price, due:start, paidAt, method:pick(methods), desc:'Plano '+plan.name+' ('+plan.months+(plan.months>1?' meses':' mês')+')'});
    }
    if (!demo && dl >= 0 && dl <= 7 && rnd() < .7) D.payments.push({id:'pg_'+id+'_n', studentId:id, planId, amount:plan.price, due:lastEnd, paidAt:null, method:'PIX', desc:'Renovação — Plano '+plan.name});
    const prog = programs[demo ? 'abc' : (i%7 === 3 ? 'glu' : progFor[goal])];
    const birthY = R(1972, 2004);
    D.users.push({id, role:'aluno', name, email: demo ? 'marina@email.com' : name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').split(' ')[0] + '@email.com', pass:'123456', phone:`(11) 9${R(1000,9999)}-${R(1000,9999)}`, birth:`${birthY}-${pad(R(1,12))}-${pad(R(1,28))}`, planId, start:first, end:lastEnd, instructorId:prof, goal, notes: demo ? 'Prefere treinar no período da manhã. Sem restrições.' : '', blocked:false});

    /* treinos do aluno */
    const mine = prog.map(([t, days]) => {
      const src = tpl(t), w = {id:'w_'+id+'_'+t, tpl:false, studentId:id, name:src.name, focus:src.focus, days, createdBy:prof, createdAt:addDays(T, -R(5,50)), items:JSON.parse(JSON.stringify(src.items))};
      D.workouts.push(w); return w;
    });

    /* medidas */
    const base = R(52, 98) - (goal === 'Emagrecimento' ? 0 : 6), trend = goal === 'Emagrecimento' ? -.7 : goal === 'Hipertrofia' ? .35 : -.1;
    const m = []; const cnt = demo ? 9 : R(3,7);
    for (let k = 0; k < cnt; k++) m.push({date:addDays(T, -(cnt-1-k)*(demo?14:25)), weight:+(base + trend*k + (rnd()-.5)).toFixed(1), fat:+(R(14,30) - k*.3).toFixed(1), waist:+(R(68,98) - k*.4).toFixed(1), chest:R(88,112), arm:R(28,38)});
    D.measures[id] = m;

    /* histórico de treinos / check-ins */
    if (dl > -20) {
      const att = demo ? .86 : .45 + rnd()*.45;
      for (let d = demo ? 120 : 84; d >= (demo ? 1 : 0); d--) {
        const day = addDays(T, -d);
        if (day < first || day > lastEnd) continue;
        const w = mine.find(x => x.days.includes(wday(day)));
        if (!w || rnd() > att) continue;
        const min = R(42, 78), hr = rnd() < .45 ? R(17,20) : rnd() < .6 ? R(6,9) : R(11,13);
        const s = {id:'s_'+id+'_'+d, studentId:id, workoutId:w.id, date:day, min, vol:R(4200, 9800)};
        if (d <= (demo ? 45 : 10)) { s.log = {}; w.items.forEach(it => { s.log[it.exId] = Array.from({length:it.sets}, () => ({l: Math.max(0, it.load + R(-2,3)*(it.load>20?2.5:1)), r: R(8,12)})); }); }
        D.sessions.push(s);
        const ts = new Date(dt(day).setHours(hr, R(0,59))).getTime();
        D.checkins.push({id:'c_'+id+'_'+d, studentId:id, ts, method: rnd()<.6 ? 'QR Code' : 'Catraca'});
      }
    }
  });

  /* aulas coletivas */
  const CL = [['Spinning','u_p3',[1,3,5],'07:00',45,18,'Sala Bike'],['Spinning','u_p3',[2,4],'19:00',45,18,'Sala Bike'],['Yoga','u_p4',[2,4],'08:00',60,15,'Sala Zen'],['Pilates','u_p4',[1,3],'09:30',50,10,'Sala Zen'],['Funcional','u_p3',[1,3,5],'18:30',50,22,'Studio'],['HIIT','u_p3',[2,4],'06:30',40,20,'Studio'],['Ritmos','u_p2',[3],'20:00',50,25,'Studio'],['Alongamento','u_p2',[6],'09:00',40,20,'Sala Zen'],['Funcional Sáb','u_p3',[6],'10:00',50,22,'Studio']];
  D.classes = [];
  CL.forEach((c, i) => D.classes.push({id:'cl'+(i+1), name:c[0].replace(' Sáb',''), instructorId:c[1], days:c[2], time:c[3], dur:c[4], cap:c[5], room:c[6]}));
  const studs = D.users.filter(u => u.role === 'aluno');
  for (let d = 0; d <= 14; d++) {
    const day = addDays(T, d);
    D.classes.filter(c => c.days.includes(wday(day))).forEach(c => {
      const k = Math.floor(c.cap * (.25 + rnd()*.6));
      [...studs].sort(() => rnd() - .5).slice(0, k).forEach(s => { if (s.id !== 'u_s1') D.bookings.push({id:uid('bk'), classId:c.id, date:day, studentId:s.id}); });
    });
  }
  const yoga = D.classes[2]; let nb = 0;
  for (let d = 1; d <= 14 && nb < 2; d++) { const day = addDays(T, d); if (yoga.days.includes(wday(day))) { D.bookings.push({id:uid('bk'), classId:yoga.id, date:day, studentId:'u_s1'}); nb++; } }

  /* check-ins de hoje (já aconteceram) */
  const now = new Date();
  studs.slice(1, 9).forEach((s, k) => { const h = Math.max(5, now.getHours() - R(0,3)); D.checkins.push({id:'c_today_'+k, studentId:s.id, ts:new Date(new Date().setHours(h, R(0,59))).getTime(), method:'Catraca'}); });

  D.announcements = [
    {id:'a1', title:'Horário especial no feriado', body:'No feriado a academia abre das 8h às 14h. Aulas coletivas suspensas.', date:addDays(T,-2), audience:'Todos'},
    {id:'a2', title:'Nova sala de bike indoor', body:'Inauguramos a nova sala de spinning com 18 bikes e som imersivo. Reserve seu lugar pelo app!', date:addDays(T,-8), audience:'Todos'},
    {id:'a3', title:'Avaliação física gratuita', body:'Alunos dos planos Pro e Black podem agendar a avaliação mensal com os professores.', date:addDays(T,-15), audience:'Pro / Black'}
  ];
  return D;
}

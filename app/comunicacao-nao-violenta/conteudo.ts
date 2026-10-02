// app/comunicacao-nao-violenta/cartelas.ts
// O texto das cartelas. Para mudar a redação, mexa só aqui.
// **assim** vira negrito. Cada cartela tem um capítulo (cap); cartelas seguidas com o mesmo cap formam o capítulo.

export type Passo = 'o' | 's' | 'n' | 'p';
export type Fala = { o: string; s: string; n: string; p: string };

export type Bloco =
  | { p: string }                                  // parágrafo
  | { lista: string[] }                            // lista com marcadores
  | { chips: string[] }                            // palavras em etiquetas
  | { nao: string }                                // ✗ frase riscada
  | { sim: string }                                // ✓ frase boa
  | { nota: string }                               // comentário em itálico
  | { duas: { evite: string[]; prefira: string[] } }
  | { formula: 'numeros' | 'palavras' }            // os 4 passos coloridos
  | { perguntas: string[] }                        // lista numerada
  | { fala: Fala }                                 // frase com as 4 cores
  | { onde: { t: string; d: string }[] }
  | { cta: string }                                // convite + botão da lista de pedidos
  | { assina: string };

export type Cartela =
  | { tipo: 'capa'; cap: string; titulo: string; sub: string; dica: string }
  | { tipo: 'texto'; cap: string; titulo: string; passo?: Passo; rotulo?: string; selo?: string; blocos: Bloco[]; pergunta?: string }
  | { tipo: 'exemplo'; cap: string; situacao: string; comum: string; cnv: Fala; seloCnv?: string; nota?: string };

export const TITULO = 'Comunicação Não Violenta';
export const SUBTITULO = 'Como falar com clareza, respeito e empatia';
export const AUTOR = 'Adilson Costa · Psicanalista & Mentor de Lideranças Corporativas';

export const CARTELAS: Cartela[] = [
  // ---------- COMEÇO ----------
  { tipo: 'capa', cap: 'Começo', titulo: TITULO, sub: SUBTITULO, dica: 'Passe as cartelas com o dedo ou com as setas →' },
  {
    tipo: 'texto', cap: 'Começo', titulo: 'Todos nós já passamos por isso',
    blocos: [
      { p: 'Queríamos conversar com alguém, mas acabamos falando de maneira agressiva, fazendo acusações ou guardando ressentimento.' },
      { p: 'Muitas vezes, o problema não está apenas no que aconteceu, mas **na forma como colocamos aquilo em palavras**.' },
    ],
  },
  {
    tipo: 'texto', cap: 'Começo', titulo: 'Um jeito mais consciente de conversar',
    blocos: [
      { p: 'A Comunicação Não Violenta, conhecida como CNV, oferece uma maneira mais consciente de conversar sobre conflitos, sentimentos e necessidades. Ela pode ser usada no trabalho, em casa, nos relacionamentos, com amigos e em diversas outras situações do dia a dia.' },
      { p: 'A CNV não elimina os conflitos nem significa aceitar tudo em silêncio. Ela ajuda a transformar conversas difíceis em oportunidades de **compreensão, diálogo e construção de acordos**.' },
    ],
  },

  // ---------- O QUE É ----------
  {
    tipo: 'texto', cap: 'O que é', titulo: 'O que é CNV?',
    blocos: [
      { p: 'CNV é a sigla para Comunicação Não Violenta, um método desenvolvido pelo psicólogo **Marshall Rosenberg** para ajudar as pessoas a se expressarem de maneira clara, honesta e empática.' },
      { p: 'Sem agressividade, julgamentos ou acusações.' },
    ],
  },
  {
    tipo: 'texto', cap: 'O que é', titulo: 'Não é ser passivo',
    blocos: [
      { p: 'Ao contrário do que algumas pessoas imaginam, praticar CNV não significa ser passivo, evitar conflitos ou permitir que os outros ultrapassem nossos limites.' },
      { p: 'Significa aprender a falar sobre aquilo que nos incomoda **sem atacar a identidade ou o caráter** da outra pessoa.' },
    ],
  },
  {
    tipo: 'texto', cap: 'O que é', titulo: 'Veja a diferença',
    blocos: [
      { nao: 'Você é irresponsável.' },
      { sim: 'O relatório não foi entregue no prazo combinado. Fiquei preocupado porque preciso de previsibilidade para organizar as próximas etapas do projeto. Você poderia me avisar com antecedência caso perceba que haverá algum atraso?' },
      { p: 'A primeira frase rotula e acusa. A segunda descreve um fato, expressa uma preocupação e propõe um comportamento concreto.' },
    ],
  },
  {
    tipo: 'texto', cap: 'O que é', titulo: 'Não é para ganhar a discussão',
    blocos: [
      { p: 'O objetivo da CNV não é “ganhar” uma discussão. É **criar conexão**, aumentar a compreensão entre as pessoas e buscar soluções que considerem as necessidades dos envolvidos.' },
    ],
  },

  // ---------- O QUE MACHUCA ----------
  {
    tipo: 'texto', cap: 'O que machuca', titulo: 'Nem sempre é grito',
    blocos: [
      { p: 'A **comunicação violenta** nem sempre aparece na forma de gritos ou ofensas explícitas. Ela também pode surgir em críticas, ironias, ameaças, cobranças, comparações e generalizações.' },
      { lista: ['“Você nunca ajuda em nada.”', '“Você sempre faz tudo errado.”', '“Você é muito egoísta.”', '“Se você realmente se importasse, faria isso.”', '“Todo mundo consegue, menos você.”', '“Você não me ama mais.”'] },
    ],
  },
  {
    tipo: 'texto', cap: 'O que machuca', titulo: 'O que essas frases provocam',
    blocos: [
      { p: 'Esse tipo de frase costuma fazer a outra pessoa se defender, contra-atacar ou se afastar. Em vez de resolver o problema, a conversa passa a girar em torno da culpa.' },
      { p: 'A CNV propõe uma mudança: falar sobre **comportamentos observáveis, sentimentos, necessidades e pedidos claros**.' },
      { p: 'Isso não significa esconder a insatisfação. Significa expressá-la de um modo que aumente as chances de ser compreendido.' },
    ],
  },

  // ---------- OS 4 PASSOS ----------
  {
    tipo: 'texto', cap: 'Os 4 passos', titulo: 'Os quatro passos',
    blocos: [
      { p: 'A CNV pode ser organizada em quatro componentes. Eles funcionam como um roteiro mental para os momentos em que precisamos conversar sobre algo delicado.' },
      { formula: 'numeros' },
      { nota: 'Cada passo tem uma cor. Nos exemplos, as cores mostram onde cada um aparece na frase.' },
    ],
  },
  {
    tipo: 'texto', cap: 'Os 4 passos', passo: 'o', rotulo: '1 · Observação', titulo: 'O que aconteceu?',
    blocos: [
      { p: 'Descreva o fato de forma objetiva, **como se uma câmera estivesse registrando a situação**. A ideia é separar o que realmente aconteceu das interpretações, julgamentos e rótulos que costumamos acrescentar.' },
      { nao: 'Você é desorganizado.' },
      { sim: 'Nas últimas duas semanas, encontrei pratos e copos na sala depois das refeições.' },
      { nao: 'Você nunca participa das reuniões.' },
      { sim: 'Você não participou das últimas duas reuniões de planejamento.' },
    ],
  },
  {
    tipo: 'texto', cap: 'Os 4 passos', passo: 'o', rotulo: '1 · Observação', titulo: 'Palavras que ajudam e que atrapalham',
    blocos: [
      { duas: {
        evite: ['Você sempre…', 'Você nunca…', 'Você é…', 'Você não se importa…', 'Você faz tudo errado…'],
        prefira: ['Percebi que…', 'Nas últimas duas vezes…', 'Hoje, às 10 horas…', 'Quando aconteceu…', 'Observei que…'],
      } },
    ],
    pergunta: 'O que aconteceu concretamente?',
  },
  {
    tipo: 'texto', cap: 'Os 4 passos', passo: 's', rotulo: '2 · Sentimento', titulo: 'Como eu me sinto?',
    blocos: [
      { p: 'Depois de identificar o fato, procure reconhecer o sentimento que ele provoca em você.' },
      { chips: ['frustração', 'irritação', 'tristeza', 'preocupação', 'insegurança', 'cansaço', 'vergonha', 'medo', 'alívio', 'alegria', 'confiança'] },
    ],
    pergunta: 'O que estou sentindo diante desse fato?',
  },
  {
    tipo: 'texto', cap: 'Os 4 passos', passo: 's', rotulo: '2 · Sentimento', titulo: 'Sentimento não é julgamento',
    blocos: [
      { nao: 'Sinto que você não se importa comigo.' },
      { p: 'Essa frase não descreve exatamente um sentimento. Ela apresenta **uma interpretação sobre a intenção da outra pessoa**.' },
      { p: 'Uma forma mais clara seria:' },
      { sim: 'Eu me sinto triste e inseguro quando isso acontece.' },
    ],
  },
  {
    tipo: 'texto', cap: 'Os 4 passos', passo: 'n', rotulo: '3 · Necessidade', titulo: 'O que é importante para mim?',
    blocos: [
      { p: 'Os sentimentos geralmente estão relacionados a necessidades que estão sendo atendidas ou não.' },
      { chips: ['respeito', 'segurança', 'organização', 'colaboração', 'previsibilidade', 'autonomia', 'reconhecimento', 'descanso', 'carinho', 'confiança', 'participação', 'justiça', 'conexão'] },
      { p: 'Uma pessoa pode sentir irritação diante de um atraso porque precisa de **previsibilidade**. Outra pode sentir tristeza porque precisa de **consideração ou proximidade**.' },
    ],
    pergunta: 'O que é importante para mim nessa situação?',
  },
  {
    tipo: 'texto', cap: 'Os 4 passos', passo: 'n', rotulo: '3 · Necessidade', titulo: 'Por trás da reclamação',
    blocos: [
      { p: 'Perguntar “o que é importante para mim?” ajuda a ir além da reclamação e a compreender **o que realmente está por trás dela**.' },
      { p: 'Quando a outra pessoa entende a necessidade, fica mais fácil encontrar uma solução que funcione para os dois lados.' },
    ],
  },
  {
    tipo: 'texto', cap: 'Os 4 passos', passo: 'p', rotulo: '4 · Pedido', titulo: 'O que eu gostaria que acontecesse?',
    blocos: [
      { p: 'Formule um pedido **claro, positivo e possível de ser realizado**, que diga exatamente qual comportamento você gostaria de ver.' },
      { nao: 'Quero que você mude.' },
      { sim: 'Você poderia me avisar por mensagem quando perceber que vai se atrasar?' },
      { nao: 'Seja mais colaborativo.' },
      { sim: 'Você poderia participar da próxima reunião e apresentar sua parte do projeto?' },
    ],
  },
  {
    tipo: 'texto', cap: 'Os 4 passos', passo: 'p', rotulo: '4 · Pedido', titulo: 'Pedido não é exigência disfarçada',
    blocos: [
      { p: 'A outra pessoa deve poder **responder, negociar ou até recusar**.' },
      { p: 'Isso não significa que você precise concordar com a recusa, mas significa que a conversa não deve ser construída com ameaça ou manipulação.' },
    ],
  },
  {
    tipo: 'texto', cap: 'Os 4 passos', titulo: 'A fórmula',
    blocos: [
      { formula: 'palavras' },
      { p: 'Antes de iniciar uma conversa difícil, faça quatro perguntas:' },
      { perguntas: ['O que aconteceu?', 'O que estou sentindo?', 'O que é importante para mim?', 'O que estou pedindo concretamente?'] },
      { p: 'Essa reflexão pode mudar completamente o rumo da conversa.' },
    ],
    pergunta: 'E uma quinta: estou fazendo um pedido ou uma exigência?',
  },

  // ---------- EXEMPLOS ----------
  {
    tipo: 'exemplo', cap: 'Exemplos', situacao: 'No trabalho · um colega não entregou o relatório no prazo combinado.',
    comum: 'Você é irresponsável, nunca entrega nada no prazo e está atrapalhando todo mundo.',
    cnv: { o: 'Percebi que o relatório não foi entregue no prazo combinado.', s: 'Fiquei preocupado', n: 'porque preciso de previsibilidade para organizar as próximas etapas do projeto.', p: 'Você poderia me avisar com antecedência caso perceba que haverá algum imprevisto na entrega?' },
    nota: 'A primeira forma mistura julgamento, generalização e acusação. A segunda aborda a situação com clareza, sem transformar o colega em “irresponsável”.',
  },
  {
    tipo: 'exemplo', cap: 'Exemplos', situacao: 'Na família · o filho adolescente passa o jantar inteiro olhando para o celular.',
    comum: 'Você vive nesse celular, não tem educação!',
    cnv: { o: 'Quando vejo você usando o celular durante o jantar,', s: 'fico chateado', n: 'porque preciso de mais conexão e conversa com você nesse momento.', p: 'Você poderia deixar o celular no modo silencioso e guardado durante as refeições?' },
    nota: 'O pedido é específico e explica por que aquele comportamento é importante para o familiar.',
  },
  {
    tipo: 'exemplo', cap: 'Exemplos', situacao: 'No casal · uma pessoa sente que está assumindo sozinha grande parte das tarefas da casa.',
    comum: 'Você nunca ajuda em nada. Essa casa caiu nas minhas costas!',
    cnv: { o: 'Percebi que, nas últimas duas semanas, lavei a louça todos os dias e cuidei do lixo sozinho.', s: 'Estou me sentindo sobrecarregado', n: 'porque preciso de mais equilíbrio na divisão das tarefas da casa.', p: 'Podemos sentar e definir juntos quem fará cada tarefa durante a semana?' },
    nota: 'A pessoa não precisa provar que o outro “nunca ajuda”. Ela apresenta fatos específicos e propõe uma solução.',
  },
  {
    tipo: 'exemplo', cap: 'Exemplos', situacao: 'Com crianças · a criança brinca e deixa os brinquedos espalhados pelo chão.',
    comum: 'Você é muito bagunceiro!',
    cnv: { o: 'Quando vejo brinquedos espalhados no chão do quarto,', s: 'fico preocupado', n: 'porque preciso de segurança e organização para ninguém tropeçar.', p: 'Você poderia guardar os brinquedos na caixa antes de sair para brincar lá fora?' },
    nota: 'Com crianças pequenas, o pedido deve ser simples, concreto e compatível com a idade.',
  },
  {
    tipo: 'exemplo', cap: 'Exemplos', situacao: 'Entre irmãos · um usa roupas ou objetos pessoais do outro sem autorização.',
    comum: 'Você é um ladrão! Vive pegando minhas coisas sem pedir!',
    cnv: { o: 'Percebi que você usou minha camiseta e meu fone de ouvido três vezes nesta semana sem me perguntar antes.', s: 'Fiquei irritado', n: 'porque preciso que meus pertences sejam respeitados e que você me consulte antes de usá-los.', p: 'Da próxima vez, você poderia me pedir autorização antes de pegar alguma coisa minha?' },
    nota: 'O fato de serem irmãos não elimina a necessidade de respeito, privacidade e consentimento.',
  },
  {
    tipo: 'exemplo', cap: 'Exemplos', situacao: 'Filhos adultos e pais idosos · os pais sentem falta de contato, mas acabam fazendo cobranças que geram culpa.',
    comum: 'Você não liga, não vem nos visitar e não se importa com a gente!',
    seloCnv: 'Com CNV, pelos pais',
    cnv: { o: 'Percebemos que faz três semanas que não nos visitamos e que você não nos ligou.', s: 'Estamos tristes', n: 'porque precisamos de mais contato e carinho com você.', p: 'Você poderia nos ligar uma vez por semana ou combinar uma visita para o próximo domingo?' },
  },
  {
    tipo: 'texto', cap: 'Exemplos', selo: 'Com CNV, pelo filho', titulo: 'O filho também pode falar do seu lado',
    blocos: [
      { fala: { o: 'Quando ouço que eu não me importo com vocês,', s: 'fico chateado', n: 'porque preciso que meu esforço e minha rotina também sejam reconhecidos.', p: 'Vocês poderiam me ligar em horários alternativos ou podemos combinar um dia fixo por mês para eu visitar vocês?' } },
      { nota: 'A CNV permite que os dois lados expressem necessidades legítimas: os pais desejam proximidade, e o filho precisa de reconhecimento e de uma combinação compatível com sua rotina.' },
    ],
  },
  {
    tipo: 'exemplo', cap: 'Exemplos', situacao: 'No casal · um dos parceiros critica o outro diante das crianças.',
    comum: 'Você me humilha na frente dos seus filhos!',
    cnv: { o: 'Quando você comenta na frente das crianças que sou irresponsável com dinheiro,', s: 'sinto-me envergonhado e magoado', n: 'porque preciso de respeito e quero preservar nossa parceria como pais.', p: 'Podemos combinar de conversar sobre esse assunto em particular, sem as crianças por perto?' },
    nota: 'O pedido não significa evitar o assunto. Significa escolher um momento e um ambiente mais adequados para tratá-lo.',
  },
  {
    tipo: 'exemplo', cap: 'Exemplos', situacao: 'Em reuniões de família · política, religião ou decisões familiares provocam discussões no almoço.',
    comum: 'Você é doente! Pensa igual a essa gente!',
    cnv: { o: 'Quando ouço discussões sobre política durante o almoço,', s: 'fico tenso', n: 'porque preciso de harmonia e de um ambiente mais leve para aproveitar a presença da família.', p: 'Podemos combinar de evitar esse assunto durante as refeições e conversar sobre ele em outro momento?' },
    nota: 'A CNV não exige que todos pensem igual. Ela ajuda a estabelecer limites para que as diferenças não destruam a convivência.',
  },
  {
    tipo: 'exemplo', cap: 'Exemplos', situacao: 'Em casa · louça acumulada na sala.',
    comum: 'Você é muito desleixado e deixa a casa uma bagunça!',
    cnv: { o: 'Quando vejo pratos e copos espalhados na mesa da sala,', s: 'fico irritada', n: 'porque preciso de mais organização nos espaços que usamos em comum.', p: 'Você poderia colocar as louças na pia ou na lava-louças depois de usar?' },
  },
  {
    tipo: 'exemplo', cap: 'Exemplos', situacao: 'No trabalho · falta de participação nas reuniões.',
    comum: 'Você nunca colabora e some nas reuniões.',
    cnv: { o: 'Percebi que você não participou das últimas duas reuniões de planejamento.', s: 'Sinto-me frustrado', n: 'porque preciso que todos participem para manter o alinhamento do projeto.', p: 'Você poderia participar das próximas reuniões ou nos avisar se houver algum impedimento?' },
  },
  {
    tipo: 'exemplo', cap: 'Exemplos', situacao: 'Num relacionamento · atrasos recorrentes.',
    comum: 'Você não respeita meu tempo e vive me deixando esperando.',
    cnv: { o: 'Nas duas últimas vezes em que combinamos de tomar café, você chegou uma hora depois sem me avisar.', s: 'Fiquei irritado', n: 'porque preciso de previsibilidade nos nossos encontros.', p: 'Da próxima vez, se perceber que vai se atrasar, você poderia me enviar uma mensagem?' },
  },
  {
    tipo: 'exemplo', cap: 'Exemplos', situacao: 'Num pedido de presente · o casal vai escolher juntos o presente do filho.',
    comum: 'Você nunca lembra de nada, vou ter que escolher sozinha de novo.',
    cnv: { o: 'O Dia das Crianças está chegando e vi umas roupas que têm a cara do nosso filho.', s: 'Fiquei animada imaginando ele usando.', n: 'Para mim é importante a gente escolher junto.', p: 'Você topa olhar a lista comigo e decidirmos até sexta?' },
    nota: 'É assim que a lista de pedidos do Com a Lupa funciona: os quatro passos, e a outra pessoa livre para dizer sim, não ou propor outra coisa.',
  },

  // ---------- ONDE USAR ----------
  {
    tipo: 'texto', cap: 'Onde usar', titulo: 'Onde usar a CNV',
    blocos: [
      { p: 'Em praticamente qualquer relação que envolva diálogo, limites, expectativas ou conflitos.' },
      { onde: [
        { t: 'No trabalho', d: 'Dar e receber feedback, negociar prazos, alinhar responsabilidades, resolver conflitos entre colegas, falar sobre falhas sem humilhar, expressar discordâncias em reuniões.' },
        { t: 'Em casa e na família', d: 'Divisão de tarefas, organização da casa, uso de celular, rotina dos filhos, horários, visitas, limites e privacidade.' },
      ] },
    ],
  },
  {
    tipo: 'texto', cap: 'Onde usar', titulo: 'Onde usar a CNV',
    blocos: [
      { onde: [
        { t: 'No relacionamento amoroso', d: 'Atrasos, falta de atenção, divisão de tarefas, finanças, críticas, tempo de qualidade, conversas difíceis na frente dos filhos.' },
        { t: 'Nas amizades', d: 'Atrasos frequentes, cancelamentos de última hora, falta de retorno, combinados não cumpridos, desequilíbrio na relação, mal-entendidos.' },
        { t: 'No atendimento e nas vendas', d: 'Compreender as necessidades dos clientes, explicar limites, lidar com reclamações e negociar sem responder de maneira defensiva.' },
      ] },
    ],
  },

  // ---------- NA PRÁTICA ----------
  {
    tipo: 'texto', cap: 'Na prática', titulo: 'Como praticar no dia a dia',
    blocos: [
      { p: 'A CNV não é uma frase pronta que resolve automaticamente qualquer conflito. É uma prática que exige atenção, autoconhecimento e disposição para ouvir.' },
      { lista: ['Faça uma pausa antes de responder quando estiver muito irritado.', 'Tente separar os fatos das interpretações.', 'Identifique o que você está sentindo.', 'Pergunte a si mesmo qual necessidade está por trás desse sentimento.', 'Faça pedidos específicos, em vez de apenas reclamar.', 'Evite generalizações como “sempre” e “nunca”.'] },
    ],
  },
  {
    tipo: 'texto', cap: 'Na prática', titulo: 'Como praticar no dia a dia',
    blocos: [
      { lista: ['Não use a CNV para manipular ou obrigar a outra pessoa a concordar.', 'Comece treinando em situações de baixa tensão.', 'Aceite que você não conseguirá aplicar tudo perfeitamente desde o início.', 'Ouça com empatia, tentando compreender os sentimentos e as necessidades do outro.', 'Mantenha limites claros quando for necessário.'] },
    ],
  },
  {
    tipo: 'texto', cap: 'Na prática', titulo: 'Ouvir não é concordar',
    blocos: [
      { p: 'Ouvir com empatia não significa concordar com tudo. Você pode compreender o que alguém está sentindo e, ainda assim, **discordar do comportamento ou estabelecer um limite**.' },
    ],
  },

  // ---------- PARA LEVAR ----------
  {
    tipo: 'texto', cap: 'Para levar', titulo: 'Clareza no lugar da acusação',
    blocos: [
      { p: 'A CNV ajuda a trocar acusações por clareza, julgamentos por compreensão e cobranças genéricas por pedidos objetivos.' },
      { p: 'Quando a usamos, não garantimos que a outra pessoa reagirá como gostaríamos. Porém, **aumentamos as chances de sermos compreendidos** e reduzimos a possibilidade de transformar uma dificuldade em uma briga.' },
    ],
  },
  {
    tipo: 'texto', cap: 'Para levar', titulo: 'Falar dos problemas, com dignidade',
    blocos: [
      { p: 'Comunicar-se de forma não violenta não significa deixar de falar sobre problemas. Significa falar sobre eles com **honestidade, respeito e responsabilidade**, preservando a dignidade de todos os envolvidos.' },
       { assina: AUTOR },
            { cta: 'Comece por uma conversa leve: que tal exercitar a CNV num pedido de presente?' },
    ],
  },
];

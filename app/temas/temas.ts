// app/temas/temas.ts
// Ficha de cada tema. Para criar um tema novo, copie um bloco e troque os valores.
// cores: [fundo, principal, secundária, destaque, suave, texto-escuro]

export type Tema = {
  cores: [string, string, string, string, string, string];
  faixa: string;
  eyebrow: string;
  titulo: [string, string, string]; // antes, palavra destacada, depois
  sub: string;
  cta: string;
  emoji: string;      // o que aparece dentro da lupa
  chapeu?: string;    // fantasia da lupa nas datas
  deco: [string, string];
  data?: boolean;     // datas festivas: botão "♡ Pedir"
  filtro: 'tipo' | 'preco';
  mascote?: string;   // imagem da mascote no banner grande (no lugar da lupa)
  leadTipo: string;   // identifica a origem da lista no e-mail
  faixas?: Faixa[];   // faixas de preço próprias (sem isso, usa FAIXAS_PRECO)
};

export type Faixa = { nome: string; min: number; max: number };

export const TEMAS: Record<string, Tema> = {
  ambiente: {
    cores: ['#FBF6EE', '#B5562B', '#4F6B3A', '#E9B949', '#F3E3CF', '#3A2416'],
    faixa: '🏡 Sala, quarto, cozinha e área externa · ofertas garimpadas toda semana',
    eyebrow: 'Monte seu ambiente',
    titulo: ['Sua casa com ', 'cara de você', ''],
    sub: 'Escolha o ambiente, descubra produtos selecionados e monte sua lista com os links das ofertas.',
    cta: '🛋️ Ver ambientes', emoji: '🛋️', deco: ['🪴', '🏠'], filtro: 'tipo', leadTipo: 'ambiente',
    faixas: [{ nome: 'Até R$ 300', min: 0, max: 300 }, { nome: 'R$ 300 a 1.000', min: 300.01, max: 1000 }, { nome: 'Acima de R$ 1.000', min: 1000.01, max: Infinity }],
  },
  momento: {
    cores: ['#FFF7EC', '#C2410C', '#7C2D12', '#FBBF24', '#FFE4C7', '#3B1A0A'],
    faixa: '✨ Churrasco, vinho, café ou festa em casa: a gente separou tudo',
    eyebrow: 'Monte seu momento',
    titulo: ['Tudo pronto para o ', 'seu momento', ''],
    sub: 'Café da manhã, vinho, churrasco, lareira: escolha o momento e veja o que não pode faltar.',
    cta: '🥂 Escolher momento', emoji: '🍷', deco: ['🔥', '🧀'], filtro: 'tipo', leadTipo: 'momento',
    faixas: [{ nome: 'Até R$ 100', min: 0, max: 100 }, { nome: 'R$ 100 a 500', min: 100.01, max: 500 }, { nome: 'Acima de R$ 500', min: 500.01, max: Infinity }],
  },
  beleza: {
    cores: ['#FFF5F7', '#C2185B', '#7B2D5B', '#F8C8A0', '#FBE0E8', '#3D1028'],
    faixa: '💖 Skincare, perfume e maquiagem com desconto de verdade',
    eyebrow: 'Beleza',
    titulo: ['Seu ritual de beleza, ', 'com a lupa', ''],
    sub: 'Da rotina de skincare ao perfume de presente: escolha por tipo e por faixa de preço.',
    cta: '💄 Ver beleza', emoji: '💄', deco: ['🌸', '✨'], filtro: 'tipo', leadTipo: 'beleza',
    faixas: [{ nome: 'Até R$ 50', min: 0, max: 50 }, { nome: 'R$ 50 a 150', min: 50.01, max: 150 }, { nome: 'Acima de R$ 150', min: 150.01, max: Infinity }],
  },
  vistase: {
    cores: ['#FAF7FF', '#7C3AED', '#1F1A2E', '#FBBF24', '#EDE5FF', '#1A1033'],
    faixa: '🛍️ Novidades da semana em moda, calçados e acessórios',
    eyebrow: 'Vista-se',
    titulo: ['Estilo para ', 'todo bolso', ''],
    sub: 'Do básico do dia a dia à peça de festa: acessível, intermediário e premium lado a lado.',
    cta: '🛍️ Ver looks', emoji: '👕', deco: ['👟', '🧥'], filtro: 'tipo', leadTipo: 'adulto',
    faixas: [{ nome: 'Até R$ 150', min: 0, max: 150 }, { nome: 'R$ 150 a 350', min: 150.01, max: 350 }, { nome: 'Acima de R$ 350', min: 350.01, max: Infinity }],
  },
  filho: {
    cores: ['#F7FBFF', '#2B8BD6', '#8E6CC9', '#FFC8DD', '#E3F1FC', '#22324A'],
    faixa: '🎒 Roupas, calçados e brinquedos para cada fase',
    eyebrow: 'Vista seu filho',
    titulo: ['Tudo para ', 'crescer feliz', ''],
    sub: 'Roupas, calçados e brinquedos infantis. Monte a lista e receba os links.',
    cta: '👕 Ver produtos', emoji: '🎒', deco: ['👟', '🪁'], filtro: 'tipo', leadTipo: 'filho',
  },
  mercado: {
    cores: ['#F6FBF3', '#2E8B3E', '#D9480F', '#FFD43B', '#E2F3DA', '#1B3A1F'],
    faixa: '🥫 Despensa cheia gastando menos · ofertas de mercado',
    eyebrow: 'Mercado',
    titulo: ['Despensa cheia, ', 'bolso feliz', ''],
    sub: 'Bebidas, alimentos e produtos do dia a dia com as melhores ofertas.',
    cta: '🛒 Ver ofertas', emoji: '🥑', deco: ['🥖', '🍅'], filtro: 'tipo', leadTipo: 'mercado',
    faixas: [{ nome: 'Até R$ 30', min: 0, max: 30 }, { nome: 'R$ 30 a 100', min: 30.01, max: 100 }, { nome: 'Acima de R$ 100', min: 100.01, max: Infinity }],
  },
  criancas: {
    cores: ['#FFFDF5', '#EF4444', '#2563EB', '#FACC15', '#FFEFD1', '#2B2D42'],
    faixa: '🎈 Dia das Crianças · 12 de outubro · confira o prazo de entrega de cada loja',
    eyebrow: 'Dia das Crianças',
    titulo: ['A festa da ', 'criançada', ' começa aqui'],
    sub: 'Brinquedos, roupas e calçados por faixa de preço. Toque em ♡ Pedir para montar a lista de desejos.',
    cta: '🎁 Ver presentes', emoji: '🎈', chapeu: '🎉', deco: ['🎉', '🪁'], data: true, filtro: 'preco', leadTipo: 'criancas',
    mascote: '/mascote/lupa-deitada.webp',
  },
  natal: {
    cores: ['#FFF9F5', '#C62828', '#1F6F5C', '#F4A261', '#FDE3DA', '#2B1D1A'],
    faixa: '🎄 Natal · confira o prazo de entrega de cada loja antes de comprar',
    eyebrow: 'Natal',
    titulo: ['Presentes que fazem os ', 'olhos brilharem', ''],
    sub: 'Filtre por bolso e monte a lista de pedidos da família.',
    cta: '🎁 Achar o presente', emoji: '🎁', chapeu: '🎅', deco: ['🎄', '❄️'], data: true, filtro: 'preco', leadTipo: 'natal',
  },
};

export const FAIXAS_PRECO: Faixa[] = [
  { nome: 'Até R$ 100', min: 0, max: 100 },
  { nome: 'R$ 100 a 300', min: 100.01, max: 300 },
  { nome: 'Acima de R$ 300', min: 300.01, max: Infinity },
];

// Calendário das datas festivas: a faixa da home aparece entre "de" e "ate" (MM-DD, horário de Brasília).
// Só coloque aqui datas que já têm página pronta.
export const CALENDARIO: { tema: string; href: string; de: string; ate: string; chamada: string; mascote?: string }[] = [
  { tema: 'criancas', href: '/dia-das-criancas', de: '09-25', ate: '10-12', chamada: 'Presentes por faixa de preço. Monte a lista e receba os links.', mascote: '/mascote/lupa-sentada.webp' },
];
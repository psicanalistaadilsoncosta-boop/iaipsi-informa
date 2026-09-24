// scripts/categorizar-produtos.mjs
// Roda com: node --env-file=.env.local scripts/categorizar-produtos.mjs
// Categoriza TODOS os produtos pinados: ambiente, momento e/ou moda

import { createClient } from '@vercel/kv';

const kv = createClient({
  url: process.env.informa_KV_REST_API_URL,
  token: process.env.informa_KV_REST_API_TOKEN,
});

// ─── LOJAS CONHECIDAS POR CATEGORIA ─────────────────────────────────────────

const LOJAS_MODA = [
  'zara', 'hm', 'h&m', 'renner', 'riachuelo', 'c&a', 'cea', 'marisa',
  'adidas', 'nike', 'puma', 'fila', 'under armour', 'mizuno', 'asics',
  'havaianas', 'rider', 'ipanema', 'grendha',
  'shein', 'dafiti', 'netshoes', 'centauro',
  'animale', 'forum', 'colcci', 'farm', 'reserva', 'aramis', 'dudalina',
  'italist',         // moda de luxo internacional
  'esbelt',          // tops/fitness
  'uvline',          // moda praia/UV
  'iodice',          // moda feminina
  'malwee',          // vestuário
  'sawary',          // jeans
  'hopeoficial',     // lingerie
  'camisariacolombo',// camisas
  'liquidostore',    // moda/praia
  'casadasaliancas', // joias → acessórios moda
  'ysyacessorios',   // joias/chokers → acessórios moda
];

const LOJAS_BELEZA = [
  'sieno',   // perfumes, cosméticos, hidratantes
  'alljoy',  // massageadores
];

const LOJAS_ALIMENTOS = [
  'vapza',       // alimentos prontos
  'divvino',     // alimentos gourmet
  'vinhosjolimont', // vinhos e sucos
];

const LOJAS_BEBE = [
  'babystock', // alimentadores, produtos bebê
  'kidy',      // brinquedos infantis
];

const LOJAS_ELETRO_CASA = [
  'irobotloja', // robôs aspiradores
  'arno',       // eletrodomésticos
  'atlaseletro',// peças eletrodomésticos
  'efácil', 'efacil', // eletrodomésticos grandes
  'mibrasil',   // xiaomi/smart home
];

const LOJAS_COZINHA = [
  'spicy',      // formas, utensílios, melamina
  'kappesberg', // móveis cozinha/escritório
];

// ─── REGRAS MODA (por nome do produto) ──────────────────────────────────────

const REGRAS_MODA = [
  { regex: /\b(camisa|camiseta|blusa|polo|regata|moletom|blusão|jaqueta|casaco|blazer|terno|paletó|colete|calça|bermuda|short|saia|vestido|macacão|jardineira|pijama|lingerie|sutiã|calcinha|cueca|meia|meias|meia-calça|meião|top|maiô|biquíni|trikini|saída de praia|viseira|canga)\b/i, tipo: 'Roupas' },
  { regex: /\b(tênis|sapato|sandália|chinelo|tamanco|bota|botina|scarpin|sapatilha|mocassim|oxford|loafer|rasteira|salto|espadrille|chuteira)\b/i, tipo: 'Calçados' },
  { regex: /\b(bolsa|mochila|carteira|necessaire|pochete|clutch|cinto|gravata|boné|chapéu|cachecol|lenço|óculos de sol|relógio|bijuteria|colar|brinco|pulseira|anel|broche|gargantilha|corrente|aliança|pingente|choker|joias|joia)\b/i, tipo: 'Acessórios' },
  { regex: /\b(body|pagão|enxoval|pelele|roupa de bebê|roupa infantil|roupa criança|camiseta infantil|calça infantil|vestido infantil|conjunto infantil|macacão infantil|shorts infantil)\b/i, tipo: 'Infantil' },
  { regex: /\b(tênis infantil|sapato infantil|sandália infantil|botinha infantil|chinelo infantil)\b/i, tipo: 'Infantil' },
  // inglês (italist etc.)
  { regex: /\b(trouser|sweater|jacket|coat|jeans|shirt|dress|blouse|skirt|sneaker|boot|loafer|bag|belt|scarf|watch|bracelet|necklace|ring|earring)\b/i, tipo: 'Roupas' },
];

// ─── REGRAS BELEZA ──────────────────────────────────────────────────────────

const REGRAS_BELEZA = [
  { regex: /\b(perfume|eau de parfum|eau de toilette|colônia|colonia|fragrância|fragrance|loção|locao|hidratante|creme corporal|sérum|serum|gel|shampoo|condicionador|máscara capilar|óleo capilar|esfoliante|sabonete|protetor solar|filtro solar|bronzeador|maquiagem|batom|rímel|base|pó|sombra|blush|contorno|primer|delineador|paleta)\b/i, categoria: 'beleza' },
  { regex: /\b(massageador|massager|aparelho de massagem|gun massagem|eye massager|leg massager|lumbar|cintura massagem)\b/i, categoria: 'beleza' },
];

// ─── REGRAS AMBIENTE ────────────────────────────────────────────────────────

const REGRAS_AMBIENTE = [
  // Sala de Estar
  { regex: /\b(sofá|sofa|poltrona|rack|estante|buffet|aparador|mesa de centro|tapete sala|painel tv|home theater|soundbar|sound bar|projetor|streaming|chromecast|fire stick|televisão|televisao|tv \d|smart tv)\b/i, ambiente: 'Sala de Estar', tipo: 'Eletro' },
  { regex: /\b(almofada|quadro decorativo|vaso decorativo|planta artificial|cortina|persiana|espelho sala|luminária sala|abajur sala)\b/i, ambiente: 'Sala de Estar', tipo: 'Decoração' },

  // Quarto
  { regex: /\b(cama|cabeceira|colchão|colchao|travesseiro|edredom|jogo de cama|roupa de cama|lençol|criado mudo|guarda-roupa|roupeiro|cômoda|comoda|cômodo)\b/i, ambiente: 'Quarto', tipo: 'Móveis' },
  { regex: /\b(luminária de cabeceira|ventilador de teto|ar condicionado|purificador de ar|umidificador)\b/i, ambiente: 'Quarto', tipo: 'Eletro' },
  { regex: /\b(aromatizador|difusor|vela aromática|porta-retrato|relógio de parede|espelho quarto)\b/i, ambiente: 'Quarto', tipo: 'Decoração' },

  // Sala de Jantar
  { regex: /\b(mesa de jantar|mesa jantar|cadeira de jantar|jogo americano|centro de mesa|porta-velas jantar)\b/i, ambiente: 'Sala de Jantar', tipo: 'Móveis' },
  { regex: /\b(louça|jogo de louça|prato|copo|taça|talher|jogo de jantar|faqueiro|terrina|saladeira|travessa)\b/i, ambiente: 'Sala de Jantar', tipo: 'Mesa Posta' },

  // Cozinha - Eletro
  { regex: /\b(fogão|geladeira|refrigerador|microondas|forno elétrico|cooktop|coifa|exaustor|lava-louças|lavadora de louça|processador|batedeira|liquidificador|air fryer|fritadeira|cafeteira|espresso|nespresso|torradeira|sanduicheira|panela elétrica|panela de pressão elétrica|robô aspirador|roomba|aspirador|braava|tanquinho|freezer|cervejeira|expositor vitrine|churrasqueira elétrica)\b/i, ambiente: 'Cozinha', tipo: 'Eletro' },
  // Cozinha - Utensílios
  { regex: /\b(faca|tábua|tabua|escorredor|peneira|forma de bolo|assadeira|frigideira|wok|caçarola|panela|chaleira|utensílio|utensilios|pinça|descanso de travessa|forma redonda|forma retangular|tigela|melamina|bowls?|bowl de)\b/i, ambiente: 'Cozinha', tipo: 'Utensílios' },
  // Cozinha - Móveis
  { regex: /\b(armário de cozinha|paneleiro|complemento \d porta|kit \d fornos|bancada|cuba|torneira cozinha)\b/i, ambiente: 'Cozinha', tipo: 'Móveis' },

  // Área Gourmet
  { regex: /\b(churrasqueira|grelha|espeto|carvão|acendedor|espeteira|parrilla|defumador|defumar)\b/i, ambiente: 'Área Gourmet', tipo: 'Churrasco' },
  { regex: /\b(adega|vinho|taça de vinho|saca-rolha|aerador|decanter|wine|sommelier)\b/i, ambiente: 'Área Gourmet', tipo: 'Vinhos' },

  // Área Externa
  { regex: /\b(mesa de jardim|cadeira de jardim|espreguiçadeira|piscina|banheira|spa|jacuzzi|gazebo|pergolado|deck)\b/i, ambiente: 'Área Externa', tipo: 'Móveis' },

  // Lavanderia
  { regex: /\b(máquina de lavar|lavadora|secadora|ferro de passar|tábua de passar|cesto de roupa|cabide|varal|papa bolinhas|vaporizador de roupas)\b/i, ambiente: 'Lavanderia', tipo: 'Eletro' },

  // Home Office
  { regex: /\b(escrivaninha|mesa de escritório|mesa diretor|cadeira de escritório|cadeira gamer|monitor|teclado|mouse|headset|webcam|impressora|scanner|nobreak|hub usb|notebook|laptop|computador|pc gamer|desktop|tablet|ipad|smartwatch|lâmpada inteligente|lampada inteligente|interruptor inteligente|luminária portátil|controle remoto luminária)\b/i, ambiente: 'Home Office', tipo: 'Eletro' },
  { regex: /\b(organizador de mesa|porta-caneta|suporte de monitor|suporte notebook|pasta|arquivo escritório)\b/i, ambiente: 'Home Office', tipo: 'Organização' },

  // Banheiro
  { regex: /\b(vaso sanitário|ducha|chuveiro|box banheiro|toalha|jogo de banheiro|porta-shampoo|saboneteira|suporte papel higiênico|espelho banheiro)\b/i, ambiente: 'Banheiro', tipo: 'Decoração' },

  // Quarto Infantil
  { regex: /\b(berço|cama infantil|carrinho de bebê|cadeirinha|alimentador infantil|chupeta|mamadeira|boia|boia de braço|prancha infantil)\b/i, ambiente: 'Quarto Infantil', tipo: 'Bebê' },
  { regex: /\b(brinquedo|pelúcia|boneca|lego|quebra-cabeça|jogo de tabuleiro|parque infantil|escorregador|garra|dino garra)\b/i, ambiente: 'Quarto Infantil', tipo: 'Brinquedos' },
];

// ─── REGRAS MOMENTO ──────────────────────────────────────────────────────────

const REGRAS_MOMENTO = [
  { regex: /\b(café da manhã|café da manha|torradeira|espresso|nespresso|cafeteira|cappuccino|xícara|pão de forma|geléia|geleia|manteiga|iogurte|granola|suco|vitamina|smoothie|achocolatado|leite condensado|strogonoff|feijão|feijao|lentilha|arroz|arroz para risoto|alimento pronto|só aquecer)\b/i, momento: 'Café da Manhã', tipo: 'Alimentos' },
  { regex: /\b(adega|vinho|taça de vinho|saca-rolha|aerador|decanter|wine|tábua de frios|frios|queijo|azeitona|antepasto|canudo de metal|tampa a vácuo|suco de uva|cabernet|merlot|chardonnay|espumante|jolimont)\b/i, momento: 'Vinho', tipo: 'Acessórios' },
  { regex: /\b(churrasqueira|churrasco|grelha|espeto|carvão|acendedor|linguiça|costela|picanha|tempero churrasco|cerveja|geleira|cooler|cervejeira)\b/i, momento: 'Churrasco', tipo: 'Acessórios' },
  { regex: /\b(lareira|aquecedor|cobertor|manta|vela|velas|xícara de chá|chá quente|cacau|chocolate quente|marshmallow)\b/i, momento: 'Lareira', tipo: 'Acessórios' },
  { regex: /\b(domingo|brunch|hamac|hammock|rede de descanso|almofada preguiça|pipoca|cobertor de sofa)\b/i, momento: 'Domingo Relaxado', tipo: 'Acessórios' },
  { regex: /\b(balão|confete|enfeite de festa|taça de festa|champagne|decoração festiva|bebida festiva|festa)\b/i, momento: 'Festa em Casa', tipo: 'Acessórios' },
];

// ─── FUNÇÕES ────────────────────────────────────────────────────────────────

function slugLoja(p) {
  return (p.loja || p.storeName || p.nomeLoja || '').toLowerCase().trim();
}

function nomeProduto(p) {
  return p.nome || p.name || '';
}

function detectarModa(p) {
  const loja = slugLoja(p);
  const nome = nomeProduto(p).toLowerCase();

  if (LOJAS_MODA.some(l => loja.includes(l))) {
    // tenta refinar pelo nome
    for (const regra of REGRAS_MODA) {
      if (regra.regex.test(nome)) return { vistaSe: true, tipoVistaSe: regra.tipo };
    }
    return { vistaSe: true, tipoVistaSe: 'Roupas' };
  }

  for (const regra of REGRAS_MODA) {
    if (regra.regex.test(nome)) return { vistaSe: true, tipoVistaSe: regra.tipo };
  }
  return null;
}

function detectarBeleza(p) {
  const loja = slugLoja(p);
  const nome = nomeProduto(p).toLowerCase();

  if (LOJAS_BELEZA.some(l => loja.includes(l))) return 'beleza';
  for (const regra of REGRAS_BELEZA) {
    if (regra.regex.test(nome)) return 'beleza';
  }
  return null;
}

function detectarAmbiente(p) {
  const loja = slugLoja(p);
  const nome = nomeProduto(p);

  // Lojas específicas com ambiente fixo
  if (['irobotloja', 'arno', 'atlaseletro', 'efácil', 'efacil'].some(l => loja.includes(l))) {
    return { ambiente: 'Cozinha', tipoAmbiente: 'Eletro' };
  }
  if (['mibrasil'].some(l => loja.includes(l))) {
    return { ambiente: 'Home Office', tipoAmbiente: 'Eletro' };
  }
  if (['spicy'].some(l => loja.includes(l))) {
    return { ambiente: 'Cozinha', tipoAmbiente: 'Utensílios' };
  }
  if (['kappesberg'].some(l => loja.includes(l))) {
    // kappesberg tem móveis cozinha e escritório — tenta pelo nome
    if (/escritório|diretor|office/i.test(nome)) return { ambiente: 'Home Office', tipoAmbiente: 'Móveis' };
    return { ambiente: 'Cozinha', tipoAmbiente: 'Móveis' };
  }
  if (['babystock', 'kidy'].some(l => loja.includes(l))) {
    return { ambiente: 'Quarto Infantil', tipoAmbiente: 'Bebê' };
  }

  for (const regra of REGRAS_AMBIENTE) {
    if (regra.regex.test(nome)) {
      return { ambiente: regra.ambiente, tipoAmbiente: regra.tipo };
    }
  }
  return null;
}

function detectarMomento(p) {
  const loja = slugLoja(p);
  const nome = nomeProduto(p);

  if (['vapza', 'divvino'].some(l => loja.includes(l))) {
    return { momento: 'Café da Manhã', tipoMomento: 'Alimentos' };
  }
  if (['vinhosjolimont'].some(l => loja.includes(l))) {
    return { momento: 'Vinho', tipoMomento: 'Acessórios' };
  }

  for (const regra of REGRAS_MOMENTO) {
    if (regra.regex.test(nome)) {
      return { momento: regra.momento, tipoMomento: regra.tipo };
    }
  }
  return null;
}

// ─── MAIN ────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🔍 Lendo produtos do KV...');
  const produtos = (await kv.get('produtos:pinados')) || [];
  console.log(`Total de produtos: ${produtos.length}\n`);

  let countModa = 0, countBeleza = 0, countAmbiente = 0, countMomento = 0, countSemCategoria = 0;
  const resumoModa = {}, resumoBeleza = {}, resumoAmbiente = {}, resumoMomento = {};

  const atualizados = produtos.map(p => {
    const resultado = { ...p };
    const moda = detectarModa(p);

    if (moda) {
      resultado.vistaSe = true;
      resultado.tipoVistaSe = moda.tipoVistaSe;
      countModa++;
      resumoModa[moda.tipoVistaSe] = (resumoModa[moda.tipoVistaSe] || 0) + 1;
      return resultado; // produto de moda não vai para ambiente/momento
    }

    const beleza = detectarBeleza(p);
    if (beleza) {
      resultado.beleza = true;
      countBeleza++;
      resumoBeleza['Beleza & Cuidados'] = (resumoBeleza['Beleza & Cuidados'] || 0) + 1;
      return resultado;
    }

    // Ambiente (só atribui se ainda não tiver)
    const ambiente = !p.ambiente ? detectarAmbiente(p) : null;
    if (ambiente) {
      resultado.ambiente = ambiente.ambiente;
      resultado.tipoAmbiente = ambiente.tipoAmbiente;
      countAmbiente++;
      resumoAmbiente[ambiente.ambiente] = (resumoAmbiente[ambiente.ambiente] || 0) + 1;
    }

    // Momento (só atribui se ainda não tiver)
    const momento = !p.momento ? detectarMomento(p) : null;
    if (momento) {
      resultado.momento = momento.momento;
      resultado.tipoMomento = momento.tipoMomento;
      countMomento++;
      resumoMomento[momento.momento] = (resumoMomento[momento.momento] || 0) + 1;
    }

    if (!ambiente && !momento && !p.ambiente && !p.momento) {
      countSemCategoria++;
    }

    return resultado;
  });

  console.log('📊 Resultado:');
  console.log(`  👗 Moda (Vista-se): ${countModa}`);
  Object.entries(resumoModa).forEach(([k, v]) => console.log(`     ${k}: ${v}`));
  console.log(`  💄 Beleza & Cuidados: ${countBeleza}`);
  console.log(`  🏠 Ambiente (novo): ${countAmbiente}`);
  Object.entries(resumoAmbiente).forEach(([k, v]) => console.log(`     ${k}: ${v}`));
  console.log(`  🌙 Momento (novo): ${countMomento}`);
  Object.entries(resumoMomento).forEach(([k, v]) => console.log(`     ${k}: ${v}`));
  console.log(`  ❓ Sem categoria: ${countSemCategoria}`);

  console.log('\n💾 Salvando no KV...');
  await kv.set('produtos:pinados', atualizados);
  console.log('✅ Pronto!');
}

main().catch(console.error);

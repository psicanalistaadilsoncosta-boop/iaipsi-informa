import { createClient } from '@vercel/kv';

const kv = createClient({
  url: process.env.informa_KV_REST_API_URL,
  token: process.env.informa_KV_REST_API_TOKEN,
});

const REGRAS = [
  // Café da manhã
  { momento: 'Café da manhã', tipo: 'Eletro', regex: /cafeteira|expresso|nespresso|dolce|cappuccino|torradeira|sanduicheira|liquidificador|mixer|batedeira/i },
  { momento: 'Café da manhã', tipo: 'Acessórios', regex: /xícara|caneca|bule|coador|french press|porta-cápsulas|cápsulas de café|café solúvel|chá/i },
  { momento: 'Café da manhã', tipo: 'Alimentos', regex: /café (em pó|torrado|gourmet|especial)|cápsula.*café|nescafé|pilão|três corações/i },

  // Vinho
  { momento: 'Vinho', tipo: 'Eletro', regex: /adega|cooler.*vinho|termômetro.*vinho/i },
  { momento: 'Vinho', tipo: 'Acessórios', regex: /taça.*vinho|cálice|saca-rolha|aerador|decantador|porta-vinho|vinho|espumante|champanhe/i },
  { momento: 'Vinho', tipo: 'Alimentos', regex: /vinho tinto|vinho branco|vinho rosé|espumante|prosecco|champagne|bordeaux|cabernet|merlot/i },

  // Churrasco
  { momento: 'Churrasco', tipo: 'Eletro', regex: /churrasqueira elétrica|grill elétrico|air fryer.*churrasco/i },
  { momento: 'Churrasco', tipo: 'Móveis', regex: /churrasqueira|grill|fogão a carvão|bafo/i },
  { momento: 'Churrasco', tipo: 'Acessórios', regex: /espeto|garfo.*churrasco|faca.*churrasco|tábua.*corte|pegador|grelha|avental|chaira|afiador/i },
  { momento: 'Churrasco', tipo: 'Alimentos', regex: /carvão|acendedor|tempero.*churrasco|sal grosso|linguiça|costela|picanha/i },

  // Lareira
  { momento: 'Lareira', tipo: 'Eletro', regex: /lareira elétrica|aquecedor.*ambiente|estufa elétrica/i },
  { momento: 'Lareira', tipo: 'Móveis', regex: /lareira|poltrona.*couro|sofá.*couro/i },
  { momento: 'Lareira', tipo: 'Acessórios', regex: /vela|porta-vela|difusor|incenso|manta|xale|cobertor|almofada.*veludo/i },

  // Domingo relaxado
  { momento: 'Domingo relaxado', tipo: 'Eletro', regex: /smart tv|projetor|caixa de som|alto-falante|bluetooth.*speaker|home theater/i },
  { momento: 'Domingo relaxado', tipo: 'Móveis', regex: /rede|hammock|espreguiçadeira|poltrona.*relaxante|pufe/i },
  { momento: 'Domingo relaxado', tipo: 'Acessórios', regex: /livro|revista|jogo de tabuleiro|puzzle|quebra-cabeça|fone de ouvido|headphone/i },

  // Festa em casa
  { momento: 'Festa em casa', tipo: 'Eletro', regex: /caixa de som.*festa|speaker.*bluetooth|karaokê|luz.*festa|pisca|led.*colorido/i },
  { momento: 'Festa em casa', tipo: 'Móveis', regex: /mesa dobrável|cadeira dobrável|banqueta|bar.*móvel/i },
  { momento: 'Festa em casa', tipo: 'Acessórios', regex: /taça|copo.*long drink|jogo de copos|bandeja|petisqueira|tábua.*frios|balão|decoração.*festa/i },
  { momento: 'Festa em casa', tipo: 'Alimentos', regex: /cerveja|drinks|refrigerante.*festa|salgadinho|petisco/i },
];

async function main() {
  const produtos = (await kv.get('produtos:pinados')) || [];
  console.log(`Total de produtos: ${produtos.length}`);

  let atualizados = 0;

   const novos = produtos.map(p => {
    // reseta para re-categorizar tudo
    const texto = `${p.nome} ${p.categoria || ''}`;
    for (const r of REGRAS) {
      if (r.regex.test(texto)) {
        atualizados++;
        return { ...p, momento: r.momento, tipoMomento: r.tipo };
      }
    }
    return p;
  });

  await kv.set('produtos:pinados', novos);
  console.log(`✅ ${atualizados} produtos categorizados por momento`);

  // Resumo
   const resumo = {};
  for (const p of novos) {
    if (!p.momento) continue;
    if (!resumo[p.momento]) resumo[p.momento] = {};
    resumo[p.momento][p.tipoMomento || 'Geral'] = (resumo[p.momento][p.tipoMomento || 'Geral'] || 0) + 1;
  }
  console.log('\nResumo:');
  for (const [m, tipos] of Object.entries(resumo)) {
    console.log(`  ${m}:`);
    for (const [t, n] of Object.entries(tipos)) {
      console.log(`    ${t}: ${n}`);
    }
  }
}

main().catch(console.error);
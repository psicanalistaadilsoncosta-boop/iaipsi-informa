import { readFileSync } from 'fs';

const URL   = process.env.informa_KV_REST_API_URL;
const TOKEN = process.env.informa_KV_REST_API_TOKEN;

if (!URL || !TOKEN) {
  console.error('❌ Variáveis não encontradas');
  process.exit(1);
}

// Lê o JSON corrigido (coloque o arquivo na pasta scripts/)
const produtos = JSON.parse(readFileSync('./scripts/produtos-corrigidos.json', 'utf8'));
console.log(`📦 ${produtos.length} produtos carregados`);

console.log('💾 Salvando no KV...');
const res = await fetch(`${URL}/set/produtos:pinados`, {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${TOKEN}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(produtos),
});

const json = await res.json();
console.log('Resposta KV:', json);
console.log('✅ Pronto!');

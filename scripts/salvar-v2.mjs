import { readFileSync } from 'fs';

const URL   = process.env.informa_KV_REST_API_URL;
const TOKEN = process.env.informa_KV_REST_API_TOKEN;

if (!URL || !TOKEN) {
  console.error('❌ Variáveis não encontradas');
  process.exit(1);
}

const produtos = JSON.parse(readFileSync('./scripts/produtos-v2.json', 'utf8'));
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
if (json.result === 'OK') {
  console.log('✅ Pronto!');
} else {
  console.error('❌ Erro ao salvar');
}

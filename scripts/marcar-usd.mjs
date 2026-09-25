// Lê produtos:pinados do KV, marca moedaUSD: true nas lojas italist e alljoy, salva de volta

const URL   = process.env.informa_KV_REST_API_URL;
const TOKEN = process.env.informa_KV_REST_API_TOKEN;

if (!URL || !TOKEN) { console.error('❌ Variáveis não encontradas'); process.exit(1); }

const LOJAS_USD = ['italist', 'alljoy'];

// Busca do KV
const res = await fetch(`${URL}/get/produtos:pinados`, {
  headers: { Authorization: `Bearer ${TOKEN}` },
});
const json = await res.json();
let produtos = json.result;
if (typeof produtos === 'string') produtos = JSON.parse(produtos);

if (!Array.isArray(produtos)) { console.error('❌ KV não retornou array', json); process.exit(1); }
console.log(`📦 ${produtos.length} produtos carregados`);

let marcados = 0;
const atualizados = produtos.map(p => {
  const loja = (p.loja || p.storeName || p.nomeLoja || '').toLowerCase();
  const ehUSD = LOJAS_USD.some(l => loja.includes(l));
  if (ehUSD && !p.moedaUSD) {
    marcados++;
    return { ...p, moedaUSD: true };
  }
  return p;
});

console.log(`💵 ${marcados} produtos marcados como USD`);

// Salva no KV
const save = await fetch(`${URL}/set/produtos:pinados`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
  body: JSON.stringify(atualizados),
});
const saveJson = await save.json();
console.log('Resposta KV:', saveJson);
if (saveJson.result === 'OK') console.log('✅ Pronto!');
else console.error('❌ Erro ao salvar');

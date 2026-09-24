const URL   = process.env.informa_KV_REST_API_URL;
const TOKEN = process.env.informa_KV_REST_API_TOKEN;

const res = await fetch(`${URL}/get/produtos:pinados`, {
  headers: { Authorization: `Bearer ${TOKEN}` }
});
const json = await res.json();
console.log('tipo result:', typeof json.result);
console.log('início result:', String(json.result).slice(0, 100));

let produtos = json.result;
if (typeof produtos === 'string') produtos = JSON.parse(produtos);
if (!Array.isArray(produtos)) {
  console.log('❌ Não é array. Estrutura:', JSON.stringify(json).slice(0, 200));
  process.exit(1);
}

console.log('Total:', produtos.length);
console.log('beleza:', produtos.filter(p => p.beleza).length);
console.log('vistaSe:', produtos.filter(p => p.vistaSe).length);
console.log('ambiente:', produtos.filter(p => p.ambiente).length);
console.log('momento:', produtos.filter(p => p.momento).length);

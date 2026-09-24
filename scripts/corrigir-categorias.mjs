// Lê as vars do .env.local via --env-file
const URL  = process.env.informa_KV_REST_API_URL;
const TOKEN = process.env.informa_KV_REST_API_TOKEN;

if (!URL || !TOKEN) {
  console.error('❌ Variáveis informa_KV_REST_API_URL ou informa_KV_REST_API_TOKEN não encontradas');
  process.exit(1);
}

async function kvGet(key) {
  const res = await fetch(`${URL}/get/${key}`, {
    headers: { Authorization: `Bearer ${TOKEN}` }
  });
  const json = await res.json();
  return json.result ? JSON.parse(json.result) : null;
}

async function kvSet(key, value) {
  const res = await fetch(`${URL}/set/${key}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(JSON.stringify(value))
  });
  return res.json();
}

console.log('🔄 Buscando produtos...');
const produtos = await kvGet('produtos:pinados') || [];
console.log(`Total: ${produtos.length}`);

const fixed = [];
for (const p of produtos) {
  const hasAmb = !!p.ambiente;
  const hasMom = !!p.momento;
  const hasVs  = !!p.vistaSe;
  const hasBel = !!p.beleza;

  const total = [hasAmb, hasMom, hasVs, hasBel].filter(Boolean).length;

  if (total <= 1) { fixed.push(p); continue; }

  const p2 = { ...p };
  if (hasBel) {
    delete p2.ambiente; delete p2.tipoAmbiente;
    delete p2.momento;  delete p2.tipoMomento;
    delete p2.vistaSe;  delete p2.tipoVistaSe;
  } else if (hasVs) {
    delete p2.ambiente; delete p2.tipoAmbiente;
    delete p2.momento;  delete p2.tipoMomento;
  } else if (hasAmb) {
    delete p2.momento;  delete p2.tipoMomento;
  }
  fixed.push(p2);
}

const conta = { vistaSe: 0, ambiente: 0, momento: 0, beleza: 0, sem: 0 };
for (const p of fixed) {
  if (p.beleza)        conta.beleza++;
  else if (p.vistaSe)  conta.vistaSe++;
  else if (p.ambiente) conta.ambiente++;
  else if (p.momento)  conta.momento++;
  else conta.sem++;
}
console.log('Resultado:', conta);

console.log('💾 Salvando no KV...');
await kvSet('produtos:pinados', fixed);
console.log('✅ Pronto!');

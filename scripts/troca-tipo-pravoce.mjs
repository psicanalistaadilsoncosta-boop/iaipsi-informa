// scripts/troca-tipo-pravoce.mjs — troca o tipo do Pra Você em todos os produtos (pin:prod)
// Teste:  node scripts/troca-tipo-pravoce.mjs
// Gravar: node scripts/troca-tipo-pravoce.mjs --gravar
import fs from 'fs';

const DE = 'Livros e leitura';
const PARA = 'Ler e refletir';
const GRAVAR = process.argv.includes('--gravar');

// lê as chaves do .env.local (sem mostrar nada na tela)
const env = Object.fromEntries(
  fs.readFileSync('.env.local', 'utf8').split(/\r?\n/)
    .map(l => l.match(/^\s*([A-Za-z0-9_]+)\s*=\s*"?([^"]*)"?\s*$/)).filter(Boolean).map(m => [m[1], m[2]])
);
const URL_KV = env.informa_KV_REST_API_URL || env.KV_REST_API_URL || env.UPSTASH_REDIS_REST_URL;
const TOKEN = env.informa_KV_REST_API_TOKEN || env.KV_REST_API_TOKEN || env.UPSTASH_REDIS_REST_TOKEN;
if (!URL_KV || !TOKEN) { console.log('Não achei a URL/TOKEN do Upstash no .env.local'); process.exit(1); }

async function cmd(...args) {
  const r = await fetch(URL_KV, { method: 'POST', headers: { Authorization: `Bearer ${TOKEN}` }, body: JSON.stringify(args) });
  const d = await r.json();
  if (d.error) throw new Error(d.error);
  return d.result;
}

const plano = await cmd('HGETALL', 'pin:prod');
const trocar = [];
for (let i = 0; i < plano.length; i += 2) {
  try {
    const p = JSON.parse(plano[i + 1]);
    if (p.tipoPraVoce === DE) trocar.push([plano[i], { ...p, tipoPraVoce: PARA }]);
  } catch {}
}
console.log(`${trocar.length} produto(s) com "${DE}"`);
trocar.slice(0, 10).forEach(([, p]) => console.log(' -', p.nome));
if (!GRAVAR) { console.log('\nModo teste: nada foi gravado. Para gravar, rode de novo com --gravar'); process.exit(0); }

for (const [campo, p] of trocar) await cmd('HSET', 'pin:prod', campo, JSON.stringify(p));
console.log(`\n✅ ${trocar.length} produto(s) agora em "${PARA}".`);
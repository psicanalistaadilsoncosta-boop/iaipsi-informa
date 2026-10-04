// scripts/migra-pinados.mjs
// Passa a lista única produtos:pinados para as gavetas (pin:prod + pin:cat:* + pin:dest:*).
// NÃO apaga a lista antiga. Salva uma cópia em backups/ antes.
// Uso:
//   node --env-file=.env.local scripts/migra-pinados.mjs            -> só mostra (não grava)
//   node --env-file=.env.local scripts/migra-pinados.mjs --gravar   -> grava as gavetas

import { mkdirSync, writeFileSync } from 'node:fs';

const URL_KV = process.env.informa_KV_REST_API_URL || process.env.KV_REST_API_URL;
const TOKEN = process.env.informa_KV_REST_API_TOKEN || process.env.KV_REST_API_TOKEN;
const GRAVAR = process.argv.includes('--gravar');
if (!URL_KV || !TOKEN) { console.error('Variáveis do KV não encontradas. Rode com --env-file=.env.local'); process.exit(1); }

async function cmd(lista) {
  const r = await fetch(`${URL_KV}/pipeline`, {
    method: 'POST', headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' }, body: JSON.stringify(lista),
  });
  if (!r.ok) throw new Error(`KV: HTTP ${r.status} ${await r.text()}`);
  const res = await r.json();
  const erro = res.find(x => x.error);
  if (erro) throw new Error(`KV: ${erro.error}`);
  return res;
}

function gavetasDo(p) {
  const g = [];
  if (p.ambiente || p.tipoAmbiente) g.push('pin:cat:ambiente');
  if (p.momento || p.tipoMomento) g.push('pin:cat:momento');
  if (p.vistaSe) g.push('pin:cat:vistaSe');
  if (p.beleza) g.push('pin:cat:beleza');
  if (p.mercado) g.push('pin:cat:mercado');
  if (p.praVoce) g.push('pin:cat:praVoce');
  if (p.aCatalogar === true) g.push('pin:cat:aCatalogar');
  for (const d of Array.isArray(p.destinos) ? p.destinos : []) if (d) g.push(`pin:dest:${d}`);
  return g;
}

const [{ result }] = await cmd([['GET', 'produtos:pinados']]);
const lista = (typeof result === 'string' ? JSON.parse(result) : result) || [];
const validos = lista.filter(p => p && p.id);
console.log(`Lista antiga: ${lista.length} produtos (${validos.length} com id)`);

const gavetas = {};
for (const p of validos) for (const g of gavetasDo(p)) (gavetas[g] ||= []).push(String(p.id));
console.log('Gavetas que serão criadas:');
for (const [g, ids] of Object.entries(gavetas).sort()) console.log(`  ${g.padEnd(28)} ${ids.length}`);

if (!GRAVAR) { console.log('\nNada foi gravado. Para gravar, rode de novo com --gravar'); process.exit(0); }

mkdirSync('backups', { recursive: true });
const arq = `backups/produtos-pinados-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
writeFileSync(arq, JSON.stringify(lista), 'utf8');
console.log(`\n💾 Cópia de segurança: ${arq}`);

// recomeça as gavetas do zero (a lista antiga continua intacta)
const antigas = (await cmd([['KEYS', 'pin:*']]))[0].result || [];
if (antigas.length) await cmd(antigas.map(k => ['DEL', k]));

for (let i = 0; i < validos.length; i += 150) {
  const parte = validos.slice(i, i + 150);
  await cmd([['HSET', 'pin:prod', ...parte.flatMap(p => [String(p.id), JSON.stringify(p)])]]);
  process.stdout.write(`\r  produtos gravados: ${Math.min(i + 150, validos.length)}/${validos.length}`);
}
await cmd(Object.entries(gavetas).map(([g, ids]) => ['SADD', g, ...ids]));

const [{ result: n }] = await cmd([['HLEN', 'pin:prod']]);
console.log(`\n✅ Gavetas prontas: ${n} produtos em pin:prod. A lista antiga produtos:pinados NÃO foi apagada.`);

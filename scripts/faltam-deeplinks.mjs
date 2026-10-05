// scripts/faltam-deeplinks.mjs
// SÓ LÊ (não grava nada). Mostra as lojas Actionpay de "lojas:cadastradas"
// que ainda NÃO têm modelo de link em "actionpay:deeplinks".
// Uso:
//   node --env-file=.env.local scripts/faltam-deeplinks.mjs

const URL_KV = process.env.informa_KV_REST_API_URL || process.env.KV_REST_API_URL;
const TOKEN = process.env.informa_KV_REST_API_TOKEN || process.env.KV_REST_API_TOKEN;
if (!URL_KV || !TOKEN) { console.error('Variáveis do KV não encontradas. Rode com --env-file=.env.local'); process.exit(1); }

const r = await fetch(`${URL_KV}/pipeline`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
  body: JSON.stringify([['GET', 'lojas:cadastradas'], ['GET', 'actionpay:deeplinks']]),
});
if (!r.ok) { console.error(`KV: HTTP ${r.status}`); process.exit(1); }
const [a, b] = await r.json();
const ler = (x) => (typeof x?.result === 'string' ? JSON.parse(x.result) : x?.result);
const lojas = ler(a) || [];
const modelos = ler(b) || {};

const actionpay = lojas.filter(l => String(l.anuncianteId || '').startsWith('actionpay-'));
const faltam = actionpay.filter(l => !modelos[String(l.anuncianteId).slice('actionpay-'.length)]?.prefixo);

console.log(`Lojas Actionpay cadastradas: ${actionpay.length}`);
console.log(`Com modelo em actionpay:deeplinks: ${actionpay.length - faltam.length}`);
console.log(`FALTAM: ${faltam.length}\n`);
console.table(faltam.map(l => ({ oferta: String(l.anuncianteId).slice('actionpay-'.length), loja: l.nome, site: l.url })));

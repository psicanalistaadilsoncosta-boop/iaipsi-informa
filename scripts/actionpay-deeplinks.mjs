// Busca o modelo de deeplink de cada oferta Actionpay e guarda no KV (chave "actionpay:deeplinks")
// Uso: node scripts/actionpay-deeplinks.mjs            → só mostra
//      node scripts/actionpay-deeplinks.mjs --gravar   → grava no KV
import fs from 'node:fs';

const env = Object.fromEntries(
  fs.readFileSync('.env.local', 'utf8').split(/\r?\n/)
    .filter(l => /^\s*[^#=\s][^=]*=/.test(l))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^"|"$/g, '')]; })
);
const FONTE = '360672';
const ofertas = JSON.parse(fs.readFileSync('scripts/actionpay-ofertas.json', 'utf8')).filter(o => o.deeplink === 'sim');

const modelos = {};
for (const o of ofertas) {
  const qs = new URLSearchParams({ key: env.ACTIONPAY_API_KEY, format: 'json', offer: String(o.id), source: FONTE });
  const j = await (await fetch(`https://actionpay.com.br/pt/apiWmLinks/?${qs}`)).json();
  const links = j.result?.links || [];
  const dl = (Array.isArray(links) ? links : [links]).find(l => String(l.url || '').includes('/url='));
  // Guarda só o começo: https://apretailer.com.br/click/<codigo>/360672/
  const m = dl && String(dl.url).match(/^(https:\/\/[^/]+\/click\/[^/]+\/\d+\/)/);
  modelos[o.id] = m ? { nome: o.oferta, prefixo: m[1] } : { nome: o.oferta, prefixo: null };
  await new Promise(r => setTimeout(r, 300));
}
console.table(Object.entries(modelos).map(([id, v]) => ({ id, oferta: v.nome, prefixo: v.prefixo || '— sem deeplink na API' })));

if (process.argv.includes('--gravar')) {
  const r = await fetch(env.informa_KV_REST_API_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.informa_KV_REST_API_TOKEN}` },
    body: JSON.stringify(['SET', 'actionpay:deeplinks', JSON.stringify(modelos)]),
  });
  console.log('Gravado no KV:', (await r.json()).result);
} else {
  console.log('\nSimulação. Para gravar: node scripts/actionpay-deeplinks.mjs --gravar');
}
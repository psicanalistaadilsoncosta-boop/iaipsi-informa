// Testa a chave da Actionpay e lista as ofertas conectadas à sua conta
import fs from 'node:fs';

const env = Object.fromEntries(
  fs.readFileSync('.env.local', 'utf8').split(/\r?\n/)
    .filter(l => /^\s*[^#=\s][^=]*=/.test(l))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^"|"$/g, '')]; })
);
const KEY = env.ACTIONPAY_API_KEY;
if (!KEY) { console.error('Falta ACTIONPAY_API_KEY no .env.local'); process.exit(1); }

async function api(metodo, params = {}) {
  const qs = new URLSearchParams({ key: KEY, format: 'json', ...params });
  const r = await fetch(`https://actionpay.com.br/pt/${metodo}/?${qs}`);
  const j = await r.json().catch(() => ({}));
  if (j.error) throw new Error(`${metodo}: ${j.error.code} ${j.error.text}`);
  return j.result ?? j;
}

// 1. Fontes (deve aparecer "Com A Lupa", 360672)
const fontes = await api('apiWmSources');
console.log('Fontes:', JSON.stringify(fontes).slice(0, 300));

// 2. Ofertas conectadas (favoritas)
const minhas = await api('apiWmMyOffers');
const lista = minhas.favouriteOffers || [];
console.log(`\nOfertas conectadas: ${lista.length}`);

// 3. Para cada uma, se aceita deeplink
const tabela = [];
for (const f of lista) {
  const id = f.offer?.id;
  let deeplink = '?';
  try {
    const o = await api('apiWmOffers', { offer: id });
    const oferta = (o.offers || [])[0] || o.offer;
    deeplink = oferta?.deeplink ? 'sim' : '-';
  } catch { deeplink = 'erro'; }
  tabela.push({ id, oferta: f.offer?.name, status: f.status?.name, deeplink });
  await new Promise(r => setTimeout(r, 300));
}
console.table(tabela);
fs.writeFileSync('scripts/actionpay-ofertas.json', JSON.stringify(tabela, null, 2));
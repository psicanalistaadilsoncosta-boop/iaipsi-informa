// Lista as lojas da Rakuten que entregam no Brasil e testa a API de parcerias
import fs from 'node:fs';

const env = Object.fromEntries(
  fs.readFileSync('.env.local', 'utf8').split(/\r?\n/)
    .filter(l => /^\s*[^#=\s][^=]*=/.test(l))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^"|"$/g, '')]; })
);
const tokenKey = Buffer.from(`${env.RAKUTEN_CLIENT_ID}:${env.RAKUTEN_CLIENT_SECRET}`).toString('base64');
const tok = await (await fetch('https://api.linksynergy.com/token', {
  method: 'POST',
  headers: { Authorization: `Bearer ${tokenKey}`, 'Content-Type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({ scope: env.RAKUTEN_SID }),
})).json();
const H = { Authorization: `Bearer ${tok.access_token}`, Accept: 'application/json' };

// 1. Todas as lojas (páginas de 100, com pausa, dentro do limite de 100 chamadas/min)
const todas = [];
for (let p = 1; ; p++) {
  const j = await (await fetch(`https://api.linksynergy.com/v2/advertisers?page=${p}&limit=100`, { headers: H })).json();
  todas.push(...(j.advertisers || []));
  process.stdout.write(`\rLojas: ${todas.length} / ${j._metadata?.total}`);
  if (!j._metadata?._links?.next) break;
  await new Promise(r => setTimeout(r, 700));
}
console.log();
fs.writeFileSync('scripts/rakuten-lojas.json', JSON.stringify(todas, null, 2));

// 2. Só as que entregam no Brasil
const br = todas.filter(a => (a.policies?.international_capabilities?.ships_to || []).includes('BR'));
console.log(`\nEntregam no Brasil: ${br.length}`);
console.table(br.map(a => ({ id: a.id, loja: a.name, rede: a.network, deeplink: a.features?.deep_links ? 'sim' : '-', catalogo: a.features?.product_feed ? 'sim' : '-', site: a.url })));

// 3. Teste da API de parcerias
for (const url of ['https://api.linksynergy.com/v1/partnerships?partner_status=active&limit=100', 'https://api.linksynergy.com/v1/partnerships?limit=100']) {
  const r = await fetch(url, { headers: H });
  const t = await r.text();
  console.log(`\nParcerias: ${url}\nHTTP ${r.status}: ${t.slice(0, 800)}`);
  if (r.ok) break;
}
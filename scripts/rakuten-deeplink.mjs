// Testa a geração de deeplink da Rakuten com a Weleda (única parceria ativa)
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

const r = await fetch('https://api.linksynergy.com/v1/links/deep_links', {
  method: 'POST',
  headers: { Authorization: `Bearer ${tok.access_token}`, 'Content-Type': 'application/json', Accept: 'application/json' },
  body: JSON.stringify({ url: 'https://www.weleda.com.br/', advertiser_id: 54237 }),
});
console.log(`HTTP ${r.status}`);
console.log(await r.text());
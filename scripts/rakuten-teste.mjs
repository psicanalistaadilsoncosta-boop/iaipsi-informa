// Testa a autenticação da Rakuten e lista as lojas com parceria aprovada
import fs from 'node:fs';

const env = Object.fromEntries(
  fs.readFileSync('.env.local', 'utf8').split(/\r?\n/)
    .filter(l => /^\s*[^#=\s][^=]*=/.test(l))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^"|"$/g, '')]; })
);
const { RAKUTEN_CLIENT_ID: id, RAKUTEN_CLIENT_SECRET: secret, RAKUTEN_SID: sid } = env;
if (!id || !secret || !sid) { console.error('Faltam RAKUTEN_CLIENT_ID, RAKUTEN_CLIENT_SECRET ou RAKUTEN_SID no .env.local'); process.exit(1); }

// 1. Pede o token de acesso
const tokenKey = Buffer.from(`${id}:${secret}`).toString('base64');
const r = await fetch('https://api.linksynergy.com/token', {
  method: 'POST',
  headers: { Authorization: `Bearer ${tokenKey}`, 'Content-Type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({ scope: sid }),
});
const tok = await r.json().catch(() => ({}));
if (!tok.access_token) { console.error(`Falhou o token (HTTP ${r.status}):`, JSON.stringify(tok).slice(0, 300)); process.exit(1); }
console.log(`Token OK (vale ${tok.expires_in} s)`);

// 2. Lista as lojas com parceria aprovada
const a = await fetch('https://api.linksynergy.com/v2/advertisers?limit=100', {
  headers: { Authorization: `Bearer ${tok.access_token}`, Accept: 'application/json' },
});
const txt = await a.text();
console.log(`Advertisers (HTTP ${a.status}):`);
console.log(txt.slice(0, 1500));
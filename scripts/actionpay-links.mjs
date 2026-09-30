// Mostra os links que a API da Actionpay devolve para a DHgate
import fs from 'node:fs';

const env = Object.fromEntries(
  fs.readFileSync('.env.local', 'utf8').split(/\r?\n/)
    .filter(l => /^\s*[^#=\s][^=]*=/.test(l))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^"|"$/g, '')]; })
);
const qs = new URLSearchParams({ key: env.ACTIONPAY_API_KEY, format: 'json', offer: '14605', source: '360672' });
const r = await fetch(`https://actionpay.com.br/pt/apiWmLinks/?${qs}`);
const j = await r.json();
const links = j.result?.links || j.links || [];
console.table((Array.isArray(links) ? links : [links]).map(l => ({ landing: l.landing?.name, landingId: l.landing?.id, url: l.url, destino: l.cleanUrl })));
if (!links.length) console.log(JSON.stringify(j).slice(0, 1500));
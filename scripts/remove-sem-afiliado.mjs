// scripts/remove-sem-afiliado.mjs
// Remove das gavetas os produtos pinados cujo link NÃO é de afiliado (o /ir recusa).
// Antes de apagar, salva uma cópia deles em backups/.
// Uso:
//   node --env-file=.env.local scripts/remove-sem-afiliado.mjs            -> só mostra (não apaga)
//   node --env-file=.env.local scripts/remove-sem-afiliado.mjs --gravar   -> apaga

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

// mesma lista de lib/links-afiliados.ts
const HOSTS_AFILIADOS = ['lmdee.link', 'lomadee.com', 'lomadee.com.br', 'awin1.com', 'apretailer.com.br', 'linksynergy.com', 'viator.com'];
function linkAfiliadoOk(u) {
  try {
    const url = new URL(u);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return false;
    if (/\.(csv|xlsx?|zip)$/i.test(url.pathname)) return false;
    const h = url.hostname.toLowerCase();
    return HOSTS_AFILIADOS.some(d => h === d || h.endsWith('.' + d));
  } catch { return false; }
}

// mesmas gavetas de lib/pinados.ts
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

const [{ result }] = await cmd([['HVALS', 'pin:prod']]);
const produtos = (result || []).map(s => { try { return JSON.parse(s); } catch { return null; } }).filter(p => p && p.id);
const ruins = produtos.filter(p => !linkAfiliadoOk(p.link || ''));

const porLoja = {};
for (const p of ruins) { const l = p.lojaNome || p.loja || '?'; porLoja[l] = (porLoja[l] || 0) + 1; }
console.log(`Produtos pinados: ${produtos.length}`);
console.log(`Serão removidos (sem link de afiliado): ${ruins.length}`);
console.table(Object.entries(porLoja).map(([loja, qtd]) => ({ loja, qtd })));

if (!ruins.length) process.exit(0);
if (!GRAVAR) { console.log('\nNada foi apagado. Para apagar, rode de novo com --gravar'); process.exit(0); }

// backup
mkdirSync('backups', { recursive: true });
const arq = `backups/removidos-sem-afiliado-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
writeFileSync(arq, JSON.stringify(ruins, null, 2));
console.log(`\nBackup dos removidos: ${arq}`);

// remove das gavetas e do hash, em lotes
const cmds = [];
for (const p of ruins) {
  const id = String(p.id);
  for (const g of gavetasDo(p)) cmds.push(['SREM', g, id]);
  cmds.push(['HDEL', 'pin:prod', id]);
}
for (let i = 0; i < cmds.length; i += 300) await cmd(cmds.slice(i, i + 300));

const [{ result: total }] = await cmd([['HLEN', 'pin:prod']]);
console.log(`✅ ${ruins.length} removidos. Agora há ${total} produtos pinados.`);

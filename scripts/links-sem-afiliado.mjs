// scripts/links-sem-afiliado.mjs
// SÓ LÊ (não grava nada). Lista os produtos pinados (gavetas, pin:prod) cujo link
// NÃO é de afiliado — esses o /ir recusa e mandam o visitante para a home da Lupa.
// Uso:
//   node --env-file=.env.local scripts/links-sem-afiliado.mjs

const URL_KV = process.env.informa_KV_REST_API_URL || process.env.KV_REST_API_URL;
const TOKEN = process.env.informa_KV_REST_API_TOKEN || process.env.KV_REST_API_TOKEN;
if (!URL_KV || !TOKEN) { console.error('Variáveis do KV não encontradas. Rode com --env-file=.env.local'); process.exit(1); }

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

const r = await fetch(`${URL_KV}/pipeline`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
  body: JSON.stringify([['HVALS', 'pin:prod']]),
});
if (!r.ok) { console.error(`KV: HTTP ${r.status}`); process.exit(1); }
const [{ result }] = await r.json();
const produtos = (result || []).map(s => { try { return JSON.parse(s); } catch { return null; } }).filter(Boolean);

const ruins = produtos.filter(p => !linkAfiliadoOk(p.link || ''));

const porLoja = {};
for (const p of ruins) {
  const loja = p.lojaNome || p.loja || (() => { try { return new URL(p.link).hostname; } catch { return '(sem link)'; } })();
  porLoja[loja] = (porLoja[loja] || 0) + 1;
}

console.log(`Produtos pinados: ${produtos.length}`);
console.log(`Com link de afiliado: ${produtos.length - ruins.length}`);
console.log(`SEM link de afiliado: ${ruins.length}\n`);
if (!ruins.length) process.exit(0);

console.log('Por loja:');
console.table(Object.entries(porLoja).sort((a, b) => b[1] - a[1]).map(([loja, qtd]) => ({ loja, qtd })));

console.log('\nProdutos (até 60):');
console.table(ruins.slice(0, 60).map(p => ({
  id: String(p.id).slice(0, 20),
  nome: String(p.nome || '').slice(0, 45),
  link: String(p.link || '(vazio)').slice(0, 60),
})));

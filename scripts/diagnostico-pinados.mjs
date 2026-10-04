// scripts/diagnostico-pinados.mjs
// Só leitura: mostra o que pesa na chave produtos:pinados. Não grava nada.
// Uso: node --env-file=.env.local scripts/diagnostico-pinados.mjs

const URL_KV = process.env.informa_KV_REST_API_URL || process.env.KV_REST_API_URL;
const TOKEN = process.env.informa_KV_REST_API_TOKEN || process.env.KV_REST_API_TOKEN;

async function ler() {
  if (process.env.KV_ARQUIVO) return JSON.parse((await import('node:fs')).readFileSync(process.env.KV_ARQUIVO, 'utf8'));
  const r = await fetch(`${URL_KV}/get/produtos:pinados`, { headers: { Authorization: `Bearer ${TOKEN}` } });
  const { result } = await r.json();
  return typeof result === 'string' ? JSON.parse(result) : result || [];
}

const kb = n => (n / 1024).toFixed(1) + ' KB';
const tam = v => Buffer.byteLength(JSON.stringify(v ?? null));

const lista = await ler();
const total = tam(lista);
console.log(`\nProdutos: ${lista.length} | tamanho total: ${kb(total)} | média por produto: ${kb(total / Math.max(lista.length, 1))}\n`);

// 1) campos que mais pesam (somando todos os produtos)
const porCampo = {};
for (const p of lista) for (const [k, v] of Object.entries(p)) porCampo[k] = (porCampo[k] || 0) + tam(v);
console.log('Campos que mais pesam:');
Object.entries(porCampo).sort((a, b) => b[1] - a[1]).slice(0, 15)
  .forEach(([k, v]) => console.log(`  ${k.padEnd(22)} ${kb(v).padStart(10)}  (${((v / total) * 100).toFixed(0)}%)`));

// 2) produtos mais pesados
console.log('\nProdutos mais pesados:');
lista.map(p => ({ p, t: tam(p) })).sort((a, b) => b.t - a.t).slice(0, 5)
  .forEach(({ p, t }) => console.log(`  ${kb(t).padStart(9)}  ${String(p.nome || p.name || p.id).slice(0, 60)}  [campos: ${Object.keys(p).length}]`));

// 3) ids repetidos (podem fazer o "mover" parecer que não funcionou)
const vistos = new Map();
for (const p of lista) vistos.set(p.id, (vistos.get(p.id) || 0) + 1);
const rep = [...vistos].filter(([, n]) => n > 1);
console.log(`\nIds repetidos: ${rep.length}${rep.length ? '  ex.: ' + rep.slice(0, 5).map(([id, n]) => `${id} (${n}x)`).join(', ') : ''}`);
console.log(`Sem id: ${lista.filter(p => !p.id).length}`);

// 4) situação
const cat = p => p.ambiente || p.tipoAmbiente ? 'ambiente' : p.momento ? 'momento' : p.vistaSe ? 'vistaSe' : p.beleza ? 'beleza' : p.mercado ? 'mercado' : p.praVoce ? 'praVoce' : 'sem categoria';
const porCat = {};
for (const p of lista) porCat[cat(p)] = (porCat[cat(p)] || 0) + 1;
console.log(`A catalogar: ${lista.filter(p => p.aCatalogar === true).length}`);
console.log('Por categoria:', porCat);
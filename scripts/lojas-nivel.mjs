// scripts/lojas-nivel.mjs
// Passa o nível das lojas para um campo próprio ("nivel"), que só aparece no cadastro de lojas.
//  1. loja com " A", " B" ou " C" no fim do nome -> tira do nome e grava em nivel
//  2. lojas Lomadee da LISTA abaixo -> nivel B
//  3. produtos pinados que ficaram com o nome "… A/B/C" dessas lojas -> volta ao nome sem a letra
// Antes de gravar, salva cópia em backups/.
// Uso:
//   node --env-file=.env.local scripts/lojas-nivel.mjs            -> só mostra (não grava)
//   node --env-file=.env.local scripts/lojas-nivel.mjs --gravar   -> grava

import { mkdirSync, writeFileSync } from 'node:fs';

const LISTA_B = [
  'Cicatrissim', 'Komo Wellness', 'Laluna', 'BioVittare Farmácia de Manipulação', 'Cirurgica Sinete',
  'UP Kids', 'Relax Saboaria', 'Catran', 'Esbelt', 'Líquido', 'Sawary', 'WSS Brasil', 'LITTLE DUCK',
  'Sofá na Caixa', 'ECO FLAME GARDEN', 'Vinícola Jolimont', 'Coza', 'Hugart', 'BALAROTI', 'Clovis Calçados',
  'Colorstone', 'Iodice', 'Maria Valentina', 'Móveis Carraro', 'Noble Nature', 'Ortope', 'Rovitex',
  'Serallê Calçados', 'Sieno Perfumes', 'Simple Organic', 'UVLine', 'Zinco', 'Vapza Alimentos', 'FUNKO',
  'Toymania', 'Sestini', 'Candide', 'Mais Mu', 'Sottile Casa', 'Kärcher', 'Camisaria Colombo', 'Malwee', 'Mobly',
];

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
const norm = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ').trim().toLowerCase();
const SUFIXO = /^(.*\S)\s+([ABC])$/;

const [{ result: rl }, { result: rp }] = await cmd([['GET', 'lojas:cadastradas'], ['HVALS', 'pin:prod']]);
const lojas = (typeof rl === 'string' ? JSON.parse(rl) : rl) || [];
const backupLojas = JSON.parse(JSON.stringify(lojas));
const produtos = (rp || []).map(s => { try { return JSON.parse(s); } catch { return null; } }).filter(p => p && p.id);

const listaB = new Map(LISTA_B.map(n => [norm(n), n]));
const achadosLista = new Set();
const mudLojas = [];
const renomeadas = new Map(); // "Nome B" -> "Nome"

for (const l of lojas) {
  const antes = { nome: l.nome, nivel: l.nivel || '' };
  let nome = String(l.nome || '').trim();
  let nivel = l.nivel || '';
  const m = nome.match(SUFIXO);
  if (m) { renomeadas.set(nome, m[1]); nome = m[1]; nivel = m[2]; }
  let obs = '';
  if (l.tipo === 'lomadee' && listaB.has(norm(nome))) {
    achadosLista.add(norm(nome));
    if (nivel && nivel !== 'B') obs = `estava ${nivel} no nome, ficou B (está na lista)`;
    nivel = 'B';
  }
  if (nome !== antes.nome || nivel !== antes.nivel) {
    mudLojas.push({ loja: antes.nome, 'nome novo': nome, nivel, ...(obs ? { obs } : {}) });
    l.nome = nome;
    l.nivel = nivel || undefined;
  }
}

// produtos que ficaram com o nome "… B" (ou A/C) dessas lojas
const mudProdutos = [];
for (const p of produtos) {
  let mudou = false;
  for (const campo of ['loja', 'lojaNome']) {
    const v = String(p[campo] || '').trim();
    if (renomeadas.has(v)) { p[campo] = renomeadas.get(v); mudou = true; }
  }
  if (mudou) mudProdutos.push(p);
}

const naoAchadas = LISTA_B.filter(n => !achadosLista.has(norm(n)));
console.log(`Lojas que mudam: ${mudLojas.length}`);
if (mudLojas.length) console.table(mudLojas);
if (naoAchadas.length) { console.log(`\nDa lista B, NÃO encontradas como Lomadee (${naoAchadas.length}):`); naoAchadas.forEach(n => console.log('  - ' + n)); }
console.log(`\nProdutos pinados com o nome da loja corrigido: ${mudProdutos.length}`);

if (!mudLojas.length && !mudProdutos.length) process.exit(0);
if (!GRAVAR) { console.log('\nNada foi gravado. Para gravar, rode de novo com --gravar'); process.exit(0); }

mkdirSync('backups', { recursive: true });
const ts = new Date().toISOString().replace(/[:.]/g, '-');
writeFileSync(`backups/lojas-cadastradas-${ts}.json`, JSON.stringify(backupLojas, null, 2));
console.log(`\nBackup das lojas: backups/lojas-cadastradas-${ts}.json`);

if (mudLojas.length) await cmd([['SET', 'lojas:cadastradas', JSON.stringify(lojas)]]);
// o nome da loja não decide gaveta: basta regravar o produto no hash
for (let i = 0; i < mudProdutos.length; i += 200) {
  await cmd(mudProdutos.slice(i, i + 200).map(p => ['HSET', 'pin:prod', String(p.id), JSON.stringify(p)]));
}
console.log(`✅ ${mudLojas.length} lojas e ${mudProdutos.length} produtos atualizados.`);

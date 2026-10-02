// scripts/lomadee-comissoes.mjs
// Busca TODAS as lojas da Lomadee (todas as páginas) e gera lomadee-comissoes.csv
//
// Uso (CMD, na pasta do projeto):
//   node --env-file=.env.local scripts/lomadee-comissoes.mjs
//
// Alternativa sem API (arquivos baixados do navegador):
//   node scripts/lomadee-comissoes.mjs "api-response (1).json" "api-response (2).json" ...

import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const CANAL = 'Com A Lupa';
const SAIDA = 'lomadee-comissoes.csv';

// ---------- descobrir a URL da API (mesma que o site usa) ----------
function descobrirBase() {
  if (process.env.LOMADEE_API_URL) return process.env.LOMADEE_API_URL.replace(/\/+$/, '');
  const rota = 'app/api/lomadee/route.ts';
  if (existsSync(rota)) {
    const txt = readFileSync(rota, 'utf8');
    const urls = txt.match(/https:\/\/[^'"`\s)]*lomadee[^'"`\s)]*/g) || [];
    const api = urls.find(u => !u.includes('cdn.') && !u.includes('lmdee.link'));
    if (api) return api.replace(/\/+$/, '');
  }
  return null;
}

// ---------- buscar as páginas ----------
async function buscarTodasPelaApi() {
  const key = process.env.LOMADEE_API_KEY;
  if (!key) throw new Error('LOMADEE_API_KEY não encontrada. Rode com: node --env-file=.env.local scripts/lomadee-comissoes.mjs');
  const base = descobrirBase();
  if (!base) throw new Error('Não achei a URL da API em app/api/lomadee/route.ts. Defina LOMADEE_API_URL no .env.local.');
  console.log('API:', base);

  const todas = [];
  let page = 1, totalPages = 1;
  do {
    const url = `${base}/affiliate/brands?limit=20&page=${page}`;
    const res = await fetch(url, { headers: { 'x-api-key': key }, signal: AbortSignal.timeout(20000) });
    if (!res.ok) throw new Error(`Página ${page}: HTTP ${res.status} ${await res.text().catch(() => '')}`);
    const json = await res.json();
    todas.push(...(json.data || []));
    totalPages = json.pagination?.totalPages || 1;
    console.log(`Página ${page}/${totalPages}: ${json.data?.length || 0} lojas`);
    page++;
    await new Promise(r => setTimeout(r, 400)); // gentileza com a API
  } while (page <= totalPages);
  return todas;
}

function lerArquivos(arquivos) {
  return arquivos.flatMap(a => {
    const json = JSON.parse(readFileSync(a, 'utf8'));
    console.log(`${a}: ${json.data?.length || 0} lojas`);
    return json.data || [];
  });
}

// ---------- montar o CSV ----------
const cel = v => {
  const s = String(v ?? '');
  return /[;"\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
const num = v => (v == null ? '' : String(v).replace('.', ',')); // vírgula decimal p/ Excel BR

const arquivos = process.argv.slice(2).filter(a => a.endsWith('.json'));
const lojas = arquivos.length ? lerArquivos(arquivos) : await buscarTodasPelaApi();

// remove repetidas (mesmo id)
const unicas = [...new Map(lojas.map(l => [l.id, l])).values()];
unicas.sort((a, b) => (b.commission?.value ?? -1) - (a.commission?.value ?? -1));

const cab = ['Loja', 'Site', 'Segmento', 'Comissão %', 'Modelo', 'Exclusiva', 'Destaque', 'Ativa',
  'Nota aprovação', 'Nota conversão', 'Nota validação', 'Nota comissão', 'Popularidade', 'Link Com A Lupa'];
const linhas = unicas.map(l => {
  const canal = (l.channels || []).find(c => c.name?.toLowerCase() === CANAL.toLowerCase());
  const t = l.network?.trait || {};
  return [
    l.name, l.site, l.segment,
    num(l.commission?.value),
    (l.commission?.transfer || '').toUpperCase(),
    t.isExclusive ? 'sim' : '',
    t.isHighlight ? 'sim' : '',
    l.network?.active === false ? 'não' : 'sim',
    num(l.network?.rating?.approval),
    num(l.network?.rating?.conversion),
    num(l.network?.rating?.validation),
    num(l.network?.rating?.commission),
    num(l.network?.rating?.popularity),
    canal?.shortUrls?.[0] || '',
  ].map(cel).join(';');
});

writeFileSync(SAIDA, '﻿' + [cab.join(';'), ...linhas].join('\r\n'), 'utf8');

// lista todos os campos que a API devolveu (para achar cookie, se existir)
const campos = new Set();
const varrer = (o, pre = '') => {
  if (!o || typeof o !== 'object' || Array.isArray(o)) return;
  for (const [k, v] of Object.entries(o)) { campos.add(pre + k); varrer(v, pre + k + '.'); }
};
unicas.forEach(l => varrer(l));
console.log('\nCampos encontrados:', [...campos].sort().join(', '));
console.log('Lojas com rating preenchido:', unicas.filter(l => l.network?.rating).length);

const modelos = [...new Set(unicas.map(l => l.commission?.transfer).filter(Boolean))];
console.log(`\n✅ ${unicas.length} lojas gravadas em ${SAIDA}`);
console.log('Modelos de pagamento encontrados:', modelos.join(', ') || '(nenhum)');
console.log('Top 5:', unicas.slice(0, 5).map(l => `${l.name} ${num(l.commission?.value)}%`).join(' | '));

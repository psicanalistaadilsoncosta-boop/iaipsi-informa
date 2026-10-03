// scripts/importa-lojas.mjs
// Cadastra lojas em lote a partir de um CSV, sem duplicar as que já estão no KV (lojas:cadastradas).
//
// Uso (CMD, na pasta do projeto):
//   node --env-file=.env.local scripts/importa-lojas.mjs lojas-importar.csv           -> só mostra (não grava)
//   node --env-file=.env.local scripts/importa-lojas.mjs lojas-importar.csv --gravar  -> grava no KV
//
// CSV (separado por ;):
//   rede;codigo;nome;url;vitrine;categoria;subtipo;moedaUSD
//   rede      = lomadee | awin | rakuten | actionpay
//   codigo    = awin: id do anunciante (ex 30615) | rakuten: MID (ex 54237) | actionpay: id da oferta (ex 14185) | lomadee: vazio
//   vitrine   = (opcional) ambiente | momento | vistaSe | beleza
//   categoria = (opcional) ambiente: Sala/Cozinha... | momento: Vinho/Churrasco... | vistaSe/beleza: tipo (ex Acessórios)
//   subtipo   = (opcional) tipoAmbiente / tipoMomento (ex Móveis, Eletrônicos)
//   moedaUSD  = sim | (vazio)

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';

const LOJAS_KEY = 'lojas:cadastradas';
const args = process.argv.slice(2);
const GRAVAR = args.includes('--gravar');
const ARQ = args.find(a => !a.startsWith('--')) || 'lojas-importar.csv';

// ---------- KV (Upstash REST, mesmo banco do site) ----------
const KV_URL = process.env.informa_KV_REST_API_URL || process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const KV_TOKEN = process.env.informa_KV_REST_API_TOKEN || process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

async function kvGet(key) {
  if (process.env.KV_ARQUIVO) return JSON.parse(readFileSync(process.env.KV_ARQUIVO, 'utf8')); // só para teste local
  if (!KV_URL || !KV_TOKEN) throw new Error('Variáveis do KV não encontradas. Rode com: node --env-file=.env.local ...');
  const r = await fetch(`${KV_URL}/get/${encodeURIComponent(key)}`, { headers: { Authorization: `Bearer ${KV_TOKEN}` } });
  if (!r.ok) throw new Error(`KV get: HTTP ${r.status}`);
  const { result } = await r.json();
  if (result == null) return [];
  return typeof result === 'string' ? JSON.parse(result) : result;
}
async function kvSet(key, valor) {
  const r = await fetch(`${KV_URL}/set/${encodeURIComponent(key)}`, {
    method: 'POST', headers: { Authorization: `Bearer ${KV_TOKEN}` }, body: JSON.stringify(valor),
  });
  if (!r.ok) throw new Error(`KV set: HTTP ${r.status} ${await r.text()}`);
}

// ---------- CSV ----------
function lerCsv(txt) {
  txt = txt.replace(/^﻿/, '');
  const linhas = []; let campo = '', linha = [], aspas = false;
  for (let i = 0; i < txt.length; i++) {
    const c = txt[i];
    if (aspas) {
      if (c === '"' && txt[i + 1] === '"') { campo += '"'; i++; }
      else if (c === '"') aspas = false;
      else campo += c;
    } else if (c === '"') aspas = true;
    else if (c === ';') { linha.push(campo); campo = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && txt[i + 1] === '\n') i++;
      linha.push(campo); linhas.push(linha); linha = []; campo = '';
    } else campo += c;
  }
  if (campo || linha.length) { linha.push(campo); linhas.push(linha); }
  const cab = linhas.shift().map(h => h.trim().toLowerCase());
  return linhas
    .filter(l => l.some(v => v.trim()))
    .map((l, i) => ({ _linha: i + 2, ...Object.fromEntries(cab.map((h, j) => [h, (l[j] || '').trim()])) }));
}

// ---------- normalização ----------
const dominio = u => { try { return new URL(u).hostname.toLowerCase().replace(/^www\./, ''); } catch { return null; } };
const urlNorm = u => {
  try {
    const x = new URL(u);
    return (x.hostname.toLowerCase().replace(/^www\./, '') + x.pathname.replace(/\/+$/, '') + x.hash).toLowerCase();
  } catch { return null; }
};
const ehHome = u => { try { return new URL(u).pathname.replace(/\/+$/, '') === '' && !new URL(u).hash; } catch { return false; } };

function montarLoja(r) {
  const rede = r.rede.toLowerCase();
  const cod = (r.codigo || '').replace(/^(awin|rakuten|actionpay)-/i, '').trim();
  const erros = [];
  if (!r.nome) erros.push('sem nome');
  if (!dominio(r.url)) erros.push('URL inválida (precisa começar com https://)');
  if (!['lomadee', 'awin', 'rakuten', 'actionpay'].includes(rede)) erros.push(`rede "${r.rede}" inválida`);
  if (rede !== 'lomadee' && !cod) erros.push(`falta o código da ${rede}`);
  else if (rede !== 'lomadee' && !/^\d+$/.test(cod)) erros.push('código deve ser só números');

  const loja = { tipo: rede === 'lomadee' ? 'lomadee' : 'awin', nome: r.nome, url: r.url };
  if (rede === 'awin') loja.anuncianteId = cod;
  if (rede === 'rakuten') loja.anuncianteId = `rakuten-${cod}`;
  if (rede === 'actionpay') loja.anuncianteId = `actionpay-${cod}`;
  loja.moedaUSD = /^(sim|s|true|1|usd)$/i.test(r.moedausd || '');

  const v = (r.vitrine || '').toLowerCase();
  if (v === 'ambiente') { loja.ambiente = r.categoria; if (r.subtipo) loja.tipoAmbiente = r.subtipo; }
  else if (v === 'momento') { loja.momento = r.categoria; if (r.subtipo) loja.tipoMomento = r.subtipo; }
  else if (v === 'vistase') { loja.vistaSe = true; if (r.categoria) loja.tipoVistaSe = r.categoria; }
  else if (v === 'beleza') { loja.beleza = true; if (r.categoria) loja.tipoBeleza = r.categoria; }
  else if (v) erros.push(`vitrine "${r.vitrine}" inválida (use ambiente, momento, vistaSe ou beleza)`);
  if ((v === 'ambiente' || v === 'momento') && !r.categoria) erros.push(`vitrine ${v} precisa de categoria`);
  return { loja, erros, rede, cod };
}

// ---------- principal ----------
if (!existsSync(ARQ)) { console.error(`Arquivo ${ARQ} não encontrado.`); process.exit(1); }
const linhas = lerCsv(readFileSync(ARQ, 'utf8'));
const atuais = await kvGet(LOJAS_KEY);
console.log(`KV: ${atuais.length} lojas cadastradas | CSV: ${linhas.length} linhas\n`);

const porUrl = new Map(atuais.map(l => [urlNorm(l.url), l]));
const porCodigo = new Map(atuais.filter(l => l.anuncianteId).map(l => [String(l.anuncianteId), l]));
const porDominio = new Map();
atuais.forEach(l => { const d = dominio(l.url); if (d) (porDominio.get(d) || porDominio.set(d, []).get(d)).push(l); });

const novas = []; const cont = { nova: 0, existe: 0, erro: 0 };
for (const r of linhas) {
  const { loja, erros, rede } = montarLoja(r);
  const tag = `linha ${r._linha} · ${r.nome || '?'}`;
  if (erros.length) { cont.erro++; console.log(`❌ ${tag}: ${erros.join('; ')}`); continue; }

  const n = urlNorm(loja.url), d = dominio(loja.url);
  const mesmaUrl = porUrl.get(n);
  const mesmoCodigo = loja.anuncianteId && porCodigo.get(String(loja.anuncianteId));
  const mesmoDominio = porDominio.get(d) || [];

  if (mesmaUrl) { cont.existe++; console.log(`⏭️  ${tag}: já existe (mesma URL: "${mesmaUrl.nome}")`); continue; }
  if (ehHome(loja.url) && mesmoCodigo) { cont.existe++; console.log(`⏭️  ${tag}: já existe (mesmo código: "${mesmoCodigo.nome}")`); continue; }
  if (ehHome(loja.url) && mesmoDominio.length) {
    cont.existe++;
    console.log(`⏭️  ${tag}: já existe (mesmo site: ${mesmoDominio.map(l => `"${l.nome}" ${l.tipo === 'lomadee' ? 'Lomadee' : l.anuncianteId}`).join(', ')})`);
    continue;
  }
  const aviso = mesmoDominio.length ? `  ⚠️ o site já tem outra(s) página(s): ${mesmoDominio.map(l => `"${l.nome}"`).join(', ')}` : '';
  cont.nova++;
  console.log(`✅ ${tag}: nova (${rede}${loja.anuncianteId ? ' ' + loja.anuncianteId : ''})${aviso}`);
  novas.push(loja);
  // evita duplicar dentro do próprio CSV
  porUrl.set(n, loja);
  if (loja.anuncianteId && ehHome(loja.url)) porCodigo.set(String(loja.anuncianteId), loja);
  if (ehHome(loja.url)) (porDominio.get(d) || porDominio.set(d, []).get(d)).push(loja);
}

console.log(`\nResumo: ${cont.nova} novas · ${cont.existe} já existiam · ${cont.erro} com erro`);

if (!GRAVAR) { console.log('\nNada foi gravado. Para gravar, rode de novo com --gravar'); process.exit(0); }
if (!novas.length) { console.log('\nNada para gravar.'); process.exit(0); }

mkdirSync('backups', { recursive: true });
const backup = `backups/lojas-cadastradas-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
writeFileSync(backup, JSON.stringify(atuais, null, 2), 'utf8');
console.log(`\n💾 Cópia de segurança: ${backup}`);

const recentes = await kvGet(LOJAS_KEY); // relê para não perder algo salvo pelo site nesse meio-tempo
await kvSet(LOJAS_KEY, [...recentes, ...novas]);
console.log(`✅ Gravado: ${recentes.length} + ${novas.length} = ${recentes.length + novas.length} lojas no KV`);

// scripts/lojas-letra-b.mjs
// Acrescenta " B" no fim do nome das lojas Lomadee da lista abaixo (em lojas:cadastradas).
// Só muda o NOME. URL, ID, vitrine e automação (cron) continuam iguais.
// Antes de gravar, salva uma cópia de lojas:cadastradas em backups/.
// Uso:
//   node --env-file=.env.local scripts/lojas-letra-b.mjs            -> só mostra (não grava)
//   node --env-file=.env.local scripts/lojas-letra-b.mjs --gravar   -> grava

import { mkdirSync, writeFileSync } from 'node:fs';

const NOMES = [
  'Cicatrissim', 'Komo Wellness', 'Laluna', 'BioVittare Farmácia de Manipulação', 'Cirurgica Sinete',
  'UP Kids', 'Relax Saboaria', 'Catran', 'Esbelt', 'Líquido', 'Sawary', 'WSS Brasil', 'LITTLE DUCK',
  'Sofá na Caixa', 'ECO FLAME GARDEN', 'Vinícola Jolimont', 'Coza', 'Hugart', 'BALAROTI', 'Clovis Calçados',
  'Colorstone', 'Iodice', 'Maria Valentina', 'Móveis Carraro', 'Noble Nature', 'Ortope', 'Rovitex',
  'Serallê Calçados', 'Sieno Perfumes', 'Simple Organic', 'UVLine', 'Zinco', 'Vapza Alimentos', 'FUNKO',
  'Toymania', 'Sestini', 'Candide', 'Mais Mu', 'Sottile Casa', 'Kärcher', 'Camisaria Colombo', 'Malwee', 'Mobly',
];
const SUFIXO = ' B';

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

// compara sem diferenciar maiúsculas, acentos e espaços extras
const norm = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ').trim().toLowerCase();

const [{ result }] = await cmd([['GET', 'lojas:cadastradas']]);
const lojas = (typeof result === 'string' ? JSON.parse(result) : result) || [];

const alvo = new Map(NOMES.map(n => [norm(n), n]));
const achados = new Set();
const mudancas = [];
let jaTinham = 0;

for (const l of lojas) {
  if (l.tipo !== 'lomadee') continue;
  const atual = String(l.nome || '').trim();
  const semB = atual.endsWith(SUFIXO) ? atual.slice(0, -SUFIXO.length) : atual;
  const chave = norm(semB);
  if (!alvo.has(chave)) continue;
  achados.add(chave);
  if (atual.endsWith(SUFIXO)) { jaTinham++; continue; }
  mudancas.push({ de: atual, para: atual + SUFIXO });
  l.nome = atual + SUFIXO;
}

const naoAchados = NOMES.filter(n => !achados.has(norm(n)));
console.log(`Lojas na lista: ${NOMES.length}`);
console.log(`Vão mudar: ${mudancas.length} | já tinham o B: ${jaTinham} | não encontradas: ${naoAchados.length}`);
if (mudancas.length) console.table(mudancas);
if (naoAchados.length) { console.log('\nNÃO encontradas como Lomadee (confira o nome):'); naoAchados.forEach(n => console.log('  - ' + n)); }

if (!mudancas.length) process.exit(0);
if (!GRAVAR) { console.log('\nNada foi gravado. Para gravar, rode de novo com --gravar'); process.exit(0); }

mkdirSync('backups', { recursive: true });
const arq = `backups/lojas-cadastradas-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
writeFileSync(arq, JSON.stringify(lojas.map(l => (mudancas.some(m => m.para === l.nome) ? { ...l, nome: l.nome.slice(0, -SUFIXO.length) } : l)), null, 2));
console.log(`\nBackup (como estava antes): ${arq}`);

await cmd([['SET', 'lojas:cadastradas', JSON.stringify(lojas)]]);
console.log(`✅ ${mudancas.length} lojas renomeadas.`);

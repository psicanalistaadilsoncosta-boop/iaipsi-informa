// scripts/marca-sem-deeplink.mjs
// Marca em actionpay:deeplinks as ofertas que NÃO aceitam deeplink (coluna "Deeplink = Não"
// na planilha de ofertas da Actionpay). Nelas o clique cai na página inicial da loja,
// então o pinar e a importação avisam antes ("melhor criar um cartão da loja").
// Uso:
//   node --env-file=.env.local scripts/marca-sem-deeplink.mjs            -> só mostra (não grava)
//   node --env-file=.env.local scripts/marca-sem-deeplink.mjs --gravar   -> grava (com backup)

import { mkdirSync, writeFileSync } from 'node:fs';

const SEM_DEEPLINK = {
  '18658': 'Dafiti', '18409': 'Volcom', '18570': 'Dominna', '18498': 'Contour', '18440': 'Ray-Ban',
  '18441': 'Sunglass Hut', '18439': 'Oakley', '18414': "L'Occitane", '18562': 'Yves Saint Laurent',
  '18262': 'Lindt', '18572': 'Maria Pia', '18460': 'Abriu Dormiu', '18455': 'Ortoclass',
  '18663': 'Primacial', '18566': 'Lyam Decor', '17013': 'Move Fitness', '16521': 'Ponto da Porcelana',
};

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

const [{ result }] = await cmd([['GET', 'actionpay:deeplinks']]);
const modelos = (typeof result === 'string' ? JSON.parse(result) : result) || {};
const backup = JSON.parse(JSON.stringify(modelos));

const marcadas = [], jaEstavam = [], naoAchadas = [];
for (const [id, nome] of Object.entries(SEM_DEEPLINK)) {
  if (!modelos[id]) { naoAchadas.push(`${id} ${nome}`); continue; }
  if (modelos[id].semDeeplink) { jaEstavam.push(nome); continue; }
  modelos[id].semDeeplink = true;
  marcadas.push(`${id} ${modelos[id].nome || nome}`);
}

console.log(`Vão ser marcadas como "sem deeplink": ${marcadas.length}`);
marcadas.forEach(m => console.log('  - ' + m));
if (jaEstavam.length) console.log(`Já estavam marcadas: ${jaEstavam.join(', ')}`);
if (naoAchadas.length) console.log(`Não estão em actionpay:deeplinks: ${naoAchadas.join(', ')}`);

if (!marcadas.length) process.exit(0);
if (!GRAVAR) { console.log('\nNada foi gravado. Para gravar, rode de novo com --gravar'); process.exit(0); }

mkdirSync('backups', { recursive: true });
const arq = `backups/actionpay-deeplinks-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
writeFileSync(arq, JSON.stringify(backup, null, 2));
await cmd([['SET', 'actionpay:deeplinks', JSON.stringify(modelos)]]);
console.log(`\nBackup: ${arq}`);
console.log(`✅ ${marcadas.length} lojas marcadas.`);

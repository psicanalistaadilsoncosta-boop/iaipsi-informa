// Cruza as lojas cadastradas com as empresas indicadas ao Guia Reclame AQUI 2026.
// Uso: node scripts/guia-ra-2026.mjs      → só mostra o resultado
import fs from 'node:fs';

const ANO = 2026;
const env = Object.fromEntries(
  fs.readFileSync('.env.local', 'utf8').split(/\r?\n/)
    .filter(l => /^\s*[^#=\s][^=]*=/.test(l))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^"|"$/g, '')]; })
);
async function kvGet(chave) {
  const r = await fetch(env.informa_KV_REST_API_URL, { method: 'POST', headers: { Authorization: `Bearer ${env.informa_KV_REST_API_TOKEN}` }, body: JSON.stringify(['GET', chave]) });
  const j = await r.json(); return j.result ? JSON.parse(j.result) : null;
}

// 1. Lê a lista do Guia salva pelo navegador
const bruto = JSON.parse(fs.readFileSync(`scripts/guia-ra-${ANO}.json`, 'utf8'));
const empresas = bruto.companies || [];
console.log(`Empresas no arquivo: ${empresas.length} de ${bruto.pagination?.totalItems ?? '?'}`);
/*for (let pagina = 1; ; pagina++) {
  const url = `https://api.reclameaqui.com.br/premio/public/guide/v1/nominated-companies?year=${ANO}&page=${pagina}&limit=100&sort=most_relevant%2Cdesc`;
  const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0', Accept: 'application/json' } });
  if (!r.ok) { console.error(`Erro HTTP ${r.status} na página ${pagina}`); break; }
  const j = await r.json();
  empresas.push(...(j.companies || []));
  process.stdout.write(`\rBaixadas: ${empresas.length} / ${j.pagination?.totalItems ?? '?'}`);
  if (!j.pagination?.hasMore) break;
  await new Promise(res => setTimeout(res, 800));
}
*/
// 2. Compara com as lojas cadastradas (pelo nome, ignorando acentos, "BR", "loja" etc.)
const norm = s => (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  .replace(/\b(br|brasil|loja|oficial|online|store|com)\b/g, '').replace(/[^a-z0-9]/g, '');
const lojas = (await kvGet('lojas:cadastradas')) || [];
const resultado = {};
for (const l of lojas) {
  const n = norm(l.nome);
  const dom = norm((() => { try { return new URL(l.url).hostname.replace(/^www\./, '').split('.')[0]; } catch { return ''; } })());
  const achada = empresas.find(e => {
    const en = norm(e.name), es = norm(e.shortname);
    return (n && (en === n || es === n)) || (dom && (en === dom || es === dom));
  });
  resultado[l.nome] = achada
    ? { guia: 'SIM', reputacao: achada.reputation, nota: achada.score, resolucao: `${achada.resolutionRate}%`, nomeRA: achada.name }
    : { guia: '—' };
}
console.table(resultado);

// 3. Grava no cadastro das lojas (só com --gravar)
const IGNORAR = ['Gazin']; // casou com "Gazin - Loja Física": não é a loja online
if (process.argv.includes('--gravar')) {
  const hoje = new Date().toISOString().slice(0, 10);
  let marcadas = 0;
  for (const l of lojas) {
    const r = resultado[l.nome];
    const achada = r?.guia === 'SIM' && !IGNORAR.includes(l.nome)
      ? empresas.find(e => e.name === r.nomeRA) : null;
    if (!achada) continue;
    l.reclameAqui = {
      reputacao: achada.reputation,          // GOOD | GREAT | RA1000
      nota: achada.score,
      resolucao: achada.resolutionRate,
      campea2025: !!achada.isPastWinner,
      url: achada.companyUrl,
      consultadoEm: hoje,
    };
    marcadas++;
  }
  const kvCmd = async cmd => (await (await fetch(env.informa_KV_REST_API_URL, { method: 'POST', headers: { Authorization: `Bearer ${env.informa_KV_REST_API_TOKEN}` }, body: JSON.stringify(cmd) })).json()).result;
  const pasta = '../_backups/iaipsi-informa';
  fs.mkdirSync(pasta, { recursive: true });
  const arq = `${pasta}/lojas-cadastradas-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
  fs.writeFileSync(arq, await kvCmd(['GET', 'lojas:cadastradas']));
  console.log(`Backup salvo em ${arq}`);
  await kvCmd(['SET', 'lojas:cadastradas', JSON.stringify(lojas)]);
  console.log(`Gravado: ${marcadas} lojas com dados do Reclame AQUI.`);
} else {
  console.log('\nSimulação apenas. Para gravar: node scripts/guia-ra-2026.mjs --gravar');
}
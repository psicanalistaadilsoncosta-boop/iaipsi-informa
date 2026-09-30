// Corrige o nome da loja nos produtos pinados, usando o nome da loja cadastrada.
// Uso:  node scripts/corrigir-nomes-lojas.mjs            → só mostra o que mudaria
//       node scripts/corrigir-nomes-lojas.mjs --gravar   → faz backup e grava no KV
import fs from 'node:fs';

const env = Object.fromEntries(
  fs.readFileSync('.env.local', 'utf8').split(/\r?\n/)
    .filter(l => /^\s*[^#=\s][^=]*=/.test(l))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^"|"$/g, '')]; })
);
const URL_KV = env.informa_KV_REST_API_URL;
const TOKEN = env.informa_KV_REST_API_TOKEN;
if (!URL_KV || !TOKEN) { console.error('Credenciais do KV não encontradas no .env.local'); process.exit(1); }

async function kv(cmd) {
  const r = await fetch(URL_KV, { method: 'POST', headers: { Authorization: `Bearer ${TOKEN}` }, body: JSON.stringify(cmd) });
  const j = await r.json();
  if (j.error) throw new Error(j.error);
  return j.result;
}
const ler = async chave => { const v = await kv(['GET', chave]); return v ? JSON.parse(v) : null; };
// Para links da Awin, usa a loja de destino que vem no parâmetro "ued"
const dominio = u => {
  try {
    const url = new URL(u);
    const destino = url.hostname.endsWith('awin1.com') ? url.searchParams.get('ued') : null;
    return new URL(destino || u).hostname.replace(/^www\./, '');
  } catch { return null; }
};
const lojas = (await ler('lojas:cadastradas')) || [];
const produtos = (await ler('produtos:pinados')) || [];

const nomePorDominio = new Map();
for (const l of lojas) {
  const d = dominio(l.url);
  if (d && l.nome && !nomePorDominio.has(d)) nomePorDominio.set(d, l.nome);
}

const trocas = {};
const semCadastro = {};
let alterados = 0;
for (const p of produtos) {
  const d = dominio(p.linkOriginal || p.link);
  const nome = d && nomePorDominio.get(d);
  if (!nome) {
    const k = `${p.loja ?? '(vazio)'}  |  ${d ?? '(sem link)'}`;
    semCadastro[k] = (semCadastro[k] || 0) + 1;
    continue;
  }
  if (p.loja !== nome || (p.lojaNome && p.lojaNome !== nome)) {
    const chave = `${p.loja ?? '(vazio)'}  →  ${nome}`;
    trocas[chave] = (trocas[chave] || 0) + 1;
    p.loja = nome;
    if (p.lojaNome) p.lojaNome = nome;
    alterados++;
  }
}

console.log(`Lojas cadastradas: ${lojas.length} | Produtos: ${produtos.length} | A alterar: ${alterados}`);
console.table(trocas);
console.log('\nProdutos de lojas NÃO cadastradas (nome atual  |  domínio do link):');
console.table(semCadastro);
if (process.argv.includes('--gravar') && alterados > 0) {
  const pasta = '../_backups/iaipsi-informa';
  fs.mkdirSync(pasta, { recursive: true });
  const arq = `${pasta}/produtos-pinados-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
  fs.writeFileSync(arq, await kv(['GET', 'produtos:pinados']));
  console.log(`Backup salvo em ${arq}`);
  await kv(['SET', 'produtos:pinados', JSON.stringify(produtos)]);
  console.log('Gravado no KV.');
} else if (!process.argv.includes('--gravar')) {
  console.log('\nSimulação apenas. Nada foi gravado.');
}
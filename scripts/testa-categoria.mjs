// scripts/testa-categoria.mjs
// Teste rápido: a loja deixa ler a página de categoria? Não grava nada.
// Uso: node scripts/testa-categoria.mjs "https://www.yslbeauty.com.br/maquiagem-rosto/"

const alvo = process.argv[2];
if (!alvo) { console.log('Uso: node scripts/testa-categoria.mjs "<link da categoria>"'); process.exit(1); }

const url = new URL(alvo);
url.searchParams.set('start', '0');
url.searchParams.set('sz', '24');

const inicio = Date.now();
const r = await fetch(url, {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Safari/537.36',
    'Accept-Language': 'pt-BR,pt;q=0.9',
    'Accept': 'text/html',
  },
  redirect: 'follow',
}).catch(e => ({ ok: false, status: 'ERRO', text: async () => String(e) }));
const html = await r.text();

const conta = re => (html.match(re) || []).length;
const pids = [...new Set([...html.matchAll(/data-pid="([^"]+)"/g)].map(m => m[1]))];
const jsonLd = [...html.matchAll(/<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/g)].map(m => m[1]);
const bloqueio = /captcha|access denied|are you a robot|cf-chl|akamai|request unsuccessful|px-captcha/i.test(html);

console.log('Endereço:', url.toString());
console.log('Resposta:', r.status, '| tamanho:', html.length, 'caracteres |', Date.now() - inicio, 'ms');
console.log('Sinais de bloqueio:', bloqueio ? 'SIM' : 'não');
console.log('Produtos (data-pid):', pids.length, pids.slice(0, 5));
console.log('Cartões de produto (classes):', conta(/product-tile|c-product-tile|productTile/g));
console.log('Blocos de dados para o Google (JSON-LD):', jsonLd.length);
for (const [i, t] of jsonLd.entries()) {
  try {
    const j = JSON.parse(t);
    for (const o of Array.isArray(j) ? j : [j]) {
      const itens = o.itemListElement?.length;
      const preco = o.offers?.price ?? o.offers?.lowPrice;
      console.log(`  bloco ${i + 1}: ${o['@type']}${itens ? ` (${itens} itens)` : ''}${o.name ? ` · ${String(o.name).slice(0, 50)}` : ''}${preco ? ` · R$ ${preco}` : ''}`);
    }
  } catch { console.log(`  bloco ${i + 1}: (não deu para ler)`); }
}
console.log('Preços "R$" na página:', conta(/R\$\s?\d/g));
const proxima = html.match(/<link rel="next" href="([^"]+)"/);
console.log('Link de próxima página:', proxima ? proxima[1] : 'não encontrado');
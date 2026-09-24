// scripts/ver-sem-categoria.mjs
// Mostra produtos sem nenhuma categoria para ajuste das regras
// node --env-file=.env.local scripts/ver-sem-categoria.mjs

import { createClient } from '@vercel/kv';

const kv = createClient({
  url: process.env.informa_KV_REST_API_URL,
  token: process.env.informa_KV_REST_API_TOKEN,
});

async function main() {
  const produtos = (await kv.get('produtos:pinados')) || [];

  const semCategoria = produtos.filter(p =>
    !p.vistaSe && !p.ambiente && !p.momento
  );

  console.log(`\n❓ Total sem categoria: ${semCategoria.length}\n`);

  // Agrupa por loja para ver quais lojas dominam
  const porLoja = {};
  semCategoria.forEach(p => {
    const loja = p.loja || p.storeName || p.nomeLoja || 'Desconhecida';
    if (!porLoja[loja]) porLoja[loja] = [];
    porLoja[loja].push(p.nome || p.name || '');
  });

  console.log('📦 Por loja:');
  Object.entries(porLoja)
    .sort((a, b) => b[1].length - a[1].length)
    .forEach(([loja, nomes]) => {
      console.log(`\n  ${loja} (${nomes.length} produtos):`);
      nomes.slice(0, 5).forEach(n => console.log(`    - ${n}`));
      if (nomes.length > 5) console.log(`    ... e mais ${nomes.length - 5}`);
    });
}

main().catch(console.error);

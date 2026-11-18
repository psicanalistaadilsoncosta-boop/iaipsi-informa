// lib/historicoPrecos.ts
// Histórico de preços do Com a Lupa (banco Neon, tabela "precos").
// Anota uma linha só quando o produto é novo ou quando o preço "por" ou "de" muda.
// Se o Neon falhar ou demorar, só registra o erro no log: nunca atrapalha a gravação no KV.

import { neon } from '@neondatabase/serverless';

const URL_DB = process.env.DATABASE_URL || '';
const TEMPO_MAXIMO = 4000; // ms

type Linha = {
  produto_id: string;
  ean: string | null;
  nome: string | null;
  loja: string | null;
  link: string | null;
  preco: number;
  preco_de: number | null;
  preco_antes: number | null;
  tipo: 'novo' | 'mudou';
};

const centavos = (v: any) => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? Math.round(n * 100) / 100 : null;
};

// preço "de" só conta quando é maior que o "por"
const precoDe = (p: any) => {
  const por = centavos(p?.preco);
  const de = centavos(p?.precoOriginal);
  return por && de && de > por ? de : null;
};

// Compara antes x depois e devolve as linhas a anotar
export function mudancasDePreco(antigos: any[], novos: any[]): Linha[] {
  const linhas: Linha[] = [];
  novos.forEach((p, k) => {
    const preco = centavos(p?.preco);
    if (!p || p.id == null || !preco) return;
    const antigo = antigos[k];
    const antes = centavos(antigo?.preco);
    let tipo: Linha['tipo'] | null = null;
    if (!antigo || !antes) tipo = 'novo';
    else if (antes !== preco || precoDe(antigo) !== precoDe(p)) tipo = 'mudou';
    if (!tipo) return;
    linhas.push({
      produto_id: String(p.id),
      ean: p.ean || p.gtin || null,
      nome: p.nome || null,
      loja: p.lojaNome || p.loja || null,
      link: p.linkOriginal || p.link || null,
      preco,
      preco_de: precoDe(p),
      preco_antes: tipo === 'mudou' ? antes : null,
      tipo,
    });
  });
  return linhas;
}

export async function anotarPrecos(linhas: Linha[]): Promise<void> {
  if (!URL_DB || !linhas.length) return;
  try {
    const sql = neon(URL_DB);
    const col = <K extends keyof Linha>(c: K) => linhas.map(l => l[c]);
    const gravar = sql.query(
      `insert into precos (produto_id, ean, nome, loja, link, preco, preco_de, preco_antes, tipo)
       select * from unnest($1::text[], $2::text[], $3::text[], $4::text[], $5::text[],
                            $6::numeric[], $7::numeric[], $8::numeric[], $9::text[])`,
      [col('produto_id'), col('ean'), col('nome'), col('loja'), col('link'),
       col('preco'), col('preco_de'), col('preco_antes'), col('tipo')],
    );
    const limite = new Promise((_, rej) => setTimeout(() => rej(new Error('tempo esgotado')), TEMPO_MAXIMO));
    await Promise.race([gravar, limite]);
  } catch (e) {
    console.error('Histórico de preços (Neon):', e);
  }
}

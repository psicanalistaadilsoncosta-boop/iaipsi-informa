// app/api/admin/precos/route.ts
// Lupômetro (só admin): lê o histórico de preços do Neon (tabela "precos").
//   ?tipo=resumo            -> totais
//   ?tipo=mudancas          -> últimas mudanças de preço
//   ?tipo=busca&q=texto     -> produtos pelo nome (último preço de cada um)
//   ?tipo=produto&id=ID     -> linha do tempo de um produto
//   ?tipo=alertas           -> desconto sempre igual na loja, "de" inflado, menor preço já visto

import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { isAdmin } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'não autorizado' }, { status: 401 });
  if (!process.env.DATABASE_URL) return NextResponse.json({ error: 'DATABASE_URL não configurada' }, { status: 500 });

  const sql = neon(process.env.DATABASE_URL);
  const q = req.nextUrl.searchParams;
  const tipo = q.get('tipo') || 'resumo';

  try {
    if (tipo === 'resumo') {
      const [r] = await sql.query(
        `select count(*)::int as linhas, count(distinct produto_id)::int as produtos,
                count(*) filter (where tipo = 'mudou')::int as mudancas, min(visto_em) as desde
         from precos`);
      return NextResponse.json(r || {});
    }

    if (tipo === 'mudancas') {
      const linhas = await sql.query(
        `select produto_id, nome, loja, link, preco_antes, preco, preco_de, visto_em
         from precos where tipo = 'mudou' order by visto_em desc limit 60`);
      return NextResponse.json(linhas);
    }

    if (tipo === 'busca') {
      const termo = (q.get('q') || '').trim();
      if (termo.length < 2) return NextResponse.json([]);
      // cada palavra precisa aparecer no nome ou na loja
      const palavras = termo.split(/\s+/).filter(Boolean).slice(0, 6);
      const cond = palavras.map((_, i) => `(nome ilike $${i + 1} or loja ilike $${i + 1})`).join(' and ');
      const linhas = await sql.query(
        `select * from (
           select distinct on (produto_id) produto_id, nome, loja, link, preco, preco_de, visto_em,
                  count(*) over (partition by produto_id)::int as registros
           from precos where ${cond}
           order by produto_id, visto_em desc
         ) x order by visto_em desc limit 60`,
        palavras.map(p => `%${p}%`));
      return NextResponse.json(linhas);
    }

    if (tipo === 'produto') {
      const id = q.get('id') || '';
      const linhas = await sql.query(
        `select visto_em, preco_antes, preco, preco_de, tipo, nome, loja, link
         from precos where produto_id = $1 order by visto_em asc`, [id]);
      return NextResponse.json(linhas);
    }

    if (tipo === 'alertas') {
      // 1. lojas com o mesmo % de desconto em tudo (preço "de" calculado, não promoção)
      const descontoFixo = await sql.query(
        `with ult as (
           select distinct on (produto_id) produto_id, loja, preco, preco_de
           from precos order by produto_id, visto_em desc
         )
         select loja, count(*)::int as produtos, round(avg(1 - preco / preco_de) * 100)::int as desconto
         from ult where preco_de is not null and preco_de > preco and loja is not null
         group by loja
         having count(*) >= 5 and max(1 - preco / preco_de) - min(1 - preco / preco_de) < 0.01
         order by produtos desc`);

      // 2. preço "de" subiu em relação à anotação anterior (desconto maquiado)
      const deInflado = await sql.query(
        `select produto_id, nome, loja, link, visto_em, preco, preco_de, de_ant, por_ant from (
           select produto_id, nome, loja, link, visto_em, preco, preco_de,
                  lag(preco_de) over w as de_ant, lag(preco) over w as por_ant
           from precos window w as (partition by produto_id order by visto_em)
         ) x
         where por_ant is not null and preco_de is not null
           and preco_de > coalesce(de_ant, por_ant) * 1.01
           and visto_em > now() - interval '60 days'
         order by visto_em desc limit 40`);

      // 3. menor preço já visto (última anotação é uma queda e é o mínimo do histórico)
      const menorPreco = await sql.query(
        `select produto_id, nome, loja, link, preco, preco_de, visto_em, maximo from (
           select produto_id, nome, loja, link, preco, preco_de, visto_em, tipo,
                  min(preco) over (partition by produto_id) as minimo,
                  max(preco) over (partition by produto_id) as maximo,
                  count(*) over (partition by produto_id) as n,
                  row_number() over (partition by produto_id order by visto_em desc) as rn
           from precos
         ) x
         where rn = 1 and n >= 2 and tipo = 'mudou' and preco <= minimo and preco < maximo
         order by visto_em desc limit 40`);

      return NextResponse.json({ descontoFixo, deInflado, menorPreco });
    }

    return NextResponse.json({ error: `tipo desconhecido: ${tipo}` }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: String((e as Error).message || e) }, { status: 500 });
  }
}

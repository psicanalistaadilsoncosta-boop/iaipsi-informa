// app/api/admin/precos/route.ts
// Lupômetro (só admin): lê o histórico de preços do Neon (tabela "precos") e guarda as suas decisões.
//
// GET
//   ?tipo=resumo            -> totais
//   ?tipo=mudancas          -> últimas mudanças, cada uma com a sua classe (caiu, de_subiu, reajuste...)
//   ?tipo=busca&q=texto     -> produtos pelo nome ou loja (último preço de cada um)
//   ?tipo=produto&id=ID     -> linha do tempo de um produto
//   ?tipo=lojas             -> resumo por loja: produtos, desconto médio, contagem de cada classe, Reclame AQUI
//   ?tipo=alertas           -> loja com o mesmo desconto em tudo, menor preço já visto
//   ?tipo=flags&ids=a,b     -> situação no site: está no site? na Oferta do Dia? conferido?
// POST { acao, id?, loja? }
//   conferir / desconferir  -> selo dourado "🏅 A Lupa conferiu" no produto
//   tirar / devolver        -> tira ou devolve o produto da Oferta do Dia
//   lojaConferida / lojaNaoConferida -> selo dourado em todos os produtos da loja

import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { isAdmin } from '@/lib/adminAuth';
import { kv } from '@/lib/kv';
import { lerUm, lerIds, salvar } from '@/lib/pinados';
import { avisarMudanca } from '@/lib/revalidar';

export const dynamic = 'force-dynamic';

// Cada mudança comparada com a anotação anterior do mesmo produto (valores em R$, não %)
const CLASSIFICADAS = `
  select produto_id, nome, loja, link, visto_em, preco, preco_de, por_ant, de_ant,
    case
      when preco < por_ant and coalesce(preco_de, -1) = coalesce(de_ant, -1) then 'caiu'
      when preco = por_ant and coalesce(preco_de, 0) > coalesce(de_ant, 0)   then 'de_subiu'
      when preco = por_ant and coalesce(preco_de, 0) < coalesce(de_ant, 0)   then 'de_desceu'
      when preco > por_ant and preco_de is not null and de_ant is not null and preco_de > de_ant then 'reajuste'
      when preco > por_ant and preco_de is null and de_ant is not null       then 'fim_desconto'
      when preco > por_ant                                                    then 'subiu'
      when preco < por_ant                                                    then 'caiu_mudou_de'
      else 'outro'
    end as classe
  from (
    select *, lag(preco) over w as por_ant, lag(preco_de) over w as de_ant
    from precos window w as (partition by produto_id order by visto_em)
  ) x
  where por_ant is not null`;

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
      const classe = q.get('classe') || '';
      const linhas = classe
        ? await sql.query(`select * from (${CLASSIFICADAS}) c where classe = $1 order by visto_em desc limit 80`, [classe])
        : await sql.query(`select * from (${CLASSIFICADAS}) c order by visto_em desc limit 80`);
      return NextResponse.json(linhas);
    }

    if (tipo === 'busca') {
      const termo = (q.get('q') || '').trim();
      if (termo.length < 2) return NextResponse.json([]);
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

    if (tipo === 'lojas') {
      const base = await sql.query(
        `with u as (
           select distinct on (produto_id) produto_id, loja, preco, preco_de
           from precos order by produto_id, visto_em desc
         )
         select loja, count(*)::int as produtos,
                count(*) filter (where preco_de > preco)::int as com_desconto,
                round(avg(case when preco_de > preco then (1 - preco / preco_de) * 100 end))::int as desconto_medio,
                round(min(case when preco_de > preco then (1 - preco / preco_de) * 100 end))::int as desconto_min,
                round(max(case when preco_de > preco then (1 - preco / preco_de) * 100 end))::int as desconto_max
         from u where loja is not null group by loja order by produtos desc`);
      const classes = await sql.query(
        `select loja, classe, count(*)::int as n from (${CLASSIFICADAS}) c where loja is not null group by loja, classe`);
      const cadastro = (await kv.get<any[]>('lojas:cadastradas')) || [];
      const porNome = new Map(cadastro.map(l => [l.nome, l]));
      const lojas = base.map((b: any) => {
        const c: Record<string, number> = {};
        classes.filter((x: any) => x.loja === b.loja).forEach((x: any) => { c[x.classe] = x.n; });
        const l = porNome.get(b.loja);
        return {
          ...b,
          classes: c,
          cadastrada: !!l,
          conferida: !!l?.lojaConferida,
          modaDestaque: !!l?.modaDestaque,
          reclameAqui: l?.reclameAqui || null,
        };
      });
      return NextResponse.json(lojas);
    }

    if (tipo === 'alertas') {
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
      return NextResponse.json({ descontoFixo, menorPreco });
    }

    if (tipo === 'flags') {
      const ids = (q.get('ids') || '').split(',').map(s => s.trim()).filter(Boolean).slice(0, 300);
      const prods = ids.length ? await lerIds(ids) : [];
      const mapa: Record<string, any> = {};
      for (const p of prods) {
        mapa[String(p.id)] = {
          noSite: true,
          ofertaDoDia: Array.isArray(p.destinos) && p.destinos.includes('oferta-do-dia'),
          conferido: !!p.conferido,
          caiuEm: p.caiuEm || null,
        };
      }
      return NextResponse.json(mapa);
    }

    return NextResponse.json({ error: `tipo desconhecido: ${tipo}` }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: String((e as Error).message || e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'não autorizado' }, { status: 401 });
  try {
    const { acao, id, loja } = await req.json();

    if (acao === 'lojaConferida' || acao === 'lojaNaoConferida') {
      const lojas = (await kv.get<any[]>('lojas:cadastradas')) || [];
      const l = lojas.find(x => x.nome === loja);
      if (!l) return NextResponse.json({ error: 'Loja não está no Cadastro de Lojas com esse nome.' }, { status: 404 });
      if (acao === 'lojaConferida') l.lojaConferida = true; else delete l.lojaConferida;
      await kv.set('lojas:cadastradas', lojas);
      avisarMudanca();
      return NextResponse.json({ ok: true });
    }

    const p = id ? await lerUm(String(id)) : null;
    if (!p) return NextResponse.json({ error: 'Produto não está mais no site.' }, { status: 404 });

    if (acao === 'conferir') p.conferido = true;
    else if (acao === 'desconferir') delete p.conferido;
    else if (acao === 'tirar') p.destinos = (p.destinos || []).filter((d: string) => d !== 'oferta-do-dia');
    else if (acao === 'devolver') p.destinos = [...new Set([...(p.destinos || []), 'oferta-do-dia'])];
    else return NextResponse.json({ error: `ação desconhecida: ${acao}` }, { status: 400 });

    await salvar(p);
    avisarMudanca();
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String((e as Error).message || e) }, { status: 500 });
  }
}

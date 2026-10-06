// app/api/lupa-me-ajuda/route.ts
// POST { respostas: {para, ocasiao, orcamento, valoriza}, turnstile, site }
//  -> { sugestoes: [{ id, nome, preco, precoOriginal, imagem, link, loja, porque }], aviso? }
//
// Custo baixo: o código separa até 15 candidatos; a IA (Haiku) escolhe até 5 e escreve o porquê.
// O resultado fica guardado por combinação de respostas (12h): a mesma combinação não chama a IA de novo.

import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@/lib/kv';
import { turnstileOk } from '@/lib/turnstile';
import { estourou } from '@/lib/ia-pedido';
import { lerIds } from '@/lib/pinados';
import { respostasValidas, candidatos, escolherComIA, Respostas } from '@/lib/lupa-conselheira';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const CACHE_SEG = 12 * 3600;
const LIMITE_IP_DIA = 10;     // consultas novas (com IA) por aparelho/rede por dia
const LIMITE_SITE_DIA = 400;  // teto do site inteiro por dia (protege o custo)

type Guardado = { sugestoes: { id: string; porque: string }[] };

function montar(produtos: any[], porques: Map<string, string>) {
  return produtos.map(p => ({
    id: String(p.id),
    nome: String(p.nome || ''),
    preco: Number(p.preco) || 0,
    precoOriginal: Number(p.precoOriginal) || 0,
    imagem: String(p.imagem || ''),
    link: String(p.link || ''),
    loja: String(p.lojaNome || p.loja || ''),
    porque: porques.get(String(p.id)) || '',
  }));
}

export async function POST(req: NextRequest) {
  try {
    const { respostas, turnstile, site } = await req.json();
    if (site) return NextResponse.json({ sugestoes: [] }); // campo-armadilha: robô
    if (!respostasValidas(respostas)) return NextResponse.json({ erro: 'Responda as 4 perguntas.' }, { status: 400 });
    const r: Respostas = respostas;
    const chave = `lupa:ajuda:${r.para}|${r.ocasiao}|${r.orcamento}|${r.valoriza}`;

    // 1. já respondido antes: devolve sem chamar a IA (com preço e link atualizados)
    const guardado = await kv.get<Guardado>(chave);
    if (guardado?.sugestoes?.length) {
      const porques = new Map(guardado.sugestoes.map(s => [s.id, s.porque]));
      const produtos = (await lerIds(guardado.sugestoes.map(s => s.id))).filter(p => p && p.link);
      if (produtos.length >= Math.min(3, guardado.sugestoes.length)) {
        return NextResponse.json({ sugestoes: montar(produtos, porques) });
      }
    }

    // 2. consulta nova: proteções antes de gastar com a IA
    const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'sem-ip';
    if (!(await turnstileOk(turnstile, ip))) {
      return NextResponse.json({ erro: 'Não conseguimos confirmar que você não é um robô. Recarregue a página e tente de novo.' }, { status: 403 });
    }

    const lista = await candidatos(r);
    if (lista.length === 0) {
      return NextResponse.json({ sugestoes: [], aviso: 'Ainda não temos produtos para essa combinação. Tente outra faixa de preço ou outra resposta.' });
    }

    if (await estourou(`lupa:ajuda:ip:${ip}`, LIMITE_IP_DIA, 1440) || await estourou('lupa:ajuda:site', LIMITE_SITE_DIA, 1440)) {
      // sem IA: mostra os candidatos mesmo assim, sem o porquê
      return NextResponse.json({ sugestoes: montar(lista.slice(0, 5), new Map()), aviso: 'Hoje a Lupa já deu muitos conselhos: seguem sugestões sem a explicação.' });
    }

    let escolhidas: { id: string; porque: string }[] = [];
    try { escolhidas = await escolherComIA(r, lista); } catch (e) { console.error('[lupa-me-ajuda] IA', e); }

    if (!escolhidas.length) {
      return NextResponse.json({ sugestoes: montar(lista.slice(0, 5), new Map()) });
    }

    await kv.set(chave, { sugestoes: escolhidas }, { ex: CACHE_SEG });
    const porId = new Map(lista.map(p => [String(p.id), p]));
    const produtos = escolhidas.map(s => porId.get(s.id)).filter(Boolean);
    const aviso = produtos.length < 3 ? 'Encontramos poucas opções para essa combinação, mas estas combinam bem.' : undefined;
    return NextResponse.json({ sugestoes: montar(produtos, new Map(escolhidas.map(s => [s.id, s.porque]))), aviso });
  } catch (e) {
    console.error('[lupa-me-ajuda]', e);
    return NextResponse.json({ erro: 'Não foi possível consultar agora. Tente de novo em instantes.' }, { status: 500 });
  }
}

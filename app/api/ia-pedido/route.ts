// app/api/ia-pedido/route.ts
// GET  ?token=...  -> quantos rascunhos restam no mês
// POST {token, modo, tema, para, relato, itens} -> rascunho dos 4 passos

import { NextRequest, NextResponse } from 'next/server';
import { emailDaSessao, lerNumero, somar, chaveUsoMes, chaveUsoDia, gerarRascunho, LIMITE_MES, TETO_DIA, MAX_RELATO } from '@/lib/ia-pedido';

export async function GET(req: NextRequest) {
  const email = await emailDaSessao(req.nextUrl.searchParams.get('token') || '');
  if (!email) return NextResponse.json({ sessao: false });
  const usados = await lerNumero(chaveUsoMes(email));
  return NextResponse.json({ sessao: true, restantes: Math.max(LIMITE_MES - usados, 0) });
}

export async function POST(req: NextRequest) {
  try {
    const b = await req.json();
    const email = await emailDaSessao(String(b.token || ''));
    if (!email) return NextResponse.json({ erro: 'Confirme seu e-mail para usar o rascunho.', sessao: false }, { status: 401 });

    const relato = String(b.relato || '').trim().slice(0, MAX_RELATO);
    if (relato.length < 10) return NextResponse.json({ erro: 'Conte um pouco mais, em uma ou duas frases.' }, { status: 400 });

    const usados = await lerNumero(chaveUsoMes(email));
    if (usados >= LIMITE_MES) {
      return NextResponse.json({ erro: `Você usou seus ${LIMITE_MES} rascunhos deste mês. Os campos continuam disponíveis para escrever à mão.`, restantes: 0 }, { status: 429 });
    }
    if ((await lerNumero(chaveUsoDia())) >= TETO_DIA) {
      return NextResponse.json({ erro: 'O rascunho com IA está muito procurado hoje. Tente amanhã, ou escreva à mão nos campos.' }, { status: 429 });
    }

    const r = await gerarRascunho({
      modo: b.modo === 'mim' ? 'mim' : 'juntos',
      tema: String(b.tema || '').slice(0, 60),
      para: String(b.para || '').slice(0, 60),
      relato,
      itens: Array.isArray(b.itens) ? b.itens.map((x: any) => String(x).slice(0, 80)) : [],
    });
    if ('erro' in r) return NextResponse.json({ erro: r.erro, restantes: LIMITE_MES - usados }, { status: 422 });

    const agora = await somar(chaveUsoMes(email));
    await somar(chaveUsoDia());
    return NextResponse.json({ campos: r, restantes: Math.max(LIMITE_MES - agora, 0) });
  } catch (e) {
    console.error('[ia-pedido]', e);
    return NextResponse.json({ erro: 'Não foi possível gerar o rascunho agora. Tente de novo em instantes.' }, { status: 500 });
  }
}

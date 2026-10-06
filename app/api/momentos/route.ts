import { NextResponse } from 'next/server';
import { lerGaveta } from '@/lib/pinados';

// Guardada até avisar: só lê o banco de novo quando algo muda (lib/revalidar.ts) ou após 24h
export const dynamic = 'force-static';
export const revalidate = 86400;

export async function GET() {
  try {
    const produtos: any[] = await lerGaveta('momento');
    const mapa: Record<string, Record<string, any[]>> = {};

       // o admin e a vitrine escrevem alguns nomes diferente: aqui igualamos
    const NOME_MOMENTO: Record<string, string> = { 'festa em casa': 'Festa em casa' };
    const NOME_TIPO: Record<string, string> = { 'vinho': 'Vinhos' };

    for (const p of produtos) {
      if (!p.momento) continue;
      const momento = NOME_MOMENTO[String(p.momento).toLowerCase()] || p.momento;
      const tipo = NOME_TIPO[String(p.tipoMomento || '').toLowerCase()] || p.tipoMomento || 'Geral';
      if (!mapa[momento]) mapa[momento] = {};
      if (!mapa[momento][tipo]) mapa[momento][tipo] = [];
      mapa[momento][tipo].push(p);
    }

    return NextResponse.json(mapa);
  } catch (e) {
    return NextResponse.json({}, { status: 500 });
  }
}
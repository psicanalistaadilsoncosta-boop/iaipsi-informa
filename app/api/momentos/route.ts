import { NextResponse } from 'next/server';
import { lerGaveta } from '@/lib/pinados';

export const dynamic = 'force-dynamic';

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
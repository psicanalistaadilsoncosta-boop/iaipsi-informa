import { NextResponse } from 'next/server';
import { lerGaveta } from '@/lib/pinados';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const pinados = await lerGaveta('ambiente');

    // Agrupa por ambiente → tipo → produtos
    const mapa: Record<string, Record<string, any[]>> = {};

    for (const p of pinados) {
      if (!p.ambiente) continue;
      if (!mapa[p.ambiente]) mapa[p.ambiente] = {};
      const tipo = p.tipoAmbiente || 'Geral';
      if (!mapa[p.ambiente][tipo]) mapa[p.ambiente][tipo] = [];
      mapa[p.ambiente][tipo].push(p);
    }

    return NextResponse.json(mapa);
  } catch (e) {
    return NextResponse.json({}, { status: 500 });
  }
}
import { NextResponse } from 'next/server';
import { kv } from '@/lib/kv';

export async function GET() {
  try {
    const produtos: any[] = (await kv.get('produtos:pinados')) || [];
    const mapa: Record<string, Record<string, any[]>> = {};

    for (const p of produtos) {
      if (!p.momento) continue;
      if (!mapa[p.momento]) mapa[p.momento] = {};
      const tipo = p.tipoMomento || 'Geral';
      if (!mapa[p.momento][tipo]) mapa[p.momento][tipo] = [];
      mapa[p.momento][tipo].push(p);
    }

    return NextResponse.json(mapa);
  } catch (e) {
    return NextResponse.json({}, { status: 500 });
  }
}
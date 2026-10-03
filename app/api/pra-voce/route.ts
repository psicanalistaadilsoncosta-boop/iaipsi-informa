// app/api/pra-voce/route.ts — produtos pinados na vitrine "Lupa pra você", separados por situação
import { NextResponse } from 'next/server';
import { kv } from '@/lib/kv';

export const dynamic = 'force-dynamic';

const TIPOS = ['Trabalhar e estudar', 'Mexer o corpo', 'Ficar conectado'];

export async function GET() {
  const produtos: any[] = (await kv.get('produtos:pinados')) || [];
  const mapa: Record<string, any[]> = {};
  for (const p of produtos) {
    if (!p.praVoce) continue;
    const tipo = TIPOS.includes(p.tipoPraVoce) ? p.tipoPraVoce : 'Ficar conectado';
    (mapa[tipo] ||= []).push(p);
  }
  return NextResponse.json(mapa);
}

// app/api/pra-voce/route.ts — produtos pinados na vitrine "Lupa pra você", separados por situação
import { NextResponse } from 'next/server';
import { lerGaveta } from '@/lib/pinados';

// Guardada até avisar: só lê o banco de novo quando algo muda (lib/revalidar.ts) ou após 24h
export const dynamic = 'force-static';
export const revalidate = 86400;

const TIPOS = ['Trabalhar e estudar', 'Mexer o corpo', 'Ficar conectado'];

export async function GET() {
  const produtos: any[] = await lerGaveta('praVoce');
  const mapa: Record<string, any[]> = {};
  for (const p of produtos) {
    if (!p.praVoce) continue;
    const tipo = TIPOS.includes(p.tipoPraVoce) ? p.tipoPraVoce : 'Ficar conectado';
    (mapa[tipo] ||= []).push(p);
  }
  return NextResponse.json(mapa);
}

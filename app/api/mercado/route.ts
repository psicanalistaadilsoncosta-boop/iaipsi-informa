import { NextResponse } from 'next/server';
import { lerGaveta } from '@/lib/pinados';

// Guardada até avisar: só lê o banco de novo quando algo muda (lib/revalidar.ts) ou após 24h
export const dynamic = 'force-static';
export const revalidate = 86400;

export async function GET() {
  try {
    const todos = await lerGaveta('mercado');
    const mercado = todos.filter(p => p.mercado);
    const porTipo: Record<string, any[]> = {};
    for (const p of mercado) {
      const tipo = p.tipoMercado || 'Outros';
      if (!porTipo[tipo]) porTipo[tipo] = [];
      porTipo[tipo].push(p);
    }
    return NextResponse.json(porTipo);
  } catch {
    return NextResponse.json({});
  }
}
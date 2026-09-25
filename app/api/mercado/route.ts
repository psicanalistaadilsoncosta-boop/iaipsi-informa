import { NextResponse } from 'next/server';
import { kv } from '@/lib/kv';

const KEY = 'produtos:pinados';

export async function GET() {
  try {
    const todos = (await kv.get<any[]>(KEY)) || [];
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
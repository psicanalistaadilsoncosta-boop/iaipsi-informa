import { NextResponse } from 'next/server';
import { kv } from '@/lib/kv';

export const dynamic = 'force-dynamic';

function detectarTipoBeleza(nome: string): string {
  const n = nome.toLowerCase();
  if (/perfume|eau de parfum|eau de toilette|colônia|colonia|fragrância|fragrance/.test(n)) return 'Perfumes';
  if (/massageador|massager|gun|eye massager|leg massager|lumbar/.test(n)) return 'Massagem';
  if (/hidratante|loção|locao|creme corporal|sérum|serum|esfoliante|sabonete/.test(n)) return 'Skincare';
  if (/shampoo|condicionador|máscara capilar|óleo capilar/.test(n)) return 'Cabelos';
  if (/maquiagem|batom|rímel|base|pó|sombra|blush|contorno|primer|delineador|paleta/.test(n)) return 'Maquiagem';
  if (/protetor solar|filtro solar|bronzeador/.test(n)) return 'Solar';
  return 'Cuidados';
}

export async function GET() {
  const produtos: any[] = (await kv.get('produtos:pinados')) || [];

  const mapa: Record<string, any[]> = {};

  for (const p of produtos) {
    if (!p.beleza) continue;
    const nome = p.nome || p.name || '';
    const tipo = detectarTipoBeleza(nome);
    if (!mapa[tipo]) mapa[tipo] = [];
    mapa[tipo].push(p);
  }

  return NextResponse.json(mapa);
}
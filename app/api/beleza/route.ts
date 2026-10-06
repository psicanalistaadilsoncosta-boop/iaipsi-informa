import { NextResponse } from 'next/server';
import { lerGaveta } from '@/lib/pinados';

// Guardada até avisar: só lê o banco de novo quando algo muda (lib/revalidar.ts) ou após 24h
export const dynamic = 'force-static';
export const revalidate = 86400;

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
  const produtos: any[] = await lerGaveta('beleza');

  const mapa: Record<string, any[]> = {};

  for (const p of produtos) {
    if (!p.beleza) continue;
    const nome = p.nome || p.name || '';
    const TIPOS_BELEZA = ['Perfumes', 'Skincare', 'Maquiagem', 'Cabelos', 'Massagem', 'Solar', 'Cuidados'];
    const tipo = TIPOS_BELEZA.includes(p.tipoBeleza) ? p.tipoBeleza : detectarTipoBeleza(nome);
    if (!mapa[tipo]) mapa[tipo] = [];
    mapa[tipo].push(p);
  }

  return NextResponse.json(mapa);
}
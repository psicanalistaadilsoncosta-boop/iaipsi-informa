import { NextResponse } from 'next/server';
import { kv } from '@/lib/kv';

export const revalidate = 86400; // 1 dia

export async function GET() {
  const lojas = (await kv.get<any[]>('lojas:cadastradas')) || [];
  const mapa: Record<string, any> = {};
  for (const l of lojas) {
    if (l?.reclameAqui && l.nome) mapa[l.nome] = l.reclameAqui;
  }
  return NextResponse.json(mapa);
}
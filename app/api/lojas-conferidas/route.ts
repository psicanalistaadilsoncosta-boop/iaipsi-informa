// app/api/lojas-conferidas/route.ts
// Lista pública só com os NOMES das lojas que você marcou como "conferida" no Lupômetro.
// A vitrine usa para mostrar o selo dourado "🏅 A Lupa conferiu".
import { NextResponse } from 'next/server';
import { kv } from '@/lib/kv';

export const revalidate = 300; // 5 min

export async function GET() {
  const lojas = (await kv.get<any[]>('lojas:cadastradas')) || [];
  return NextResponse.json(lojas.filter(l => l?.lojaConferida && l.nome).map(l => l.nome));
}

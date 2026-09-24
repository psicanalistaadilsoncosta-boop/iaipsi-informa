// app/api/produtos/lojas/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@/lib/kv';

const KV_KEY = 'lojas:cadastradas';

export interface LojaLomadee {
  tipo: 'lomadee';
  nome: string;
  url: string;
  moedaUSD?: boolean;
  ambiente?: string;
  tipoAmbiente?: string;
  momento?: string;
  tipoMomento?: string;
}

export interface LojaAwin {
  tipo: 'awin';
  nome: string;
  url: string;
  anuncianteId: string;
  moedaUSD?: boolean;
  ambiente?: string;
  tipoAmbiente?: string;
  momento?: string;
  tipoMomento?: string;
}

export type Loja = LojaLomadee | LojaAwin;

export async function GET() {
  const lojas = (await kv.get<Loja[]>(KV_KEY)) || [];
  return NextResponse.json(lojas);
}

export async function POST(req: NextRequest) {
  const loja: Loja = await req.json();
  const lojas = (await kv.get<Loja[]>(KV_KEY)) || [];

  // Evita duplicata pela URL
  const existente = lojas.findIndex(l => l.url === loja.url && l.tipo === loja.tipo);
  if (existente >= 0) {
    lojas[existente] = loja; // atualiza
  } else {
    lojas.push(loja);
  }

  await kv.set(KV_KEY, lojas);
  return NextResponse.json({ ok: true, lojas });
}

export async function DELETE(req: NextRequest) {
  const { url, tipo } = await req.json();
  const lojas = (await kv.get<Loja[]>(KV_KEY)) || [];
  const novas = lojas.filter(l => !(l.url === url && l.tipo === tipo));
  await kv.set(KV_KEY, novas);
  return NextResponse.json({ ok: true, lojas: novas });
}

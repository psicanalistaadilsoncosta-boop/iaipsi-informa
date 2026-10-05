// app/api/produtos/lojas/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@/lib/kv';
import { isAdmin } from '@/lib/adminAuth';

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
  if (!isAdmin(req)) return NextResponse.json({ error: 'não autorizado' }, { status: 401 });
  const { urlAntiga, ...loja } = (await req.json()) as Loja & { urlAntiga?: string };
  let lojas = (await kv.get<Loja[]>(KV_KEY)) || [];

  // Edição: acha a loja pela URL antiga (a URL pode ter mudado)
  const procurarPor = urlAntiga || loja.url;
  const existente = lojas.findIndex(l => l.url === procurarPor && l.tipo === loja.tipo);
  if (existente >= 0) {
    lojas[existente] = loja as Loja; // atualiza
    // se a URL nova já era de outra loja do mesmo tipo, tira a repetida
    lojas = lojas.filter((l, i) => i === existente || !(l.url === loja.url && l.tipo === loja.tipo));
  } else {
    lojas.push(loja as Loja);
  }

  await kv.set(KV_KEY, lojas);
  return NextResponse.json({ ok: true, lojas });
}

export async function DELETE(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'não autorizado' }, { status: 401 });
  const { url, tipo } = await req.json();
  const lojas = (await kv.get<Loja[]>(KV_KEY)) || [];
  const novas = lojas.filter(l => !(l.url === url && l.tipo === tipo));
  await kv.set(KV_KEY, novas);
  return NextResponse.json({ ok: true, lojas: novas });
}

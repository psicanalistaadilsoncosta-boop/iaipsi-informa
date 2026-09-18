import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@/lib/kv';

export interface ArtigoProduto {
  id: string;
  slug: string;
  titulo: string;
  marca: string;
  categoria: string;
  gtin: string;
  imagem: string;
  gallery: string[];
  descricaoCurta: string;
  conteudo: string; // artigo gerado pela IA
  specs: Record<string, { grupo: string; itens: { nome: string; valor: string }[] }>;
  ofertas: { loja: string; preco: number; link: string }[];
  publicado: boolean;
  createdAt: string;
}

const KEY = 'artigos:produtos';

async function read(): Promise<ArtigoProduto[]> {
  try {
    const data = await kv.get<ArtigoProduto[]>(KEY);
    return data || [];
  } catch { return []; }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get('slug');
  const todos = await read();
  if (slug) {
    const artigo = todos.find(a => a.slug === slug);
    return artigo
      ? NextResponse.json(artigo)
      : NextResponse.json({ error: 'Não encontrado' }, { status: 404 });
  }
  return NextResponse.json(todos);
}

export async function POST(req: NextRequest) {
  try {
    const artigo: ArtigoProduto = await req.json();
    const existing = await read();
    const idx = existing.findIndex(a => a.id === artigo.id);
    if (idx >= 0) {
      existing[idx] = artigo;
    } else {
      existing.unshift({ ...artigo, createdAt: new Date().toISOString() });
    }
    await kv.set(KEY, existing.slice(0, 200));
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    const existing = await read();
    await kv.set(KEY, existing.filter(a => a.id !== id));
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
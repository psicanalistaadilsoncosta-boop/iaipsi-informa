import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@/lib/kv';
import { isAdmin } from '@/lib/adminAuth';

export interface SaboresItem {
  id: string;
  prato: string;
  destino: string;
  intro: string;
  cta: string;
  content: string;
  imageUrl: string | null;
  imageQuery: string;
  recipe: any | null;
  publishedAt: string;
}

const KEY = 'sabores:items';

async function read(): Promise<SaboresItem[]> {
  try {
    const data = await kv.get<SaboresItem[]>(KEY);
    return data || [];
  } catch {
    return [];
  }
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'não autorizado' }, { status: 401 });
  try {
    const item = await req.json();
    const existing = await read();

    const newItem: SaboresItem = {
      id: Date.now().toString(),
      prato: item.prato,
      destino: item.destino,
      intro: item.intro,
      cta: item.cta,
      content: item.content,
      imageUrl: item.imageUrl || null,
      imageQuery: item.imageQuery || '',
      recipe: item.recipe || null,
      publishedAt: new Date().toISOString(),
    };

    const updated = [newItem, ...existing].slice(0, 20);
    await kv.set(KEY, updated);

    return NextResponse.json({ success: true, item: newItem });
  } catch (error) {
    console.error('Erro ao salvar:', error);
    return NextResponse.json({ error: 'Erro ao salvar' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'não autorizado' }, { status: 401 });
  try {
    const { id, imageUrl } = await req.json();
    const existing = await read();
    const updated = existing.map(item => item.id === id ? { ...item, imageUrl } : item);
    await kv.set(KEY, updated);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Erro ao atualizar imagem' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'não autorizado' }, { status: 401 });
  try {
    const { id } = await req.json();
    const existing = await read();
    const updated = existing.filter(item => item.id !== id);
    await kv.set(KEY, updated);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Erro ao deletar' }, { status: 500 });
  }
}

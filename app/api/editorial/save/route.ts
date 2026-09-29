import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@/lib/kv';
import { isAdmin } from '@/lib/adminAuth';

export interface EditorialItem {
  id: string;
  title: string;
  analysis: string;
  link: string;
  category?: string;
  publishedAt: string;
  author: string;
}

const KEY = 'editorial:items';

async function read(): Promise<EditorialItem[]> {
  try {
    const data = await kv.get<EditorialItem[]>(KEY);
    return data || [];
  } catch {
    return [];
  }
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'não autorizado' }, { status: 401 });
  try {
    const item: Omit<EditorialItem, 'id' | 'publishedAt' | 'author'> = await req.json();

    const existing = await read();

    const newItem: EditorialItem = {
      id: Date.now().toString(),
      title: item.title,
      analysis: item.analysis,
      link: item.link,
      category: item.category,
      publishedAt: new Date().toISOString(),
      author: 'Adilson Costa',
    };

    const updated = [newItem, ...existing].slice(0, 20);
    await kv.set(KEY, updated);

    revalidatePath('/'); return NextResponse.json({ success: true, item: newItem });
  } catch (error) {
    console.error('Erro ao salvar:', error);
    return NextResponse.json({ error: 'Erro ao salvar análise' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'não autorizado' }, { status: 401 });
  try {
    const { id } = await req.json();
    const existing = await read();
    const updated = existing.filter(item => item.id !== id);
    await kv.set(KEY, updated);
    revalidatePath('/'); return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao deletar' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export interface EditorialItem {
  id: string;
  title: string;
  analysis: string;
  link: string;
  category?: string;
  publishedAt: string;
  author: string;
}

export async function POST(req: NextRequest) {
  try {
    const item: Omit<EditorialItem, 'id' | 'publishedAt' | 'author'> = await req.json();

    const filePath = path.join(process.cwd(), 'public', 'editorial.json');

    // Lê arquivo existente ou começa vazio
    let existing: EditorialItem[] = [];
    try {
      const raw = await fs.readFile(filePath, 'utf-8');
      existing = JSON.parse(raw);
    } catch {
      existing = [];
    }

    const newItem: EditorialItem = {
      id: Date.now().toString(),
      title: item.title,
      analysis: item.analysis,
      link: item.link,
      category: item.category,
      publishedAt: new Date().toISOString(),
      author: 'Adilson Costa',
    };

    // Mais recente primeiro, máximo 20 publicados
    const updated = [newItem, ...existing].slice(0, 20);
    await fs.writeFile(filePath, JSON.stringify(updated, null, 2), 'utf-8');

    return NextResponse.json({ success: true, item: newItem });
  } catch (error) {
    console.error('Erro ao salvar:', error);
    return NextResponse.json({ error: 'Erro ao salvar análise' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    const filePath = path.join(process.cwd(), 'public', 'editorial.json');
    const raw = await fs.readFile(filePath, 'utf-8');
    const existing: EditorialItem[] = JSON.parse(raw);
    const updated = existing.filter(item => item.id !== id);
    await fs.writeFile(filePath, JSON.stringify(updated, null, 2), 'utf-8');
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao deletar' }, { status: 500 });
  }
}
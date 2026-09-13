import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

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

export async function POST(req: NextRequest) {
  try {
    const item = await req.json();
    const filePath = path.join(process.cwd(), 'public', 'sabores.json');

    let existing: SaboresItem[] = [];
    try {
      const raw = await fs.readFile(filePath, 'utf-8');
      existing = JSON.parse(raw);
    } catch {
      existing = [];
    }

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
    await fs.writeFile(filePath, JSON.stringify(updated, null, 2), 'utf-8');

    return NextResponse.json({ success: true, item: newItem });
  } catch (error) {
    console.error('Erro ao salvar:', error);
    return NextResponse.json({ error: 'Erro ao salvar' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  // Atualiza só a imagem de um item
  try {
    const { id, imageUrl } = await req.json();
    const filePath = path.join(process.cwd(), 'public', 'sabores.json');
    const raw = await fs.readFile(filePath, 'utf-8');
    const existing: SaboresItem[] = JSON.parse(raw);
    const updated = existing.map(item => item.id === id ? { ...item, imageUrl } : item);
    await fs.writeFile(filePath, JSON.stringify(updated, null, 2), 'utf-8');
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Erro ao atualizar imagem' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    const filePath = path.join(process.cwd(), 'public', 'sabores.json');
    const raw = await fs.readFile(filePath, 'utf-8');
    const existing: SaboresItem[] = JSON.parse(raw);
    const updated = existing.filter(item => item.id !== id);
    await fs.writeFile(filePath, JSON.stringify(updated, null, 2), 'utf-8');
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Erro ao deletar' }, { status: 500 });
  }
}
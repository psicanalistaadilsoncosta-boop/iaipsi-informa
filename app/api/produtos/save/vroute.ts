import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export interface ProdutoPinado {
  id: string;
  nome: string;
  imagem: string;
  link: string;
  linkOriginal: string;
  preco: number;
  precoOriginal: number;
  desconto: number;
  parcelas?: string;
  valorParcela?: string;
  organizationId: string;
  destinos: string[];
  ativo?: boolean;
  pinedAt: string;
}

const FILE = path.join(process.cwd(), 'public', 'produtos-pinados.json');

async function read(): Promise<ProdutoPinado[]> {
  try {
    return JSON.parse(await fs.readFile(FILE, 'utf-8'));
  } catch { return []; }
}

export async function POST(req: NextRequest) {
   try {
    const produto: ProdutoPinado = await req.json();
    let existing = await read();
    const idx = existing.findIndex(p => p.id === produto.id);

    // Se está ativando como oferta do dia, desativa todos os outros
    if (produto.ativo && produto.destinos?.includes('oferta-do-dia')) {
      existing = existing.map(p => ({
        ...p,
        ativo: p.destinos?.includes('oferta-do-dia') ? false : p.ativo,
      }));
    }

    if (idx >= 0) {
      existing[idx] = { ...existing[idx], ...produto, pinedAt: existing[idx].pinedAt };
      await fs.writeFile(FILE, JSON.stringify(existing, null, 2));
    } else {
      const updated = [{ ...produto, pinedAt: new Date().toISOString() }, ...existing].slice(0, 100);
      await fs.writeFile(FILE, JSON.stringify(updated, null, 2));
    }
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    const existing = await read();
    await fs.writeFile(FILE, JSON.stringify(existing.filter(p => p.id !== id), null, 2));
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
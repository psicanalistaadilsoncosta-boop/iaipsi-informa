import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export interface ProdutoPinado {
  id: string;
  nome: string;
  imagem: string;
  link: string; // link de afiliado
  linkOriginal: string;
  preco: number;
  precoOriginal: number;
  desconto: number;
  organizationId: string;
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
    const existing = await read();
    if (existing.find(p => p.id === produto.id)) {
      return NextResponse.json({ success: true, message: 'Já pinado' });
    }
    const updated = [{ ...produto, pinedAt: new Date().toISOString() }, ...existing].slice(0, 20);
    await fs.writeFile(FILE, JSON.stringify(updated, null, 2));
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
import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@/lib/kv';

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

const KEY = 'produtos:pinados';

async function read(): Promise<ProdutoPinado[]> {
  try {
    const data = await kv.get<ProdutoPinado[]>(KEY);
    return data || [];
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
    } else {
      existing = [{ ...produto, pinedAt: new Date().toISOString() }, ...existing].slice(0, 1000);
    }

    await kv.set(KEY, existing);
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    const existing = await read();
    await kv.set(KEY, existing.filter(p => p.id !== id));
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

// GET — para o painel ler os pinados
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tipo = searchParams.get('tipo');

  // Retorna o ID do destaque da home
    if (tipo === 'destaque-home') {
    try {
      const data = await kv.get<{ id: string; frase: string }>('oferta:destaque-home');
      if (typeof data === 'string') return NextResponse.json({ id: data, frase: '' });
      return NextResponse.json({ id: data?.id || null, frase: data?.frase || '' });
    } catch {
      return NextResponse.json({ id: null, frase: '' });
    }
  }

  // Retorna todos os pinados
  try {
    const data = await read();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json([]);
  }
}

// Salva o destaque da home
export async function PATCH(req: NextRequest) {
  try {
    const { id, frase } = await req.json();
    await kv.set('oferta:destaque-home', { id, frase: frase || '' });
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
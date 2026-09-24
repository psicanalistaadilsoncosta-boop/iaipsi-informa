import { NextResponse } from 'next/server';
import { kv } from '@/lib/kv';

export const dynamic = 'force-dynamic';

// GET — retorna todos os produtos
export async function GET() {
  const produtos: any[] = (await kv.get('produtos:pinados')) || [];
  return NextResponse.json(produtos);
}

// PATCH — atualiza categoria de um produto pelo id
// body: { id, categoria: 'ambiente'|'vistaSe'|'beleza'|'momento', tipoAmbiente?, tipoMomento?, tipoVistaSe? }
export async function PATCH(req: Request) {
  const { id, categoria, tipoAmbiente, tipoMomento, tipoVistaSe } = await req.json();
  if (!id || !categoria) return NextResponse.json({ error: 'id e categoria obrigatórios' }, { status: 400 });

  const produtos: any[] = (await kv.get('produtos:pinados')) || [];
  const idx = produtos.findIndex((p: any) => p.id === id);
  if (idx === -1) return NextResponse.json({ error: 'produto não encontrado' }, { status: 404 });

  const p = { ...produtos[idx] };

  // Remove todas as categorias
  delete p.ambiente; delete p.tipoAmbiente;
  delete p.momento; delete p.tipoMomento;
  delete p.vistaSe; delete p.tipoVistaSe;
  delete p.beleza;

  // Aplica nova categoria
  if (categoria === 'ambiente') {
    p.ambiente = tipoAmbiente || 'Sala';
    p.tipoAmbiente = tipoAmbiente || 'Decoração';
  } else if (categoria === 'momento') {
    p.momento = tipoMomento || 'Café da manhã';
    p.tipoMomento = tipoMomento || 'Acessórios';
  } else if (categoria === 'vistaSe') {
    p.vistaSe = true;
    p.tipoVistaSe = tipoVistaSe || 'Roupas';
  } else if (categoria === 'beleza') {
    p.beleza = true;
  }

  produtos[idx] = p;
  await kv.set('produtos:pinados', produtos);

  return NextResponse.json({ ok: true });
}

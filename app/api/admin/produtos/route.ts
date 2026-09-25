import { NextResponse, NextRequest } from 'next/server';
import { kv } from '@/lib/kv';

export const dynamic = 'force-dynamic';

function checkAuth(req: NextRequest) {
  return req.cookies.get('editorial_auth')?.value === 'true';
}

// GET — retorna todos os produtos
export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'não autorizado' }, { status: 401 });
  const produtos: any[] = (await kv.get('produtos:pinados')) || [];
  return NextResponse.json(produtos);
}

// PATCH — atualiza categoria de um produto pelo id
// body: { id, categoria, nomeAmbiente?, tipoAmbiente?, tipoMomento?, tipoVistaSe?, tipoBeleza? }
export async function PATCH(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'não autorizado' }, { status: 401 });
  const { id, categoria, nomeAmbiente, tipoAmbiente, tipoMomento, tipoVistaSe, tipoBeleza } = await req.json();
  if (!id || !categoria) return NextResponse.json({ error: 'id e categoria obrigatórios' }, { status: 400 });

  const produtos: any[] = (await kv.get('produtos:pinados')) || [];
  const idx = produtos.findIndex((p: any) => p.id === id);
  if (idx === -1) return NextResponse.json({ error: 'produto não encontrado' }, { status: 404 });

  const p = { ...produtos[idx] };

  // Remove todas as categorias
  delete p.ambiente; delete p.tipoAmbiente;
  delete p.momento; delete p.tipoMomento;
  delete p.vistaSe; delete p.tipoVistaSe;
  delete p.beleza; delete p.tipoBeleza;

  // Aplica nova categoria
  if (categoria === 'ambiente') {
    p.ambiente = nomeAmbiente || 'Sala';
    p.tipoAmbiente = tipoAmbiente || 'Organização';
  } else if (categoria === 'momento') {
    p.momento = tipoMomento || 'Café da manhã';
    p.tipoMomento = 'Acessórios';
  } else if (categoria === 'vistaSe') {
    p.vistaSe = true;
    p.tipoVistaSe = tipoVistaSe || 'Roupas';
  } else if (categoria === 'beleza') {
    p.beleza = true;
    p.tipoBeleza = tipoBeleza || 'Cuidados';
  }

  produtos[idx] = p;
  await kv.set('produtos:pinados', produtos);

  return NextResponse.json({ ok: true });
}

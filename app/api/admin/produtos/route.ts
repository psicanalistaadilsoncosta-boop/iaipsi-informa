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

function aplicarCat(p: any, categoria: string, nomeAmbiente?: string, tipoAmbiente?: string, tipoMomento?: string, tipoVistaSe?: string, tipoBeleza?: string, tipoMercado?: string) {
  const novo = { ...p };
  delete novo.ambiente; delete novo.tipoAmbiente;
  delete novo.momento; delete novo.tipoMomento;
  delete novo.vistaSe; delete novo.tipoVistaSe;
  delete novo.beleza; delete novo.tipoBeleza;
  delete novo.mercado; delete novo.tipoMercado;

  if (categoria === 'ambiente') {
    novo.ambiente = nomeAmbiente || 'Sala';
    novo.tipoAmbiente = tipoAmbiente || 'Organização';
  } else if (categoria === 'momento') {
    novo.momento = tipoMomento || 'Café da manhã';
    novo.tipoMomento = nomeAmbiente || 'Acessórios';
  } else if (categoria === 'vistaSe') {
    novo.vistaSe = true;
    novo.tipoVistaSe = tipoVistaSe || 'Roupas';
  } else if (categoria === 'beleza') {
    novo.beleza = true;
    novo.tipoBeleza = tipoBeleza || 'Cuidados';
  } else if (categoria === 'mercado') {
    novo.mercado = true;
    novo.tipoMercado = tipoMercado || 'Alimentos';
  }
  return novo;
}

// PATCH — atualiza categoria de um ou vários produtos
// body: { id, categoria, ... }  ← individual
// body: { ids: string[], categoria, ... }  ← lote
export async function PATCH(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'não autorizado' }, { status: 401 });
  const body = await req.json();
  const { categoria, nomeAmbiente, tipoAmbiente, tipoMomento, tipoVistaSe, tipoBeleza, tipoMercado } = body;
  if (!categoria) return NextResponse.json({ error: 'categoria obrigatória' }, { status: 400 });

  // Suporte a lote (ids[]) ou individual (id)
  const ids: string[] = body.ids ?? (body.id ? [body.id] : []);
  if (ids.length === 0) return NextResponse.json({ error: 'id ou ids obrigatório' }, { status: 400 });

  const produtos: any[] = (await kv.get('produtos:pinados')) || [];

    const limparACatalogar = body.limparACatalogar === true;

  for (const id of ids) {
    const idx = produtos.findIndex((p: any) => p.id === id);
    if (idx !== -1) {
      let p = aplicarCat(produtos[idx], categoria, nomeAmbiente, tipoAmbiente, tipoMomento, tipoVistaSe, tipoBeleza);
      if (limparACatalogar) { delete p.aCatalogar; delete p.lojaNome; }
      produtos[idx] = p;
    }
  }

  await kv.set('produtos:pinados', produtos);
  return NextResponse.json({ ok: true, atualizados: ids.length });
}

import { revalidatePath } from 'next/cache';
import { NextResponse, NextRequest } from 'next/server';
import { kv } from '@/lib/kv';
import { isAdmin } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

function checkAuth(req: NextRequest) {
  return isAdmin(req);
}

// GET — retorna todos os produtos
export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'não autorizado' }, { status: 401 });
  const produtos: any[] = (await kv.get('produtos:pinados')) || [];
  return NextResponse.json(produtos);
}

function aplicarCat(p: any, categoria: string, nomeAmbiente?: string, tipoAmbiente?: string, tipoMomento?: string, tipoVistaSe?: string, tipoBeleza?: string, tipoMercado?: string, tipoPraVoce?: string) {
  const novo = { ...p };
  delete novo.ambiente; delete novo.tipoAmbiente;
  delete novo.momento; delete novo.tipoMomento;
  delete novo.vistaSe; delete novo.tipoVistaSe;
  delete novo.beleza; delete novo.tipoBeleza;
  delete novo.mercado; delete novo.tipoMercado;
  delete novo.praVoce; delete novo.tipoPraVoce;

  if (categoria === 'ambiente') {
    novo.ambiente = nomeAmbiente || 'Sala';
    novo.tipoAmbiente = tipoAmbiente || 'Organização';
  } else if (categoria === 'momento') {
    novo.momento = nomeAmbiente || tipoMomento || 'Café da manhã';
    novo.tipoMomento = tipoMomento || 'Acessórios';
  } else if (categoria === 'vistaSe') {
    novo.vistaSe = true;
    novo.tipoVistaSe = tipoVistaSe || 'Roupas';
  } else if (categoria === 'beleza') {
    novo.beleza = true;
        novo.tipoBeleza = tipoBeleza || 'Cuidados';
  } else if (categoria === 'mercado') {
    novo.mercado = true;
    novo.tipoMercado = tipoMercado || 'Alimentos';
  } else if (categoria === 'praVoce') {
    novo.praVoce = true;
    novo.tipoPraVoce = tipoPraVoce || 'Ficar conectado';
  }
  return novo;
}

// PATCH — atualiza categoria de um ou vários produtos
// body: { id, categoria, ... }  ← individual
// body: { ids: string[], categoria, ... }  ← lote
// body: { id, bannerDestaque, precoTipo, textoParcelamento } ← configuração de banner
export async function PATCH(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'não autorizado' }, { status: 401 });
  const body = await req.json();

  const produtos: any[] = (await kv.get('produtos:pinados')) || [];

  // Modo banner: apenas atualiza campos de banner
  if ('bannerDestaque' in body || 'precoTipo' in body) {
    const id: string = body.id;
    if (!id) return NextResponse.json({ error: 'id obrigatório' }, { status: 400 });
    const idx = produtos.findIndex((p: any) => p.id === id);
    if (idx === -1) return NextResponse.json({ error: 'produto não encontrado' }, { status: 404 });
    if ('bannerDestaque' in body) produtos[idx].bannerDestaque = !!body.bannerDestaque;
   if ('precoTipo' in body) produtos[idx].precoTipo = body.precoTipo;
if ('textoParcelamento' in body) produtos[idx].textoParcelamento = body.textoParcelamento;
if ('valorParcela' in body) produtos[idx].valorParcela = body.valorParcela; // valor da parcela em número
    await kv.set('produtos:pinados', produtos);
    revalidatePath('/'); return NextResponse.json({ ok: true });
  }

  const { categoria, nomeAmbiente, tipoAmbiente, tipoMomento, tipoVistaSe, tipoBeleza, tipoMercado, tipoPraVoce } = body;
  if (!categoria) return NextResponse.json({ error: 'categoria obrigatória' }, { status: 400 });

  // Suporte a lote (ids[]) ou individual (id)
  const ids: string[] = body.ids ?? (body.id ? [body.id] : []);
  if (ids.length === 0) return NextResponse.json({ error: 'id ou ids obrigatório' }, { status: 400 });

  for (const id of ids) {
    const idx = produtos.findIndex((p: any) => p.id === id);
    if (idx !== -1) {
    produtos[idx] = aplicarCat(produtos[idx], categoria, nomeAmbiente, tipoAmbiente, tipoMomento, tipoVistaSe, tipoBeleza, tipoMercado, tipoPraVoce);
    }
  }

  await kv.set('produtos:pinados', produtos);
  revalidatePath('/'); return NextResponse.json({ ok: true, atualizados: ids.length });
}

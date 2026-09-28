import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/adminAuth';
import {
  chamarActionpay, acharLista, normalizarOferta, normalizarLink, montarDeeplink, ActionpayErro,
} from '@/lib/actionpay';

export const dynamic = 'force-dynamic';

// Uso (logado no admin):
//   /api/actionpay?tipo=teste                    -> confere se a chave funciona
//   /api/actionpay?tipo=ofertas&page=1           -> catálogo de ofertas
//   /api/actionpay?tipo=minhas                   -> ofertas em que você está inscrito
//   /api/actionpay?tipo=fontes                   -> suas fontes de tráfego (sites)
//   /api/actionpay?tipo=links&offer=123          -> links de afiliado de uma oferta
//   /api/actionpay?tipo=deeplink&offer=123&url=https://loja.com/produto
//   acrescente &bruto=1 para ver a resposta original da API
export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'não autorizado' }, { status: 401 });

  const q = req.nextUrl.searchParams;
  const tipo = q.get('tipo') || 'teste';
  const bruto = q.get('bruto') === '1';

  try {
    if (tipo === 'teste') {
      const dados = await chamarActionpay('apiWmDashboard');
      return NextResponse.json({ ok: true, mensagem: 'Chave funcionando', dados });
    }

    if (tipo === 'ofertas') {
      const dados = await chamarActionpay('apiWmOffers', {
        page: q.get('page') || 1,
        category: q.get('category') || undefined,
        offer: q.get('offer') || undefined,
      });
      const ofertas = acharLista(dados, ['offers', 'offer']).map(normalizarOferta);
      return NextResponse.json(bruto ? { ofertas, bruto: dados } : { ofertas });
    }

    if (tipo === 'minhas') {
      const dados = await chamarActionpay('apiWmMyOffers');
      const lista = acharLista(dados, ['favouriteOffers', 'favouriteOffer', 'offers']).map((f: any) => ({
        id: Number(f?.offer?.id),
        nome: f?.offer?.name ?? '',
        disponivel: f?.available === true || f?.available === 'true',
        status: f?.status?.name ?? null,
        linksBloqueados: f?.linksBlocked === true || f?.linksBlocked === 'true',
      }));
      return NextResponse.json(bruto ? { ofertas: lista, bruto: dados } : { ofertas: lista });
    }

    if (tipo === 'fontes') {
      const dados = await chamarActionpay('apiWmSources');
      const fontes = acharLista(dados, ['sources', 'source']).map((s: any) => ({ id: s?.id, nome: s?.name }));
      return NextResponse.json(bruto ? { fontes, bruto: dados } : { fontes });
    }

    if (tipo === 'links' || tipo === 'deeplink') {
      const offer = q.get('offer');
      if (!offer) return NextResponse.json({ error: 'informe offer=ID' }, { status: 400 });
      const dados = await chamarActionpay('apiWmLinks', { offer, source: q.get('source') || undefined });
      const links = acharLista(dados, ['links', 'link']).map(normalizarLink).filter(l => l.url);

      if (tipo === 'links') return NextResponse.json(bruto ? { links, bruto: dados } : { links });

      const urlProduto = q.get('url');
      if (!urlProduto) return NextResponse.json({ error: 'informe url=<link do produto>' }, { status: 400 });
      if (!links.length) return NextResponse.json({ error: 'nenhum link disponível para essa oferta' }, { status: 404 });
      return NextResponse.json({ deeplink: montarDeeplink(links[0].url, urlProduto), base: links[0] });
    }

    return NextResponse.json({ error: `tipo desconhecido: ${tipo}` }, { status: 400 });
  } catch (e) {
    const status = e instanceof ActionpayErro && e.codigo && e.codigo >= 400 ? e.codigo : 500;
    return NextResponse.json({ error: String((e as Error).message || e) }, { status });
  }
}

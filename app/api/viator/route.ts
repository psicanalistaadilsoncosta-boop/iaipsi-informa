import { NextRequest, NextResponse } from 'next/server';

const VIATOR_API_KEY = process.env.VIATOR_API_KEY!;
const BASE_URL = process.env.VIATOR_API_BASE_URL ?? 'https://api.viator.com/partner';

const HEADERS = {
  'Accept': 'application/json;version=2.0',
  'Accept-Language': 'pt-BR',
  'exp-api-key': VIATOR_API_KEY,
  'Content-Type': 'application/json',
};

export async function GET(req: NextRequest) {
  const destCode = req.nextUrl.searchParams.get('destCode') ?? '';
  const keyword  = req.nextUrl.searchParams.get('keyword')  ?? '';

  if (!destCode && !keyword) {
    return NextResponse.json({ error: 'Informe destCode ou keyword' }, { status: 400 });
  }

  try {
    let rawProducts: any[] = [];

    if (destCode) {
      // ── Busca estruturada por destino ──────────────────────────────────
      const body = {
        filtering: { destination: destCode },
        sorting: { sort: 'TRAVELER_RATING', order: 'DESCENDING' },
        pagination: { start: 1, count: 20 },
        currency: 'BRL',
      };
      const res = await fetch(`${BASE_URL}/products/search`, {
        method: 'POST',
        headers: HEADERS,
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const txt = await res.text();
        return NextResponse.json({ error: `Viator: ${res.status}`, detail: txt }, { status: 502 });
      }
      const data = await res.json();
      rawProducts = data.products ?? [];

    } else {
            // ── Busca por texto livre ──────────────────────────────────────────
      const body = {
        searchTerm: keyword,
        searchTypes: [{
          searchType: 'PRODUCTS',
          pagination: { start: 1, count: 20 },
          sorting: { sort: 'TRAVELER_RATING', order: 'DESCENDING' },
        }],
        currency: 'BRL',
      };
      const res = await fetch(`${BASE_URL}/search/freetext`, {
        method: 'POST',
        headers: HEADERS,
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const txt = await res.text();
        return NextResponse.json({ error: `Viator: ${res.status}`, detail: txt }, { status: 502 });
      }
      const data = await res.json();
    rawProducts = data.products?.results ?? data.searchResults?.find((r: any) => r.searchType === 'PRODUCTS')?.results ?? [];
    }

    // ── Normaliza para o formato interno ─────────────────────────────────
    const produtos = rawProducts.map((p: any) => ({
      product_code:     p.productCode,
      titulo:           p.title,
      descricao:        p.description ?? '',
      duracao:          p.duration?.fixedDurationInMinutes
                          ? `${Math.round(p.duration.fixedDurationInMinutes / 60)}h`
                          : 'Consulte',
      destaques:        (p.productHighlights ?? []).slice(0, 5),
      precoBase:        p.pricing?.summary?.fromPrice ?? 0,
      moeda:            'BRL',
      // Pega a imagem de capa na variante mais larga disponível
      imagem:           p.images?.find((i: any) => i.isCover)?.variants
                          ?.sort((a: any, b: any) => b.width - a.width)[0]?.url
                          ?? p.images?.[0]?.variants?.[0]?.url ?? '',
      gallery:          (p.images ?? []).slice(1, 6).map(
                          (img: any) => img.variants
                            ?.sort((a: any, b: any) => b.width - a.width)[0]?.url ?? ''
                        ).filter(Boolean),
      affiliate_url:    p.productUrl ?? '',
      rating:           p.reviews?.combinedAverageRating ?? null,
      totalReviews:     p.reviews?.totalReviews ?? 0,
      flags:            p.flags ?? [],
      destination_code: destCode || '',
      rating: p.reviews?.combinedAverageRating ?? p.rating ?? null,
      reviewCount: p.reviews?.totalReviews ?? p.reviewCount ?? null,
      destino: p.destinations?.[0]?.ref
        ? (p.destinations[0].primaryDestinationName || p.destinations[0].name || '')
        : '',
      source:           'viator' as const,
    }));

    return NextResponse.json({ products: produtos });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
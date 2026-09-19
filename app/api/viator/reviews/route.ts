import { NextRequest, NextResponse } from 'next/server';

const VIATOR_API_KEY = process.env.VIATOR_API_KEY!;
const BASE_URL = process.env.VIATOR_API_BASE_URL ?? 'https://api.viator.com/partner';

const HEADERS = {
  'Accept': 'application/json;version=2.0',
  'Accept-Language': 'pt-BR',
  'exp-api-key': VIATOR_API_KEY,
};

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code') ?? '';
  if (!code) return NextResponse.json({ error: 'code obrigatório' }, { status: 400 });

  try {
    // Busca reviews do produto
    const res = await fetch(`${BASE_URL}/products/${code}/reviews?count=10&start=1`, {
      headers: HEADERS,
      next: { revalidate: 3600 }, // cache 1h
    });

    if (!res.ok) {
      const txt = await res.text();
      return NextResponse.json({ error: `Viator: ${res.status}`, detail: txt }, { status: 502 });
    }

    const data = await res.json();

    // Estrutura retornada: { reviews: [...], totalCount, avgRating }
    const reviews = (data.reviews ?? []).map((r: any) => ({
      id: r.reviewReference ?? r.id ?? '',
      nota: r.rating ?? 0,
      titulo: r.title ?? '',
      texto: r.text ?? r.reviewText ?? '',
      autor: r.userName ?? r.displayName ?? 'Viajante',
      data: r.publishedDate ?? r.submissionDate ?? '',
      pais: r.userCountry ?? '',
    }));

    return NextResponse.json({
      totalReviews: data.totalCount ?? data.reviewCount ?? reviews.length,
      avgRating: data.avgRating ?? data.averageRating ?? null,
      reviews,
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

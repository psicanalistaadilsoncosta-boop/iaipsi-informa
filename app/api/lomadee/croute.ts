import { NextResponse } from 'next/server';

export const revalidate = 3600;

const API_KEY = process.env.LOMADEE_API_KEY || '';
const BASE_URL = 'https://api.lomadee.com.br';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tipo = searchParams.get('tipo') || 'products';
  const busca = searchParams.get('q') || '';
  const pagina = parseInt(searchParams.get('pagina') || '1');

  try {
    let url = '';

    if (tipo === 'campaigns') {
      url = `${BASE_URL}/affiliate/campaigns?limit=20&page=${pagina}`;
    } else if (tipo === 'brands') {
      url = `${BASE_URL}/affiliate/brands?limit=20&page=${pagina}`;
    } else {
      const params = new URLSearchParams({
        limit: '24',
        page: String(pagina),
      });
      if (busca) params.set('search', busca);
      url = `${BASE_URL}/affiliate/products?${params}`;
    }

    const res = await fetch(url, {
      headers: { 'x-api-key': API_KEY },
      signal: AbortSignal.timeout(10000),
    });

    const data = await res.json();

    // Retorna raw para campaigns e brands — para inspecionar estrutura
    if (tipo === 'campaigns' || tipo === 'brands') {
      return NextResponse.json(data);
    }

    // Processa produtos
    const produtos = (data.data || [])
      .filter((p: any) => {
        if (!p.name || p.name === '#N/A') return false;
        if (!p.images?.length) return false;
        return true;
      })
      .map((p: any) => {
        const option = p.options?.[0];
        const pricing = option?.pricing?.[0];
        const preco_oferta = pricing?.price || 0;
        const preco_original = pricing?.listPrice || preco_oferta;
        const desconto = preco_original > preco_oferta
          ? Math.round((1 - preco_oferta / preco_original) * 100)
          : 0;
        const rating = p.metadata?.find((m: any) => m.key === 'item_rating')?.value;

        return {
          id: p.id,
          titulo: p.name,
          descricao: p.description?.slice(0, 200).replace(/\n/g, ' ').trim() || '',
          imagem: p.images?.[0]?.url || '',
          link: p.url,
          preco_original,
          preco_oferta,
          desconto,
          rating: rating ? parseFloat(rating) : null,
          vendedor: option?.seller || '',
          fonte: 'Lomadee',
        };
      });

    return NextResponse.json({
      items: produtos,
      total: data.count || produtos.length,
      pagina,
    });
  } catch (e) {
    console.error('Erro Lomadee:', e);
    return NextResponse.json({ items: [], total: 0, pagina: 1 });
  }
}

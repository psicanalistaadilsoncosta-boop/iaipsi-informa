import { NextRequest, NextResponse } from 'next/server';
import { detectAndFetch } from '@/lib/scrapers/index';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url') || '';
  const limit = parseInt(searchParams.get('limit') || '20');
  const q = searchParams.get('q') || '';
  const organizationId = searchParams.get('orgId') || '';
  const moedaUSD = searchParams.get('moedaUSD') === 'true';

  if (!url) return NextResponse.json({ error: 'URL obrigatória' }, { status: 400 });

  try {
       const { produtos, plataforma } = await detectAndFetch(url, limit, moedaUSD);

    const filtrados = q
      ? produtos.filter((p: any) => p.nome.toLowerCase().includes(q.toLowerCase()))
      : produtos;

    // Injeta organizationId do Lomadee em cada produto
    const data = filtrados.map((p: any) => ({
      ...p,
      organizationId: organizationId || p.organizationId,
    }));

    return NextResponse.json({
      data,
      total: data.length,
      plataforma,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message, data: [] }, { status: 500 });
  }
}
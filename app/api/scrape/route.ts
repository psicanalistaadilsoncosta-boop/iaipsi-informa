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

       // Monta deep link Awin se orgId for numérico
    const awinAffid = '3093907';
    const isAwin = /^\d+$/.test(organizationId);

    // Converte moeda se necessário
    let cotacao = 1;
    if (moedaUSD) {
      try {
        const cotRes = await fetch('https://economia.awesomeapi.com.br/json/last/USD-BRL', { signal: AbortSignal.timeout(5000) });
        if (cotRes.ok) {
          const cotData = await cotRes.json();
          const val = parseFloat(cotData.USDBRL?.bid);
          if (val > 3 && val < 10) cotacao = val;
        }
      } catch {}
      if (cotacao === 1) cotacao = 5.14;
    }

    const data = filtrados.map((p: any) => ({
      ...p,
      organizationId: organizationId || p.organizationId,
      link: isAwin && p.link
        ? `https://www.awin1.com/cread.php?awinmid=${organizationId}&awinaffid=${awinAffid}&ued=${encodeURIComponent(p.link)}`
        : p.link,
      preco: p.preco,
      precoOriginal: p.precoOriginal,
      moedaOriginal: moedaUSD ? 'USD' : p.moedaOriginal,
      cotacaoUsada: moedaUSD ? (p.cotacaoUsada || cotacao) : p.cotacaoUsada,
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
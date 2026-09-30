import { NextRequest, NextResponse } from 'next/server';

const API_KEY = process.env.LOMADEE_API_KEY || '';
const AWIN_AFFID = process.env.AWIN_PUBLISHER_ID || '3093907';
const RAKUTEN_LINK_ID = process.env.RAKUTEN_LINK_ID || '';

const AWIN_ADVERTISERS: Record<string, string> = {
  'awin-arno': '108626',
  'awin-spicy': '30615', 
  // adicione outros anunciantes Awin aqui
};

export async function POST(req: NextRequest) {
  try {
    const { url, organizationId } = await req.json();

    // Se for anunciante Awin, gera deeplink Awin
    const awinMid = AWIN_ADVERTISERS[organizationId];
    if (awinMid) {
      const awinLink = `https://www.awin1.com/cread.php?awinmid=${awinMid}&awinaffid=${AWIN_AFFID}&ued=${encodeURIComponent(url)}`;
        return NextResponse.json({ shortUrl: awinLink });
    }

    // Se for loja Rakuten (organizationId = "rakuten-<mid>"), gera deeplink Rakuten
    const rakutenMid = typeof organizationId === 'string' && organizationId.startsWith('rakuten-')
      ? organizationId.slice('rakuten-'.length) : '';
    if (rakutenMid) {
      if (!RAKUTEN_LINK_ID) {
        return NextResponse.json({ shortUrl: null, error: 'RAKUTEN_LINK_ID não configurado' }, { status: 500 });
      }
      const rakutenLink = `https://click.linksynergy.com/deeplink?id=${encodeURIComponent(RAKUTEN_LINK_ID)}&mid=${rakutenMid}&murl=${encodeURIComponent(url)}`;
      return NextResponse.json({ shortUrl: rakutenLink });
    }

    // Caso contrário usa Lomadee
        const res = await fetch('https://api-beta.lomadee.com.br/affiliate/shortener/url', {
      method: 'POST',
      signal: AbortSignal.timeout(10000),
      headers: {
        'x-api-key': API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        organizationId,
        type: 'Custom',
        url,
      }),
    });

    const data = await res.json();
        const shortUrl = data?.[0]?.shortUrls?.[0] || null;

    // Sem link de afiliado: avisa com erro, para ninguém gravar o link sem comissão
    if (!shortUrl) {
      return NextResponse.json({ shortUrl: null, error: 'Lomadee não gerou o link de afiliado', raw: data }, { status: 502 });
    }

    return NextResponse.json({ shortUrl, raw: data });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
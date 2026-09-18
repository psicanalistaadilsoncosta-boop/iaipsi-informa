import { NextRequest, NextResponse } from 'next/server';

const API_KEY = process.env.LOMADEE_API_KEY || '';
const AWIN_AFFID = process.env.AWIN_PUBLISHER_ID || '3093907';

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

    // Caso contrário usa Lomadee
    const res = await fetch('https://api-beta.lomadee.com.br/affiliate/shortener/url', {
      method: 'POST',
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

    return NextResponse.json({ shortUrl, raw: data });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
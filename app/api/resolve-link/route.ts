import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { url } = await req.json();
  try {
    const res = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Bot/1.0)',
      },
      signal: AbortSignal.timeout(8000),
    });

    const finalUrl = res.url;
    const urlObj = new URL(finalUrl);
    const dominio = urlObj.hostname.replace('www.', '');

    // Extrai organizationId do utm_campaign se tiver
    const utmCampaign = urlObj.searchParams.get('utm_campaign') || '';
    const uuidMatch = utmCampaign.match(/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i);
    const organizationId = uuidMatch?.[1] || '';

    return NextResponse.json({ finalUrl, dominio, organizationId });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
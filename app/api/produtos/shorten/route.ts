import { NextRequest, NextResponse } from 'next/server';

const API_KEY = process.env.LOMADEE_API_KEY || '';

export async function POST(req: NextRequest) {
  try {
    const { url, organizationId } = await req.json();

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
import { NextResponse } from 'next/server';

export const revalidate = 900;

const API_KEY = process.env.LOMADEE_API_KEY || '';
const BASE_URL = 'https://api.lomadee.com.br';

async function fetchLomadee(endpoint: string) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: { 'x-api-key': API_KEY },
    signal: AbortSignal.timeout(8000),
  });
  return res.json();
}

export async function GET() {
  const results: any[] = [];

  // 1 — Campanhas ativas
  try {
    const data = await fetchLomadee('/affiliate/campaigns?limit=20');
    const campanhas = (data.data || [])
      .filter((c: any) => c.status === 'onTime' && c.channels?.[0]?.shortUrls?.[0])
      .slice(0, 4)
      .map((c: any) => ({
        tipo: 'campanha',
        id: c.id,
        titulo: c.name,
        link: c.channels[0].shortUrls[0],
        imagem: c.mediaKit?.banners?.[0] || null,
        isCupom: c.type === 'GenericCoupon' || c.type === 'PersonalCoupon',
        code: c.code || null,
        expira: c.period?.endAt || null,
      }));
    results.push(...campanhas);
  } catch {}

  // 2 — Marcas em destaque
  try {
    const data = await fetchLomadee('/affiliate/brands?limit=20');
    const marcas = (data.data || [])
      .filter((m: any) => m.network?.trait?.isHighlight && m.channels?.[0]?.shortUrls?.[0])
      .slice(0, 3)
      .map((m: any) => ({
        tipo: 'marca',
        id: m.id,
        titulo: m.name,
        link: m.channels[0].shortUrls[0],
        logo: m.logo,
        segment: m.segment,
        commission: m.commission?.value || 0,
      }));
    results.push(...marcas);
  } catch {}

   // Ordem fixa: campanhas primeiro, depois marcas
  // (embaralhar causava hydration mismatch no React)

  return NextResponse.json({ items: results });
}

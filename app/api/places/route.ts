import { NextRequest, NextResponse } from 'next/server';

const GOOGLE_KEY = process.env.GOOGLE_PLACES_API_KEY!;

const TIPOS_INTERESSE = [
  { type: 'restaurant', label: '🍽️ Restaurantes', emoji: '🍽️' },
  { type: 'cafe', label: '☕ Cafés', emoji: '☕' },
  { type: 'bakery', label: '🥐 Padarias', emoji: '🥐' },
  { type: 'bar', label: '🍺 Bares', emoji: '🍺' },
  { type: 'pharmacy', label: '💊 Farmácias', emoji: '💊' },
  { type: 'supermarket', label: '🛒 Supermercados', emoji: '🛒' },
  { type: 'atm', label: '💳 Caixas eletrônicos', emoji: '💳' },
  { type: 'subway_station', label: '🚇 Metrô', emoji: '🚇' },
];

export async function GET(req: NextRequest) {
  const destino = req.nextUrl.searchParams.get('destino');
  const raio = req.nextUrl.searchParams.get('raio') || '500';

  if (!destino) return NextResponse.json({ error: 'destino obrigatório' }, { status: 400 });
  if (!GOOGLE_KEY) return NextResponse.json({ error: 'GOOGLE_PLACES_API_KEY não configurada' }, { status: 500 });

  try {
    // 1. Geocoding: nome da cidade → lat/lng
    const geoRes = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(destino)}&key=${GOOGLE_KEY}`
    );
    const geoData = await geoRes.json();

    if (geoData.status !== 'OK' || !geoData.results?.length) {
      return NextResponse.json({ error: `Destino não encontrado: ${destino}` }, { status: 404 });
    }

    const { lat, lng } = geoData.results[0].geometry.location;
    const enderecoFormatado = geoData.results[0].formatted_address;

    // 2. Nearby Search para cada categoria
    const resultados: Record<string, any[]> = {};

    await Promise.all(
      TIPOS_INTERESSE.map(async ({ type, emoji }) => {
        const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${raio}&type=${type}&language=pt-BR&key=${GOOGLE_KEY}`;
        const res = await fetch(url);
        const data = await res.json();

        if (data.status === 'OK' && data.results?.length) {
          resultados[type] = data.results.slice(0, 5).map((p: any) => ({
            name: p.name,
            rating: p.rating || null,
            total_ratings: p.user_ratings_total || 0,
            vicinity: p.vicinity || '',
            open_now: p.opening_hours?.open_now ?? null,
            price_level: p.price_level ?? null,
            emoji,
          }));
        }
      })
    );

    return NextResponse.json({
      destino,
      enderecoFormatado,
      lat,
      lng,
      raio: parseInt(raio),
      categorias: TIPOS_INTERESSE
        .filter(t => resultados[t.type]?.length)
        .map(t => ({
          type: t.type,
          label: t.label,
          emoji: t.emoji,
          lugares: resultados[t.type],
        })),
    });

  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

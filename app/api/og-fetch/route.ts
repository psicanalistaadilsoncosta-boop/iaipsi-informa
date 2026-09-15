import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { url } = await req.json();
  if (!url) return NextResponse.json({ error: 'URL obrigatória' }, { status: 400 });

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1)',
        'Accept': 'text/html',
      },
      signal: AbortSignal.timeout(8000),
    });

    const html = await res.text();

    // Extrai Open Graph tags
    function getMeta(property: string): string {
      const m = html.match(new RegExp(`<meta[^>]+(?:property|name)=["']${property}["'][^>]+content=["']([^"']+)["']`, 'i'))
        || html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${property}["']`, 'i'));
      return m?.[1]?.trim() || '';
    }

    // Extrai preço de schema.org
    function getSchema(key: string): string {
      const m = html.match(new RegExp(`"${key}"\\s*:\\s*"?([^",}]+)"?`, 'i'));
      return m?.[1]?.trim() || '';
    }

    const titulo = getMeta('og:title') || getMeta('twitter:title');
    const imagem = getMeta('og:image') || getMeta('twitter:image');
    const descricao = getMeta('og:description') || getMeta('twitter:description');
    const preco = getSchema('price') || getSchema('lowPrice');
    const precoOriginal = getSchema('highPrice');
    const disponivel = html.includes('InStock') || html.includes('in_stock');

    return NextResponse.json({
      titulo,
      imagem,
      descricao,
      preco,
      precoOriginal,
      disponivel,
      url,
    });
  } catch (e) {
    return NextResponse.json({ error: 'Não foi possível acessar a página' }, { status: 500 });
  }
}
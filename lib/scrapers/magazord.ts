const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept-Language': 'pt-BR,pt;q=0.9',
};

// 1. Pega URLs de produtos via sitemap-produto.xml
async function getMagazordProductUrls(baseUrl: string): Promise<string[]> {
  const base = baseUrl.replace(/\/$/, '');
  try {
    const res = await fetch(`${base}/sitemap-produto.xml`, {
      headers: HEADERS,
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return [];
    const xml = await res.text();
    const urls = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => m[1]);
    return urls.filter(u => u.includes(base));
  } catch {
    return [];
  }
}

// 2. Extrai um produto via JSON-LD (Schema.org)
async function extractMagazordProduct(url: string, loja: string): Promise<any | null> {
  try {
    const res = await fetch(url, {
      headers: HEADERS,
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return null;
    const html = await res.text();

    // Procura todos os blocos JSON-LD
    const scripts = [...html.matchAll(/<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)];

    let data: any = null;
    for (const s of scripts) {
      try {
        const parsed = JSON.parse(s[1]);
        const obj = Array.isArray(parsed) ? parsed[0] : parsed;
        if (obj['@type'] === 'Product') { data = obj; break; }
      } catch {}
    }

    if (!data) return null;

    const nome = data.name || '';
    if (!nome) return null;

    const sku = data.sku || data.mpn || '';
    const imagem = Array.isArray(data.image) ? data.image[0] : (data.image || '');

    const offers = data.offers;
    let preco = 0;
    let precoOriginal = 0;
    let disponivel = false;
    let parcelas = '';
    let valorParcela = 0;

    if (offers) {
      const offerObj = Array.isArray(offers) ? offers[0] : offers;
      preco = parseFloat(offerObj.price || offerObj.lowPrice || '0') || 0;
      precoOriginal = parseFloat(offerObj.highPrice || offerObj.price || '0') || preco;
      disponivel = offerObj.availability?.includes('InStock') ?? false;
    }

    const desconto = precoOriginal > preco && preco > 0
      ? Math.round(((precoOriginal - preco) / precoOriginal) * 100)
      : 0;

    // Tenta extrair parcelas do HTML (padrão comum Magazord)
    const parcelasMatch = html.match(/(\d+)x\s+(?:de\s+)?R\$\s*([\d.,]+)/i);
    if (parcelasMatch) {
      parcelas = parcelasMatch[1];
      valorParcela = parseFloat(parcelasMatch[2].replace('.', '').replace(',', '.')) || 0;
    }

    return {
      id: `magazord-${sku || url.split('/').filter(Boolean).pop()}`,
      nome,
      imagem,
      link: url,
      linkOriginal: url,
      preco,
      precoOriginal: precoOriginal || preco,
      desconto,
      loja,
      categoria: data.category || '',
      plataforma: 'magazord',
      skuId: sku,
      disponivel,
      estoque: disponivel ? 99 : 0,
      parcelas,
      valorParcela,
    };
  } catch {
    return null;
  }
}

// 3. Orquestra (lotes de 5 com delay)
export async function fetchMagazord(baseUrl: string, limit = 500): Promise<any[]> {
  const base = baseUrl.replace(/\/$/, '');
  const loja = base.replace(/^https?:\/\//, '').replace(/^www\./, '').split('.')[0];

  const urls = await getMagazordProductUrls(base);
  if (urls.length === 0) throw new Error('Magazord: nenhum produto encontrado no sitemap.');

  const targets = urls.slice(0, limit);
  const results: any[] = [];

  for (let i = 0; i < targets.length; i += 5) {
    const batch = targets.slice(i, i + 5);
    const products = await Promise.all(batch.map(u => extractMagazordProduct(u, loja)));
    products.forEach(p => { if (p && p.preco > 0) results.push(p); });
    if (i + 5 < targets.length) await new Promise(r => setTimeout(r, 300));
  }

  return results;
}

// 4. Detecta se é Magazord via sitemap
export async function isMagazord(baseUrl: string): Promise<boolean> {
  const base = baseUrl.replace(/\/$/, '');
  try {
    const res = await fetch(`${base}/sitemap-produto.xml`, {
      headers: HEADERS,
      signal: AbortSignal.timeout(5000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

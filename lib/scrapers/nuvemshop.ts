export interface NuvemshopProduct {
  id: string;
  nome: string;
  url: string;
  imagem: string | null;
  preco: number;
  precoOriginal: number;
  desconto: number;
  disponivel: boolean;
  estoque: number;
  descricao: string | null;
  ean?: string;
}

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
  'Accept-Language': 'pt-BR,pt;q=0.9',
};

// 1. Pega URLs do sitemap
export async function getNuvemshopProductUrls(baseUrl: string): Promise<string[]> {
  const base = baseUrl.replace(/\/$/, '');
  const res = await fetch(`${base}/sitemap.xml`, { headers: HEADERS });
  if (!res.ok) return [];
  const xml = await res.text();
  const urls = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => m[1]);
  return urls.filter(u => u.includes('/produtos/') && !u.endsWith('/produtos/'));
}

// 2. Extrai um produto
export async function extractNuvemshopProduct(url: string): Promise<NuvemshopProduct | null> {
  try {
    const res = await fetch(url, { headers: HEADERS });
    if (!res.ok) return null;
    const html = await res.text();

    const nome = html.match(/<meta property="og:title" content="([^"]+)"/)?.[1];
    const imagem = html.match(/<meta property="og:image:secure_url" content="([^"]+)"/)?.[1]
                 || html.match(/<meta property="og:image" content="([^"]+)"/)?.[1];
    const descricao = html.match(/<meta property="og:description" content="([^"]+)"/)?.[1];

    if (!nome) return null;

    const variantsMatch = html.match(/data-variants="([^"]+)"/);

    let preco = 0;
    let precoOriginal = 0;
    let disponivel = true;
    let estoque = 0;
    let sku = '';

    if (variantsMatch) {
      const json = variantsMatch[1]
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>');

      const variants = JSON.parse(json);
      if (Array.isArray(variants) && variants.length > 0) {
        const precos = variants.map((v: any) => v.price_number).filter(Boolean);
        const precosOrig = variants.map((v: any) => v.compare_at_price_number).filter(Boolean);

        preco = Math.min(...precos);
        precoOriginal = Math.max(...precosOrig, preco);
        estoque = variants.reduce((sum: number, v: any) => sum + (v.stock || 0), 0);
        disponivel = variants.some((v: any) => v.available);
        sku = variants[0]?.sku || '';
      }
    }

    const desconto = precoOriginal > preco
      ? Math.round((1 - preco / precoOriginal) * 100)
      : 0;

     return {
      id: url.split('/').filter(Boolean).pop() || sku,
      ean: sku || '',
      nome,
      url,
      imagem: imagem || null,
      preco,
      precoOriginal,
      desconto,
      disponivel,
      estoque,
      descricao: descricao?.replace(/&lt;br&gt;/g, ' ').substring(0, 300) || null,
    };
  } catch {
    return null;
  }
}

// 3. Orquestra (com lotes e delay)
export async function fetchNuvemshop(
  baseUrl: string,
  limit = 500
): Promise<NuvemshopProduct[]> {
  const urls = await getNuvemshopProductUrls(baseUrl);
  const targets = urls.slice(0, limit);

  const results: NuvemshopProduct[] = [];
  for (let i = 0; i < targets.length; i += 5) {
    const batch = targets.slice(i, i + 5);
    const products = await Promise.all(batch.map(extractNuvemshopProduct));
    products.forEach(p => { if (p) results.push(p); });
    if (i + 5 < targets.length) await new Promise(r => setTimeout(r, 300));
  }

  return results;
}
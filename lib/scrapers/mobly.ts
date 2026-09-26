const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'application/json',
  'Accept-Language': 'pt-BR,pt;q=0.9',
};

const BFF = 'https://app-bff.mobly.com.br';
const BASE = 'https://www.mobly.com.br';

// 1. Detecta se é Mobly
export async function isMobly(baseUrl: string): Promise<boolean> {
  return baseUrl.includes('mobly.com.br');
}

// 2. Extrai o termo de busca da URL
// Ex: https://www.mobly.com.br/sofas/ → "sofas"
// Ex: https://www.mobly.com.br/moveis/sofas/ → "sofas"
function termoDaUrl(url: string): string {
  const path = new URL(url).pathname;
  const parts = path.split('/').filter(Boolean);
  return parts[parts.length - 1] || parts[0] || 'moveis';
}

// 3. Busca produtos via BFF (paginando de 50 em 50)
export async function fetchMobly(baseUrl: string, limit = 500): Promise<any[]> {
  const term = termoDaUrl(baseUrl);
  const results: any[] = [];
  let page = 1;

  while (results.length < limit) {
    try {
      const res = await fetch(
        `${BFF}/v1/catalog/search?term=${encodeURIComponent(term)}&page=${page}&limit=50`,
        { headers: HEADERS, signal: AbortSignal.timeout(10000) }
      );
      if (!res.ok) break;

      const data = await res.json();
      // products é um objeto { SKU: {...}, SKU: {...} }
      const productsObj = data?.data?.products || {};
      const items: any[] = Object.values(productsObj);
      const total: number = data?.data?.total || 0;

      if (items.length === 0) break;

      for (const item of items) {
        if (results.length >= limit) break;

        const nome = item.name || '';
        if (!nome) continue;

        // rawPrice = preço original (número), finalPrice = preço com desconto (string "2.804,96")
        const precoOriginal = parseFloat(item.rawPrice || '0') || 0;
        const preco = parseFloat(
          String(item.finalPrice || item.rawPrice || '0').replace(/\./g, '').replace(',', '.')
        ) || precoOriginal;

        if (preco <= 0) continue;

        const sku = item.sku || item.id || '';

        // Imagem vem completa no groupCollection[0].image.main (versão -cart.jpg)
        // Troca por -product.jpg para imagem maior
        const imgMain = (item.groupCollection?.[0]?.image?.main || '').replace('-cart.jpg', '-product.jpg');
        const imagem = imgMain
          ? (imgMain.startsWith('http') ? imgMain : `https://${imgMain}`)
          : '';

        const link = item.url
          ? `${BASE}${item.url}`
          : `${BASE}/${sku}.html`;

        const savingPct = parseInt((item.savingPercentage || '0').replace('%', '')) || 0;
        const desconto = savingPct > 0
          ? savingPct
          : (precoOriginal > preco && preco > 0
            ? Math.round(((precoOriginal - preco) / precoOriginal) * 100)
            : 0);

        const parcelas = item.installments?.count ? String(item.installments.count) : '';
        const valorParcela = parseFloat(
          (item.installments?.value || '0').replace(/\./g, '').replace(',', '.')
        ) || 0;

        results.push({
          id: `mobly-${sku}`,
          nome,
          imagem,
          link,
          linkOriginal: link,
          preco,
          precoOriginal,
          desconto,
          loja: 'mobly',
          categoria: term,
          plataforma: 'mobly',
          skuId: sku,
          disponivel: item.stockAvailable !== false,
          estoque: item.stockAvailable !== false ? 99 : 0,
          parcelas,
          valorParcela,
        });
      }

      if (results.length >= limit || page * 50 >= total) break;
      page++;

      await new Promise(r => setTimeout(r, 300));
    } catch {
      break;
    }
  }

  return results;
}

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'application/json',
  'Accept-Language': 'pt-BR,pt;q=0.9',
};

const BFF = 'https://app-bff.mobly.com.br';

// 1. Detecta se é Mobly
export async function isMobly(baseUrl: string): Promise<boolean> {
  return baseUrl.includes('mobly.com.br');
}

// 2. Extrai o termo de busca da URL
// Ex: https://www.mobly.com.br/sofas/ → "sofas"
// Ex: https://www.mobly.com.br/sala-de-estar/sofas/ → "sofas"
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
      const items: any[] = data?.data?.products || [];
      const total: number = data?.data?.total || 0;

      if (items.length === 0) break;

      for (const item of items) {
        if (results.length >= limit) break;

        const nome = item.name || item.title || '';
        if (!nome) continue;

        const rawPrice = parseFloat(
          (item.rawPrice || item.finalPrice || '0').replace(',', '.')
        ) || 0;
        const originalPrice = parseFloat(
          (item.price || item.rawPrice || '0').replace(/\./g, '').replace(',', '.')
        ) || rawPrice;

        if (rawPrice <= 0) continue;

        const sku = item.sku || item.id || '';
        const imagem = item.image?.main
          ? (item.image.main.startsWith('http') ? item.image.main : `https://${item.image.main}`)
          : '';

        const link = item.link || `https://www.mobly.com.br/${sku}.html`;

        const savingPct = parseInt((item.savingPercentage || '0').replace('%', '')) || 0;
        const desconto = savingPct > 0
          ? savingPct
          : (originalPrice > rawPrice && rawPrice > 0
            ? Math.round(((originalPrice - rawPrice) / originalPrice) * 100)
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
          preco: rawPrice,
          precoOriginal: originalPrice || rawPrice,
          desconto,
          loja: 'mobly',
          categoria: item.category || term,
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

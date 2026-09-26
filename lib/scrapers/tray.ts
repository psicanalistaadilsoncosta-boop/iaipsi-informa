const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'application/json',
  'Accept-Language': 'pt-BR,pt;q=0.9',
};

// 1. Detecta se é Tray via web_api
export async function isTray(baseUrl: string): Promise<boolean> {
  const base = baseUrl.replace(/\/$/, '');
  try {
    const res = await fetch(`${base}/web_api/products/?limit=1&page=1`, {
      headers: HEADERS,
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return false;
    const data = await res.json();
    return !!data?.paging && Array.isArray(data?.Products);
  } catch {
    return false;
  }
}

// 2. Busca todos os produtos via web_api (paginando de 50 em 50)
export async function fetchTray(baseUrl: string, limit = 500): Promise<any[]> {
  const base = baseUrl.replace(/\/$/, '');
  const loja = base.replace(/^https?:\/\//, '').replace(/^www\./, '').split('.')[0];

  const results: any[] = [];
  let page = 1;

  while (results.length < limit) {
    try {
      const res = await fetch(
        `${base}/web_api/products/?limit=50&page=${page}&available=1`,
        { headers: HEADERS, signal: AbortSignal.timeout(10000) }
      );
      if (!res.ok) break;

      const data = await res.json();
      const produtos: any[] = data?.Products || [];
      const paging = data?.paging;

      if (produtos.length === 0) break;

      for (const item of produtos) {
        if (results.length >= limit) break;

        const p = item.Product;
        if (!p) continue;

        const nome = p.name || '';
        if (!nome) continue;

        const preco = parseFloat(p.promotional_price) > 0
          ? parseFloat(p.promotional_price)
          : parseFloat(p.price || '0');

        const precoOriginal = parseFloat(p.price || '0') || preco;

        if (preco <= 0) continue;

        const desconto = precoOriginal > preco
          ? Math.round(((precoOriginal - preco) / precoOriginal) * 100)
          : 0;

        const imagem = p.ProductImage?.[0]?.https
          || p.ProductImage?.[0]?.http
          || '';

        const link = p.url?.https || p.url?.http || base;

        // Parcelas — pega a variante com mais parcelas
        const variants: any[] = p.Variant || [];
        let parcelas = '';
        let valorParcela = 0;
        if (variants.length > 0) {
          const v = variants[0];
          if (v?.max_installments && v?.installment_price) {
            parcelas = String(v.max_installments);
            valorParcela = parseFloat(v.installment_price) || 0;
          }
        }

        results.push({
          id: `tray-${p.id}`,
          nome,
          imagem,
          link,
          linkOriginal: link,
          preco,
          precoOriginal,
          desconto,
          loja,
          categoria: p.category_name || p.category_id || '',
          plataforma: 'tray',
          skuId: p.id || '',
          disponivel: p.available === '1' || p.available === true,
          estoque: parseInt(p.stock || '0') || (p.available === '1' ? 99 : 0),
          parcelas,
          valorParcela,
        });
      }

      // Verifica se há mais páginas
      if (!paging || page * 50 >= paging.total) break;
      page++;

      // Delay entre páginas
      if (results.length < limit) await new Promise(r => setTimeout(r, 300));

    } catch {
      break;
    }
  }

  return results;
}

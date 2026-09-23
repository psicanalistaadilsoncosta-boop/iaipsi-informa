export async function fetchEfacil(baseUrl: string, limit = 50): Promise<any[]> {
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  };

  // 1. Busca o buildId dinamicamente na página inicial
  let buildId = '';
  try {
    const homeRes = await fetch(baseUrl, { headers, signal: AbortSignal.timeout(8000) });
    const html = await homeRes.text();
    const match = html.match(/"buildId"\s*:\s*"([^"]+)"/);
    if (match) buildId = match[1];
  } catch {}

  if (!buildId) throw new Error('eFácil: não foi possível obter o buildId.');

  // 2. Extrai o slug da categoria a partir da URL
  // Ex: https://www.efacil.com.br/loja/departamento/Adega → slug = Adega
  const slugMatch = baseUrl.match(/\/loja\/departamento\/([^/?]+)/);
  const categoria = slugMatch ? slugMatch[1] : 'Eletrodomesticos';

  const loja = 'eFácil';
  const produtos: any[] = [];
  let pagina = 1;

  while (produtos.length < limit) {
    const apiUrl = `https://www.efacil.com.br/_next/data/${buildId}/loja/departamento/${categoria}.json`;
    const slugParam = JSON.stringify({ page: String(pagina), sortBy: 'relevance', filter: [] });

    try {
      const res = await fetch(`${apiUrl}?slug=${categoria}&slug=${encodeURIComponent(slugParam)}`, {
        headers,
        signal: AbortSignal.timeout(10000),
      });

      if (!res.ok) break;

      const data = await res.json();
      const itens: any[] = data?.pageProps?.staticResults?.produtos || [];

      if (itens.length === 0) break;

      for (const prod of itens) {
        if (produtos.length >= limit) break;

        const preco = parseFloat(
          (prod.preco?.precoPor ?? prod.preco?.precoPorText ?? '0')
            .toString()
            .replace('R$', '')
            .replace(/\./g, '')
            .replace(',', '.')
            .trim()
        );
        const precoOriginal = parseFloat(
          (prod.preco?.precoDe ?? prod.preco?.precoDeText ?? prod.preco?.precoPor ?? '0')
            .toString()
            .replace('R$', '')
            .replace(/\./g, '')
            .replace(',', '.')
            .trim()
        );

        const desconto =
          precoOriginal > preco && preco > 0
            ? Math.round(((precoOriginal - preco) / precoOriginal) * 100)
            : 0;

        const sku = prod.sku || prod.id || '';
        const slug = prod.slug || prod.url || '';

        produtos.push({
          id: `efacil-${sku}`,
          nome: prod.nome || '',
          imagem: prod.imagem || prod.imagemUrl || '',
          link: slug ? `https://www.efacil.com.br/loja/produto/${slug}` : baseUrl,
          linkOriginal: slug ? `https://www.efacil.com.br/loja/produto/${slug}` : baseUrl,
          preco,
          precoOriginal: precoOriginal || preco,
          desconto,
          organizationId: '',
          loja,
          categoria: prod.categoria || categoria,
          plataforma: 'efacil',
          skuId: sku,
          estoque: prod.disponivel === false ? 0 : 999,
        });
      }

      if (itens.length < 12) break; // página incompleta = última página
      pagina++;
    } catch {
      break;
    }
  }

  return produtos;
}
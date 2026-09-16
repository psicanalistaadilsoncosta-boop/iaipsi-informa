export async function fetchVtex(baseUrl: string, limit = 20) {
  const url = baseUrl.replace(/\/$/, '');
  const apiUrl = `${url}/api/catalog_system/pub/products/search?_from=0&_to=${limit - 1}`;

  const res = await fetch(apiUrl, {
    headers: { 'Accept': 'application/json', 'User-Agent': 'Mozilla/5.0' },
    signal: AbortSignal.timeout(10000),
  });

  if (!res.ok) throw new Error(`VTEX status ${res.status}`);
  const data = await res.json();

  return data.map((p: any) => {
    const sku = p.items?.[0];
    const seller = sku?.sellers?.[0]?.commertialOffer;
    const preco = seller?.Price || 0;
    const precoOriginal = seller?.ListPrice || preco;
    const imagem = sku?.images?.[0]?.imageUrl || p.thumbUrl || '';
       // Pega a parcela com maior número de vezes
    const installments = seller?.Installments || [];
    const parcelas = installments.reduce((max: any, inst: any) =>
      !max || inst.NumberOfInstallments > max.NumberOfInstallments ? inst : max, null);

    return {
      id: String(p.productId),
      nome: p.productName,
      imagem,
      // Evita link duplicado
      link: p.link?.startsWith('http') ? p.link : `${url}${p.link}`,
      preco,
      precoOriginal,
      desconto: precoOriginal > preco ? Math.round((1 - preco / precoOriginal) * 100) : 0,
      categoria: p.categories?.[0]?.replace(/\//g, '').trim() || '',
      loja: p.brand || '',
      disponivel: seller?.IsAvailable || false,
      estoque: seller?.AvailableQuantity || 0,
      parcelas: parcelas ? String(parcelas.NumberOfInstallments) : '',
      valorParcela: parcelas ? parcelas.Value : 0,
      skuId: sku?.itemId || String(p.productId),
      linkOriginal: p.link?.startsWith('http') ? p.link : `${url}/${p.link?.replace(/^\//, '')}`,
      plataforma: 'vtex',
    };
  });
}
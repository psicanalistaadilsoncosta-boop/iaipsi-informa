export async function fetchShopify(baseUrl: string, limit = 20) {
  const url = baseUrl.replace(/\/$/, '');
  const apiUrl = `${url}/products.json?limit=${limit}`;

  const res = await fetch(apiUrl, {
    headers: { 'Accept': 'application/json', 'User-Agent': 'Mozilla/5.0' },
    signal: AbortSignal.timeout(10000),
  });

  if (!res.ok) throw new Error(`Shopify status ${res.status}`);
  const data = await res.json();

  return (data.products || []).map((p: any) => {
    const variant = p.variants?.[0];
    const preco = parseFloat(variant?.price || '0');
    const precoOriginal = parseFloat(variant?.compare_at_price || String(preco));
    const imagem = p.images?.[0]?.src || '';

  return {
      id: String(p.id),
      ean: variant?.barcode || '',
      nome: p.title,
      imagem,
      link: `${url}/products/${p.handle}`,
      preco,
      precoOriginal,
      desconto: precoOriginal > preco ? Math.round((1 - preco / precoOriginal) * 100) : 0,
      categoria: p.product_type || '',
      loja: p.vendor || '',
      disponivel: variant?.available || false,
      estoque: 99,
      parcelas: '',
      valorParcela: 0,
      plataforma: 'shopify',
    };
  });
}
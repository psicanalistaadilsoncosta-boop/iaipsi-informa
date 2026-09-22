const UTM = '?utm_source=lomadee&utm_medium=link_generator&utm_campaign=fa41e636-e20b-42d8-9c47-c3165dc9a139_e1d43df5-8c98-4f7a-9f75-e507ecbd649c_RLZDHiCXbl2B_8hPm7VaUhbzKcGHzYEH1YM&lmdeeTracking=9015475';

interface ProdutoRaw {
  id: string;
  nome: string;
  preco: number;
  imagem: string;
  link: string;
  preco_original: number;
  desconto: number;
  loja: string;
  categoria: string;
  parcelas?: string;
  valorParcela?: string;
}

export async function fetchMiBrasil(url: string, limit = 200): Promise<ProdutoRaw[]> {
   const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
      'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
      'Accept-Encoding': 'gzip, deflate, br',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
    },
    signal: AbortSignal.timeout(15000),
  });
  const html = await res.text();

    // Extrai produtos pelos atributos data-* dos cards no HTML
  const cardRegex = /onclick="pushToDataLayer\('(\d+)',\s*'([^']+)',\s*'([^']+)',\s*'([^']+)',\s*'([^']+)'\)/g;
  const items: any[] = [];
  let cm;
  while ((cm = cardRegex.exec(html)) !== null) {
    items.push({
      item_id: cm[1],
      item_name: cm[2],
      item_brand: cm[3],
      item_category: cm[4],
      price: parseFloat(cm[5]),
    });
  }

    console.log('[mibrasil] items encontrados:', items.length);
  const idxHref = html.indexOf('href="/') + 6;
  console.log('[mibrasil] trecho href produto:', html.substring(idxHref, idxHref + 300));
  const idxImg = html.indexOf('data-src=') > -1 ? html.indexOf('data-src=') : html.indexOf('<img');
  console.log('[mibrasil] trecho imagem:', html.substring(idxImg, idxImg + 200));
  if (items.length === 0) return [];

    // Extrai slugs pelo padrão href="/slug-pID"
  const slugMap: Record<string, { slug: string; imagem: string }> = {};
  const slugRegex = /href="(\/[^"]+?-p(\d+)[^"?]*)(?:\?[^"]*)?"[^>]*>/g;
  let m;
  while ((m = slugRegex.exec(html)) !== null) {
    const slug = m[1];
    const id = m[2];
    if (id && !slugMap[id]) slugMap[id] = { slug, imagem: '' };
  }

  // Extrai imagens via data-src (lazy load)
  const imgRegex = /data-src="(https:\/\/d1r6yjixh9u0er\.cloudfront\.net\/[^"]+\.(?:webp|jpg|png))"/g;
  const imagens: string[] = [];
  let im;
  while ((im = imgRegex.exec(html)) !== null) {
    imagens.push(im[1]);
  }

  // Associa imagens aos produtos por ordem
  const ids = Object.keys(slugMap);
  ids.forEach((id, i) => {
    if (imagens[i]) slugMap[id].imagem = imagens[i];
  });

  // Extrai categoria da URL (ex: /celulares/smartphones → Smartphones)
  const pathParts = new URL(url).pathname.split('/').filter(Boolean);
  const categoriaRaw = pathParts[pathParts.length - 1] || 'Xiaomi';
  const categoria = categoriaRaw.charAt(0).toUpperCase() + categoriaRaw.slice(1);

  return items.slice(0, limit).map((item: any) => {
    const id = String(item.item_id);
    const info = slugMap[id];
    const linkProduto = info
      ? `https://www.mibrasil.com.br${info.slug}${UTM}`
      : `https://www.mibrasil.com.br${UTM}`;
    const imagem = info?.imagem || '';
    const preco = item.price || 0;

    return {
      id: `mibrasil-${id}`,
      nome: item.item_name || '',
      preco,
      preco_original: preco,
      desconto: 0,
      imagem,
      link: linkProduto,
      loja: 'MiBrasil',
      categoria,
    };
  }).filter(p => p.nome && p.preco > 0);
}
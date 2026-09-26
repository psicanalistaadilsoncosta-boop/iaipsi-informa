import { fetchVtex } from './vtex';
import { fetchShopify } from './shopify';
import { fetchMiBrasil } from './mibrasil';
import { fetchEfacil } from './efacil';
import { fetchNuvemshop, getNuvemshopProductUrls } from './nuvemshop';

const LOJAS_USD = ['italist.com'];

export async function detectAndFetch(url: string, limit = 500, isUSD = false) {
const base = url.replace(/\/$/, '');

    if (base.includes('mibrasil.com.br')) {
    const produtos = await fetchMiBrasil(url, limit);
    return { produtos, plataforma: 'mibrasil' };
  }

  if (base.includes('efacil.com.br')) {
    const produtos = await fetchEfacil(url, limit);
    return { produtos, plataforma: 'efacil' };
  }
   isUSD = isUSD || LOJAS_USD.some(d => base.includes(d));

  // Tenta Shopify
  try {
    const res = await fetch(`${base}/products.json?limit=1`, {
      signal: AbortSignal.timeout(5000),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.products) {
        const produtos = await fetchShopify(base, limit, isUSD);
        return { produtos, plataforma: 'shopify' };
      }
    }
  } catch {}

  // Tenta VTEX
  try {
    const res = await fetch(`${base}/api/catalog_system/pub/products/search?_from=0&_to=0`, {
      signal: AbortSignal.timeout(5000),
    });
    if (res.ok) {
      const produtos = await fetchVtex(base, limit);
      return { produtos, plataforma: 'vtex' };
    }
  } catch {}

    // Tenta Nuvemshop (via sitemap)
  try {
    const urls = await getNuvemshopProductUrls(base);
    if (urls.length > 0) {
      const raw = await fetchNuvemshop(base, limit);
      if (raw.length > 0) {
        const produtos = raw.map((p: any) => ({
          id: p.id,
          nome: p.nome,
          imagem: p.imagem || '',
          link: p.url,
          preco: p.preco,
          precoOriginal: p.precoOriginal,
          desconto: p.desconto,
          disponivel: p.disponivel,
          estoque: p.estoque,
          organizationId: '',
          loja: base.replace('https://', '').replace('www.', '').split('.')[0],
          categoria: '',
          plataforma: 'nuvemshop',
          skuId: p.id,
          linkOriginal: p.url,
        }));
        return { produtos, plataforma: 'nuvemshop' };
      }
    }
  } catch {}

  throw new Error('Plataforma não identificada. Loja pode usar Tray ou outra plataforma.');
}
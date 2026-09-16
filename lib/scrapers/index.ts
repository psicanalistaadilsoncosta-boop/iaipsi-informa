import { fetchVtex } from './vtex';
import { fetchShopify } from './shopify';

export async function detectAndFetch(url: string, limit = 20) {
  const base = url.replace(/\/$/, '');

  // Tenta Shopify
  try {
    const res = await fetch(`${base}/products.json?limit=1`, {
      signal: AbortSignal.timeout(5000),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.products) {
        const produtos = await fetchShopify(base, limit);
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

  throw new Error('Plataforma não identificada. Loja pode usar Tray, Nuvemshop ou outra plataforma.');
}
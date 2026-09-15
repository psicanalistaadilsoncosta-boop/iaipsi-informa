import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export const revalidate = 900;

const API_KEY = process.env.LOMADEE_API_KEY || '';
const BASE_URL = 'https://api.lomadee.com.br';

async function fetchLomadee(endpoint: string) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: { 'x-api-key': API_KEY },
    signal: AbortSignal.timeout(8000),
  });
  return res.json();
}

function extractTag(block: string, tag: string): string {
  const escapedTag = tag.replace(':', '\\:');
  const m = block.match(new RegExp(`<${escapedTag}><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${escapedTag}>`, 'i'))
    || block.match(new RegExp(`<${escapedTag}>([^<]*)<\\/${escapedTag}>`, 'i'));
  return m?.[1]?.trim() || '';
}

const CATEGORIA_MAP: Record<string, { label: string; color: string }> = {
  'Consumer Electronics': { label: 'Tecnologia', color: '#0f766e' },
  'Health & Beauty': { label: 'Saúde & Beleza', color: '#7c3aed' },
  'Food & Beverage': { label: 'Gastronomia', color: '#be185d' },
  'Sports & Entertainment': { label: 'Esportes', color: '#ea580c' },
  'Home & Garden': { label: 'Casa & Jardim', color: '#047857' },
  'Apparel & Accessories': { label: 'Moda', color: '#be185d' },
  'Luggage, Bags & Cases': { label: 'Viagens', color: '#0284c7' },
};

export async function GET() {
  const results: any[] = [];

  // 1 — Campanhas ativas
  try {
    const data = await fetchLomadee('/affiliate/campaigns?limit=20');
    const campanhas = (data.data || [])
      .filter((c: any) => c.status === 'onTime' && c.channels?.[0]?.shortUrls?.[0])
      .slice(0, 4)
      .map((c: any) => ({
        tipo: 'campanha',
        id: c.id,
        titulo: c.name,
        link: c.channels[0].shortUrls[0],
        imagem: c.mediaKit?.banners?.[0] || null,
        isCupom: c.type === 'GenericCoupon' || c.type === 'PersonalCoupon',
        code: c.code || null,
        expira: c.period?.endAt || null,
      }));
    results.push(...campanhas);
  } catch {}

  // 2 — Marcas em destaque
  try {
    const data = await fetchLomadee('/affiliate/brands?limit=20');
    const marcas = (data.data || [])
      .filter((m: any) => m.network?.trait?.isHighlight && m.channels?.[0]?.shortUrls?.[0])
      .slice(0, 3)
      .map((m: any) => ({
        tipo: 'marca',
        id: m.id,
        titulo: m.name,
        link: m.channels[0].shortUrls[0],
        logo: m.logo,
        segment: m.segment,
        commission: m.commission?.value || 0,
      }));
    results.push(...marcas);
  } catch {}

  // 3 — Produtos do Alibaba
  try {
    const filePath = path.join(process.cwd(), 'public', '');
    const xml = await fs.readFile(filePath, 'utf-8');
    const itemRegex = /<item[^>]*>([\s\S]*?)<\/item>/gi;
    const produtos: any[] = [];
    let match;
    const CATEGORIAS_PERMITIDAS = Object.keys(CATEGORIA_MAP);

    while ((match = itemRegex.exec(xml)) !== null && produtos.length < 4) {
      const block = match[1];
      const product_type = extractTag(block, 'g:product_type');
      if (!CATEGORIAS_PERMITIDAS.includes(product_type)) continue;

      const titulo = extractTag(block, 'g:title');
      const link = extractTag(block, 'g:link').replace(/&amp;/g, '&');
      const imagem = extractTag(block, 'g:image_link').replace('_200x200', '_300x300');
      const preco_str = extractTag(block, 'g:sale_price') || extractTag(block, 'g:price');
      const preco_original_str = extractTag(block, 'g:price');
      const preco = parseFloat(preco_str.replace(/[^0-9.]/g, '')) || 0;
      const preco_original = parseFloat(preco_original_str.replace(/[^0-9.]/g, '')) || preco;
      const desconto = preco_original > preco ? Math.round((1 - preco / preco_original) * 100) : 0;

      if (!titulo || !link || preco <= 0) continue;

      const cat = CATEGORIA_MAP[product_type] || { label: 'Outros', color: '#374151' };
      produtos.push({
        tipo: 'produto',
        id: extractTag(block, 'g:id'),
        titulo,
        link,
        imagem,
        preco,
        preco_original,
        desconto,
        categoria: cat.label,
        color: cat.color,
      });
    }
    results.push(...produtos);
  } catch {}

  // Embaralha para variar
  results.sort(() => Math.random() - 0.5);

  return NextResponse.json({ items: results });
}
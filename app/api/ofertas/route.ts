import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export const revalidate = 3600;

const CATEGORIAS_PERMITIDAS = [
  'Consumer Electronics',
  'Health & Beauty',
  'Food & Beverage',
  'Sports & Entertainment',
  'Home & Garden',
  'Books',
  'Education & Office Supplies',
  'Apparel & Accessories',
  'Luggage, Bags & Cases',
  'Travel',
];

const CATEGORIA_MAP: Record<string, { label: string; color: string }> = {
  'Consumer Electronics': { label: 'Tecnologia', color: '#0f766e' },
  'Health & Beauty': { label: 'Saúde & Beleza', color: '#7c3aed' },
  'Food & Beverage': { label: 'Gastronomia', color: '#be185d' },
  'Sports & Entertainment': { label: 'Esportes', color: '#ea580c' },
  'Home & Garden': { label: 'Casa & Jardim', color: '#047857' },
  'Books': { label: 'Livros', color: '#1e3a8a' },
  'Education & Office Supplies': { label: 'Educação', color: '#b45309' },
  'Apparel & Accessories': { label: 'Moda', color: '#be185d' },
  'Luggage, Bags & Cases': { label: 'Viagens', color: '#0284c7' },
  'Travel': { label: 'Viagens', color: '#0284c7' },
};

function extractTag(block: string, tag: string): string {
  const escapedTag = tag.replace(':', '\\:');
  const m = block.match(new RegExp(`<${escapedTag}><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${escapedTag}>`, 'i'))
    || block.match(new RegExp(`<${escapedTag}>([^<]*)<\\/${escapedTag}>`, 'i'));
  return m?.[1]?.trim() || '';
}

function parseItems(xml: string) {
  const itemRegex = /<item[^>]*>([\s\S]*?)<\/item>/gi;
  const items: any[] = [];
  let match;

  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1];

    const product_type = extractTag(block, 'g:product_type');
    if (!CATEGORIAS_PERMITIDAS.includes(product_type)) continue;

    const titulo = extractTag(block, 'g:title');
    const link = extractTag(block, 'g:link');
    const imagem = extractTag(block, 'g:image_link');
    const descricao = extractTag(block, 'g:description');
    const preco_str = extractTag(block, 'g:price');
    const preco_oferta_str = extractTag(block, 'g:sale_price') || preco_str;

    const preco_original = parseFloat(preco_str.replace(/[^0-9.]/g, '')) || 0;
    const preco_oferta = parseFloat(preco_oferta_str.replace(/[^0-9.]/g, '')) || preco_original;
    const desconto = preco_original > preco_oferta
      ? Math.round((1 - preco_oferta / preco_original) * 100)
      : 0;

    if (!titulo || !link || preco_oferta <= 0) continue;

    const cat = CATEGORIA_MAP[product_type] || { label: product_type, color: '#374151' };

        // Decodifica &amp; para & no link
    const linkDecoded = link.replace(/&amp;/g, '&');

    items.push({
      id: extractTag(block, 'g:id'),
      titulo,
      link: linkDecoded,
      imagem: imagem.replace('_200x200', '_300x300'),
      descricao: descricao.slice(0, 180),
      preco_original,
      preco_oferta,
      desconto,
      categoria: cat.label,
      color: cat.color,
      fonte: 'Alibaba',
    });
  }

  return items;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const categoria = searchParams.get('categoria') || 'Todas';

  try {
    const filePath = path.join(process.cwd(), 'public', 'Alibaba_2026-09-15__2_.xml');
    const xml = await fs.readFile(filePath, 'utf-8');

    let allItems = parseItems(xml);

    const categorias = ['Todas', ...Array.from(new Set(allItems.map(i => i.categoria)))];

    if (categoria !== 'Todas') {
      allItems = allItems.filter(i => i.categoria === categoria);
    }

    const items = allItems.slice(0, 24);

    return NextResponse.json({ items, categorias, total: items.length });
  } catch (e) {
    console.error('Erro no feed:', e);
    return NextResponse.json({ items: [], categorias: [], total: 0 });
  }
}

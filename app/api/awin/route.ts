import { NextRequest, NextResponse } from 'next/server';
import { createGunzip } from 'zlib';
import { parse } from 'csv-parse';
import { Readable } from 'stream';
import path from 'path';
import fs from 'fs/promises';

export const revalidate = 3600;

const FEEDS: Record<string, string> = {
  arno: process.env.AWIN_FEED_ARNO || 'arno-feed.csv',
  spicy: process.env.AWIN_FEED_SPICY || 'spicy-feed.csv',
  // adicione novos aqui
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';
  const categoria = searchParams.get('categoria') || '';
  const limit = parseInt(searchParams.get('limit') || '40');
  const loja = searchParams.get('loja') || 'arno';

  // Pega o nome do arquivo do feed
  const feedFile = FEEDS[loja] || FEEDS.arno;
  // Remove caminho se vier com public/
  const feedFileName = feedFile.replace(/^public\//, '');
  const filePath = path.join(process.cwd(), 'public', feedFileName);

  try {
    const buffer = await fs.readFile(filePath);

    const produtos = await new Promise<any[]>((resolve, reject) => {
      const records: any[] = [];
      const parser = parse({
        columns: true,
        skip_empty_lines: true,
        delimiter: ',',
        relax_quotes: true,
        trim: true,
      });

      parser.on('readable', () => {
        let record;
        while ((record = parser.read()) !== null) {
          records.push(record);
        }
      });

      parser.on('error', reject);
      parser.on('end', () => resolve(records));

      const readable = Readable.from(buffer);

      // Verifica se é gzip pelos magic bytes
      if (buffer[0] === 0x1f && buffer[1] === 0x8b) {
        const gunzip = createGunzip();
        readable.pipe(gunzip).pipe(parser);
      } else {
        readable.pipe(parser);
      }
    });

    // Filtra
    let filtrados = produtos.filter((p: any) => {
      if (p.in_stock !== 'y' && p.in_stock !== '1' && p.in_stock !== 'true') return false;
      if (!p.product_name || !p.merchant_image_url) return false;
      if (q && !p.product_name.toLowerCase().includes(q.toLowerCase()) &&
          !p.merchant_category?.toLowerCase().includes(q.toLowerCase())) return false;
      if (categoria && !p.merchant_category?.toLowerCase().includes(categoria.toLowerCase())) return false;
      return true;
    });

    const mapped = filtrados.slice(0, limit).map((p: any) => {
      const preco = parseFloat(p.search_price) || parseFloat(p.store_price) || 0;
      const precoOriginal = parseFloat(p.rrp_price) || parseFloat(p.product_price_old) || preco;
      const desconto = precoOriginal > preco ? Math.round((1 - preco / precoOriginal) * 100) : parseInt(p.savings_percent) || 0;

      return {
        id: p.aw_product_id || p.merchant_product_id,
        ean: p.ean || p.gtin || p.merchant_product_id || '',
        nome: p.product_name,
        imagem: p.aw_image_url || p.merchant_image_url || p.large_image,
        link: p.aw_deep_link,
        preco,
        precoOriginal,
        desconto,
        categoria: p.merchant_category || p.category_name,
        loja: p.merchant_name || loja,
        emEstoque: p.in_stock,
        disponivel: true,
        organizationId: `awin-${loja}`,
        estoque: parseInt(p.stock_quantity) || 99,
        parcelasTexto: p.base_price_text || '',
        displayPrice: p.display_price || '',
      };
    });

    const categorias = [...new Set(produtos
      .filter((p: any) => p.merchant_category)
      .map((p: any) => p.merchant_category)
    )].sort();

    return NextResponse.json({
      data: mapped,
      total: filtrados.length,
      categorias,
    });

  } catch (e) {
    console.error('Erro Awin:', e);
    return NextResponse.json({ error: String(e), data: [], total: 0 }, { status: 500 });
  }
}

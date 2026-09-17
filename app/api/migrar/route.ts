import { NextResponse } from 'next/server';
import { kv } from '@/lib/kv';
import fs from 'fs/promises';
import path from 'path';

export async function GET() {
  try {
    // Migra produtos pinados
    const produtosPath = path.join(process.cwd(), 'public', 'produtos-pinados.json');
    const produtosRaw = await fs.readFile(produtosPath, 'utf-8');
    const produtos = JSON.parse(produtosRaw);
    if (produtos.length > 0) await kv.set('produtos:pinados', produtos);

    // Migra editorial
    const editorialPath = path.join(process.cwd(), 'public', 'editorial.json');
    const editorialRaw = await fs.readFile(editorialPath, 'utf-8');
    const editorial = JSON.parse(editorialRaw);
    if (editorial.length > 0) await kv.set('editorial:items', editorial);

    // Migra sabores
    const saboresPath = path.join(process.cwd(), 'public', 'sabores.json');
    const saboresRaw = await fs.readFile(saboresPath, 'utf-8');
    const sabores = JSON.parse(saboresRaw);
    if (sabores.length > 0) await kv.set('sabores:items', sabores);

    return NextResponse.json({
      success: true,
      migrados: {
        produtos: produtos.length,
        editorial: editorial.length,
        sabores: sabores.length,
      }
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
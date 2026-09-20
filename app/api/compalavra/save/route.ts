import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@/lib/kv';

export interface ArtigoComPalavra {
  id: string;
  slug: string;
  titulo: string;
  conteudo: string;
  resumo: string;
  imagem?: string;
  publicado: boolean;
  destaque: boolean;
  createdAt: string;
  updatedAt: string;
}

function gerarSlug(titulo: string): string {
  return titulo
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 80);
}

export async function GET() {
  try {
    const data = await kv.get<ArtigoComPalavra[]>('artigos:compalavra');
    return NextResponse.json(data || []);
  } catch {
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const artigos = await kv.get<ArtigoComPalavra[]>('artigos:compalavra') || [];
    const agora = new Date().toISOString();

    if (body.id) {
      const idx = artigos.findIndex(a => a.id === body.id);
      if (idx === -1) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 });
      let lista = artigos;
      if (body.destaque) lista = artigos.map(a => ({ ...a, destaque: false }));
      lista[idx] = { ...lista[idx], ...body, updatedAt: agora };
      await kv.set('artigos:compalavra', lista);
      return NextResponse.json(lista[idx]);
    } else {
      const slug = gerarSlug(body.titulo || 'artigo');
      const slugFinal = artigos.some(a => a.slug === slug) ? `${slug}-${Date.now()}` : slug;
      let lista = artigos;
      if (body.destaque) lista = artigos.map(a => ({ ...a, destaque: false }));
      const novo: ArtigoComPalavra = {
        id: crypto.randomUUID(),
        slug: slugFinal,
        titulo: body.titulo || '',
        conteudo: body.conteudo || '',
        resumo: body.resumo || '',
        imagem: body.imagem || '',
        publicado: body.publicado ?? false,
        destaque: body.destaque ?? false,
        createdAt: agora,
        updatedAt: agora,
      };
      await kv.set('artigos:compalavra', [...lista, novo]);
      return NextResponse.json(novo);
    }
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    const artigos = await kv.get<ArtigoComPalavra[]>('artigos:compalavra') || [];
    await kv.set('artigos:compalavra', artigos.filter(a => a.id !== id));
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

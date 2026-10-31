import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@/lib/kv';
import { isAdmin } from '@/lib/adminAuth';

export interface ArtigoComPalavra {
  id: string;
  slug: string;
  titulo: string;
  conteudo: string;
  resumo: string;
  imagem?: string;
  publicado: boolean;
  destaque: boolean;
  categoria?: string;
  videoLupa?: string;
  videoNarrado?: string;
  publicarEm?: string;
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

// aceita data válida e guarda em ISO; qualquer outra coisa vira '' (sem agendamento)
function dataOuVazio(v: any): string {
  if (!v) return '';
  const t = new Date(String(v)).getTime();
  return isNaN(t) ? '' : new Date(t).toISOString();
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
  if (!isAdmin(req)) return NextResponse.json({ error: 'não autorizado' }, { status: 401 });
  try {
    const body = await req.json();
    const artigos = await kv.get<ArtigoComPalavra[]>('artigos:compalavra') || [];
    const agora = new Date().toISOString();

    if (body.id) {
      const idx = artigos.findIndex(a => a.id === body.id);
      if (idx === -1) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 });
      let lista = artigos;
      if (body.destaque) lista = artigos.map(a => ({ ...a, destaque: false }));
      const slugPedido = gerarSlug(String(body.slug || lista[idx].slug));
      if (!slugPedido) return NextResponse.json({ error: 'Slug vazio' }, { status: 400 });
      if (lista.some(a => a.id !== body.id && a.slug === slugPedido))
        return NextResponse.json({ error: 'Já existe outro artigo com esse slug' }, { status: 409 });
      const slugAntigo = lista[idx].slug;
      lista[idx] = { ...lista[idx], ...body, slug: slugPedido, publicarEm: dataOuVazio(body.publicarEm ?? lista[idx].publicarEm), updatedAt: agora };
      await kv.set('artigos:compalavra', lista);
      revalidatePath('/'); revalidatePath('/compalavra'); revalidatePath(`/compalavra/${slugPedido}`);
      if (slugAntigo !== slugPedido) revalidatePath(`/compalavra/${slugAntigo}`);
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
        categoria: body.categoria || 'reflexao',
        videoLupa: String(body.videoLupa || '').trim(),
        videoNarrado: String(body.videoNarrado || '').trim(),
        publicarEm: dataOuVazio(body.publicarEm),
        createdAt: agora,
        updatedAt: agora,
      };
      await kv.set('artigos:compalavra', [...lista, novo]);
      revalidatePath('/'); revalidatePath('/compalavra'); return NextResponse.json(novo);
    }
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'não autorizado' }, { status: 401 });
  try {
    const { id } = await req.json();
    const artigos = await kv.get<ArtigoComPalavra[]>('artigos:compalavra') || [];
    await kv.set('artigos:compalavra', artigos.filter(a => a.id !== id));
    revalidatePath('/'); return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

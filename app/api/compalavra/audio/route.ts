// app/api/compalavra/audio/route.ts — áudio dos artigos do Com a Palavra (só admin)
// GET  -> situação do áudio de cada artigo: { [id]: 'ok' | 'falta' | 'desatualizado' }
// POST { id } -> gera (ou refaz) o áudio do artigo e grava audioUrl no artigo
import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@/lib/kv';
import { isAdmin } from '@/lib/adminAuth';
import { gerarAudioDeTexto, textoParaFala, hashAudio } from '@/lib/audio-artigo';

export const dynamic = 'force-dynamic';
export const maxDuration = 120; // artigos longos levam alguns pedidos ao Google

const CHAVE = 'artigos:compalavra';

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'não autorizado' }, { status: 401 });
  const artigos: any[] = (await kv.get<any[]>(CHAVE)) || [];
  const situacao: Record<string, string> = {};
  for (const a of artigos) {
    if (!a.audioUrl) situacao[a.id] = 'falta';
    else if (a.audioTipo === 'gravacao') situacao[a.id] = 'ok'; // a sua gravação: o Gerenciar não mexe
    else situacao[a.id] = a.audioHash === hashAudio(textoParaFala(a.titulo, a.resumo, a.conteudo, a.categoria)) ? 'ok' : 'desatualizado';
  }
  return NextResponse.json(situacao);
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'não autorizado' }, { status: 401 });
  try {
    const { id } = await req.json();
    const artigos: any[] = (await kv.get<any[]>(CHAVE)) || [];
    const artigo = artigos.find(a => a.id === id);
    if (!artigo) return NextResponse.json({ error: 'Artigo não encontrado.' }, { status: 404 });
    if (!String(artigo.conteudo || '').trim()) return NextResponse.json({ error: 'Artigo sem conteúdo.' }, { status: 400 });
    if (artigo.audioTipo === 'gravacao') return NextResponse.json({ error: 'Este artigo tem a sua gravação. Para trocar, use /admin/audios.' }, { status: 409 });

    const audio = await gerarAudioDeTexto('compalavra', artigo.slug, textoParaFala(artigo.titulo, artigo.resumo, artigo.conteudo, artigo.categoria), artigo.audioUrl);

    // relê a lista na hora de gravar, para não desfazer uma edição feita enquanto o áudio era gerado
    const agora: any[] = (await kv.get<any[]>(CHAVE)) || [];
    const lista = agora.map(a => (a.id === id ? { ...a, ...audio, audioTipo: 'ia' } : a));
    await kv.set(CHAVE, lista);
    try { revalidatePath(`/compalavra/${artigo.slug}`); revalidatePath('/compalavra'); } catch {}
    return NextResponse.json({ ok: true, ...audio });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || String(e) }, { status: 500 });
  }
}

// app/api/audios/route.ts — áudio de Com a Palavra, Sabores e Roteiros de viagem (só admin)
// GET  -> lista de cada seção (só publicados) com a situação do áudio e o tipo ('ia' ou 'gravacao')
// POST { fonte, id }                         -> gera (ou refaz) o áudio com a voz do Google
// POST { fonte, id, forcar: true }           -> idem, mesmo que o item tenha a sua gravação
// POST { fonte, id, gravacaoUrl, segundos }  -> usa a gravação que você enviou (já está no Blob)
import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import { del } from '@vercel/blob';
import { kv } from '@/lib/kv';
import { isAdmin } from '@/lib/adminAuth';
import { gerarAudioDeTexto, hashAudio } from '@/lib/audio-artigo';
import { FONTES } from '@/lib/audio-fontes';

export const dynamic = 'force-dynamic';
export const maxDuration = 120; // textos longos levam alguns pedidos ao Google

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'não autorizado' }, { status: 401 });
  const saida: Record<string, any[]> = {};
  for (const [id, f] of Object.entries(FONTES)) {
    const itens: any[] = (await kv.get<any[]>(f.chave).catch(() => [])) || [];
    saida[id] = itens.filter(a => f.publicado(a) && String(f.texto(a) || '').length > 80).map(a => ({
      id: a.id,
      titulo: f.titulo(a),
      publicado: f.publicado(a),
      link: f.caminhos(a)[0],
      situacao: !a.audioUrl ? 'falta' : a.audioHash === hashAudio(f.texto(a)) ? 'ok' : 'desatualizado',
      tipo: a.audioUrl ? (a.audioTipo === 'gravacao' ? 'gravacao' : 'ia') : '',
      caracteres: f.texto(a).length,
    }));
  }
  return NextResponse.json(saida);
}

const gravacaoValida = (u: string) => {
  try { const x = new URL(u); return x.protocol === 'https:' && x.hostname.endsWith('.blob.vercel-storage.com') && x.pathname.startsWith('/audios/'); }
  catch { return false; }
};

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'não autorizado' }, { status: 401 });
  try {
    const { fonte, id, forcar, gravacaoUrl, segundos } = await req.json();
    const f = FONTES[fonte];
    if (!f) return NextResponse.json({ error: 'Seção desconhecida.' }, { status: 400 });
    const itens: any[] = (await kv.get<any[]>(f.chave)) || [];
    const item = itens.find(a => String(a.id) === String(id));
    if (!item) return NextResponse.json({ error: 'Item não encontrado.' }, { status: 404 });

    let audio: Record<string, any>;
    if (gravacaoUrl) {
      // a sua gravação: o arquivo já subiu direto do navegador para o Blob
      if (!gravacaoValida(gravacaoUrl)) return NextResponse.json({ error: 'Endereço da gravação inválido.' }, { status: 400 });
      audio = {
        audioUrl: gravacaoUrl,
        audioHash: hashAudio(f.texto(item)), // fica "desatualizado" se você mudar o texto depois
        audioSegundos: Math.max(0, Math.round(Number(segundos) || 0)),
        audioEm: new Date().toISOString(),
        audioTipo: 'gravacao',
      };
      if (item.audioUrl && item.audioUrl !== gravacaoUrl) { try { await del(item.audioUrl); } catch {} }
    } else {
      if (item.audioTipo === 'gravacao' && !forcar)
        return NextResponse.json({ error: 'Este texto tem a sua gravação.', codigo: 'gravacao' }, { status: 409 });
      audio = { ...(await gerarAudioDeTexto(f.pasta, f.arquivo(item), f.texto(item), item.audioUrl)), audioTipo: 'ia' };
    }

    // relê a lista na hora de gravar, para não desfazer uma edição feita enquanto o áudio era preparado
    const agora: any[] = (await kv.get<any[]>(f.chave)) || [];
    await kv.set(f.chave, agora.map(a => (String(a.id) === String(id) ? { ...a, ...audio } : a)));
    try { for (const c of f.caminhos(item)) revalidatePath(c); } catch {}
    return NextResponse.json({ ok: true, ...audio });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || String(e) }, { status: 500 });
  }
}

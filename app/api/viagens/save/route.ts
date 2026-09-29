import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@/lib/kv';
import { isAdmin } from '@/lib/adminAuth';

const KV_KEY = 'artigos:viagens';

// ─── GET — lista todos os pinados ─────────────────────────────────────────────
export async function GET() {
  try {
    const artigos = await kv.get<any[]>(KV_KEY) || [];
    return NextResponse.json(artigos);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

// ─── POST — cria ou atualiza um passeio pinado ────────────────────────────────
export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'não autorizado' }, { status: 401 });
  try {
    const payload = await req.json();
    const { id } = payload;
    if (!id) return NextResponse.json({ error: 'id obrigatório' }, { status: 400 });

    const artigos = await kv.get<any[]>(KV_KEY) || [];
    const idx = artigos.findIndex(a => a.id === id);

    if (idx >= 0) {
      // Atualiza preservando campos não enviados
      artigos[idx] = { ...artigos[idx], ...payload };
    } else {
      artigos.unshift({ ...payload, pinedAt: payload.pinedAt || new Date().toISOString() });
    }

    await kv.set(KV_KEY, artigos);
    revalidatePath('/'); return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

// ─── DELETE — remove um passeio pinado ───────────────────────────────────────
export async function DELETE(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'não autorizado' }, { status: 401 });
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: 'id obrigatório' }, { status: 400 });

    const artigos = await kv.get<any[]>(KV_KEY) || [];
    const filtrados = artigos.filter(a => a.id !== id);
    await kv.set(KV_KEY, filtrados);
    revalidatePath('/'); return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

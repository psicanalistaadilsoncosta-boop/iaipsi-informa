// app/api/admin/importar-categoria/salvar/route.ts
// GET  -> deeplinks já guardados por loja (para não colar de novo)
// POST { produtos, deeplink, loja, origem } -> coloca os produtos em "A catalogar" (produtos:pinados)
import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { kv } from '@/lib/kv';
import { isAdmin } from '@/lib/adminAuth';
import { linkAfiliadoOk } from '@/lib/links-afiliados';
import { lerTodos, salvarVarios } from '@/lib/pinados';

export const dynamic = 'force-dynamic';
const CHAVE_DEEPLINKS = 'importar:deeplinks';

// "https://apretailer.com.br/click/XXX/360672/subaccount/url=https%3A..." -> ".../click/XXX/360672/comlupa/url="
function baseDoDeeplink(exemplo: string): string | null {
  const m = String(exemplo || '').match(/^(https?:\/\/[^\s]*?(?:url=|ued=|murl=))/i);
  if (!m) return null;
  return m[1].replace('/subaccount/', '/comlupa/');
}

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'não autorizado' }, { status: 401 });
  return NextResponse.json((await kv.get(CHAVE_DEEPLINKS)) || {});
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'não autorizado' }, { status: 401 });
  const { produtos, deeplink, loja, origem } = await req.json();
  const base = baseDoDeeplink(deeplink);
  if (!base) return NextResponse.json({ error: 'Deeplink de exemplo inválido: ele precisa terminar com url=, ued= ou murl= seguido do endereço.' }, { status: 400 });
  if (!Array.isArray(produtos) || !produtos.length) return NextResponse.json({ error: 'Nenhum produto selecionado.' }, { status: 400 });

  const pinados: any[] = await lerTodos();
  const jaTem = new Set(pinados.map(p => p.urlLoja || p.link));
  const paraSalvar: any[] = [];
  let novos = 0, repetidos = 0, recusados = 0;

  for (const p of produtos.slice(0, 200)) {
    const urlLoja = String(p.url || '');
    const link = base + encodeURIComponent(urlLoja);
    if (!linkAfiliadoOk(link)) { recusados++; continue; }
    if (jaTem.has(urlLoja) || jaTem.has(link)) { repetidos++; continue; }
    jaTem.add(urlLoja);
      paraSalvar.push({
      id: 'imp-' + crypto.createHash('sha1').update(urlLoja).digest('hex').slice(0, 16),
      nome: String(p.nome || '').slice(0, 160),
      preco: Number(p.preco) || 0,
      imagem: String(p.imagem || ''),
      link,
      urlLoja,
      loja: String(loja || '').slice(0, 60),
      lojaNome: String(loja || '').slice(0, 60),
      aCatalogar: true,
      importadoDe: String(origem || '').slice(0, 500),
      importadoEm: new Date().toISOString(),
    });
    novos++;
  }

  await salvarVarios(paraSalvar);
  // guarda o deeplink desta loja para a próxima vez
  try {
    const host = new URL(String(origem)).hostname.replace(/^www\./, '');
    const mapa: Record<string, string> = (await kv.get(CHAVE_DEEPLINKS)) || {};
    mapa[host] = String(deeplink);
    await kv.set(CHAVE_DEEPLINKS, mapa);
  } catch {}
  revalidatePath('/');
  return NextResponse.json({ ok: true, novos, repetidos, recusados });
}

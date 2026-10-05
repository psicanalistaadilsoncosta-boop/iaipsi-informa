// app/api/admin/importar-categoria/origens/route.ts
// GET   -> páginas importadas (com quantos produtos cada uma tem pinados agora)
// PATCH { id, ativo?, pag2?, paginas? } -> liga/desliga a atualização diária, ajusta página 2 e nº de páginas
import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/adminAuth';
import { lerTodos } from '@/lib/pinados';
import { lerOrigens, salvarOrigens, idOrigem, Origem } from '@/lib/importa-origens';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'não autorizado' }, { status: 401 });
  const origens = await lerOrigens();

  // confere com os produtos pinados: acha páginas importadas antes deste registro existir
  // e acerta a lista de ids (tira os que você apagou no admin)
  const todos = await lerTodos();
  const porOrigem: Record<string, { ids: string[]; loja: string }> = {};
  for (const p of todos) {
    if (!p?.importadoDe) continue;
    const id = idOrigem(p.importadoDe);
    (porOrigem[id] ||= { ids: [], loja: p.loja || p.lojaNome || '' }).ids.push(String(p.id));
    if (!origens[id]) {
      origens[id] = { id, loja: p.loja || p.lojaNome || '', pag1: String(p.importadoDe).trim(), pag2: '', paginas: 1, ativo: false, ids: [], sumidos: {} };
    }
  }
  for (const o of Object.values(origens)) {
    const agora = new Set(porOrigem[o.id]?.ids || []);
    // os que estavam na lista e não existem mais = você apagou -> não trazer de volta
    const apagados = (o.ids || []).filter(id => !agora.has(id));
    if (apagados.length) o.ignorados = [...new Set([...(o.ignorados || []), ...apagados])];
    o.ids = [...agora];
    if (!o.loja && porOrigem[o.id]) o.loja = porOrigem[o.id].loja;
  }
  await salvarOrigens(origens);

  const lista = Object.values(origens)
    .map(o => ({ id: o.id, loja: o.loja, pag1: o.pag1, pag2: o.pag2, paginas: o.paginas, ativo: o.ativo, produtos: o.ids.length, ultima: o.ultima || null, erro: o.erro || '', resumo: o.resumo || '' }))
    .sort((a, b) => (a.loja + a.pag1).localeCompare(b.loja + b.pag1));
  return NextResponse.json(lista);
}

export async function PATCH(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'não autorizado' }, { status: 401 });
  const { id, ativo, pag2, paginas } = await req.json();
  const origens = await lerOrigens();
  const o: Origem | undefined = origens[String(id)];
  if (!o) return NextResponse.json({ error: 'página não encontrada' }, { status: 404 });
  if (typeof ativo === 'boolean') o.ativo = ativo;
  if (typeof pag2 === 'string') {
    const limpo = pag2.trim();
    if (limpo) { try { new URL(limpo); } catch { return NextResponse.json({ error: 'Link da página 2 inválido.' }, { status: 400 }); } }
    o.pag2 = limpo;
  }
  if (paginas != null) o.paginas = Math.min(Math.max(Number(paginas) || 1, 1), 5);
  await salvarOrigens(origens);
  return NextResponse.json({ ok: true });
}

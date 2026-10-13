// app/api/admin/importar-categoria/route.ts
// POST { pagina1, pagina2?, paginas } -> lista os produtos encontrados (não grava nada)
import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/adminAuth';
import { lerCategoria } from '@/lib/importa-categoria';
import { lerOrigens, idImportado } from '@/lib/importa-origens';

// Lista que veio do coletor (public/coletor.js), rodado no navegador do admin numa loja que bloqueia o servidor (403)
function listaColada(c: any, pagina1: string) {
  const hostDe = (u: string) => { try { return new URL(u).hostname.replace(/^www\./, ''); } catch { return ''; } };
  const h = hostDe(pagina1);
  if (c?.coletor !== 'comlupa' || !Array.isArray(c.produtos) || !h) return { status: 'erro', mensagem: 'A lista colada não veio do coletor.', avisos: [] };
  const vistos = new Set<string>();
  const produtos: any[] = [];
  for (const p of c.produtos.slice(0, 3000)) {
    const url = String(p?.url || '');
    if (hostDe(url) !== h || vistos.has(url)) continue; // só links da própria loja
    const nome = String(p?.nome || '').replace(/\s+/g, ' ').trim().slice(0, 200);
    if (!nome) continue;
    vistos.add(url);
    const imagem = /^https:\/\//.test(String(p?.imagem || '')) ? String(p.imagem) : '';
    produtos.push({ nome, url, imagem, preco: Number(p?.preco) || 0, esgotado: !!p?.esgotado });
  }
  if (!produtos.length) return { status: 'sem-dados', mensagem: 'A lista colada não tem produtos desta loja.', avisos: [] };
  const quando = c.coletadoEm ? new Date(c.coletadoEm).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '';
  return { status: 'ok', produtos, paginasLidas: Number(c.paginasLidas) || 1, avisos: [`Lista do coletor, lida no seu navegador${quando ? ' em ' + quando : ''}.`] };
}

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'não autorizado' }, { status: 401 });
  const { pagina1, pagina2, paginas, colado } = await req.json();
  try { new URL(String(pagina1)); } catch { return NextResponse.json({ status: 'erro', mensagem: 'Link da categoria inválido.', avisos: [] }); }
   const r: any = colado ? listaColada(colado, String(pagina1)) : await lerCategoria(String(pagina1), String(pagina2 || ''), Number(paginas) || 1);
  // marca o que já foi importado antes (vem desmarcado na tela)
  if (r.status === 'ok') {
    try {
      const origens = await lerOrigens();
      const jaTem = new Set(Object.values(origens).flatMap((o: any) => o.ids || []).map(String));
      r.produtos = r.produtos.map((p: any) => ({ ...p, jaNoSite: jaTem.has(String(idImportado(p.url))) }));
    } catch {}
  }
  return NextResponse.json(r);
}

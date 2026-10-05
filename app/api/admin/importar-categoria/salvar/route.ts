// app/api/admin/importar-categoria/salvar/route.ts
// GET  -> deeplinks já guardados por loja (para não colar de novo)
// POST { produtos, deeplink, loja, origem, pagina2, paginas } -> coloca os produtos em "A catalogar"
//   e registra a página em importar:origens (para a atualização diária, que começa desligada)
import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { kv } from '@/lib/kv';
import { isAdmin } from '@/lib/adminAuth';
import { linkAfiliadoOk } from '@/lib/links-afiliados';
import { lerTodos, salvarVarios } from '@/lib/pinados';
import { lerOrigens, salvarOrigens, idOrigem, idImportado, baseDoDeeplink } from '@/lib/importa-origens';

export const dynamic = 'force-dynamic';
const CHAVE_DEEPLINKS = 'importar:deeplinks';

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'não autorizado' }, { status: 401 });
  return NextResponse.json((await kv.get(CHAVE_DEEPLINKS)) || {});
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'não autorizado' }, { status: 401 });
  const { produtos, deeplink, loja, origem, pagina2, paginas } = await req.json();
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
      id: idImportado(urlLoja),
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
  // registra a página importada (a atualização diária começa desligada; liga na tela de importar)
  try {
    const pag1 = String(origem || '').trim();
    if (pag1) {
      const origens = await lerOrigens();
      const id = idOrigem(pag1);
      const antes = origens[id];
      origens[id] = {
        id,
        loja: String(loja || antes?.loja || '').slice(0, 60),
        pag1,
        pag2: String(pagina2 || antes?.pag2 || '').trim(),
        paginas: Math.min(Math.max(Number(paginas) || antes?.paginas || 1, 1), 5),
        ativo: antes?.ativo ?? false,
        ids: [...new Set([...(antes?.ids || []), ...paraSalvar.map(p => p.id)])],
        sumidos: antes?.sumidos || {},
        // importou de novo de propósito: esses deixam de ser ignorados
        ignorados: (antes?.ignorados || []).filter(id => !paraSalvar.some(p => p.id === id)),
        ultima: antes?.ultima,
        erro: antes?.erro,
        resumo: antes?.resumo,
      };
      await salvarOrigens(origens);
    }
  } catch {}
  // loja marcada como "sem deeplink" (o clique cai na página inicial): avisa
  let aviso = '';
  try {
    const modelos: Record<string, { nome?: string; prefixo?: string; semDeeplink?: boolean }> = (await kv.get('actionpay:deeplinks')) || {};
    const m = Object.values(modelos).find(v => v?.semDeeplink && v.prefixo && base.startsWith(v.prefixo));
    if (m) aviso = `${m.nome || 'Esta loja'} não aceita link direto para o produto: quem clicar vai cair na página inicial da loja. O melhor é usar um cartão da loja.`;
  } catch {}
  revalidatePath('/');
  return NextResponse.json({ ok: true, novos, repetidos, recusados, aviso });
}

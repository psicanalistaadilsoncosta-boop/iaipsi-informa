// app/api/cron/atualiza-importados/route.ts
//
// Roda 1x por dia (vercel.json). Atualiza SÓ as páginas importadas pela tela
// "Importar categoria" que estão com "Atualizar todo dia" ligado (importar:origens).
//
// Para cada página ligada:
//  - relê a página na loja (mesmo leitor da tela de importar)
//  - produto que já existe: atualiza preço, foto e nome (grava só se mudou; vitrine não muda)
//  - produto novo: vai para a vitrine dos irmãos (se todos estão na mesma) ou para "A catalogar"
//  - produto que sumiu/esgotou: sai do ar depois de 2 dias seguidos
//  - produto que você apagou no admin, ou não marcou ao importar, NÃO volta
//  - na primeira leitura de cada página, não traz nada novo: só anota o que já existia na loja
// Proteções: se a loja bloquear, der erro ou trouxer menos da metade dos produtos, não remove nada.
//
// Proteção de acesso: header Authorization: Bearer <CRON_SECRET>

import { NextRequest, NextResponse } from 'next/server';
import { avisarMudanca } from '@/lib/revalidar';
import { kv } from '@/lib/kv';
import { lerCategoria } from '@/lib/importa-categoria';
import { lerIds, salvarVarios, removerVarios } from '@/lib/pinados';
import { linkAfiliadoOk } from '@/lib/links-afiliados';
import { lerOrigens, salvarOrigens, idImportado, baseDoDeeplink, vitrineDosIrmaos, Origem } from '@/lib/importa-origens';
import { orgLomadee, encurtarLomadee } from '@/lib/lomadee';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const DIAS_PARA_REMOVER = 2;
const LIMITE_TEMPO_MS = 45_000; // para antes do limite da Vercel; o que faltar fica para amanhã

function host(u: string) { try { const x = new URL(u); const h = x.hostname.replace(/^www\./, ''); return /\.xml$/i.test(x.pathname) ? h + x.pathname : h; } catch { return ''; } }

async function atualizarOrigem(o: Origem, deeplinks: Record<string, string>) {
  const r = await lerCategoria(o.pag1, o.pag2 || '', o.paginas || 1);
  if (r.status !== 'ok') return { erro: r.mensagem, resumo: 'nada foi alterado' };

  const lidos = new Map(r.produtos.filter(p => !p.esgotado).map(p => [p.url, p]));
  const existentes = await lerIds(o.ids || []);
  // estavam na lista e não existem mais = você apagou no admin -> não trazer de volta
  const vivos = new Set(existentes.map(p => String(p.id)));
  const ignorados = new Set([...(o.ignorados || []), ...(o.ids || []).filter(id => !vivos.has(id))]);
  const primeiraVez = !o.ultima;
  const existentesPorUrl = new Map(existentes.map(p => [String(p.urlLoja || ''), p]));

  // loja trouxe bem menos produtos que antes: pode ser falha passageira -> não remove nada hoje
  const seguroRemover = existentes.length === 0 || lidos.size >= existentes.length / 2;

  const agora = new Date().toISOString();
  const paraSalvar: any[] = [];
  const paraRemover: string[] = [];
  const sumidos: Record<string, number> = {};
  let mudaram = 0;

  // 1. produtos que já existem
  for (const p of existentes) {
    const id = String(p.id);
    const lido = lidos.get(String(p.urlLoja || ''));
    if (lido) {
      const novo = { ...p };
      let mudou = false;
      if (lido.preco && lido.preco !== p.preco) { novo.preco = lido.preco; mudou = true; }
      if (lido.imagem && lido.imagem !== p.imagem) { novo.imagem = lido.imagem; mudou = true; }
      if (lido.nome && lido.nome !== p.nome) { novo.nome = lido.nome; mudou = true; }
      if (mudou) { novo.atualizadoEm = agora; paraSalvar.push(novo); mudaram++; }
    } else if (seguroRemover) {
      const dias = (o.sumidos?.[id] || 0) + 1;
      if (dias >= DIAS_PARA_REMOVER) paraRemover.push(id);
      else sumidos[id] = dias;
    } else if (o.sumidos?.[id]) {
      sumidos[id] = o.sumidos[id]; // mantém a contagem, sem somar
    }
  }

  // 2. produtos novos
  const modelo = deeplinks[host(o.pag1)] || '';
  const org = orgLomadee(modelo);
  const base = org ? '' : (baseDoDeeplink(modelo) || '');
  const vitrine = vitrineDosIrmaos(existentes);
  let novos = 0, semDeeplink = 0, anotados = 0;
  for (const [url, lido] of lidos) {
    if (existentesPorUrl.has(url)) continue;
    const idNovo = idImportado(url);
    if (ignorados.has(idNovo)) continue;
    // primeira leitura: o que já estava na loja e você não importou fica de fora
    if (primeiraVez) { ignorados.add(idNovo); anotados++; continue; }
       if (!base && !org) { semDeeplink++; continue; }
    const link = org ? ((await encurtarLomadee(org, url).catch(() => null)) || '') : base + encodeURIComponent(url);
    if (!link || !linkAfiliadoOk(link)) continue;
    paraSalvar.push({
      id: idNovo,
      nome: String(lido.nome || '').slice(0, 160),
      preco: Number(lido.preco) || 0,
      imagem: String(lido.imagem || ''),
      link,
      urlLoja: url,
      loja: o.loja,
      lojaNome: o.loja,
      importadoDe: o.pag1,
      importadoEm: agora,
      ...(vitrine ? { ...vitrine, aCatalogar: false } : { aCatalogar: true }),
    });
    novos++;
  }

  if (paraSalvar.length) await salvarVarios(paraSalvar);
  if (paraRemover.length) await removerVarios(paraRemover);

  const removidos = new Set(paraRemover);
  o.ids = [...new Set([...(o.ids || []).filter(id => !removidos.has(id)), ...paraSalvar.map(p => String(p.id))])];
  o.sumidos = sumidos;
  o.ignorados = [...ignorados];

  const partes = [`${mudaram} atualizados`, `${novos} novos${novos ? (vitrine ? ' (na vitrine dos irmãos)' : ' (em A catalogar)') : ''}`, `${paraRemover.length} removidos`];
  if (anotados) partes.push(`primeira leitura: ${anotados} produtos que você não importou ficam de fora`);
  if (!seguroRemover) partes.push('loja trouxe poucos produtos: nada removido hoje');
  if (semDeeplink) partes.push(`${semDeeplink} novos ignorados: falta o deeplink da loja`);
  return { erro: '', resumo: partes.join(', ') };
}

export async function GET(req: NextRequest) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const inicio = Date.now();
  const origens = await lerOrigens();
  const deeplinks: Record<string, string> = (await kv.get<Record<string, string>>('importar:deeplinks')) || {};

  // as que estão há mais tempo sem atualizar vão primeiro
  const ligadas = Object.values(origens).filter(o => o.ativo)
    .sort((a, b) => (a.ultima || '').localeCompare(b.ultima || ''));

  const resultados: Record<string, string> = {};
  let feitas = 0;
  for (const o of ligadas) {
    if (Date.now() - inicio > LIMITE_TEMPO_MS) { resultados[o.loja + ' · ' + o.pag1] = 'ficou para amanhã (tempo)'; continue; }
    try {
      const r = await atualizarOrigem(o, deeplinks);
      o.erro = r.erro;
      o.resumo = r.resumo;
    } catch (e: any) {
      o.erro = String(e?.message || e);
      o.resumo = 'nada foi alterado';
    }
    o.ultima = new Date().toISOString();
    resultados[o.loja + ' · ' + o.pag1] = o.erro ? `ERRO: ${o.erro}` : o.resumo || '';
    feitas++;
    await salvarOrigens(origens); // salva a cada página, para não perder o que já foi feito
  }

  if (feitas) avisarMudanca();
  return NextResponse.json({ ok: true, paginasLigadas: ligadas.length, feitas, resultados });
}

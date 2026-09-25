// app/api/cron/atualiza-lojas/route.ts
//
// Roda diariamente via Vercel Cron (vercel.json).
// Para cada loja com cron.ativo = true, verifica se é hora de atualizar
// (baseado em frequencia + ultimaAtualizacao), faz o scrape, remove os
// produtos pinados antigos dessa loja e pina os novos.
//
// Proteção: header Authorization: Bearer <CRON_SECRET>

import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@/lib/kv';

interface LojaCron {
  ativo: boolean;
  frequencia: 'diario' | '2dias' | 'semanal';
  destino: string;
  limite?: number;
  ultimaAtualizacao: string | null;
}

interface LojaLomadee {
  tipo: 'lomadee';
  nome: string;
  url: string;
  moedaUSD?: boolean;
  cron?: LojaCron;
  ambiente?: string;
  tipoAmbiente?: string;
  momento?: string;
  tipoMomento?: string;
  vistaSe?: boolean;
  tipoVistaSe?: string;
  beleza?: boolean;
  tipoBeleza?: string;
 }

interface LojaAwin {
  tipo: 'awin';
  nome: string;
  url: string;
  anuncianteId: string;
  moedaUSD?: boolean;
  cron?: LojaCron;
  ambiente?: string;
  tipoAmbiente?: string;
  momento?: string;
  tipoMomento?: string;
  vistaSe?: boolean;
  tipoVistaSe?: string;
  beleza?: boolean;
  tipoBeleza?: string;
 }

type Loja = LojaLomadee | LojaAwin;

interface ProdutoPinado {
  id: string;
  nome: string;
  imagem: string;
  link: string;
  linkOriginal?: string;
  preco: number;
  precoOriginal: number;
  desconto: number;
  organizationId: string;
  estoque: number;
  loja?: string;
  pinedAt: string;
  destinos: string[];
  parcelas?: string;
  valorParcela?: string;
  ativo?: boolean;
  aCatalogar?: boolean;
  lojaNome?: string;
}

const LOJAS_KEY = 'lojas:cadastradas';
const PINADOS_KEY = 'produtos:pinados';
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://informa.iaipsi.com';

function diasDesdeUltima(ultimaAtualizacao: string | null): number {
  if (!ultimaAtualizacao) return 999;
  const diff = Date.now() - new Date(ultimaAtualizacao).getTime();
  return diff / (1000 * 60 * 60 * 24);
}

function precisaAtualizar(cron: LojaCron): boolean {
  const dias = diasDesdeUltima(cron.ultimaAtualizacao);
  if (cron.frequencia === 'diario') return dias >= 1;
  if (cron.frequencia === '2dias') return dias >= 2;
  if (cron.frequencia === 'semanal') return dias >= 7;
  return false;
}

async function scrapeLojaLomadee(loja: LojaLomadee, limite = 20): Promise<any[]> {
  try {
    // Tenta identificar orgId da loja via brands-categoria
    let orgId = '';
    try {
      const brandsRes = await fetch(`${BASE_URL}/api/lomadee?tipo=brands-categoria`);
      const brandsJson = await brandsRes.json();
      const dominio = new URL(loja.url).hostname.replace('www.', '');
      const marca = (brandsJson.data || []).find((m: any) =>
        m.site && m.site.replace('www.', '').replace('https://', '').includes(dominio)
      );
      orgId = marca?.id || '';
    } catch {}

    const params = new URLSearchParams({ url: loja.url, limit: String(limite) });
    if (orgId) params.set('orgId', orgId);
    const res = await fetch(`${BASE_URL}/api/scrape?${params}`);
    const json = await res.json();
    return json.data || [];
  } catch {
    return [];
  }
}

async function scrapeLojaAwin(loja: LojaAwin, limite = 20): Promise<any[]> {
  try {
    const params = new URLSearchParams({ url: loja.url, limit: String(limite), orgId: loja.anuncianteId });
    const res = await fetch(`${BASE_URL}/api/scrape?${params}`);
    const json = await res.json();
    return json.data || [];
  } catch {
    return [];
  }
}

async function gerarLinkAfiliado(produto: any): Promise<string> {
  try {
    const res = await fetch(`${BASE_URL}/api/produtos/shorten`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: produto.link, organizationId: produto.organizationId }),
    });
    const data = await res.json();
    return data.shortUrl || produto.link;
  } catch {
    return produto.link;
  }
}

export async function GET(req: NextRequest) {
  // Verifica autorização do cron
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const lojas = (await kv.get<Loja[]>(LOJAS_KEY)) || [];
  const pinados = (await kv.get<ProdutoPinado[]>(PINADOS_KEY)) || [];

  const lojasParaAtualizar = lojas.filter(l => l.cron?.ativo && precisaAtualizar(l.cron));

  if (lojasParaAtualizar.length === 0) {
    return NextResponse.json({ ok: true, mensagem: 'Nenhuma loja para atualizar agora.' });
  }

  const resultados: Record<string, { removidos: number; pinados: number; erro?: string }> = {};
  let pinadosAtualizados = [...pinados];

  for (const loja of lojasParaAtualizar) {
    try {
      const cron = loja.cron!;

      // 1. Scrape produtos
      const limiteConfigured = cron.limite || 20;
      let produtos: any[] = [];
      if (loja.tipo === 'lomadee') {
        produtos = await scrapeLojaLomadee(loja as LojaLomadee, limiteConfigured);
      } else {
        produtos = await scrapeLojaAwin(loja as LojaAwin, limiteConfigured);
      }

      if (produtos.length === 0) {
        resultados[loja.nome] = { removidos: 0, pinados: 0, erro: 'Sem produtos retornados pelo scrape' };
        continue;
      }

        // 2. Separa: catalogados (têm categoria) vs a_catalogar desta loja
      const dominioLoja = new URL(loja.url).hostname.replace('www.', '');

      const temCategoria = (p: any) =>
        p.ambiente || p.momento || p.vistaSe || p.beleza || p.mercado;

      const isDaLoja = (p: any) => {
        const link = p.linkOriginal || p.link || '';
        try { return new URL(link).hostname.replace('www.', '') === dominioLoja; }
        catch { return false; }
      };

      // Remove apenas os "a_catalogar" desta loja (catalogados ficam intactos)
      const removidos = pinadosAtualizados.filter(p => isDaLoja(p) && !temCategoria(p));
      pinadosAtualizados = pinadosAtualizados.filter(p => !(isDaLoja(p) && !temCategoria(p)));

      // Catalogados desta loja (para match automático)
      const catalogadosDaLoja = pinadosAtualizados.filter(p => isDaLoja(p) && temCategoria(p));

      // Função de similaridade simples por palavras do título
      function similaridade(a: string, b: string): number {
        const palavras = (s: string) => s.toLowerCase().replace(/[^a-z0-9 ]/g, '').split(/\s+/).filter(w => w.length > 3);
        const pa = new Set(palavras(a));
        const pb = palavras(b);
        if (pa.size === 0 || pb.length === 0) return 0;
        const comuns = pb.filter(w => pa.has(w)).length;
        return comuns / Math.max(pa.size, pb.length);
      }

      // 3. Pina novos produtos
      const novos: ProdutoPinado[] = [];
      const limite = Math.min(produtos.length, limiteConfigured);
      for (let i = 0; i < limite; i++) {
        const produto = produtos[i];
        const linkAfiliado = await gerarLinkAfiliado(produto);

        // Tenta match com catalogado existente (similaridade > 0.5)
        let matchIdx = -1;
        let melhorScore = 0.5;
        for (let j = 0; j < catalogadosDaLoja.length; j++) {
          const score = similaridade(produto.nome || '', catalogadosDaLoja[j].nome || '');
          if (score > melhorScore) { melhorScore = score; matchIdx = j; }
        }

        if (matchIdx >= 0) {
          // Match encontrado: substitui o catalogado preservando a categoria
          const antigo = catalogadosDaLoja[matchIdx];
          const atualizado = {
            ...antigo,
            nome: produto.nome,
            imagem: produto.imagem,
            preco: produto.preco,
            precoOriginal: produto.precoOriginal,
            desconto: produto.desconto,
            parcelas: produto.parcelas,
            valorParcela: produto.valorParcela,
            link: linkAfiliado,
            linkOriginal: produto.link,
            pinedAt: new Date().toISOString(),
            ...(loja.moedaUSD ? { moedaUSD: true } : {}),
          };
          // Substitui no array principal
          const idxPrincipal = pinadosAtualizados.findIndex(p => p.id === antigo.id);
          if (idxPrincipal >= 0) pinadosAtualizados[idxPrincipal] = atualizado as any;
          // Remove do array de catalogados para não dar match duplo
          catalogadosDaLoja.splice(matchIdx, 1);
        } else {
          // Sem match: vai para "a catalogar"
          novos.push({
            ...produto,
            link: linkAfiliado,
            linkOriginal: produto.link,
            destinos: [cron.destino],
            pinedAt: new Date().toISOString(),
            aCatalogar: true,
            lojaNome: loja.nome,
            ...(loja.moedaUSD ? { moedaUSD: true } : {}),
          } as any);
        }
      }

      pinadosAtualizados = [...pinadosAtualizados, ...novos];

      // 4. Atualiza ultimaAtualizacao da loja no KV
      const lojasAtualizadas = lojas.map(l => {
        if (l.url === loja.url && l.tipo === loja.tipo && l.cron) {
          return { ...l, cron: { ...l.cron, ultimaAtualizacao: new Date().toISOString() } };
        }
        return l;
      });
      await kv.set(LOJAS_KEY, lojasAtualizadas);

      resultados[loja.nome] = { pinados: novos.length };
    } catch (err: any) {
      resultados[loja.nome] = { removidos: 0, pinados: 0, erro: err?.message || 'Erro desconhecido' };
    }
  }

  // Salva pinados atualizados
  await kv.set(PINADOS_KEY, pinadosAtualizados);

  return NextResponse.json({
    ok: true,
    timestamp: new Date().toISOString(),
    lojasProcessadas: lojasParaAtualizar.length,
    resultados,
  });
}

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
  ultimaAtualizacao: string | null;
}

interface LojaLomadee {
  tipo: 'lomadee';
  nome: string;
  url: string;
  cron?: LojaCron;
}

interface LojaAwin {
  tipo: 'awin';
  nome: string;
  url: string;
  anuncianteId: string;
  moedaUSD?: boolean;
  cron?: LojaCron;
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

async function scrapeLojaLomadee(loja: LojaLomadee): Promise<any[]> {
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

    const params = new URLSearchParams({ url: loja.url, limit: '20' });
    if (orgId) params.set('orgId', orgId);
    const res = await fetch(`${BASE_URL}/api/scrape?${params}`);
    const json = await res.json();
    return json.data || [];
  } catch {
    return [];
  }
}

async function scrapeLojaAwin(loja: LojaAwin): Promise<any[]> {
  try {
    const params = new URLSearchParams({ url: loja.url, limit: '20', orgId: loja.anuncianteId });
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
      let produtos: any[] = [];
      if (loja.tipo === 'lomadee') {
        produtos = await scrapeLojaLomadee(loja as LojaLomadee);
      } else {
        produtos = await scrapeLojaAwin(loja as LojaAwin);
      }

      if (produtos.length === 0) {
        resultados[loja.nome] = { removidos: 0, pinados: 0, erro: 'Sem produtos retornados pelo scrape' };
        continue;
      }

      // 2. Identifica e remove pinados antigos desta loja
      const dominioLoja = new URL(loja.url).hostname.replace('www.', '');
      const pinadosDaLoja = pinadosAtualizados.filter(p => {
        const link = p.linkOriginal || p.link || '';
        try {
          const d = new URL(link).hostname.replace('www.', '');
          return d === dominioLoja;
        } catch { return false; }
      });

      pinadosAtualizados = pinadosAtualizados.filter(p => {
        const link = p.linkOriginal || p.link || '';
        try {
          const d = new URL(link).hostname.replace('www.', '');
          return d !== dominioLoja;
        } catch { return true; }
      });

      // 3. Pina novos produtos (limite de 8 por loja para não lotar)
      const novos: ProdutoPinado[] = [];
      const limite = Math.min(produtos.length, 8);
      for (let i = 0; i < limite; i++) {
        const produto = produtos[i];
        const linkAfiliado = await gerarLinkAfiliado(produto);
        novos.push({
          ...produto,
          link: linkAfiliado,
          linkOriginal: produto.link,
          destinos: [cron.destino],
          pinedAt: new Date().toISOString(),
        });
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

      resultados[loja.nome] = { removidos: pinadosDaLoja.length, pinados: novos.length };
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

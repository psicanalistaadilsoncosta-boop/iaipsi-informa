import { MetadataRoute } from 'next';
import fs from 'fs/promises';
import path from 'path';
import { kv } from '@/lib/kv';
import { lerTodos } from '@/lib/pinados';

// Refaz o sitemap a cada 1 hora, lendo o conteúdo atual do KV
export const revalidate = 3600;

const BASE = 'https://comlupa.com.br';

type Freq = 'hourly' | 'daily' | 'weekly' | 'monthly';

// Mesma regra de slug usada em /categorias/[slug] e /lojas/[slug]
function paraSlug(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function paraData(valor: any): Date {
  const d = valor ? new Date(valor) : new Date();
  return isNaN(d.getTime()) ? new Date() : d;
}

async function lerKV<T = any>(chave: string): Promise<T[]> {
  try {
    const data = await kv.get<T[]>(chave);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

// Editorial e Sabores: KV primeiro, JSON como reserva (igual à home)
async function lerKVouJSON(chave: string, arquivo: string): Promise<any[]> {
  const doKV = await lerKV(chave);
  if (doKV.length > 0) return doKV;
  try {
    const raw = await fs.readFile(path.join(process.cwd(), 'public', arquivo), 'utf-8');
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const agora = new Date();

  // ── Páginas fixas ───────────────────────────────────────────────
  const fixas: [string, Freq, number][] = [
    ['', 'hourly', 1],
    ['/noticias', 'hourly', 0.9],
    ['/ofertas', 'daily', 0.8],
    ['/ofertas-selecionadas', 'daily', 0.8],
    ['/oferta-do-dia', 'daily', 0.8],
    ['/parcelado', 'daily', 0.7],
    ['/cupons', 'daily', 0.7],
    ['/monte-seu-ambiente', 'daily', 0.8],
    ['/monte-seu-momento', 'daily', 0.8],
    ['/vista-se', 'daily', 0.8],
    ['/vista-seu-filho', 'daily', 0.8],
    ['/beleza', 'daily', 0.8],
    ['/mercado', 'daily', 0.8],
    ['/viagens', 'weekly', 0.7],
    ['/viagens-selecionadas', 'daily', 0.7],
    ['/compalavra', 'weekly', 0.8],
    ['/arquivo-editorial', 'daily', 0.8],
    ['/arquivo-sabores', 'weekly', 0.7],
    ['/categorias', 'weekly', 0.6],
    ['/lojas', 'weekly', 0.6],
    ['/termos', 'monthly', 0.2],
  ];

  const paginasFixas: MetadataRoute.Sitemap = fixas.map(([rota, freq, prioridade]) => ({
    url: `${BASE}${rota}`,
    lastModified: agora,
    changeFrequency: freq,
    priority: prioridade,
  }));

  // ── Conteúdo do KV (em paralelo) ────────────────────────────────
  const [editorial, sabores, compalavra, artigosProduto, viagens, pinados] = await Promise.all([
    lerKVouJSON('editorial:items', 'editorial.json'),
    lerKVouJSON('sabores:items', 'sabores.json'),
    lerKV('artigos:compalavra'),
    lerKV('artigos:produtos'),
    lerKV('artigos:viagens'),
    lerTodos().catch(() => []),
  ]);

  const paginasEditorial: MetadataRoute.Sitemap = editorial
    .filter((i: any) => i?.id)
    .map((i: any) => ({
      url: `${BASE}/editorial/${i.id}`,
      lastModified: paraData(i.publishedAt),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }));

  const paginasSabores: MetadataRoute.Sitemap = sabores
    .filter((i: any) => i?.id)
    .map((i: any) => ({
      url: `${BASE}/sabores/${i.id}`,
      lastModified: paraData(i.publishedAt),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }));

  const paginasComPalavra: MetadataRoute.Sitemap = compalavra
    .filter((a: any) => a?.slug && a.publicado)
    .map((a: any) => ({
      url: `${BASE}/compalavra/${a.slug}`,
      lastModified: paraData(a.updatedAt || a.createdAt),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    }));

  const paginasProduto: MetadataRoute.Sitemap = artigosProduto
    .filter((a: any) => a?.slug && a.publicado)
    .map((a: any) => ({
      url: `${BASE}/produto/${a.slug}`,
      lastModified: paraData(a.updatedAt || a.createdAt),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

  const paginasViagem: MetadataRoute.Sitemap = viagens
    .filter((a: any) => a?.slug && a.publicado)
    .map((a: any) => ({
      url: `${BASE}/viagem/${a.slug}`,
      lastModified: paraData(a.updatedAt || a.createdAt || a.pinedAt),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));

    // Categorias e lojas com pelo menos 3 produtos pinados
  // (páginas com 1 ou 2 produtos o Google vê como conteúdo fraco)
  const MINIMO_PRODUTOS = 3;
  const contaCategorias = new Map<string, number>();
  const contaLojas = new Map<string, number>();
  for (const p of pinados as any[]) {
    if (p?.categoria) {
      const slug = paraSlug(String(p.categoria));
      contaCategorias.set(slug, (contaCategorias.get(slug) || 0) + 1);
    }
    if (p?.loja) {
      const slug = paraSlug(String(p.loja));
      contaLojas.set(slug, (contaLojas.get(slug) || 0) + 1);
    }
  }
  const categorias = [...contaCategorias].filter(([, n]) => n >= MINIMO_PRODUTOS).map(([slug]) => slug);
  const lojas = [...contaLojas].filter(([, n]) => n >= MINIMO_PRODUTOS).map(([slug]) => slug);


  const paginasCategorias: MetadataRoute.Sitemap = [...categorias].filter(Boolean).map((slug) => ({
    url: `${BASE}/categorias/${slug}`,
    lastModified: agora,
    changeFrequency: 'daily' as const,
    priority: 0.5,
  }));

  const paginasLojas: MetadataRoute.Sitemap = [...lojas].filter(Boolean).map((slug) => ({
    url: `${BASE}/lojas/${slug}`,
    lastModified: agora,
    changeFrequency: 'daily' as const,
    priority: 0.5,
  }));

  // Junta tudo sem repetir endereço
  const vistos = new Set<string>();
  return [
    ...paginasFixas,
    ...paginasComPalavra,
    ...paginasEditorial,
    ...paginasProduto,
    ...paginasViagem,
    ...paginasSabores,
    ...paginasCategorias,
    ...paginasLojas,
  ].filter((item) => {
    if (vistos.has(item.url)) return false;
    vistos.add(item.url);
    return true;
  });
}

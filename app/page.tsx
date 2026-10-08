import NewsClient from './NewsClient';
import Parser from 'rss-parser';
import iconv from 'iconv-lite';
import fs from 'fs/promises';
import path from 'path';
import { kv } from '@/lib/kv';
import { lerTodos, lerDestino, lerGaveta } from '@/lib/pinados';
import { unstable_cache } from 'next/cache';
import { TAG_PRODUTOS } from '@/lib/revalidar';
// Tempo limite garantido: se a API não responder, devolve o valor reserva em vez de travar
function comTempoLimite<T>(p: Promise<T>, ms: number, reserva: T): Promise<T> {
  return Promise.race([p, new Promise<T>(resolve => setTimeout(() => resolve(reserva), ms))]).catch(() => reserva);
}
import { getViagemDestaque } from './ViagemDestaque';
import { Analytics } from "@vercel/analytics/next"
import FaixaSazonal from './temas/FaixaSazonal';

export interface FeedItem {
  title?: string;
  link?: string;
  pubDate?: string;
  contentSnippet?: string;
  category?: string;
  categoryColor?: string;
  imageUrl?: string;
}

interface FeedConfig {
  url: string;
  category: string;
  color: string;
  hasRssImage: boolean;
  dynamicCategory?: boolean;
}

export const revalidate = 900;
export const dynamic = 'force-static';

const parser = new Parser({
  customFields: {
    item: [
      ['media:content', 'mediaContent', { keepArray: false }],
      ['media:thumbnail', 'mediaThumbnail', { keepArray: false }],
      ['enclosure', 'enclosure', { keepArray: false }],
    ],
  },
});

async function fetchAndParseFeed(url: string) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/153.0.0.0 Safari/537.36',
      'Accept': 'application/rss+xml, application/xml, text/xml, */*;q=0.8',
      'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
    },
    signal: AbortSignal.timeout(8000),
  });

  if (!response.ok) throw new Error(`Status code ${response.status}`);

  const buffer = Buffer.from(await response.arrayBuffer());
  const header = buffer.subarray(0, 500).toString('ascii');
  const encoding = /encoding=["']?iso-8859-1/i.test(header) ? 'win1252' : 'utf8';
  const xml = iconv.decode(buffer, encoding);

  return parser.parseString(xml);
}

const FEEDS: FeedConfig[] = [
  { url: 'https://winenews.com.br/feed.xml',                                  category: 'Vinhos & Afins',        color: '#7B1B38', hasRssImage: true  },
  { url: 'https://revistaadega.uol.com.br/feed/',                             category: 'Vinhos & Afins',        color: '#7B1B38', hasRssImage: true  },
  { url: 'https://all4wine.com.br/feed/',                                     category: 'Vinhos & Afins',        color: '#7B1B38', hasRssImage: true  },
  { url: 'https://g1.globo.com/rss/g1/politica/',                             category: 'Política',              color: '#1e3a8a', hasRssImage: true  },
  { url: 'https://www.cnnbrasil.com.br/feed/', category: 'Geral', color: '#cc0000', hasRssImage: true, dynamicCategory: true },
  { url: 'https://news.google.com/rss/search?q=politica+brasil&hl=pt-BR&gl=BR&ceid=BR:pt-419',        category: 'Política',        color: '#1e3a8a', hasRssImage: false },
  { url: 'https://g1.globo.com/rss/g1/economia/',                             category: 'Economia',              color: '#047857', hasRssImage: true  },
  { url: 'https://news.google.com/rss/search?q=economia+brasil&hl=pt-BR&gl=BR&ceid=BR:pt-419',       category: 'Economia',        color: '#047857', hasRssImage: false },
  { url: 'https://ge.globo.com/ESP/Noticia/Rss/0,,AS0-4271,00.xml',           category: 'Esportes',              color: '#ea580c', hasRssImage: true  },
  { url: 'https://news.google.com/rss/search?q=futebol+brasileiro&hl=pt-BR&gl=BR&ceid=BR:pt-419',    category: 'Esportes',        color: '#ea580c', hasRssImage: false },
  { url: 'https://news.google.com/rss/search?q=saude+mental&hl=pt-BR&gl=BR&ceid=BR:pt-419',          category: 'Saúde Mental',    color: '#7c3aed', hasRssImage: false },
  { url: 'https://g1.globo.com/rss/g1/ciencia-e-saude/',                      category: 'Saúde & Ciência',       color: '#0284c7', hasRssImage: true  },
  { url: 'https://news.google.com/rss/search?q=ciencia+saude+brasil&hl=pt-BR&gl=BR&ceid=BR:pt-419', category: 'Saúde & Ciência', color: '#0284c7', hasRssImage: false },
  { url: 'https://news.google.com/rss/search?q=psicanalise&hl=pt-BR&gl=BR&ceid=BR:pt-419',           category: 'Psicanálise',     color: '#be185d', hasRssImage: false },
  { url: 'https://news.google.com/rss/search?q=psicanalise+terapia&hl=pt-BR&gl=BR&ceid=BR:pt-419',  category: 'Psicanálise',     color: '#be185d', hasRssImage: false },
  { url: 'https://news.google.com/rss/search?q=inteligencia+artificial+brasil&hl=pt-BR&gl=BR&ceid=BR:pt-419', category: 'Tecnologia & IA', color: '#0f766e', hasRssImage: false },
  { url: 'https://news.google.com/rss/search?q=tecnologia+inovacao+brasil&hl=pt-BR&gl=BR&ceid=BR:pt-419',    category: 'Tecnologia & IA', color: '#0f766e', hasRssImage: false },
  { url: 'https://news.google.com/rss/search?q=educacao+carreira+brasil&hl=pt-BR&gl=BR&ceid=BR:pt-419',      category: 'Educação & Carreira', color: '#b45309', hasRssImage: false },
  { url: 'https://news.google.com/rss/search?q=mercado+trabalho+emprego+brasil&hl=pt-BR&gl=BR&ceid=BR:pt-419', category: 'Educação & Carreira', color: '#b45309', hasRssImage: false },
  { url: 'https://news.google.com/rss/search?q=lideranca+gestao+empresas&hl=pt-BR&gl=BR&ceid=BR:pt-419',     category: 'Liderança & Gestão', color: '#7c2d12', hasRssImage: false },
  { url: 'https://news.google.com/rss/search?q=cultura+organizacional+rh&hl=pt-BR&gl=BR&ceid=BR:pt-419',     category: 'Liderança & Gestão', color: '#7c2d12', hasRssImage: false },
  { url: 'https://feeds.bbci.co.uk/portuguese/rss.xml',                       category: 'Mundo',                 color: '#374151', hasRssImage: true  },
  { url: 'https://news.google.com/rss/search?q=mundo+internacional+noticias&hl=pt-BR&gl=BR&ceid=BR:pt-419',  category: 'Mundo',           color: '#374151', hasRssImage: false },
  { url: 'https://feeds.folha.uol.com.br/turismo/rss091.xml',                 category: 'Turismo',               color: '#537CC5', hasRssImage: true  },
  { url: 'https://news.google.com/rss/search?q=turismo&hl=pt-BR&gl=BR&ceid=BR:pt-419',               category: 'Turismo',           color: '#537CC5', hasRssImage: false },
];

const ITEMS_PER_FEED = 4;
const MAX_PER_CATEGORY = 6;

function truncateText(text: string | undefined, maxLength = 110): string {
  if (!text) return '';
  const clean = text.replace(/<[^>]*>?/gm, '').trim();
  return clean.length <= maxLength ? clean : clean.slice(0, maxLength) + '...';
}

function extractImageFromRss(item: any): string | undefined {
  if (item.enclosure?.url && /\.(jpg|jpeg|png|webp|gif)/i.test(item.enclosure.url))
    return item.enclosure.url;
  if (item.mediaContent?.$.url) return item.mediaContent.$.url;
  if (item.mediaThumbnail?.$.url) return item.mediaThumbnail.$.url;
  const content = item.content || item['content:encoded'] || item.summary || '';
  const m = content.match(/<img[^>]+src=["']([^"']+)["']/i);
  return m?.[1];
}

function deduplicateByLink(items: FeedItem[]): FeedItem[] {
  const seen = new Set<string>();
  return items.filter(item => {
    if (!item.link) return true;
    if (seen.has(item.link)) return false;
    seen.add(item.link);
    return true;
  });
}

async function resolveGoogleNewsUrl(url: string): Promise<string> {
  if (!url.includes('news.google.com')) return url;
  try {
    const res = await comTempoLimite<Response | null>(fetch(url, {
      method: 'GET',
      redirect: 'follow',
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; NewsBot/1.0)' },
      signal: AbortSignal.timeout(4000),
    }), 4000, null);
    return res?.url || url;
  } catch {
    return url;
  }
}

async function getNews(): Promise<FeedItem[]> {
  const byCategory: Record<string, FeedConfig[]> = {};
  for (const feed of FEEDS) {
    if (!byCategory[feed.category]) byCategory[feed.category] = [];
    byCategory[feed.category].push(feed);
  }

  const categoryPromises = Object.entries(byCategory).map(async ([_category, feeds]) => {
    const feedResults = await Promise.all(
      feeds.map(async (feed) => {
        try {
        const res = await comTempoLimite<Awaited<ReturnType<typeof fetchAndParseFeed>>>(fetchAndParseFeed(feed.url), 8000, { items: [] } as any);
          const items = res.items.slice(0, ITEMS_PER_FEED);

          return await Promise.all(items.map(async (item) => {
            const resolvedLink = item.link && !feed.hasRssImage
              ? await resolveGoogleNewsUrl(item.link)
              : item.link;

            let category = feed.category;
            let categoryColor = feed.color;
            if (feed.dynamicCategory && Array.isArray(item.categories) && item.categories.length > 0) {
              const raw = item.categories[0].trim();
              const categoryMap: Record<string, { label: string; color: string }> = {
                'política': { label: 'Política', color: '#1e3a8a' },
                'politica': { label: 'Política', color: '#1e3a8a' },
                'economia': { label: 'Economia', color: '#047857' },
                'negócios': { label: 'Economia', color: '#047857' },
                'negocios': { label: 'Economia', color: '#047857' },
                'esporte': { label: 'Esportes', color: '#ea580c' },
                'esportes': { label: 'Esportes', color: '#ea580c' },
                'saúde': { label: 'Saúde & Ciência', color: '#0284c7' },
                'saude': { label: 'Saúde & Ciência', color: '#0284c7' },
                'ciência': { label: 'Saúde & Ciência', color: '#0284c7' },
                'ciencia': { label: 'Saúde & Ciência', color: '#0284c7' },
                'tecnologia': { label: 'Tecnologia & IA', color: '#0f766e' },
                'tech': { label: 'Tecnologia & IA', color: '#0f766e' },
                'mundo': { label: 'Mundo', color: '#374151' },
                'internacional': { label: 'Mundo', color: '#374151' },
              };
              const key = raw.toLowerCase();
              const mapped = categoryMap[key];
              if (mapped) {
                category = mapped.label;
                categoryColor = mapped.color;
              } else {
                category = raw;
                categoryColor = feed.color;
              }
            }

            return {
              title: item.title,
              link: resolvedLink,
              pubDate: item.pubDate,
              contentSnippet: truncateText(item.contentSnippet || item.content),
              category,
              categoryColor,
              imageUrl: feed.hasRssImage ? extractImageFromRss(item) : undefined,
            };
          }));
        } catch (e) {
          console.error(`Erro no feed ${feed.category} (${feed.url}):`, e);
          return [];
        }
      })
    );

    const merged = deduplicateByLink(feedResults.flat());
    merged.sort((a, b) => {
      const tA = a.pubDate ? new Date(a.pubDate).getTime() : 0;
      const tB = b.pubDate ? new Date(b.pubDate).getTime() : 0;
      return tB - tA;
    });
    return merged.slice(0, MAX_PER_CATEGORY);
  });

  const categoryResults = await Promise.all(categoryPromises);

  const globalSeen = new Set<string>();
  const deduplicated = categoryResults.flat().filter(item => {
    if (!item.link) return true;
    if (globalSeen.has(item.link)) return false;
    globalSeen.add(item.link);
    return true;
  });

  return deduplicated.sort((a, b) => {
    const tA = a.pubDate ? new Date(a.pubDate).getTime() : 0;
    const tB = b.pubDate ? new Date(b.pubDate).getTime() : 0;
    return tB - tA;
  });
}

export interface AdItem {
  id: string;
  position: 'topo' | 'meio' | 'rodape';
  image: string;
  text: string;
  cta: string;
  link: string;
  active: boolean;
}

export interface EditorialItem {
  id: string;
  title: string;
  analysis: string;
  link: string;
  category?: string;
  publishedAt: string;
  author: string;
}

export interface SaboresItem {
  id: string;
  prato: string;
  destino: string;
  intro: string;
  cta: string;
  content: string;
  imageUrl: string | null;
  publishedAt: string;
}

async function getComPalavraDestaque(): Promise<any | null> {
  try {
    const data = await kv.get<any[]>('artigos:compalavra');
    return (data || []).find(a => a.publicado && a.destaque) || null;
  } catch { return null; }
}


async function getViagensNoticias(): Promise<any[]> {
  try {
    const data = await kv.get<any[]>('artigos:viagens');
    const all = data || [];
    return all
      .filter(v => v.destinos?.includes('viagens'))
      .sort((a, b) => new Date(b.pinedAt || b.createdAt || 0).getTime() - new Date(a.pinedAt || a.createdAt || 0).getTime())
      .slice(0, 10);
  } catch {
    return [];
  }
}


async function getArtigosProduto() {
  try {
    const data = await kv.get<any[]>('artigos:produtos');
    return (data || []).filter(a => a.publicado).slice(0, 3);
  } catch { return []; }
}

async function getSabores(): Promise<SaboresItem[]> {
  try {
    // Tenta KV primeiro
    const data = await kv.get<SaboresItem[]>('sabores:items');
    if (data && data.length > 0) return data;
  } catch {}
  // Fallback para JSON
  try {
    const filePath = path.join(process.cwd(), 'public', 'sabores.json');
    const raw = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function getEditorial(): Promise<EditorialItem[]> {
  try {
    // Tenta KV primeiro
    const data = await kv.get<EditorialItem[]>('editorial:items');
    if (data && data.length > 0) return data;
  } catch {}
  // Fallback para JSON
  try {
    const filePath = path.join(process.cwd(), 'public', 'editorial.json');
    const raw = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function getAds(): Promise<AdItem[]> {
  try {
    const filePath = path.join(process.cwd(), 'public', 'ads.json');
    const raw = await fs.readFile(filePath, 'utf-8');
    const all: AdItem[] = JSON.parse(raw);
    return all.filter(ad => ad.active);
  } catch {
    return [];
  }
}

async function getOfertasMix(): Promise<any[]> {
  try {
    const API_KEY = process.env.LOMADEE_API_KEY || '';
    const BASE_URL = 'https://api-beta.lomadee.com.br';

    // Produtos pinados — tenta KV primeiro, depois JSON
    let produtosPinados: any[] = [];
    try {
      const kvData = await lerDestino('mix');
      if (kvData && kvData.length > 0) {
        produtosPinados = kvData
          .filter((p: any) => p.destinos?.includes('mix'))
          .map((p: any) => ({
            tipo: 'produto',
            id: p.id,
            titulo: p.nome,
            imagem: p.imagem,
            link: p.link,
            preco: p.preco,
            precoOriginal: p.precoOriginal,
            desconto: p.desconto,
          }));
      }
    } catch {}

    if (produtosPinados.length === 0) {
      try {
        const filePath = path.join(process.cwd(), 'public', 'produtos-pinados.json');
        const raw = await fs.readFile(filePath, 'utf-8');
        produtosPinados = JSON.parse(raw)
          .filter((p: any) => p.destinos?.includes('mix'))
          .map((p: any) => ({
            tipo: 'produto',
            id: p.id,
            titulo: p.nome,
            imagem: p.imagem,
            link: p.link,
            preco: p.preco,
            precoOriginal: p.precoOriginal,
            desconto: p.desconto,
          }));
      } catch {}
    }

const [campData, brandData] = !API_KEY ? [{ data: [] }, { data: [] }] : await Promise.all([
        comTempoLimite(fetch(`${BASE_URL}/affiliate/campaigns?limit=20`, {
        headers: { 'x-api-key': API_KEY },
        
        signal: AbortSignal.timeout(8000),
      }).then(r => r.json()), 8000, { data: [] }),
      comTempoLimite(fetch(`${BASE_URL}/affiliate/brands?limit=20`, {
        headers: { 'x-api-key': API_KEY },
        
        signal: AbortSignal.timeout(8000),
      }).then(r => r.json()), 8000, { data: [] }),
    ]);

    const SHOPEE_ID = '124df9f6-2449-4bf5-ae80-dfc1fac6d46a';

    const campanhas = (campData.data || [])
      .filter((c: any) =>
        c.status === 'onTime' &&
        c.channels?.[0]?.shortUrls?.[0] &&
        !c.name.includes('[') &&
        !c.name.includes(']') &&
        c.name.length > 5
      )
      .slice(0, 4)
      .map((c: any) => ({
        tipo: 'campanha',
        id: c.id,
        titulo: c.name,
        link: c.channels[0].shortUrls[0],
        imagem: c.mediaKit?.banners?.[0] || null,
        isCupom: c.type === 'GenericCoupon' || c.type === 'PersonalCoupon',
        code: c.code || null,
        expira: c.period?.endAt || null,
      }));

    const marcas = (brandData.data || [])
      .filter((m: any) =>
        m.network?.trait?.isHighlight &&
        m.channels?.[0]?.shortUrls?.[0] &&
        m.id !== SHOPEE_ID
      )
      .slice(0, 3)
      .map((m: any) => ({
        tipo: 'marca',
        id: m.id,
        titulo: m.name,
        link: m.channels[0].shortUrls[0],
        logo: m.logo,
        segment: m.segment,
      }));

    return [...produtosPinados, ...campanhas, ...marcas];
  } catch {
    return [];
  }
}

// Produtos do banner: guardados até algum produto mudar (lib/revalidar.ts) ou 24h.
// A home renova a cada 15 min por causa das notícias, mas NÃO relê todos os produtos a cada vez.
const produtosDoBanner = unstable_cache(async () => {
  const produtosPinados = await lerTodos();
  return produtosPinados
      .filter((p: any) => p.bannerDestaque === true)
      .map((p: any) => ({
        tipo: 'oferta' as const,
        imagem: p.imagem || p.foto || p.thumbnail || '',
        nome: p.nome || '',
        loja: p.lojaNome || p.loja || '',
        precoTipo: (p.precoTipo as 'valor' | 'parcela') || 'valor',
        preco: p.preco,
        valorParcela: p.valorParcela,
        textoParcelamento: (p.textoParcelamento as 'confira' | 'a partir de') || 'a partir de',
        link: p.link,
        novaAba: true,
      }));
}, ['home-banner-produtos'], { revalidate: 86400, tags: [TAG_PRODUTOS] });

async function getBannerData(): Promise<{ slidesEditoriais: any[]; produtosBanner: any[] }> {
  try {
    const [slidesEditoriais, produtosBanner] = await Promise.all([
      kv.get<any[]>('banner:slides').then(v => v || []),
      produtosDoBanner().catch(() => [] as any[]),
    ]);
    return { slidesEditoriais, produtosBanner };
  } catch {
    return { slidesEditoriais: [], produtosBanner: [] };
  }
}
// "Lupadas da semana": até 2 escolhidas por você (ofertas-selecionadas, mais recentes)
// + sorteio de Beleza e Vista-se (adulto) completando 8. Máx. 2 por loja.
// O sorteio usa o número da semana: fica igual a semana toda e troca na segunda-feira.
const LUPADAS_TOTAL = 8;
const LUPADAS_MANUAIS = 2;
const INFANTIL = ['Infantil', 'Bebê', 'Brinquedos'];

function numeroDaSemana(): number {
  // dias desde 01/01/1970 no horário de Brasília; +3 faz a semana virar na segunda
  const dias = Math.floor((Date.now() - 3 * 3600000) / 86400000);
  return Math.floor((dias + 3) / 7);
}

function embaralharComSemente<T>(lista: T[], semente: number): T[] {
  const a = [...lista];
  let s = semente >>> 0;
  const aleatorio = () => {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(aleatorio() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function paraLupada(p: any) {
  return {
    id: p.id, nome: p.nome, imagem: p.imagem, link: p.link,
    preco: p.preco, precoOriginal: p.precoOriginal,
    loja: p.lojaNome || p.loja,
    moedaUSD: !!(p.moedaUSD || p.moedaOriginal === 'USD'),
  };
}

const valeComoLupada = (p: any) =>
  p && p.ativo !== false && p.preco > 0 && p.link && p.imagem && !p.cartaoLoja;

async function montarLupadas(semana: number): Promise<any[]> {
  const [selecionadas, beleza, vistaSe] = await Promise.all([
    lerDestino('ofertas-selecionadas').catch(() => [] as any[]),
    lerGaveta('beleza').catch(() => [] as any[]),
    lerGaveta('vistaSe').catch(() => [] as any[]),
  ]);

  // 1) até 2 escolhidas por você, as mais recentes
  const manuais = selecionadas
    .filter((p: any) => p.destinos?.includes('ofertas-selecionadas') && valeComoLupada(p))
    .sort((a: any, b: any) => new Date(b.pinedAt || 0).getTime() - new Date(a.pinedAt || 0).getTime())
    .slice(0, LUPADAS_MANUAIS);

  // 2) sorteio de Beleza + Vista-se adulto
  const usados = new Set(manuais.map((p: any) => p.id));
  const candidatos = [
    ...beleza.filter((p: any) => p.beleza),
    ...vistaSe.filter((p: any) => p.vistaSe && !INFANTIL.includes(p.tipoVistaSe)),
  ].filter(valeComoLupada);

  const porLoja: Record<string, number> = {};
  for (const p of manuais) {
    const loja = (p.lojaNome || p.loja || '').toLowerCase();
    porLoja[loja] = (porLoja[loja] || 0) + 1;
  }

  const sorteadas: any[] = [];
  for (const p of embaralharComSemente(candidatos, semana)) {
    if (manuais.length + sorteadas.length >= LUPADAS_TOTAL) break;
    if (usados.has(p.id)) continue;
    const loja = (p.lojaNome || p.loja || '').toLowerCase();
    if ((porLoja[loja] || 0) >= 2) continue;
    usados.add(p.id);
    porLoja[loja] = (porLoja[loja] || 0) + 1;
    sorteadas.push(p);
  }

  return [...manuais, ...sorteadas].map(paraLupada);
}

// Guardadas até algum produto mudar (lib/revalidar.ts) ou 24h; a chave muda a cada semana
async function getLupadas(): Promise<any[]> {
  const semana = numeroDaSemana();
  try {
    return await unstable_cache(
      () => montarLupadas(semana),
      ['home-lupadas', String(semana)],
      { revalidate: 86400, tags: [TAG_PRODUTOS] }
    )();
  } catch { return []; }
}
export default async function Home() {
  const [posts, ads, editorial, sabores, ofertasMix, artigosProduto, viagemDestaque, viagensNoticias, comPalavraDestaque, bannerData, lupadas] = await Promise.all([
    getNews(), getAds(), getEditorial(), getSabores(), Promise.resolve([] as any[]), getArtigosProduto(), getViagemDestaque(), getViagensNoticias(), getComPalavraDestaque(), getBannerData(), getLupadas()
  ]);

  // Mescla slides editoriais + produtos de oferta e embaralha
  const bannerSlides = [...bannerData.slidesEditoriais, ...bannerData.produtosBanner]
    .sort(() => Math.random() - 0.5);

    return <><FaixaSazonal /><NewsClient posts={posts} ads={ads} editorial={editorial} sabores={sabores} ofertasMix={ofertasMix} artigosProduto={artigosProduto} viagemDestaque={viagemDestaque} viagensNoticias={viagensNoticias} comPalavraDestaque={comPalavraDestaque} bannerSlides={bannerSlides} lupadas={lupadas} /></>
}

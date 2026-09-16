import NewsClient from './NewsClient';
import Parser from 'rss-parser';

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
  dynamicCategory?: boolean; // usa a categoria do próprio XML
}

// ─── CACHE: revalida a cada 15 minutos ────────────────────────────────────
export const revalidate = 900;

import iconv from 'iconv-lite';

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
  });

  if (!response.ok) throw new Error(`Status code ${response.status}`);

  const buffer = Buffer.from(await response.arrayBuffer());
  const header = buffer.subarray(0, 500).toString('ascii');
  const encoding = /encoding=["']?iso-8859-1/i.test(header) ? 'win1252' : 'utf8';
  const xml = iconv.decode(buffer, encoding);

  return parser.parseString(xml);
}

// ─── FEEDS ────────────────────────────────────────────────────────────────
const FEEDS: FeedConfig[] = [

// ── VINHOS ──────────────────────────────────────────────────────────────
  { url: 'https://winenews.com.br/feed.xml',                                  category: 'Vinhos & Afins',        color: '#7B1B38', hasRssImage: true  },
  { url: 'https://revistaadega.uol.com.br/feed/',                             category: 'Vinhos & Afins',        color: '#7B1B38', hasRssImage: true  },

// ── POLÍTICA ──────────────────────────────────────────────────────────────
  { url: 'https://g1.globo.com/rss/g1/politica/',                                                     category: 'Política',        color: '#1e3a8a', hasRssImage: true  },
  { url: 'https://www.cnnbrasil.com.br/feed/', category: 'Geral', color: '#cc0000', hasRssImage: true, dynamicCategory: true },
  { url: 'https://news.google.com/rss/search?q=politica+brasil&hl=pt-BR&gl=BR&ceid=BR:pt-419',        category: 'Política',        color: '#1e3a8a', hasRssImage: false },

  // ── ECONOMIA ──────────────────────────────────────────────────────────────
  { url: 'https://g1.globo.com/rss/g1/economia/',                                                     category: 'Economia',        color: '#047857', hasRssImage: true  },
  { url: 'https://news.google.com/rss/search?q=economia+brasil&hl=pt-BR&gl=BR&ceid=BR:pt-419',       category: 'Economia',        color: '#047857', hasRssImage: false },

  // ── ESPORTES ──────────────────────────────────────────────────────────────
  { url: 'https://ge.globo.com/ESP/Noticia/Rss/0,,AS0-4271,00.xml',                                    category: 'Esportes',        color: '#ea580c', hasRssImage: true  },
  { url: 'https://news.google.com/rss/search?q=futebol+brasileiro&hl=pt-BR&gl=BR&ceid=BR:pt-419',    category: 'Esportes',        color: '#ea580c', hasRssImage: false },

  // ── SAÚDE MENTAL ──────────────────────────────────────────────────────────
  { url: 'https://news.google.com/rss/search?q=saude+mental&hl=pt-BR&gl=BR&ceid=BR:pt-419',          category: 'Saúde Mental',    color: '#7c3aed', hasRssImage: false },

  // ── SAÚDE & CIÊNCIA ───────────────────────────────────────────────────────
  { url: 'https://g1.globo.com/rss/g1/ciencia-e-saude/',                                              category: 'Saúde & Ciência', color: '#0284c7', hasRssImage: true  },
   { url: 'https://news.google.com/rss/search?q=ciencia+saude+brasil&hl=pt-BR&gl=BR&ceid=BR:pt-419', category: 'Saúde & Ciência', color: '#0284c7', hasRssImage: false },

  // ── PSICANÁLISE ───────────────────────────────────────────────────────────
  { url: 'https://news.google.com/rss/search?q=psicanalise&hl=pt-BR&gl=BR&ceid=BR:pt-419',           category: 'Psicanálise',     color: '#be185d', hasRssImage: false },
  { url: 'https://news.google.com/rss/search?q=psicanalise+terapia&hl=pt-BR&gl=BR&ceid=BR:pt-419',  category: 'Psicanálise',     color: '#be185d', hasRssImage: false },

  // ── TECNOLOGIA & IA ───────────────────────────────────────────────────────
  { url: 'https://news.google.com/rss/search?q=inteligencia+artificial+brasil&hl=pt-BR&gl=BR&ceid=BR:pt-419', category: 'Tecnologia & IA', color: '#0f766e', hasRssImage: false },
  { url: 'https://news.google.com/rss/search?q=tecnologia+inovacao+brasil&hl=pt-BR&gl=BR&ceid=BR:pt-419',    category: 'Tecnologia & IA', color: '#0f766e', hasRssImage: false },

  // ── EDUCAÇÃO & CARREIRA ───────────────────────────────────────────────────
  { url: 'https://news.google.com/rss/search?q=educacao+carreira+brasil&hl=pt-BR&gl=BR&ceid=BR:pt-419',      category: 'Educação & Carreira', color: '#b45309', hasRssImage: false },
  { url: 'https://news.google.com/rss/search?q=mercado+trabalho+emprego+brasil&hl=pt-BR&gl=BR&ceid=BR:pt-419', category: 'Educação & Carreira', color: '#b45309', hasRssImage: false },

  // ── LIDERANÇA & GESTÃO ────────────────────────────────────────────────────
  { url: 'https://news.google.com/rss/search?q=lideranca+gestao+empresas&hl=pt-BR&gl=BR&ceid=BR:pt-419',     category: 'Liderança & Gestão', color: '#7c2d12', hasRssImage: false },
  { url: 'https://news.google.com/rss/search?q=cultura+organizacional+rh&hl=pt-BR&gl=BR&ceid=BR:pt-419',     category: 'Liderança & Gestão', color: '#7c2d12', hasRssImage: false },

  // ── MUNDO & INTERNACIONAL ─────────────────────────────────────────────────
  { url: 'https://feeds.bbci.co.uk/portuguese/rss.xml',                                                        category: 'Mundo',           color: '#374151', hasRssImage: true  },
  { url: 'https://news.google.com/rss/search?q=mundo+internacional+noticias&hl=pt-BR&gl=BR&ceid=BR:pt-419',  category: 'Mundo',           color: '#374151', hasRssImage: false },

  // ── TURISMO ─────────────────────────────────────────────────
  { url: 'https://feeds.folha.uol.com.br/turismo/rss091.xml',                                                        category: 'Turismo',           color: '#537CC5', hasRssImage: true  },
  { url: 'https://news.google.com/rss/search?q=turismo&hl=pt-BR&gl=BR&ceid=BR:pt-419',  category: 'Turismo',           color: '#537CC5', hasRssImage: false },
];

const ITEMS_PER_FEED = 4;
const MAX_PER_CATEGORY = 6;

// ─── UTILITÁRIOS ──────────────────────────────────────────────────────────
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
    const res = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; NewsBot/1.0)' },
      signal: AbortSignal.timeout(4000),
    });
    return res.url || url;
  } catch {
    return url;
  }
}

// ─── FETCH PRINCIPAL ──────────────────────────────────────────────────────
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
          const res = await fetchAndParseFeed(feed.url);
          const items = res.items.slice(0, ITEMS_PER_FEED);

                    return await Promise.all(items.map(async (item) => {
            const resolvedLink = item.link && !feed.hasRssImage
              ? await resolveGoogleNewsUrl(item.link)
              : item.link;

            // Categoria dinâmica: pega do XML se disponível
            let category = feed.category;
            let categoryColor = feed.color;
            if (feed.dynamicCategory && Array.isArray(item.categories) && item.categories.length > 0) {
              const raw = item.categories[0].trim();
              // Mapeia categoria do XML para as categorias do site
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
                category = raw; // usa o nome original se não mapeado
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

  // Deduplicação global — remove a mesma URL que apareceu em categorias diferentes
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

import fs from 'fs/promises';
import path from 'path';

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

async function getSabores(): Promise<SaboresItem[]> {
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

    // Produtos pinados por você
    let produtosPinados: any[] = [];
    try {
      const filePath = (await import('path')).join(process.cwd(), 'public', 'produtos-pinados.json');
      const raw = await (await import('fs/promises')).readFile(filePath, 'utf-8');
      produtosPinados = JSON.parse(raw).map((p: any) => ({
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
    const [campData, brandData] = await Promise.all([
      fetch(`${BASE_URL}/affiliate/campaigns?limit=20`, {
        headers: { 'x-api-key': API_KEY },
        next: { revalidate: 900 },
      }).then(r => r.json()),
      fetch(`${BASE_URL}/affiliate/brands?limit=20`, {
        headers: { 'x-api-key': API_KEY },
        next: { revalidate: 900 },
      }).then(r => r.json()),
    ]);

    const campanhas = (campData.data || [])
      .filter((c: any) => c.status === 'onTime' && c.channels?.[0]?.shortUrls?.[0])
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
      .filter((m: any) => m.network?.trait?.isHighlight && m.channels?.[0]?.shortUrls?.[0])
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
export default async function Home() {
  const [posts, ads, editorial, sabores, ofertasMix] = await Promise.all([
    getNews(), getAds(), getEditorial(), getSabores(), getOfertasMix()
  ]);
  return <NewsClient posts={posts} ads={ads} editorial={editorial} sabores={sabores} ofertasMix={ofertasMix} />;
}
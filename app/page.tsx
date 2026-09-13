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
}

// ─── CACHE: revalida a cada 15 minutos ────────────────────────────────────
export const revalidate = 900;

const parser = new Parser({
  customFields: {
    item: [
      ['media:content', 'mediaContent', { keepArray: false }],
      ['media:thumbnail', 'mediaThumbnail', { keepArray: false }],
      ['enclosure', 'enclosure', { keepArray: false }],
    ],
  },
});

// ─── FEEDS ────────────────────────────────────────────────────────────────
const FEEDS: FeedConfig[] = [

  // ── POLÍTICA ──────────────────────────────────────────────────────────────
  { url: 'https://g1.globo.com/rss/g1/politica/',                                                     category: 'Política',        color: '#1e3a8a', hasRssImage: true  },
  { url: 'https://www.cnnbrasil.com.br/feed/',                                                         category: 'Política',        color: '#1e3a8a', hasRssImage: true  },
  { url: 'https://news.google.com/rss/search?q=politica+brasil&hl=pt-BR&gl=BR&ceid=BR:pt-419',        category: 'Política',        color: '#1e3a8a', hasRssImage: false },

  // ── ECONOMIA ──────────────────────────────────────────────────────────────
  { url: 'https://g1.globo.com/rss/g1/economia/',                                                     category: 'Economia',        color: '#047857', hasRssImage: true  },
  { url: 'https://news.google.com/rss/search?q=economia+brasil&hl=pt-BR&gl=BR&ceid=BR:pt-419',       category: 'Economia',        color: '#047857', hasRssImage: false },

  // ── ESPORTES ──────────────────────────────────────────────────────────────
  { url: 'https://noticias.uol.com.br/ultimas/index.xml',                                              category: 'Esportes',        color: '#ea580c', hasRssImage: true  },
  { url: 'https://news.google.com/rss/search?q=futebol+brasileiro&hl=pt-BR&gl=BR&ceid=BR:pt-419',    category: 'Esportes',        color: '#ea580c', hasRssImage: false },

  // ── SAÚDE MENTAL ──────────────────────────────────────────────────────────
  { url: 'https://news.google.com/rss/search?q=saude+mental&hl=pt-BR&gl=BR&ceid=BR:pt-419',          category: 'Saúde Mental',    color: '#7c3aed', hasRssImage: false },

  // ── SAÚDE & CIÊNCIA ───────────────────────────────────────────────────────
  { url: 'https://g1.globo.com/rss/g1/ciencia-e-saude/',                                              category: 'Saúde & Ciência', color: '#0284c7', hasRssImage: true  },
  { url: 'https://feeds.bbci.co.uk/portuguese/rss.xml',                                               category: 'Saúde & Ciência', color: '#0284c7', hasRssImage: true  },
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
          const res = await parser.parseURL(feed.url);
          const items = res.items.slice(0, ITEMS_PER_FEED);

          return await Promise.all(items.map(async (item) => {
            const resolvedLink = item.link && !feed.hasRssImage
              ? await resolveGoogleNewsUrl(item.link)
              : item.link;

            return {
              title: item.title,
              link: resolvedLink,
              pubDate: item.pubDate,
              contentSnippet: truncateText(item.contentSnippet || item.content),
              category: feed.category,
              categoryColor: feed.color,
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
export default async function Home() {
  const [posts, ads, editorial, sabores] = await Promise.all([getNews(), getAds(), getEditorial(), getSabores()]);
  return <NewsClient posts={posts} ads={ads} editorial={editorial} sabores={sabores} />;
}
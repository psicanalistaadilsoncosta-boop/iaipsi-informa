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

const parser = new Parser({
  customFields: {
    item: [
      ['media:content', 'mediaContent', { keepArray: false }],
      ['media:thumbnail', 'mediaThumbnail', { keepArray: false }],
      ['enclosure', 'enclosure', { keepArray: false }],
    ],
  },
});

// ─── FEEDS POR CATEGORIA ───────────────────────────────────────────────────
// hasRssImage: true  → extrai imagem do próprio XML (G1, BBC, CNN, UOL)
// hasRssImage: false → Google News, sem imagem, sem fetch externo
const FEEDS: FeedConfig[] = [

  // ── POLÍTICA ──────────────────────────────────────────────────────────────
  { url: 'https://g1.globo.com/rss/g1/politica/',                                                         category: 'Política',      color: '#1e3a8a', hasRssImage: true  },
  { url: 'https://www.cnnbrasil.com.br/feed/',                                                             category: 'Política',      color: '#1e3a8a', hasRssImage: true  },
  { url: 'https://news.google.com/rss/search?q=politica+brasil&hl=pt-BR&gl=BR&ceid=BR:pt-419',            category: 'Política',      color: '#1e3a8a', hasRssImage: false },

  // ── ECONOMIA ──────────────────────────────────────────────────────────────
  { url: 'https://g1.globo.com/rss/g1/economia/',                                                         category: 'Economia',      color: '#047857', hasRssImage: true  },
  { url: 'https://news.google.com/rss/search?q=economia+brasil&hl=pt-BR&gl=BR&ceid=BR:pt-419',            category: 'Economia',      color: '#047857', hasRssImage: false },

  // ── ESPORTES ──────────────────────────────────────────────────────────────
  { url: 'https://noticias.uol.com.br/ultimas/index.xml',                                                  category: 'Esportes',      color: '#ea580c', hasRssImage: true  },
  { url: 'https://news.google.com/rss/search?q=futebol+brasileiro&hl=pt-BR&gl=BR&ceid=BR:pt-419',         category: 'Esportes',      color: '#ea580c', hasRssImage: false },

  // ── SAÚDE MENTAL ──────────────────────────────────────────────────────────
  { url: 'https://news.google.com/rss/search?q=saude+mental&hl=pt-BR&gl=BR&ceid=BR:pt-419',               category: 'Saúde Mental',  color: '#7c3aed', hasRssImage: false },

  // ── SAÚDE & CIÊNCIA ───────────────────────────────────────────────────────
  { url: 'https://g1.globo.com/rss/g1/ciencia-e-saude/',                                                  category: 'Saúde & Ciência', color: '#0284c7', hasRssImage: true },
  { url: 'https://feeds.bbci.co.uk/portuguese/rss.xml',                                                   category: 'Saúde & Ciência', color: '#0284c7', hasRssImage: true },
  { url: 'https://news.google.com/rss/search?q=ciencia+saude+brasil&hl=pt-BR&gl=BR&ceid=BR:pt-419',      category: 'Saúde & Ciência', color: '#0284c7', hasRssImage: false },

  // ── PSICANÁLISE ───────────────────────────────────────────────────────────
  { url: 'https://news.google.com/rss/search?q=psicanalise&hl=pt-BR&gl=BR&ceid=BR:pt-419',                category: 'Psicanálise',   color: '#be185d', hasRssImage: false },
  { url: 'https://news.google.com/rss/search?q=psicanalise+terapia&hl=pt-BR&gl=BR&ceid=BR:pt-419',       category: 'Psicanálise',   color: '#be185d', hasRssImage: false },
];

const ITEMS_PER_FEED = 4;
const MAX_PER_CATEGORY = 6;

// Resolve URL real de links do Google News
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

// ─── FETCH PRINCIPAL ──────────────────────────────────────────────────────
async function getNews(): Promise<FeedItem[]> {
  // Agrupa feeds por categoria para controlar o limite por categoria
  const byCategory: Record<string, FeedConfig[]> = {};
  for (const feed of FEEDS) {
    if (!byCategory[feed.category]) byCategory[feed.category] = [];
    byCategory[feed.category].push(feed);
  }

  const categoryPromises = Object.entries(byCategory).map(async ([category, feeds]) => {
    // Busca todos os feeds da categoria em paralelo
    const feedResults = await Promise.all(
      feeds.map(async (feed) => {
        try {
          const res = await parser.parseURL(feed.url);
          return res.items.slice(0, ITEMS_PER_FEED).map((item) => ({
            title: item.title,
            link: item.link,
            pubDate: item.pubDate,
            contentSnippet: truncateText(item.contentSnippet || item.content),
            category: feed.category,
            categoryColor: feed.color,
            // Sem fetch externo: Google News fica sem imagem
            imageUrl: feed.hasRssImage ? extractImageFromRss(item) : undefined,
          }));
        } catch (e) {
          console.error(`Erro no feed ${feed.category} (${feed.url}):`, e);
          return [];
        }
      })
    );

    // Junta, remove duplicatas e limita por categoria
    const merged = deduplicateByLink(feedResults.flat());

    // Ordena por data dentro da categoria
    merged.sort((a, b) => {
      const tA = a.pubDate ? new Date(a.pubDate).getTime() : 0;
      const tB = b.pubDate ? new Date(b.pubDate).getTime() : 0;
      return tB - tA;
    });

    return merged.slice(0, MAX_PER_CATEGORY);
  });

  const categoryResults = await Promise.all(categoryPromises);
  const allItems = categoryResults.flat();

  // Ordenação final geral por data
  return allItems.sort((a, b) => {
    const tA = a.pubDate ? new Date(a.pubDate).getTime() : 0;
    const tB = b.pubDate ? new Date(b.pubDate).getTime() : 0;
    return tB - tA;
  });
}

export default async function Home() {
  const posts = await getNews();
  return <NewsClient posts={posts} />;
}
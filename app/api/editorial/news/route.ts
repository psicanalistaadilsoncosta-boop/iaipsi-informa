import { NextResponse } from 'next/server';
import Parser from 'rss-parser';

const parser = new Parser();

const FEEDS = [
  { url: 'https://news.google.com/rss/search?q=saude+mental&hl=pt-BR&gl=BR&ceid=BR:pt-419', category: 'Saúde Mental' },
  { url: 'https://news.google.com/rss/search?q=lideranca+gestao+empresas&hl=pt-BR&gl=BR&ceid=BR:pt-419', category: 'Liderança & Gestão' },
  { url: 'https://news.google.com/rss/search?q=psicanalise+terapia&hl=pt-BR&gl=BR&ceid=BR:pt-419', category: 'Psicanálise' },
  { url: 'https://news.google.com/rss/search?q=economia+brasil&hl=pt-BR&gl=BR&ceid=BR:pt-419', category: 'Economia' },
  { url: 'https://news.google.com/rss/search?q=cultura+organizacional+rh&hl=pt-BR&gl=BR&ceid=BR:pt-419', category: 'Liderança & Gestão' },
];

async function resolveUrl(url: string): Promise<string> {
  if (!url.includes('news.google.com')) return url;
  try {
    const res = await fetch(url, {
      redirect: 'follow',
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; NewsBot/1.0)' },
      signal: AbortSignal.timeout(4000),
    });
    return res.url || url;
  } catch {
    return url;
  }
}

export async function GET() {
  const seen = new Set<string>();
  const items: any[] = [];

  await Promise.all(
    FEEDS.map(async (feed) => {
      try {
        const res = await parser.parseURL(feed.url);
        await Promise.all(
          res.items.slice(0, 5).map(async (item) => {
            const link = await resolveUrl(item.link || '');
            if (!link || seen.has(link)) return;
            seen.add(link);
            items.push({
              title: item.title || '',
              link,
              snippet: (item.contentSnippet || '').replace(/<[^>]*>/g, '').slice(0, 200),
              category: feed.category,
            });
          })
        );
      } catch {
        // feed falhou, ignora
      }
    })
  );

  // Embaralha para variar a ordem
  items.sort(() => Math.random() - 0.5);

  return NextResponse.json({ items: items.slice(0, 30) });
}
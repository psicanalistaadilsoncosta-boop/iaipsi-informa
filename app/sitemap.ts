import { MetadataRoute } from 'next';
import fs from 'fs/promises';
import path from 'path';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = 'https://informa.iaipsi.com';

  // Páginas fixas
  const static_pages: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: 'hourly', priority: 1 },
    { url: `${base}/arquivo-editorial`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${base}/arquivo-sabores`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
  ];

  // Análises editoriais
  let editorialPages: MetadataRoute.Sitemap = [];
  try {
    const raw = await fs.readFile(path.join(process.cwd(), 'public', 'editorial.json'), 'utf-8');
    const items = JSON.parse(raw);
    editorialPages = items.map((item: any) => ({
      url: `${base}/editorial/${item.id}`,
      lastModified: new Date(item.publishedAt),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }));
  } catch {}

  // Posts de sabores
  let saboresPages: MetadataRoute.Sitemap = [];
  try {
    const raw = await fs.readFile(path.join(process.cwd(), 'public', 'sabores.json'), 'utf-8');
    const items = JSON.parse(raw);
    saboresPages = items.map((item: any) => ({
      url: `${base}/sabores/${item.id}`,
      lastModified: new Date(item.publishedAt),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }));
  } catch {}

  return [...static_pages, ...editorialPages, ...saboresPages];
}
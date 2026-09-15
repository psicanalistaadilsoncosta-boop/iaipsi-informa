import fs from 'fs/promises';
import path from 'path';
import SaboresPostClient from './SaboresPostClient';

interface SaboresItem {
  id: string;
  prato: string;
  destino: string;
  intro: string;
  cta: string;
  content: string;
  imageUrl: string | null;
  publishedAt: string;
  recipe?: any;
}

async function getItem(id: string): Promise<SaboresItem | null> {
  try {
    const filePath = path.join(process.cwd(), 'public', 'sabores.json');
    const raw = await fs.readFile(filePath, 'utf-8');
    const items: SaboresItem[] = JSON.parse(raw);
    return items.find(i => i.id === id) || null;
  } catch { return null; }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await getItem(id);
  if (!item) return {};
  return {
    title: `${item.prato} — ${item.destino}`,
    description: item.intro,
    openGraph: {
      title: `${item.prato} — ${item.destino}`,
      description: item.intro,
      type: 'article',
      images: item.imageUrl ? [{ url: item.imageUrl }] : [],
    },
  };
}

export default async function SaboresPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await getItem(id);
  return <SaboresPostClient item={item} />;
}

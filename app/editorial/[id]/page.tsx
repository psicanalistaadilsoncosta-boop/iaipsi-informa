import fs from 'fs/promises';
import path from 'path';
import Link from 'next/link';
import { kv } from '@/lib/kv';

interface EditorialItem {
  id: string;
  title: string;
  analysis: string;
  link: string;
  category?: string;
  publishedAt: string;
  author: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  'Política': '#1e3a8a', 'Economia': '#047857', 'Esportes': '#ea580c',
  'Saúde Mental': '#7c3aed', 'Saúde & Ciência': '#0284c7', 'Psicanálise': '#be185d',
  'Tecnologia & IA': '#0f766e', 'Educação & Carreira': '#b45309',
  'Liderança & Gestão': '#7c2d12', 'Mundo': '#374151',
};

function renderAnalysis(text: string) {
  return text.split('\n').map((line, i) => {
    const trimmed = line.trim();
    if (!trimmed) return <br key={i} />;
    // Linha só com negrito = título de seção
    if (/^\*\*[^*]+\*\*$/.test(trimmed)) {
      const title = trimmed.replace(/\*\*/g, '');
      return <h2 key={i} style={{ fontSize: '1rem', fontWeight: 700, color: '#111827', margin: '24px 0 8px', textTransform: 'none' }}>{title}</h2>;
    }
    const parsed = trimmed.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    return <p key={i} style={{ margin: '0 0 16px', lineHeight: 1.85, fontSize: '1.05rem', color: '#374151' }} dangerouslySetInnerHTML={{ __html: parsed }} />;
  });
}

async function getItem(id: string): Promise<EditorialItem | null> {
  try {
    const data = await kv.get<EditorialItem[]>('editorial:items');
    if (data) return data.find(i => i.id === id) || null;
  } catch {}
  try {
    const filePath = path.join(process.cwd(), 'public', 'editorial.json');
    const raw = await fs.readFile(filePath, 'utf-8');
    const items: EditorialItem[] = JSON.parse(raw);
    return items.find(i => i.id === id) || null;
  } catch { return null; }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await getItem(id);
  if (!item) return {};
  return {
    title: item.title,
    description: item.analysis.replace(/\*\*/g, '').split('\n').find((l: string) => l.trim()) || '',
    openGraph: {
      title: item.title,
      description: item.analysis.replace(/\*\*/g, '').split('\n').find((l: string) => l.trim()) || '',
      type: 'article',
      publishedTime: item.publishedAt,
      authors: ['Adilson Costa'],
    },
  };
}

export default async function EditorialPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await getItem(id);
  const color = (cat?: string) => CATEGORY_COLORS[cat || ''] || '#be185d';

  if (!item) return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif', backgroundColor: '#f9fafb' }}>
      <p style={{ color: '#9ca3af' }}>Análise não encontrada.</p>
    </main>
  );

  return (
    <main style={{ maxWidth: '780px', margin: '0 auto', padding: '30px 20px', fontFamily: 'system-ui, sans-serif', backgroundColor: '#f9fafb', minHeight: '100vh' }}>

      <Link href="/arquivo-editorial" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#be185d', fontWeight: 600, fontSize: '0.85rem', textDecoration: 'none', marginBottom: '24px' }}>
        ← Todas as análises
      </Link>

      <article style={{ backgroundColor: '#fff', borderRadius: '14px', border: '1px solid #e5e7eb', padding: '36px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', borderLeft: `6px solid ${color(item.category)}` }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
          {item.category && (
            <span style={{ backgroundColor: color(item.category), color: '#fff', fontSize: '0.72rem', fontWeight: 700, padding: '3px 10px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {item.category}
            </span>
          )}
          <small style={{ color: '#9ca3af', fontSize: '0.78rem' }}>
            {new Date(item.publishedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })} · {item.author}
          </small>
        </div>

       <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#374151', margin: '0 0 8px', lineHeight: 1.4, fontStyle: 'italic' }}>
          {item.title}
        </h1>
        <p style={{ fontSize: '0.78rem', color: '#9ca3af', margin: '0 0 28px' }}>Notícia de origem</p>

        <div style={{ marginBottom: '28px' }}>
          {renderAnalysis(item.analysis)}
        </div>

        <div style={{ paddingTop: '20px', borderTop: '1px solid #f3f4f6' }}>
          <a href={item.link} target="_blank" rel="noopener noreferrer" style={{ color: color(item.category), fontWeight: 600, fontSize: '0.88rem', textDecoration: 'none' }}>
            Ver notícia original ↗
          </a>
        </div>

      </article>

      <footer style={{ marginTop: '32px', textAlign: 'center' }}>
        <p style={{ fontSize: '0.72rem', color: '#9ca3af', margin: 0, lineHeight: 1.6 }}>
          Análise elaborada com auxílio de inteligência artificial e revisada por Adilson Costa.
        </p>
      </footer>

    </main>
  );
}
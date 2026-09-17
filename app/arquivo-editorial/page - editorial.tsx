import fs from 'fs/promises';
import path from 'path';
import Link from 'next/link';

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

const SECTION_TITLES = ['O fato', 'O que está em jogo', 'A lente', 'Para o líder'];

function getPreview(analysis: string): string {
  const lines = analysis.replace(/\*\*/g, '').split('\n');
  return lines.find(l => {
    const t = l.trim();
    return t && !SECTION_TITLES.includes(t);
  })?.trim() || '';
}

async function getEditorial(): Promise<EditorialItem[]> {
  try {
    const filePath = path.join(process.cwd(), 'public', 'editorial.json');
    const raw = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch { return []; }
}

export default async function ArquivoEditorialPage() {
  const items = await getEditorial();
  const color = (cat?: string) => CATEGORY_COLORS[cat || ''] || '#be185d';

  return (
    <main style={{ maxWidth: '860px', margin: '0 auto', padding: '30px 20px', fontFamily: 'system-ui, sans-serif', backgroundColor: '#f9fafb', minHeight: '100vh' }}>

      <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#be185d', fontWeight: 600, fontSize: '0.85rem', textDecoration: 'none', marginBottom: '24px' }}>
        ← Voltar ao site
      </Link>

      <header style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', marginBottom: '32px', borderTop: '6px solid #be185d' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#111827', margin: '0 0 6px' }}>Análises Editoriais</h1>
        <p style={{ color: '#6b7280', fontSize: '0.95rem', margin: 0 }}>
          Todas as análises por Adilson Costa — Psicanalista
        </p>
      </header>

      {items.length === 0 ? (
        <p style={{ color: '#6b7280', textAlign: 'center', padding: '40px' }}>Nenhuma análise publicada ainda.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {items.map(item => (
            <Link key={item.id} href={`/editorial/${item.id}`} style={{ textDecoration: 'none' }}>
              <article style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '24px', boxShadow: '0 2px 6px rgba(0,0,0,0.04)', borderLeft: `5px solid ${color(item.category)}`, cursor: 'pointer' }}>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', flexWrap: 'wrap' }}>
                  {item.category && (
                    <span style={{ backgroundColor: color(item.category), color: '#fff', fontSize: '0.72rem', fontWeight: 700, padding: '3px 10px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {item.category}
                    </span>
                  )}
                  <small style={{ color: '#9ca3af', fontSize: '0.78rem' }}>
                    {new Date(item.publishedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </small>
                </div>

                <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#111827', margin: '0 0 8px', lineHeight: 1.4 }}>
                  {item.title}
                </h2>

                <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0 0 12px', lineHeight: 1.55, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {getPreview(item.analysis)}
                </p>

                <span style={{ fontSize: '0.82rem', color: color(item.category), fontWeight: 600 }}>
                  Ler análise completa →
                </span>

              </article>
            </Link>
          ))}
        </div>
      )}

      <footer style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #e5e7eb', textAlign: 'center' }}>
        <p style={{ fontSize: '0.72rem', color: '#9ca3af', margin: 0 }}>
          Análises elaboradas com auxílio de inteligência artificial e revisadas por Adilson Costa.
        </p>
      </footer>

    </main>
  );
}

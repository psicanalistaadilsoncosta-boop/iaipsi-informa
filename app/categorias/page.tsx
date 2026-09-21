import { kv } from '@/lib/kv';
import Link from 'next/link';

export const revalidate = 0;

interface ProdutoPinado {
  id: string;
  nome: string;
  imagem: string;
  preco: number;
  categoria?: string;
  destinos: string[];
}

const ICONES: Record<string, string> = {
  'eletro': '⚡',
  'tech': '💻',
  'moda': '👗',
  'casa': '🏠',
  'moveis': '🪑',
  'saude': '💊',
  'beleza': '💄',
  'bebe': '🍼',
  'kids': '🧸',
  'brinquedo': '🎮',
  'gastro': '🍷',
  'aliment': '🥘',
  'bebida': '🍺',
  'esporte': '⚽',
  'fitness': '🏋️',
  'livro': '📚',
  'entret': '🎬',
  'viagem': '✈️',
  'servico': '🛠️',
  'churrasq': '🔥',
};

function getIcone(categoria: string): string {
  const lower = categoria.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  for (const [key, icone] of Object.entries(ICONES)) {
    if (lower.includes(key)) return icone;
  }
  return '🏷️';
}

function categoriaToSlug(cat: string): string {
  return cat
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

async function getCategorias(): Promise<{ nome: string; slug: string; total: number; thumb?: string }[]> {
  try {
    const todos = await kv.get<ProdutoPinado[]>('produtos:pinados') || [];
    const mapa = new Map<string, { total: number; thumb?: string }>();

    for (const p of todos) {
      if (!p.categoria) continue;
      const existente = mapa.get(p.categoria);
      if (existente) {
        existente.total += 1;
        if (!existente.thumb && p.imagem) existente.thumb = p.imagem;
      } else {
        mapa.set(p.categoria, { total: 1, thumb: p.imagem || undefined });
      }
    }

    return Array.from(mapa.entries())
      .map(([nome, { total, thumb }]) => ({ nome, slug: categoriaToSlug(nome), total, thumb }))
      .sort((a, b) => b.total - a.total);
  } catch {
    return [];
  }
}

export default async function CategoriasPage() {
  const categorias = await getCategorias();

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#f9fafb', fontFamily: 'system-ui' }}>
      <div style={{ backgroundColor: '#fff', borderBottom: '1px solid #e5e7eb', padding: '20px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <Link href="/" style={{ color: '#6b7280', fontSize: '0.85rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px', marginBottom: '12px' }}>
            ← Início
          </Link>
          <h1 style={{ fontSize: '1.7rem', fontWeight: 800, color: '#111827', margin: '0 0 4px' }}>🏷️ Categorias</h1>
          <p style={{ color: '#6b7280', fontSize: '0.9rem', margin: 0 }}>
            {categorias.length} {categorias.length === 1 ? 'categoria' : 'categorias'} com produtos selecionados
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '24px 16px' }}>
        {categorias.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9ca3af' }}>
            <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🏷️</div>
            <p>Nenhuma categoria disponível no momento.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '14px' }}>
            {categorias.map(cat => (
              <Link key={cat.slug} href={`/categorias/${cat.slug}`} style={{ textDecoration: 'none', display: 'block' }}>
                <div style={{ backgroundColor: '#fff', borderRadius: '14px', overflow: 'hidden', border: '1px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', padding: '20px', textAlign: 'center' }}>
                  {cat.thumb ? (
                    <div style={{ width: '64px', height: '64px', borderRadius: '12px', overflow: 'hidden', margin: '0 auto 14px', backgroundColor: '#f3f4f6' }}>
                      <img src={cat.thumb} alt={cat.nome} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '4px', boxSizing: 'border-box' }} />
                    </div>
                  ) : (
                    <div style={{ fontSize: '2.5rem', marginBottom: '14px' }}>{getIcone(cat.nome)}</div>
                  )}
                  <p style={{ fontSize: '0.9rem', fontWeight: 700, color: '#111827', margin: '0 0 4px', lineHeight: 1.3 }}>
                    {cat.nome}
                  </p>
                  <p style={{ fontSize: '0.78rem', color: '#6b7280', margin: 0 }}>
                    {cat.total} {cat.total === 1 ? 'produto' : 'produtos'}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

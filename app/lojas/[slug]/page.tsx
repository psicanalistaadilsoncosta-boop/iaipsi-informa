import { kv } from '@/lib/kv';
import Link from 'next/link';

interface ProdutoPinado {
  id: string;
  nome: string;
  imagem: string;
  preco: number;
  loja?: string;
  destinos: string[];
}

function lojaToSlug(loja: string): string {
  return loja
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

async function getLojas(): Promise<{ nome: string; slug: string; total: number; thumb?: string }[]> {
  try {
    const todos = await kv.get<ProdutoPinado[]>('produtos:pinados') || [];
    const mapa = new Map<string, { total: number; thumb?: string }>();

    for (const p of todos) {
      if (!p.loja) continue;
      const existente = mapa.get(p.loja);
      if (existente) {
        existente.total += 1;
        if (!existente.thumb && p.imagem) existente.thumb = p.imagem;
      } else {
        mapa.set(p.loja, { total: 1, thumb: p.imagem || undefined });
      }
    }

    return Array.from(mapa.entries())
      .map(([nome, { total, thumb }]) => ({ nome, slug: lojaToSlug(nome), total, thumb }))
      .sort((a, b) => b.total - a.total);
  } catch {
    return [];
  }
}

export default async function LojasPage() {
  const lojas = await getLojas();

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#f9fafb', fontFamily: 'system-ui' }}>
      {/* Header */}
      <div style={{ backgroundColor: '#fff', borderBottom: '1px solid #e5e7eb', padding: '20px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <Link href="/" style={{ color: '#6b7280', fontSize: '0.85rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px', marginBottom: '12px' }}>
            ← Início
          </Link>
          <h1 style={{ fontSize: '1.7rem', fontWeight: 800, color: '#111827', margin: '0 0 4px' }}>🏪 Lojas</h1>
          <p style={{ color: '#6b7280', fontSize: '0.9rem', margin: 0 }}>
            Produtos curados de {lojas.length} {lojas.length === 1 ? 'loja' : 'lojas'} parceiras
          </p>
        </div>
      </div>

      {/* Grid de lojas */}
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '24px 16px' }}>
        {lojas.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9ca3af' }}>
            <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🏪</div>
            <p>Nenhuma loja disponível no momento.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '14px' }}>
            {lojas.map(loja => (
              <Link key={loja.slug} href={`/loja/${loja.slug}`} style={{ textDecoration: 'none', display: 'block' }}>
                <div style={{ backgroundColor: '#fff', borderRadius: '14px', overflow: 'hidden', border: '1px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', padding: '20px', textAlign: 'center', transition: 'box-shadow 0.2s' }}>
                  {/* Thumbnail ou ícone */}
                  <div style={{ width: '64px', height: '64px', borderRadius: '12px', overflow: 'hidden', margin: '0 auto 14px', backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {loja.thumb ? (
                      <img src={loja.thumb} alt={loja.nome} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '4px', boxSizing: 'border-box' }} />
                    ) : (
                      <span style={{ fontSize: '2rem' }}>🏪</span>
                    )}
                  </div>
                  <p style={{ fontSize: '0.95rem', fontWeight: 700, color: '#111827', margin: '0 0 4px', lineHeight: 1.3 }}>
                    {loja.nome}
                  </p>
                  <p style={{ fontSize: '0.78rem', color: '#6b7280', margin: 0 }}>
                    {loja.total} {loja.total === 1 ? 'produto' : 'produtos'}
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

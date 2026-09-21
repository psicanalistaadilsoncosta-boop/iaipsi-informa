import { kv } from '@/lib/kv';
import Link from 'next/link';

export const revalidate = 0;

interface ProdutoPinado {
  id: string;
  nome: string;
  imagem: string;
  link: string;
  preco: number;
  precoOriginal: number;
  desconto: number;
  parcelas?: string;
  valorParcela?: string;
  loja?: string;
  categoria?: string;
  destinos: string[];
  ativo?: boolean;
  pinedAt: string;
}

function categoriaToSlug(cat: string): string {
  return cat
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

async function getProdutosDaCategoria(slug: string): Promise<{ produtos: ProdutoPinado[]; nomeCategoria: string | null }> {
  try {
    const todos = await kv.get<ProdutoPinado[]>('produtos:pinados') || [];
    const produtos = todos.filter(p => p.categoria && categoriaToSlug(p.categoria) === slug);
    const nomeCategoria = produtos.length > 0 ? produtos[0].categoria! : null;
    return { produtos, nomeCategoria };
  } catch {
    return { produtos: [], nomeCategoria: null };
  }
}

export default async function CategoriaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { produtos, nomeCategoria } = await getProdutosDaCategoria(slug);

  if (!nomeCategoria) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui', backgroundColor: '#f9fafb' }}>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🏷️</div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#111827', margin: '0 0 8px' }}>Categoria não encontrada</h1>
          <p style={{ color: '#6b7280', marginBottom: '24px' }}>Nenhum produto desta categoria está disponível.</p>
          <Link href="/categorias" style={{ color: '#2563eb', fontWeight: 600, textDecoration: 'none' }}>← Ver todas as categorias</Link>
        </div>
      </main>
    );
  }

  // Agrupa por loja para mostrar filtro opcional
  const lojas = [...new Set(produtos.map(p => p.loja).filter(Boolean))] as string[];

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#f9fafb', fontFamily: 'system-ui' }}>
      {/* Header */}
      <div style={{ backgroundColor: '#fff', borderBottom: '1px solid #e5e7eb', padding: '16px 20px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <Link href="/categorias" style={{ color: '#6b7280', fontSize: '0.85rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px', marginBottom: '12px' }}>
            ← Todas as categorias
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '2rem' }}>🏷️</span>
            <div>
              <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#111827', margin: 0 }}>{nomeCategoria}</h1>
              <p style={{ color: '#6b7280', fontSize: '0.9rem', margin: '2px 0 0' }}>
                {produtos.length} {produtos.length === 1 ? 'produto' : 'produtos'}
                {lojas.length > 0 && ` · ${lojas.length} ${lojas.length === 1 ? 'loja' : 'lojas'}`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Lojas disponíveis nessa categoria */}
      {lojas.length > 1 && (
        <div style={{ backgroundColor: '#fff', borderBottom: '1px solid #f3f4f6', padding: '12px 20px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', color: '#9ca3af', fontWeight: 600 }}>Lojas:</span>
            {lojas.map(loja => (
              <Link key={loja} href={`/loja/${loja.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`}
                style={{ fontSize: '0.8rem', backgroundColor: '#f3f4f6', color: '#374151', padding: '4px 10px', borderRadius: '20px', textDecoration: 'none', fontWeight: 600 }}>
                🏪 {loja}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Produtos */}
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '24px 16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
          {produtos.map(produto => (
            <a key={produto.id} href={produto.link} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', display: 'block' }}>
              <div style={{ backgroundColor: '#fff', borderRadius: '14px', overflow: 'hidden', border: '1px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div style={{ height: '200px', overflow: 'hidden', backgroundColor: '#f3f4f6', position: 'relative' }}>
                  {produto.imagem ? (
                    <img src={produto.imagem} alt={produto.nome} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '8px', boxSizing: 'border-box' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: '3rem' }}>📦</span>
                    </div>
                  )}
                  {produto.desconto > 0 && (
                    <span style={{ position: 'absolute', top: '10px', left: '10px', backgroundColor: '#dc2626', color: '#fff', fontSize: '0.72rem', fontWeight: 800, padding: '3px 8px', borderRadius: '20px' }}>
                      -{produto.desconto}%
                    </span>
                  )}
                  {produto.loja && (
                    <span style={{ position: 'absolute', top: '10px', right: '10px', backgroundColor: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: '0.68rem', fontWeight: 600, padding: '3px 8px', borderRadius: '20px' }}>
                      🏪 {produto.loja}
                    </span>
                  )}
                </div>

                <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <p style={{ fontSize: '0.88rem', fontWeight: 600, color: '#1f2937', margin: '0 0 10px', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {produto.nome}
                  </p>
                  <div style={{ marginTop: 'auto' }}>
                    {produto.precoOriginal > produto.preco && (
                      <p style={{ fontSize: '0.78rem', color: '#9ca3af', textDecoration: 'line-through', margin: '0 0 2px' }}>
                        R$ {produto.precoOriginal.toFixed(2).replace('.', ',')}
                      </p>
                    )}
                    <p style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111827', margin: '0 0 4px' }}>
                      R$ {produto.preco.toFixed(2).replace('.', ',')}
                    </p>
                    {produto.parcelas && produto.valorParcela && (
                      <p style={{ fontSize: '0.78rem', color: '#047857', margin: '0 0 12px' }}>
                        {produto.parcelas}x de R$ {Number(produto.valorParcela).toFixed(2).replace('.', ',')} sem juros
                      </p>
                    )}
                    <div style={{ backgroundColor: '#2563eb', color: '#fff', borderRadius: '8px', padding: '9px 14px', fontSize: '0.85rem', fontWeight: 700, textAlign: 'center', marginTop: '8px' }}>
                      Ver oferta →
                    </div>
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </main>
  );
}

import type { Metadata } from 'next';
import { kv } from '@/lib/kv';
import BotaoWhatsApp from '../BotaoWhatsApp';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Buscar ofertas',
  robots: { index: false, follow: true },
};

// Remove acentos e deixa minúsculo: "Cafeteira Elétrica" -> "cafeteira eletrica"
function normalizar(texto: string): string {
  return (texto || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

function formatarPreco(valor: any): string | null {
  const n = Number(valor);
  if (!n || isNaN(n) || n <= 0) return null;
  return n.toFixed(2).replace('.', ',');
}

async function buscarProdutos(termo: string): Promise<any[]> {
  if (termo.length < 2) return [];
  try {
    const produtos = (await kv.get<any[]>('produtos:pinados')) || [];
    const palavras = normalizar(termo).split(/\s+/).filter(Boolean);

    return produtos
      .filter((p) => {
        const texto = normalizar(
          `${p.nome || ''} ${p.lojaNome || p.loja || ''} ${p.categoria || ''} ${p.ambiente || ''}`
        );
        // Todas as palavras digitadas precisam aparecer
        return palavras.every((w) => texto.includes(w));
      })
      .slice(0, 60);
  } catch (e) {
    console.error('[busca]', e);
    return [];
  }
}

export default async function BuscaPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = '' } = await searchParams;
  const termo = q.trim();
  const resultados = await buscarProdutos(termo);

  return (
    <main
      style={{
        maxWidth: '1060px',
        margin: '0 auto',
        padding: '30px 20px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        backgroundColor: '#f9fafb',
        minHeight: '100vh',
      }}
    >
      <a href="/" style={{ fontSize: '0.85rem', color: '#5B3E96', fontWeight: 600, textDecoration: 'none' }}>
        ← Voltar para o início
      </a>

      <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#111827', margin: '16px 0 12px' }}>
        🔍 Buscar ofertas
      </h1>

      {/* Campo de busca da própria página, para refinar */}
      <form action="/busca" method="get" style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <input
          type="search"
          name="q"
          defaultValue={termo}
          placeholder="O que você procura? Ex.: air fryer, tênis, perfume"
          style={{
            flex: '1 1 260px',
            padding: '12px 14px',
            borderRadius: '8px',
            border: '1.5px solid #d1d5db',
            fontSize: '1rem',
          }}
        />
        <button
          type="submit"
          style={{
            backgroundColor: '#5B3E96',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            padding: '12px 22px',
            fontWeight: 700,
            fontSize: '0.95rem',
            cursor: 'pointer',
          }}
        >
          Buscar
        </button>
      </form>

      {termo.length < 2 ? (
        <p style={{ color: '#6b7280' }}>Digite pelo menos 2 letras para buscar.</p>
      ) : resultados.length === 0 ? (
        <div style={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '24px', color: '#374151' }}>
          <p style={{ margin: '0 0 8px', fontWeight: 700 }}>Nenhuma oferta encontrada para “{termo}”.</p>
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#6b7280' }}>
            Tente outra palavra ou veja as{' '}
            <a href="/ofertas-selecionadas" style={{ color: '#5B3E96', fontWeight: 600 }}>ofertas selecionadas</a>.
          </p>
        </div>
      ) : (
        <>
          <p style={{ color: '#6b7280', fontSize: '0.9rem', margin: '0 0 16px' }}>
            {resultados.length} oferta{resultados.length > 1 ? 's' : ''} para “{termo}”
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '16px',
            }}
          >
            {resultados.map((p, i) => {
              const imagem = p.imagem || p.foto || p.thumbnail || '';
              const preco = formatarPreco(p.preco);
              const precoOriginal = formatarPreco(p.precoOriginal);
              const loja = p.lojaNome || p.loja || '';
              const irUrl = `/ir?url=${encodeURIComponent(p.link || '')}&nome=${encodeURIComponent(p.nome || '')}&imagem=${encodeURIComponent(imagem)}`;

              return (
                <a key={p.id || i} href={irUrl} style={{ textDecoration: 'none' }}>
                  <article
                    style={{
                      backgroundColor: '#fff',
                      borderRadius: '12px',
                      border: '1px solid #e5e7eb',
                      overflow: 'hidden',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                      display: 'flex',
                      flexDirection: 'column',
                      height: '100%',
                    }}
                  >
                    <div
                      style={{
                        height: '160px',
                        backgroundColor: '#f9fafb',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '8px',
                        position: 'relative',
                      }}
                    >
                      {imagem && (
                        <img src={imagem} alt={p.nome || ''} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                      )}
                      {Number(p.desconto) > 0 && (
                        <span
                          style={{
                            position: 'absolute',
                            top: '8px',
                            left: '8px',
                            backgroundColor: '#dc2626',
                            color: '#fff',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: '6px',
                          }}
                        >
                          -{p.desconto}%
                        </span>
                      )}
                    </div>

                    <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '6px', flexGrow: 1 }}>
                      {loja && <div style={{ fontSize: '0.7rem', color: '#047857', fontWeight: 600 }}>🏪 {loja}</div>}
                      <h2
                        style={{
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          color: '#111827',
                          margin: 0,
                          lineHeight: 1.4,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {p.nome}
                      </h2>

                      <div style={{ marginTop: 'auto' }}>
                        {precoOriginal && Number(p.precoOriginal) > Number(p.preco) && (
                          <div style={{ fontSize: '0.72rem', color: '#9ca3af', textDecoration: 'line-through' }}>
                            R$ {precoOriginal}
                          </div>
                        )}
                        {preco && (
                          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#dc2626' }}>R$ {preco}</div>
                        )}
                      </div>

                      <div
                        style={{
                          backgroundColor: '#5B3E96',
                          color: '#fff',
                          padding: '7px',
                          borderRadius: '6px',
                          fontWeight: 700,
                          fontSize: '0.8rem',
                          textAlign: 'center',
                        }}
                      >
                        Ver oferta →
                      </div>
                      <BotaoWhatsApp nome={p.nome || ''} link={p.link || ''} imagem={imagem} preco={p.preco} />
                    </div>
                  </article>
                </a>
              );
            })}
          </div>
        </>
      )}
    </main>
  );
}

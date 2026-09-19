'use client';
import { useState, useEffect } from 'react';

interface Review {
  id: string;
  nota: number;
  titulo: string;
  texto: string;
  autor: string;
  data: string;
  pais: string;
}

function Estrelas({ nota, tamanho = 14 }: { nota: number; tamanho?: number }) {
  const cheia = Math.floor(nota);
  const meia = nota - cheia >= 0.5;
  return (
    <span style={{ display: 'inline-flex', gap: '1px', alignItems: 'center' }}>
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} style={{ fontSize: `${tamanho}px`, color: i <= cheia ? '#f59e0b' : (i === cheia + 1 && meia ? '#f59e0b' : '#e5e7eb') }}>
          {i <= cheia ? '★' : (i === cheia + 1 && meia ? '½' : '☆')}
        </span>
      ))}
    </span>
  );
}

function formatarData(iso: string) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
  } catch { return ''; }
}

export default function AvaliacoesPasseio({
  productCode,
  ratingInicial,
  totalReviewsInicial,
}: {
  productCode: string;
  ratingInicial?: number;
  totalReviewsInicial?: number;
}) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [avgRating, setAvgRating] = useState<number | null>(ratingInicial ?? null);
  const [total, setTotal] = useState<number>(totalReviewsInicial ?? 0);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(false);
  const [expandidos, setExpandidos] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!productCode) { setLoading(false); return; }
    fetch(`/api/viator/reviews?code=${encodeURIComponent(productCode)}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) { setErro(true); return; }
        setReviews(d.reviews ?? []);
        if (d.avgRating != null) setAvgRating(d.avgRating);
        if (d.totalReviews != null) setTotal(d.totalReviews);
      })
      .catch(() => setErro(true))
      .finally(() => setLoading(false));
  }, [productCode]);

  // Se nem rating inicial nem reviews — não renderiza nada
  if (!loading && erro && !avgRating && reviews.length === 0) return null;

  return (
    <section style={{ marginTop: '40px' }}>
      <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#111827', marginBottom: '20px', borderBottom: '2px solid #e5e7eb', paddingBottom: '10px' }}>
        ⭐ Avaliações de Viajantes
      </h2>

      {/* Resumo do rating */}
      {(avgRating != null || total > 0) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', backgroundColor: '#fffbeb', border: '1px solid #fde68a', borderRadius: '12px', padding: '16px 20px', marginBottom: '24px' }}>
          {avgRating != null && (
            <div style={{ textAlign: 'center', minWidth: '60px' }}>
              <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#d97706', lineHeight: 1 }}>{avgRating.toFixed(1)}</div>
              <Estrelas nota={avgRating} tamanho={16} />
            </div>
          )}
          {total > 0 && (
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#374151' }}>{total.toLocaleString('pt-BR')} avaliações</div>
              <div style={{ fontSize: '0.78rem', color: '#6b7280' }}>via Viator</div>
            </div>
          )}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '30px', color: '#9ca3af', fontSize: '0.9rem' }}>
          ⏳ Carregando avaliações...
        </div>
      )}

      {/* Erro mas tem rating — mostra só o resumo (já renderizado acima) */}
      {!loading && erro && (
        <p style={{ fontSize: '0.82rem', color: '#9ca3af' }}>Não foi possível carregar os comentários individuais.</p>
      )}

      {/* Reviews */}
      {!loading && !erro && reviews.length === 0 && (
        <p style={{ fontSize: '0.85rem', color: '#9ca3af' }}>Nenhuma avaliação disponível ainda.</p>
      )}

      {!loading && reviews.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {reviews.map(r => {
            const expandido = expandidos.has(r.id);
            const textoLongo = r.texto.length > 220;
            const textoExibido = textoLongo && !expandido ? r.texto.slice(0, 220) + '…' : r.texto;

            return (
              <div key={r.id} style={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
                  <div>
                    <Estrelas nota={r.nota} />
                    {r.titulo && (
                      <p style={{ fontSize: '0.88rem', fontWeight: 700, color: '#111827', margin: '4px 0 0' }}>{r.titulo}</p>
                    )}
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#374151' }}>{r.autor}</div>
                    {r.pais && <div style={{ fontSize: '0.7rem', color: '#9ca3af' }}>{r.pais}</div>}
                    {r.data && <div style={{ fontSize: '0.7rem', color: '#9ca3af' }}>{formatarData(r.data)}</div>}
                  </div>
                </div>
                {r.texto && (
                  <div>
                    <p style={{ fontSize: '0.83rem', color: '#4b5563', margin: 0, lineHeight: 1.6 }}>{textoExibido}</p>
                    {textoLongo && (
                      <button
                        onClick={() => setExpandidos(prev => {
                          const next = new Set(prev);
                          expandido ? next.delete(r.id) : next.add(r.id);
                          return next;
                        })}
                        style={{ background: 'none', border: 'none', color: '#0f766e', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', padding: '4px 0 0', display: 'block' }}
                      >
                        {expandido ? 'Ver menos ▲' : 'Ver mais ▼'}
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

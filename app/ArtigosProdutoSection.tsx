'use client';

import { useState, useEffect } from 'react';

export default function ArtigosProdutoSection({ artigos }: { artigos: any[] }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    function check() { setIsMobile(window.innerWidth < 640); }
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  if (!artigos || artigos.length === 0) return null;

  return (
    <section style={{ marginBottom: '32px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <div style={{ width: '4px', height: '28px', backgroundColor: '#2563eb', borderRadius: '2px' }} />
        <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#111827', margin: 0 }}>📦 Guias de Produtos</h2>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {artigos.map((artigo: any) => {
          const preview = artigo.conteudo
            ?.replace(/#{1,3} /g, '')
            .replace(/\*\*/g, '')
            .replace(/---/g, '')
            .split('\n')
            .filter((l: string) => l.trim().length > 40)
            .slice(0, 2)
            .join(' ') || artigo.descricaoCurta || '';

          return (
            <a key={artigo.id} href={`/produto/${artigo.slug}`} style={{ textDecoration: 'none' }}>
              <article style={{ backgroundColor: '#fff', borderRadius: '14px', overflow: 'hidden', border: '1px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', display: 'flex', flexDirection: isMobile ? 'column' : 'row' }}>
                <div style={{ width: isMobile ? '100%' : '200px', height: isMobile ? '200px' : 'auto', flexShrink: 0, backgroundColor: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', borderRight: isMobile ? 'none' : '1px solid #f3f4f6', borderBottom: isMobile ? '1px solid #f3f4f6' : 'none' }}>
                  {artigo.imagem ? (
                    <img src={artigo.imagem} alt={artigo.titulo} style={{ maxWidth: '100%', maxHeight: isMobile ? '160px' : '140px', objectFit: 'contain' }} />
                  ) : (
                    <span style={{ fontSize: '3rem' }}>📦</span>
                  )}
                </div>
                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px', flexGrow: 1 }}>
                  <div style={{ fontSize: '0.72rem', color: '#6b7280', fontWeight: 500 }}>{artigo.marca} · {artigo.categoria}</div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#111827', margin: 0, lineHeight: 1.4 }}>
                    Conheça: {artigo.titulo}
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: '#6b7280', margin: 0, lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {preview.substring(0, 300)}...
                  </p>
                  <div style={{ marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid #f3f4f6' }}>
                    <span style={{ fontSize: '0.85rem', color: '#2563eb', fontWeight: 600 }}>Ler artigo completo →</span>
                  </div>
                </div>
              </article>
            </a>
          );
        })}
      </div>
    </section>
  );
}
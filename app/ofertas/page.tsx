'use client';

import { useState, useEffect } from 'react';

interface Oferta {
  id: string;
  titulo: string;
  link: string;
  imagem: string;
  descricao: string;
  preco_original: number;
  preco_oferta: number;
  desconto: number;
  categoria: string;
  color: string;
  fonte: string;
}

export default function OfertasPage() {
  const [ofertas, setOfertas] = useState<Oferta[]>([]);
  const [categorias, setCategorias] = useState<string[]>([]);
  const [categoria, setCategoria] = useState('Todas');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/ofertas?categoria=${encodeURIComponent(categoria)}`)
      .then(r => r.json())
      .then(data => {
        setOfertas(data.items || []);
        if (data.categorias?.length) setCategorias(data.categorias);
      })
      .finally(() => setLoading(false));
  }, [categoria]);

  return (
    <main style={{ maxWidth: '1060px', margin: '0 auto', padding: '30px 20px', fontFamily: 'system-ui, sans-serif', backgroundColor: '#f9fafb', minHeight: '100vh' }}>

      <a href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#2563eb', fontWeight: 600, fontSize: '0.85rem', textDecoration: 'none', marginBottom: '24px' }}>
        ← Voltar ao site
      </a>

      <header style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', marginBottom: '24px', borderTop: '6px solid #dc2626' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#111827', margin: '0 0 6px' }}>🛍 Ofertas & Experiências</h1>
        <p style={{ color: '#6b7280', fontSize: '0.95rem', margin: 0 }}>
          Produtos selecionados com os melhores descontos — tecnologia, saúde, gastronomia e muito mais.
        </p>
      </header>

      {/* Filtros de categoria */}
      <nav style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
        {categorias.map(cat => {
          const isActive = categoria === cat;
          return (
            <button key={cat} onClick={() => setCategoria(cat)} style={{
              padding: '7px 16px',
              borderRadius: '999px',
              border: `2px solid ${isActive ? '#dc2626' : '#e5e7eb'}`,
              backgroundColor: isActive ? '#dc2626' : '#fff',
              color: isActive ? '#fff' : '#374151',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}>
              {cat}
            </button>
          );
        })}
      </nav>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280' }}>
          ⏳ Carregando ofertas...
        </div>
      ) : ofertas.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280' }}>
          Nenhuma oferta encontrada nessa categoria.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {ofertas.map(oferta => (
            <a key={oferta.id} href={oferta.link} target="_blank" rel="noopener noreferrer sponsored" style={{ textDecoration: 'none' }}>
              <article style={{ backgroundColor: '#fff', borderRadius: '14px', overflow: 'hidden', border: '1px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', height: '100%' }}>

                {/* Imagem */}
                <div style={{ position: 'relative', height: '220px', overflow: 'hidden', backgroundColor: '#f3f4f6' }}>
                  {oferta.imagem ? (
                    <img src={oferta.imagem} alt={oferta.titulo} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '12px' }}
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' }}>🛍</div>
                  )}
                  {/* Badge desconto */}
                  {oferta.desconto > 0 && (
                    <div style={{ position: 'absolute', top: '12px', left: '12px', backgroundColor: '#dc2626', color: '#fff', fontWeight: 800, fontSize: '0.9rem', padding: '4px 10px', borderRadius: '6px' }}>
                      -{oferta.desconto}%
                    </div>
                  )}
                  {/* Badge categoria */}
                  <div style={{ position: 'absolute', top: '12px', right: '12px', backgroundColor: oferta.color, color: '#fff', fontSize: '0.68rem', fontWeight: 700, padding: '2px 8px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {oferta.categoria}
                  </div>
                </div>

                <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>

                  <h2 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#111827', margin: '0 0 8px', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {oferta.titulo}
                  </h2>

                  {oferta.descricao && (
                    <p style={{ fontSize: '0.78rem', color: '#6b7280', margin: '0 0 12px', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {oferta.descricao}
                    </p>
                  )}

                  <div style={{ marginTop: 'auto' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
                      {oferta.preco_original > oferta.preco_oferta && (
                        <span style={{ fontSize: '0.78rem', color: '#9ca3af', textDecoration: 'line-through' }}>
                          R$ {oferta.preco_original.toFixed(2).replace('.', ',')}
                        </span>
                      )}
                      <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#dc2626' }}>
                        R$ {oferta.preco_oferta.toFixed(2).replace('.', ',')}
                      </span>
                    </div>

                    <div style={{ backgroundColor: '#dc2626', color: '#fff', padding: '9px 16px', borderRadius: '8px', fontWeight: 700, fontSize: '0.85rem', textAlign: 'center' }}>
                      Ver oferta no Alibaba →
                    </div>

                    <div style={{ textAlign: 'center', marginTop: '6px', fontSize: '0.68rem', color: '#9ca3af' }}>
                      via Alibaba · link de afiliado
                    </div>
                  </div>
                </div>
              </article>
            </a>
          ))}
        </div>
      )}

      <footer style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #e5e7eb', textAlign: 'center' }}>
        <p style={{ fontSize: '0.72rem', color: '#9ca3af', margin: 0, lineHeight: 1.6 }}>
          Links de afiliado — ao comprar através deles você apoia o IAIPSI Informa sem custo adicional. Preços e disponibilidade sujeitos a alteração.
        </p>
      </footer>

    </main>
  );
}
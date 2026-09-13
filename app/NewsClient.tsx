'use client';

import { useState } from 'react';
import { FeedItem } from './page';

// ─── SLOT DE ANÚNCIO ──────────────────────────────────────────────────────
// Substitua o conteúdo entre os comentários pelo HTML do seu anúncio.
function AdSlot({ position }: { position: 'topo' | 'meio' | 'rodape' }) {
  return (
    <div style={{
      gridColumn: '1 / -1',
      backgroundColor: '#fefce8',
      border: '2px dashed #fbbf24',
      borderRadius: '10px',
      minHeight: '100px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#92400e',
      fontSize: '0.85rem',
      fontWeight: 600,
    }}>
      {/* ↓ COLE SEU ANÚNCIO AQUI — posição: {position} ↓ */}
      📢 Seu anúncio — {position}
      {/* ↑ ─────────────────────────────────────────── ↑ */}
    </div>
  );
}

// ─── CARD DE NOTÍCIA ──────────────────────────────────────────────────────
function NewsCard({ item }: { item: FeedItem }) {
  const [imgError, setImgError] = useState(false);
  const showImage = !!item.imageUrl && !imgError;

  return (
    <article style={{
      backgroundColor: '#fff',
      borderRadius: '12px',
      overflow: 'hidden',
      border: '1px solid #e5e7eb',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
    }}>

      {showImage && (
        <div style={{ height: '180px', overflow: 'hidden', backgroundColor: '#f3f4f6' }}>
          <img
            src={item.imageUrl!}
            alt={item.title || ''}
            onError={() => setImgError(true)}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
      )}

      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>

        {/* Tag de categoria */}
        <div style={{ marginBottom: '10px' }}>
          <span style={{
            backgroundColor: item.categoryColor || '#2563eb',
            color: '#fff',
            fontSize: '0.72rem',
            fontWeight: 700,
            padding: '3px 10px',
            borderRadius: '20px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}>
            {item.category}
          </span>
        </div>

        {/* Título */}
        <h2 style={{
          fontSize: '1.02rem',
          margin: '0 0 8px',
          lineHeight: '1.4',
          fontWeight: 700,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          
           <a href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#1f2937', textDecoration: 'none' }}
          >
            {item.title}
          </a>
        </h2>

        {/* Data */}
        {item.pubDate && (
          <small style={{ color: '#9ca3af', display: 'block', marginBottom: '10px', fontSize: '0.78rem' }}>
            📅 {new Date(item.pubDate).toLocaleDateString('pt-BR', {
              day: '2-digit', month: '2-digit', year: 'numeric',
              hour: '2-digit', minute: '2-digit',
            })}
          </small>
        )}

        {/* Resumo */}
        {item.contentSnippet && (
          <p style={{
            color: '#4b5563',
            margin: '0 0 16px',
            fontSize: '0.875rem',
            lineHeight: '1.55',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {item.contentSnippet}
          </p>
        )}

        {/* Link */}
        <div style={{ marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid #f3f4f6' }}>
          
            <a href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: item.categoryColor || '#2563eb', fontWeight: 600, fontSize: '0.85rem', textDecoration: 'none' }}
          >
            Ler matéria completa →
          </a>
        </div>

      </div>
    </article>
  );
}

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────
export default function NewsClient({ posts }: { posts: FeedItem[] }) {
  const safePosts = posts ?? [];

  const categories = [
    'Todas',
    ...Array.from(new Set(
      safePosts.map(p => p.category).filter((c): c is string => !!c)
    )),
  ];

  const [active, setActive] = useState('Todas');

  const filtered = active === 'Todas'
    ? safePosts
    : safePosts.filter(p => p.category === active);

  return (
    <main style={{
      maxWidth: '1060px',
      margin: '0 auto',
      padding: '30px 20px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      backgroundColor: '#f9fafb',
      minHeight: '100vh',
    }}>

      {/* ── Cabeçalho ── */}
      <header style={{
        backgroundColor: '#fff',
        padding: '24px',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        marginBottom: '16px',
        borderTop: '6px solid #2563eb',
      }}>
        <h1 style={{ fontSize: '2.1rem', color: '#111827', margin: 0, fontWeight: 800 }}>
          IAIPSI Informa
        </h1>
        <p style={{ color: '#6b7280', fontSize: '1rem', margin: '6px 0 0' }}>
          Política · Economia · Esportes · Saúde Mental · Ciência · Psicanálise
        </p>
      </header>

      {/* ── Anúncio topo ── */}
      <div style={{ marginBottom: '16px' }}>
        <AdSlot position="topo" />
      </div>

      {/* ── Barra de Jogos ── */}
      <div style={{
        backgroundColor: '#eff6ff',
        border: '1px solid #bfdbfe',
        padding: '12px 20px',
        borderRadius: '8px',
        marginBottom: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '10px',
      }}>
        <span style={{ fontSize: '0.9rem', color: '#1e40af', fontWeight: 600 }}>
          ⚽ Acompanhe os jogos de hoje:
        </span>
        
         <a href="https://www.uol.com.br/esporte/futebol/central-de-jogos/"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            backgroundColor: '#2563eb', color: '#fff',
            padding: '6px 14px', borderRadius: '6px',
            fontSize: '0.85rem', textDecoration: 'none', fontWeight: 600,
          }}
        >
          Abrir Central de Jogos UOL ↗
        </a>
      </div>

      {/* ── Filtros de categoria ── */}
      <nav style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
        {categories.map((cat) => {
          const feedColor = safePosts.find(p => p.category === cat)?.categoryColor;
          const isActive = active === cat;
          return (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              style={{
                padding: '7px 16px',
                borderRadius: '999px',
                border: `2px solid ${isActive ? (feedColor || '#2563eb') : '#e5e7eb'}`,
                backgroundColor: isActive ? (feedColor || '#2563eb') : '#fff',
                color: isActive ? '#fff' : '#374151',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {cat}
            </button>
          );
        })}
      </nav>

      {/* ── Grid de cards ── */}
      <section style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '20px',
      }}>
        {filtered.length === 0 ? (
          <p style={{ color: '#6b7280' }}>Nenhuma notícia encontrada.</p>
        ) : (
          filtered.map((item, index) => (
            <>
              {index > 0 && index % 12 === 0 && (
                <AdSlot key={`ad-${index}`} position="meio" />
              )}
              <NewsCard key={`card-${index}`} item={item} />
            </>
          ))
        )}
      </section>

      {/* ── Anúncio rodapé ── */}
      <div style={{ marginTop: '32px' }}>
        <AdSlot position="rodape" />
      </div>

    </main>
  );
}
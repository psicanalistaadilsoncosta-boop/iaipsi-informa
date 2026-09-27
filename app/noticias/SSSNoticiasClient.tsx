'use client';

// app/noticias/NoticiasClient.tsx

import { useState, useEffect, Fragment } from 'react';
import { FeedItem, AdItem } from '../page';
import FooterSite from '../FooterSite';

// ─── CARD DE VIAGEM NO GRID ───────────────────────────────────────────────
function ViagemNoticiaCard({ viagem }: { viagem: any }) {
  const url = viagem.affiliate_url || viagem.affiliateUrl || '';
  const irUrl = url
    ? `/ir?url=${encodeURIComponent(url)}&nome=${encodeURIComponent(viagem.titulo)}&imagem=${encodeURIComponent(viagem.imagem || '')}`
    : `/viagem/${viagem.slug}`;

  return (
    <a href={irUrl} style={{ textDecoration: 'none', breakInside: 'avoid', display: 'block', marginBottom: '20px' }}>
      <article style={{ backgroundColor: '#fff', borderRadius: '12px', overflow: 'hidden', border: '1px solid #d1fae5', boxShadow: '0 2px 8px rgba(15,118,110,0.08)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ height: '160px', overflow: 'hidden', backgroundColor: '#f0fdfa', position: 'relative' }}>
          {viagem.imagem ? (
            <img src={viagem.imagem} alt={viagem.titulo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          ) : (
            <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #0f766e, #047857)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '2.5rem' }}>🌍</span>
            </div>
          )}
          <span style={{ position: 'absolute', top: '8px', left: '8px', backgroundColor: '#0f766e', color: '#fff', fontSize: '0.62rem', fontWeight: 700, padding: '2px 8px', borderRadius: '20px' }}>
            ✈️ Viagem
          </span>
          {viagem.rating != null && Number(viagem.rating) > 0 && (
            <span style={{ position: 'absolute', bottom: '6px', right: '8px', backgroundColor: 'rgba(0,0,0,0.55)', color: '#fbbf24', fontSize: '0.62rem', fontWeight: 700, padding: '2px 7px', borderRadius: '20px' }}>
              ★ {Number(viagem.rating).toFixed(1)}{viagem.reviewCount ? ` (${Number(viagem.reviewCount).toLocaleString('pt-BR')})` : ''}
            </span>
          )}
        </div>
        <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {viagem.destino && (
            <div style={{ fontSize: '0.68rem', color: '#6b7280', fontWeight: 600 }}>📍 {viagem.destino}</div>
          )}
          <h3 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#111827', margin: 0, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {viagem.titulo}
          </h3>
          {viagem.precoBase > 0 && (
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f766e' }}>
              R$ {viagem.precoBase.toFixed(2).replace('.', ',')}
            </div>
          )}
          <div style={{ backgroundColor: '#0f766e', color: '#fff', padding: '7px', borderRadius: '6px', fontWeight: 700, fontSize: '0.8rem', textAlign: 'center', marginTop: '4px' }}>
            Ver oferta →
          </div>
        </div>
      </article>
    </a>
  );
}

// ─── CARD DE OFERTA NO GRID ───────────────────────────────────────────────
function OfertaCard({ item }: { item: any }) {
  const [copiado, setCopiado] = useState(false);

  if (item.tipo === 'campanha') {
    return (
      <article style={{ backgroundColor: '#fff', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', boxShadow: '0 2px 6px rgba(220,38,38,0.08)', breakInside: 'avoid', marginBottom: '20px' }}>
        {item.imagem && (
          <div style={{ height: '140px', overflow: 'hidden', backgroundColor: '#f3f4f6' }}>
            <img src={item.imagem} alt={item.titulo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          </div>
        )}
        <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', flexGrow: 1, gap: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ backgroundColor: item.isCupom ? '#7c3aed' : '#dc2626', color: '#fff', fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px', borderRadius: '20px', textTransform: 'uppercase' }}>
              {item.isCupom ? '🏷 Cupom' : '🔥 Oferta'}
            </span>
            <span style={{ fontSize: '0.68rem', color: '#9ca3af' }}>Publicidade</span>
          </div>
          <h3 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#111827', margin: 0, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {item.titulo}
          </h3>
          <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {item.isCupom && item.code && (
              <button onClick={() => { navigator.clipboard.writeText(item.code); setCopiado(true); setTimeout(() => setCopiado(false), 2000); }}
                style={{ backgroundColor: copiado ? '#047857' : '#f5f3ff', color: copiado ? '#fff' : '#7c3aed', border: '1px dashed #7c3aed', borderRadius: '6px', padding: '6px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', letterSpacing: '1px', textAlign: 'center' }}>
                {copiado ? '✅ Copiado!' : item.code}
              </button>
            )}
            <a href={`/ir?url=${encodeURIComponent(item.link)}&nome=${encodeURIComponent(item.titulo)}&imagem=${encodeURIComponent(item.imagem || '')}`} style={{ backgroundColor: '#dc2626', color: '#fff', padding: '8px', borderRadius: '6px', fontWeight: 700, fontSize: '0.82rem', textAlign: 'center', textDecoration: 'none' }}>
              {item.isCupom ? 'Usar cupom →' : 'Ver oferta →'}
            </a>
          </div>
        </div>
      </article>
    );
  }

  if (item.tipo === 'marca') {
    return (
      <a href={`/ir?url=${encodeURIComponent(item.link)}&nome=${encodeURIComponent(item.titulo)}&imagem=${encodeURIComponent(item.logo || '')}`} style={{ textDecoration: 'none', breakInside: 'avoid', display: 'block', marginBottom: '20px' }}>
        <article style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '20px', boxShadow: '0 2px 6px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', textAlign: 'center', minHeight: '160px', justifyContent: 'center' }}>
          <span style={{ fontSize: '0.65rem', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Publicidade</span>
          <div style={{ width: '64px', height: '64px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #f3f4f6', backgroundColor: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src={item.logo} alt={item.titulo} style={{ width: '100%', height: '100%', objectFit: 'contain' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          </div>
          <div>
            <div style={{ fontWeight: 700, color: '#111827', fontSize: '0.95rem' }}>{item.titulo}</div>
            <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '2px' }}>{item.segment}</div>
          </div>
          <div style={{ backgroundColor: '#dc2626', color: '#fff', padding: '7px 16px', borderRadius: '6px', fontWeight: 700, fontSize: '0.8rem' }}>
            Visitar loja →
          </div>
        </article>
      </a>
    );
  }

  if (item.tipo === 'produto') {
    return (
      <a href={`/ir?url=${encodeURIComponent(item.link)}&nome=${encodeURIComponent(item.titulo)}&imagem=${encodeURIComponent(item.imagem || '')}`} style={{ textDecoration: 'none', breakInside: 'avoid', display: 'block', marginBottom: '20px' }}>
        <article style={{ backgroundColor: '#fff', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
          <div style={{ height: '160px', overflow: 'hidden', backgroundColor: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', padding: '8px' }}>
            {item.imagem && <img src={item.imagem} alt={item.titulo} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />}
            {item.desconto > 0 && (
              <span style={{ position: 'absolute', top: '8px', left: '8px', backgroundColor: '#dc2626', color: '#fff', fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: '6px' }}>
                -{item.desconto}%
              </span>
            )}
            <span style={{ position: 'absolute', top: '8px', right: '8px', fontSize: '0.65rem', color: '#9ca3af', fontWeight: 600 }}>Publicidade</span>
          </div>
          <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px', flexGrow: 1 }}>
            <span style={{ backgroundColor: item.color, color: '#fff', fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px', borderRadius: '20px', textTransform: 'uppercase', alignSelf: 'flex-start' }}>
              {item.categoria}
            </span>
            <h3 style={{ fontSize: '0.82rem', fontWeight: 600, color: '#111827', margin: 0, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {item.titulo}
            </h3>
            <div style={{ marginTop: 'auto' }}>
              {item.preco_original > item.preco && (
                <div style={{ fontSize: '0.72rem', color: '#9ca3af', textDecoration: 'line-through' }}>
                  R$ {item.preco_original.toFixed(2).replace('.', ',')}
                </div>
              )}
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#dc2626' }}>
                R$ {item.preco.toFixed(2).replace('.', ',')}
              </div>
              <div style={{ fontSize: '0.65rem', color: '#9ca3af', marginTop: '2px', lineHeight: 1.3 }}>
                Confira o valor no site e no carrinho
              </div>
            </div>
            <div style={{ backgroundColor: '#dc2626', color: '#fff', padding: '7px', borderRadius: '6px', fontWeight: 700, fontSize: '0.8rem', textAlign: 'center' }}>
              Ver oferta →
            </div>
          </div>
        </article>
      </a>
    );
  }

  return null;
}

// ─── BANNER ROTATIVO ─────────────────────────────────────────────────────
function AdBannerRotating({ ads }: { ads: AdItem[] }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (ads.length <= 1) return;
    const interval = setInterval(() => {
      setCurrent(prev => (prev + 1) % ads.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [ads.length]);

  if (!ads.length) return null;
  const ad = ads[current];

  return (
    <div style={{ position: 'relative' }}>
      <a href={ad.link} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', display: 'block' }}>
        <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid #e5e7eb', backgroundColor: '#fff', boxShadow: '0 2px 6px rgba(0,0,0,0.06)' }}>
          <div style={{ width: '100%', maxHeight: '120px', overflow: 'hidden' }}>
            <img src={ad.image} alt={ad.text} style={{ width: '100%', height: '120px', objectFit: 'cover' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.7rem', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Publicidade</span>
              <span style={{ color: '#374151', fontSize: '0.9rem', fontWeight: 500 }}>{ad.text}</span>
            </div>
            <span style={{ backgroundColor: '#2563eb', color: '#fff', padding: '6px 16px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
              {ad.cta} →
            </span>
          </div>
        </div>
      </a>
      {ads.length > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '8px' }}>
          {ads.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)} style={{ width: '8px', height: '8px', borderRadius: '50%', border: 'none', backgroundColor: i === current ? '#2563eb' : '#d1d5db', cursor: 'pointer', padding: 0 }} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── CARD DE NOTÍCIA ──────────────────────────────────────────────────────
function NewsCard({ item }: { item: FeedItem }) {
  const [imgError, setImgError] = useState(false);
  const showImage = !!item.imageUrl && !imgError;

  return (
    <article style={{ backgroundColor: '#fff', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', boxShadow: '0 2px 6px rgba(0,0,0,0.05)', breakInside: 'avoid', marginBottom: '20px' }}>
      {showImage && (
        <div style={{ height: '180px', overflow: 'hidden', backgroundColor: '#f3f4f6' }}>
          <img src={item.imageUrl!} alt={item.title || ''} onError={() => setImgError(true)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      )}
      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <div style={{ marginBottom: '10px' }}>
          <span style={{ backgroundColor: item.categoryColor || '#2563eb', color: '#fff', fontSize: '0.72rem', fontWeight: 700, padding: '3px 10px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {item.category}
          </span>
        </div>
        <h2 style={{ fontSize: '1.02rem', margin: '0 0 8px', lineHeight: 1.4, fontWeight: 700, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          <a href={`/noticia?url=${encodeURIComponent(item.link ?? '#')}&titulo=${encodeURIComponent(item.title ?? '')}&categoria=${encodeURIComponent(item.category ?? '')}&cor=${encodeURIComponent((item.categoryColor ?? '#2563eb').replace('#', ''))}&snippet=${encodeURIComponent(item.contentSnippet ?? '')}`} style={{ color: '#1f2937', textDecoration: 'none' }}>{item.title}</a>
        </h2>
        {item.pubDate && (
          <small style={{ color: '#9ca3af', display: 'block', marginBottom: '10px', fontSize: '0.78rem' }}>
            📅 {new Date(item.pubDate).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </small>
        )}
        {item.contentSnippet && (
          <p style={{ color: '#4b5563', margin: '0 0 16px', fontSize: '0.875rem', lineHeight: '1.55', display: '-webkit-box', WebkitLineClamp: showImage ? 3 : 6, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {item.contentSnippet}
          </p>
        )}
        <div style={{ marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid #f3f4f6' }}>
          <a href={`/noticia?url=${encodeURIComponent(item.link ?? '#')}&titulo=${encodeURIComponent(item.title ?? '')}&categoria=${encodeURIComponent(item.category ?? '')}&cor=${encodeURIComponent((item.categoryColor ?? '#2563eb').replace('#', ''))}&snippet=${encodeURIComponent(item.contentSnippet ?? '')}`} style={{ color: item.categoryColor || '#2563eb', fontWeight: 600, fontSize: '0.85rem', textDecoration: 'none' }}>
            Ler matéria completa →
          </a>
        </div>
      </div>
    </article>
  );
}

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────
export default function NoticiasClient({
  posts,
  ads,
  ofertasMix,
  viagensNoticias,
}: {
  posts: FeedItem[];
  ads: AdItem[];
  ofertasMix: any[];
  viagensNoticias: any[];
}) {
  const safePosts = posts ?? [];
  const safeAds = ads ?? [];
  const adsMeio = safeAds.filter(a => a.position === 'meio' && a.active !== false);
  const adsRodape = safeAds.filter(a => a.position === 'rodape' && a.active !== false);

  const [ofertasMixEmbaralhado, setOfertasMixEmbaralhado] = useState<any[]>(ofertasMix ?? []);
  useEffect(() => {
    setOfertasMixEmbaralhado([...(ofertasMix ?? [])].sort(() => Math.random() - 0.5));
  }, []);

  const safeOfertasMix = ofertasMixEmbaralhado;
  const safeViagens = viagensNoticias ?? [];

  const categories = [
    'Todas',
    ...Array.from(new Set(safePosts.map(p => p.category).filter((c): c is string => !!c))),
  ];

  const [active, setActive] = useState('Todas');
  const filtered = active === 'Todas' ? safePosts : safePosts.filter(p => p.category === active);

  return (
    <main style={{ maxWidth: '1060px', margin: '0 auto', padding: '30px 20px', fontFamily: 'system-ui, -apple-system, sans-serif', backgroundColor: '#f9fafb', minHeight: '100vh' }}>

      {/* Header */}
      <header style={{ backgroundColor: '#fff', padding: '20px 24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', marginBottom: '20px', borderTop: '6px solid #2563eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <a href="/" style={{ fontSize: '0.85rem', color: '#6b7280', textDecoration: 'none', fontWeight: 500 }}>
            ← Voltar à home
          </a>
          <h1 style={{ fontSize: '1.8rem', color: '#111827', margin: '6px 0 0', fontWeight: 800 }}>
            📰 Todas as Notícias
          </h1>
          <p style={{ color: '#6b7280', fontSize: '0.9rem', margin: '4px 0 0' }}>
            Política · Economia · Esportes · Saúde Mental · Ciência · Psicanálise · Tecnologia · Liderança · Mundo
          </p>
        </div>
        <div style={{ fontSize: '0.82rem', color: '#9ca3af', fontWeight: 500 }}>
          {filtered.length} notícia{filtered.length !== 1 ? 's' : ''}
        </div>
      </header>

      {/* Filtro de categorias */}
      <nav style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
        {categories.map((cat) => {
          const feedColor = safePosts.find(p => p.category === cat)?.categoryColor;
          const isActive = active === cat;
          return (
            <button key={cat} onClick={() => setActive(cat)} style={{ padding: '7px 16px', borderRadius: '999px', border: `2px solid ${isActive ? (feedColor || '#2563eb') : '#e5e7eb'}`, backgroundColor: isActive ? (feedColor || '#2563eb') : '#fff', color: isActive ? '#fff' : '#374151', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.15s' }}>
              {cat}
            </button>
          );
        })}
      </nav>

      {/* Grid completo — ofertas a cada 6, viagem a cada 9, banner a cada 12 */}
      <section style={{ columns: '3 300px', columnGap: '20px' }}>
        {filtered.length === 0 ? (
          <p style={{ color: '#6b7280' }}>Nenhuma notícia encontrada.</p>
        ) : (
          filtered.map((item, index) => (
            <Fragment key={`noticia-${index}`}>
              {index > 0 && index % 6 === 0 && (() => {
                const ofertaIndex = Math.floor(index / 6) - 1;
                const oferta = safeOfertasMix[ofertaIndex] ?? null;
                return oferta ? <OfertaCard item={oferta} /> : null;
              })()}
              {index > 0 && index % 9 === 0 && (() => {
                if (safeViagens.length === 0) return null;
                const vIdx = Math.floor(index / 9) - 1;
                const viagem = safeViagens[vIdx % safeViagens.length];
                return viagem ? <ViagemNoticiaCard viagem={viagem} /> : null;
              })()}
              {index > 0 && index % 12 === 0 && adsMeio.length > 0 && (
                <div style={{ breakInside: 'avoid', marginBottom: '20px' }}>
                  <AdBannerRotating ads={adsMeio} />
                </div>
              )}
              <NewsCard item={item} />
            </Fragment>
          ))
        )}
      </section>

      {adsRodape.length > 0 && (
        <div style={{ marginTop: '32px' }}>
          <AdBannerRotating ads={adsRodape} />
        </div>
      )}

      <FooterSite />
    </main>
  );
}

'use client';

import { useState, useEffect, Fragment } from 'react';
import { FeedItem, AdItem, EditorialItem, SaboresItem } from './page';
import OfertaDestaque from './OfertaDestaque';

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
const CATEGORY_COLORS: Record<string, string> = {
  'Política': '#1e3a8a',
  'Economia': '#047857',
  'Esportes': '#ea580c',
  'Saúde Mental': '#7c3aed',
  'Saúde & Ciência': '#0284c7',
  'Psicanálise': '#be185d',
  'Tecnologia & IA': '#0f766e',
  'Educação & Carreira': '#b45309',
  'Liderança & Gestão': '#7c2d12',
  'Mundo': '#374151',
};

function renderAnalysis(text: string) {
  return text.split('\n').map((line, i) => {
    const parsed = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    if (!parsed.trim()) return <br key={i} />;
    return <p key={i} style={{ margin: '0 0 8px', lineHeight: 1.7 }} dangerouslySetInnerHTML={{ __html: parsed }} />;
  });
}

// ─── CARD SABORES EXPANDÍVEL ──────────────────────────────────────────────
function SaboresCardExpanded({ item, small = false }: { item: SaboresItem; small?: boolean }) {
  const [showRecipe, setShowRecipe] = useState(false);
  const recipe = (item as any).recipe || null;

  function renderContent(text: string) {
    return text.split('\n').map((line, i) => {
      const parsed = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      if (!parsed.trim()) return <br key={i} />;
      return <p key={i} style={{ margin: '0 0 10px', lineHeight: 1.7, fontSize: small ? '0.82rem' : '0.9rem' }} dangerouslySetInnerHTML={{ __html: parsed }} />;
    });
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <button
          onClick={() => window.open(`/sabores/${item.id}`, '_blank')}
          style={{
            backgroundColor: '#b45309',
            color: '#fff',
            border: 'none',
            padding: small ? '6px 14px' : '9px 20px',
            borderRadius: '8px',
            fontWeight: 700,
            fontSize: small ? '0.78rem' : '0.88rem',
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}>
          {item.cta}
        </button>
      </div>
    </div>
  );
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

// ─── SEÇÃO EDITORIAL ──────────────────────────────────────────────────────
function EditorialSection({ items }: { items: EditorialItem[] }) {
  const [expanded, setExpanded] = useState<string | null>(null);
  if (!items || items.length === 0) return null;

  const [featured, ...rest] = items;
  const color = (cat?: string) => CATEGORY_COLORS[cat || ''] || '#be185d';

  return (
    <section style={{ marginBottom: '32px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <div style={{ width: '4px', height: '28px', backgroundColor: '#be185d', borderRadius: '2px' }} />
        <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#111827', margin: 0 }}>Análises Editoriais</h2>
        <span style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 500, marginLeft: '4px' }}>por Adilson Costa - Psicanalista</span>
        <a href="/arquivo-editorial" style={{ marginLeft: 'auto', fontSize: '0.8rem', color: '#be185d', fontWeight: 600, textDecoration: 'none' }}>Ver todas →</a>
      </div>

      <div style={{ backgroundColor: '#fff', borderRadius: '14px', border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.06)', marginBottom: '16px', borderLeft: `5px solid ${color(featured.category)}` }}>
        <div style={{ padding: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', flexWrap: 'wrap' }}>
            {featured.category && (
              <span style={{ backgroundColor: color(featured.category), color: '#fff', fontSize: '0.72rem', fontWeight: 700, padding: '3px 10px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {featured.category}
              </span>
            )}
            <small style={{ color: '#9ca3af', fontSize: '0.78rem' }}>
              {new Date(featured.publishedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
            </small>
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111827', margin: '0 0 16px', lineHeight: 1.35 }}>{featured.title}</h3>
          <div style={{ fontSize: '0.9rem', color: '#374151', overflow: expanded === featured.id ? 'visible' : 'hidden', maxHeight: expanded === featured.id ? 'none' : '120px', maskImage: expanded === featured.id ? 'none' : 'linear-gradient(to bottom, black 60%, transparent 100%)', WebkitMaskImage: expanded === featured.id ? 'none' : 'linear-gradient(to bottom, black 60%, transparent 100%)' }}>
            {renderAnalysis(featured.analysis)}
          </div>
          <div style={{ marginTop: '16px', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => setExpanded(expanded === featured.id ? null : featured.id)} style={{ backgroundColor: 'transparent', border: `1px solid ${color(featured.category)}`, color: color(featured.category), padding: '6px 14px', borderRadius: '6px', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>
              {expanded === featured.id ? 'Recolher ↑' : 'Ler análise completa ↓'}
            </button>
            <a href={featured.link} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.82rem', color: '#9ca3af', textDecoration: 'none', fontWeight: 500 }}>
              Ver notícia original ↗
            </a>
          </div>
        </div>
      </div>

      {rest.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
          {rest.map((item) => (
            <div key={item.id} style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '20px', boxShadow: '0 2px 6px rgba(0,0,0,0.04)', borderLeft: `4px solid ${color(item.category)}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                {item.category && (
                  <span style={{ backgroundColor: color(item.category), color: '#fff', fontSize: '0.68rem', fontWeight: 700, padding: '2px 8px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {item.category}
                  </span>
                )}
                <small style={{ color: '#9ca3af', fontSize: '0.75rem' }}>
                  {new Date(item.publishedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                </small>
              </div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#111827', margin: '0 0 10px', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.title}</h3>
              <div style={{ fontSize: '0.82rem', color: '#6b7280', overflow: 'hidden', maxHeight: '60px', maskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)' }}>
                {renderAnalysis(item.analysis)}
              </div>
              <div style={{ marginTop: '12px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                <button onClick={() => setExpanded(expanded === item.id ? null : item.id)} style={{ backgroundColor: 'transparent', border: `1px solid ${color(item.category)}`, color: color(item.category), padding: '5px 12px', borderRadius: '6px', fontWeight: 600, fontSize: '0.78rem', cursor: 'pointer' }}>
                  {expanded === item.id ? 'Recolher ↑' : 'Ler completo ↓'}
                </button>
                <a href={item.link} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.78rem', color: '#9ca3af', textDecoration: 'none' }}>Notícia ↗</a>
              </div>
              {expanded === item.id && (
                <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px solid #f3f4f6', fontSize: '0.85rem', color: '#374151' }}>
                  {renderAnalysis(item.analysis)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
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
export default function NewsClient({ posts, ads, editorial, sabores, ofertasMix }: { posts: FeedItem[]; ads: AdItem[]; editorial: EditorialItem[]; sabores: SaboresItem[]; ofertasMix: any[] }) {  
const safePosts = posts ?? [];
  const safeAds = ads ?? [];
  const safeEditorial = editorial ?? [];
  const safeSabores = sabores ?? [];

  // Todos os anúncios ativos — independente da posição
  const allAds = safeAds.filter(a => a.active !== false);
  const adsTopo = safeAds.filter(a => a.position === 'topo' && a.active !== false);
  const adsMeio = safeAds.filter(a => a.position === 'meio' && a.active !== false);
  const adsRodape = safeAds.filter(a => a.position === 'rodape' && a.active !== false);
  const [ofertasMixEmbaralhado, setOfertasMixEmbaralhado] = useState<any[]>(ofertasMix ?? []);
  
  useEffect(() => {
    setOfertasMixEmbaralhado([...(ofertasMix ?? [])].sort(() => Math.random() - 0.5));
  }, []);

  const safeOfertasMix = ofertasMixEmbaralhado;

  const categories = [
    'Todas',
    ...Array.from(new Set(safePosts.map(p => p.category).filter((c): c is string => !!c))),
  ];

  const [active, setActive] = useState('Todas');
  const filtered = active === 'Todas' ? safePosts : safePosts.filter(p => p.category === active);

  return (
    <main style={{ maxWidth: '1060px', margin: '0 auto', padding: '30px 20px', fontFamily: 'system-ui, -apple-system, sans-serif', backgroundColor: '#f9fafb', minHeight: '100vh' }}>

      <header style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', marginBottom: '16px', borderTop: '6px solid #2563eb' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontSize: '2.1rem', color: '#111827', margin: 0, fontWeight: 800 }}>IAIPSI Informa</h1>
                        <p style={{ color: '#6b7280', fontSize: '1rem', margin: '6px 0 0' }}>
              Política · Economia · Esportes · Saúde Mental · Ciência · Psicanálise · Tecnologia · Liderança · Mundo
            </p>
                       <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
              <a href="/ofertas" style={{ backgroundColor: '#dc2626', color: '#fff', padding: '6px 16px', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 700, textDecoration: 'none' }}>🛍 Ofertas & Cupons</a>
              <a href="/ofertas-selecionadas" style={{ backgroundColor: '#2563eb', color: '#fff', padding: '6px 16px', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 700, textDecoration: 'none' }}>⭐ Selecionadas</a>
              <a href="/parcelado" style={{ backgroundColor: '#047857', color: '#fff', padding: '6px 16px', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 700, textDecoration: 'none' }}>💳 Parcelado</a>
              <a href="/oferta-do-dia" style={{ backgroundColor: '#b45309', color: '#fff', padding: '6px 16px', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 700, textDecoration: 'none' }}>🔥 Oferta do Dia</a>
            </div>
          </div>
        </div>
      </header>

        {adsTopo.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <AdBannerRotating ads={adsTopo} />
        </div>
      )}

      <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', padding: '12px 20px', borderRadius: '8px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <span style={{ fontSize: '0.9rem', color: '#1e40af', fontWeight: 600 }}>⚽ Acompanhe os jogos de hoje:</span>
        <a href="https://www.uol.com.br/esporte/futebol/central-de-jogos/" target="_blank" rel="noopener noreferrer" style={{ backgroundColor: '#2563eb', color: '#fff', padding: '6px 14px', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', fontWeight: 600 }}>
          Abrir Central de Jogos UOL ↗
        </a>
      </div>
      <OfertaDestaque />
      <EditorialSection items={safeEditorial.slice(0, 3)} />

      {safeSabores.slice(0, 3).length > 0 && (
        <section style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ width: '4px', height: '28px', backgroundColor: '#b45309', borderRadius: '2px' }} />
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#111827', margin: 0 }}>Sabores & Destinos</h2>
            <span style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 500, marginLeft: '4px' }}>por Adilson Costa</span>
            <a href="/arquivo-sabores" style={{ marginLeft: 'auto', fontSize: '0.8rem', color: '#b45309', fontWeight: 600, textDecoration: 'none' }}>Ver todos →</a>
          </div>

          {(() => {
            const item = safeSabores.slice(0, 3)[0];
            return (
              <div style={{ borderRadius: '14px', overflow: 'hidden', border: '1px solid #e5e7eb', boxShadow: '0 4px 16px rgba(0,0,0,0.08)', marginBottom: '16px', position: 'relative' }}>
                <div style={{ height: '380px', overflow: 'hidden', backgroundColor: '#f3f4f6', position: 'relative' }}>
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.prato} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #b45309 0%, #92400e 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: '4rem' }}>🍽</span>
                    </div>
                  )}
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '65%', background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)' }} />
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '28px' }}>
                    <div style={{ fontSize: '0.72rem', color: '#fcd34d', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px' }}>
                      🍽 Sabores & Destinos · {item.destino}
                    </div>
                    <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', margin: '0 0 10px', lineHeight: 1.2 }}>{item.prato}</h3>
                    <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.95rem', margin: '0 0 18px', fontStyle: 'italic', lineHeight: 1.5 }}>{item.intro}</p>
                    <SaboresCardExpanded item={item} />
                  </div>
                </div>
              </div>
            );
          })()}

          {safeSabores.slice(0, 3).length > 1 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
              {safeSabores.slice(1, 3).map(item => (
                <div key={item.id} style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid #e5e7eb', boxShadow: '0 2px 6px rgba(0,0,0,0.05)' }}>
                  <div style={{ height: '160px', overflow: 'hidden', backgroundColor: '#f3f4f6', position: 'relative' }}>
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.prato} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #b45309 0%, #92400e 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: '2.5rem' }}>🍽</span>
                      </div>
                    )}
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '60%', background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 100%)' }} />
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '14px' }}>
                      <div style={{ fontSize: '0.65rem', color: '#fcd34d', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>{item.destino}</div>
                      <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#fff', margin: '0 0 6px', lineHeight: 1.2 }}>{item.prato}</h3>
                      <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.78rem', margin: 0, fontStyle: 'italic', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.intro}</p>
                    </div>
                  </div>
                  <div style={{ padding: '14px', backgroundColor: '#fff' }}>
                    <SaboresCardExpanded item={item} small />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

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

      <section style={{ columns: '3 300px', columnGap: '20px' }}>
        {filtered.length === 0 ? (
          <p style={{ color: '#6b7280' }}>Nenhuma notícia encontrada.</p>
        ) : (
          filtered.map((item, index) => (
            <Fragment key={`item-${index}`}>
                           {index > 0 && index % 6 === 0 && (() => {
                const ofertaIndex = Math.floor(index / 6) - 1;
                const oferta = safeOfertasMix[ofertaIndex % Math.max(safeOfertasMix.length, 1)];
                return oferta ? <OfertaCard item={oferta} /> : null;
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

      <footer style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #e5e7eb', textAlign: 'center' }}>
        <p style={{ fontSize: '0.78rem', color: '#9ca3af', margin: 0, lineHeight: 1.8 }}>
                   © {new Date().getFullYear()} IAIPSI Informa · Notícias coletadas automaticamente dos principais portais de comunicação do Brasil e do mundo.
          <br />
          As análises editoriais são elaboradas com auxílio de inteligência artificial e revisadas e assinadas por Adilson Costa.
          <br />
          Os produtos, ofertas e cupons exibidos são de responsabilidade exclusiva dos respectivos anunciantes. Preços, condições e disponibilidade estão expressos em seus respectivos sites. Confira sempre o valor final no site do anunciante e no carrinho de compras antes de concluir a compra. Links de afiliado — ao comprar através deles você apoia o IAIPSI Informa sem custo adicional.
        </p>
      </footer>

    </main>
  );
}

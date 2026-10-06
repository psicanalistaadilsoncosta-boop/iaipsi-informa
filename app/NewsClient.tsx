'use client';

import { useState, useEffect, Fragment } from 'react';
import { FeedItem, AdItem, EditorialItem, SaboresItem } from './page';
import FooterSite from './FooterSite';
import OfertaDestaque from './OfertaDestaque';
import ArtigosProdutoSection from './ArtigosProdutoSection';
import ViagemDestaque from './ViagemDestaque';
import BannerDestaque from './banners/BannerDestaque';
import { TEMAS } from './temas/temas';
import OfertasLupadas from './temas/OfertasLupadas';
import LogoComAPalavra from './temas/LogoComAPalavra';
import Carrossel from './Carrossel';

// ─── VITRINES ──────────────────────────────────────────────────────────────
const PAGINAS_PRODUTOS = [
  { emoji: '🏠', titulo: 'Monte seu Ambiente', descricao: 'Móveis, decoração e tudo para transformar sua casa',
    href: '/monte-seu-ambiente', imagem: '/universo/ambiente.jpg' },
  { emoji: '🍷', titulo: 'Monte seu Momento', descricao: 'Produtos para tornar cada ocasião especial e inesquecível',
    href: '/monte-seu-momento', imagem: '/universo/momento.jpg' },
  { emoji: '👔', titulo: 'Vista-se', descricao: 'Moda, roupas e acessórios para todos os estilos',
    href: '/vista-se', imagem: '/universo/vista-se.jpg' },
  { emoji: '👶', titulo: 'Vista seu Filho', descricao: 'Roupas, acessórios e produtos para bebês e crianças',
    href: '/vista-seu-filho', imagem: '/universo/vista-seu-filho.jpg' },
  { emoji: '🧴', titulo: 'Beleza', descricao: 'Cosméticos, cuidados pessoais e bem-estar',
    href: '/beleza', imagem: '/universo/beleza.jpg' },
  { emoji: '🛒', titulo: 'Mercado', descricao: 'Alimentos, bebidas e produtos essenciais do dia a dia',
    href: '/mercado', imagem: '/universo/mercado.jpg' },
];

const TEMA_DA_PAGINA: Record<string, string> = {
  '/monte-seu-ambiente': 'ambiente',
  '/monte-seu-momento': 'momento',
  '/vista-se': 'vistase',
  '/vista-seu-filho': 'filho',
  '/beleza': 'beleza',
  '/mercado': 'mercado',
};

// ─── NEWSLETTER ───────────────────────────────────────────────────────────
function BannerNewsletter() {
  return (
    <>
      <style>{`
        .bn-wrap {
          background: linear-gradient(135deg, #7c3aed, #a855f7);
          border-radius: 14px; padding: 20px 24px;
          display: flex; align-items: center; justify-content: space-between;
          gap: 24px; box-shadow: 0 4px 16px rgba(124,58,237,0.25);
          box-sizing: border-box; width: 100%;
        }
        .bn-left { display: flex; align-items: center; gap: 14px; }
        .bn-icon { font-size: 2rem; line-height: 1; }
        .bn-title { font-weight: 800; font-size: 1.05rem; color: #fff; }
        .bn-sub { font-size: 0.8rem; color: #e9d5ff; margin-top: 2px; }
        .bn-cats {
          background-color: rgba(255,255,255,0.15); border-radius: 10px;
          width: 128px; padding: 10px 20px; font-size: 0.8rem; color: #f3e8ff;
          line-height: 1.8; flex-shrink: 0; white-space: nowrap;
          box-sizing: border-box; text-align: center;
        }
        @media (max-width: 640px) {
          .bn-wrap { flex-direction: column; align-items: flex-start; gap: 14px; padding: 18px 20px; }
          .bn-cats { width: 100%; padding: 8px 12px; }
        }
      `}</style>
      <div className="bn-wrap">
        <div className="bn-left">
          <div className="bn-icon">📧✨</div>
          <div>
            <div className="bn-title">Monte sua lista e receba no e-mail</div>
            <div className="bn-sub">Passeie pelas vitrines, toque em <b>+ Lista</b> nos produtos de que gostar e receba os links no seu e-mail.</div>
          </div>
        </div>
        <div className="bn-cats">🏠🍷👔🧴🛒👶</div>
      </div>
    </>
  );
}

// ─── LUPA PRA VOCÊ ────────────────────────────────────────────────────────
function BannerPraVoce() {
  const c = TEMAS.pravoce?.cores || ['#EEF8FA', '#0E7490', '#164E63', '#F59E0B', '#D5EFF4', '#082F3A'];
  return (
    <a href="/pra-voce" className="bp-wrap" style={{ background: `linear-gradient(135deg, ${c[1]}, ${c[2]})` }}>
      <style>{`
        .bp-wrap { border-radius: 14px; padding: 20px 24px; display: flex; align-items: center; justify-content: space-between;
          gap: 24px; width: 100%; box-sizing: border-box; text-decoration: none; color: #fff;
          box-shadow: 0 4px 16px rgba(14,116,144,0.25); transition: transform .2s; }
        .bp-wrap:hover { transform: translateY(-3px); }
        .bp-left { display: flex; align-items: center; gap: 14px; }
        .bp-icon { font-size: 2rem; line-height: 1; }
        .bp-title { font-weight: 800; font-size: 1.05rem; }
        .bp-sub { font-size: 0.8rem; opacity: .9; margin-top: 2px; }
        .bp-dir { display: flex; align-items: center; gap: 14px; flex-shrink: 0; }
        .bp-emojis { font-size: 1.3rem; letter-spacing: 4px; }
        .bp-btn { font-weight: 800; font-size: .8rem; padding: 8px 16px; border-radius: 999px; white-space: nowrap; }
        @media (max-width: 640px) {
          .bp-wrap { flex-direction: column; align-items: flex-start; gap: 14px; padding: 18px 20px; }
          .bp-emojis { display: none; }
        }
      `}</style>
      <div className="bp-left">
        <div className="bp-icon">🎧</div>
        <div>
          <div className="bp-title">Lupa pra você</div>
          <div className="bp-sub">Trabalhar e estudar, mexer o corpo e ficar conectado: ofertas lupadas de perto.</div>
        </div>
      </div>
      <div className="bp-dir">
        <span className="bp-emojis" aria-hidden="true">💻👟📱</span>
        <span className="bp-btn" style={{ background: c[3], color: c[5] }}>Ver ofertas →</span>
      </div>
    </a>
  );
}

// ─── LUPA, ME AJUDA? ──────────────────────────────────────────────────────
function BannerLupaAjuda() {
  return (
    <a href="/lupa-me-ajuda" className="bla-wrap">
      <style>{`
        .bla-wrap { border-radius: 14px; padding: 20px 24px; display: flex; align-items: center; justify-content: space-between;
          gap: 24px; width: 100%; box-sizing: border-box; text-decoration: none; color: #fff; margin-bottom: 28px;
          background: linear-gradient(135deg, #5B3E96, #3B2468); box-shadow: 0 4px 16px rgba(91,62,150,0.3); transition: transform .2s; }
        .bla-wrap:hover { transform: translateY(-3px); }
        .bla-left { display: flex; align-items: center; gap: 14px; }
        .bla-icon { font-size: 2rem; line-height: 1; }
        .bla-title { font-weight: 800; font-size: 1.1rem; }
        .bla-sub { font-size: 0.82rem; opacity: .92; margin-top: 2px; }
        .bla-btn { font-weight: 800; font-size: .82rem; padding: 9px 18px; border-radius: 999px; white-space: nowrap;
          background: #F5C518; color: #2B1A4A; flex-shrink: 0; }
        @media (max-width: 640px) {
          .bla-wrap { flex-direction: column; align-items: flex-start; gap: 14px; padding: 18px 20px; }
        }
      `}</style>
      <div className="bla-left">
        <div className="bla-icon">🔍</div>
        <div>
          <div className="bla-title">Lupa, me ajuda?</div>
          <div className="bla-sub">Responda 4 perguntas e receba sugestões de presente com o porquê de cada uma.</div>
        </div>
      </div>
      <span className="bla-btn">Começar →</span>
    </a>
  );
}

// ─── SEU UNIVERSO — carrossel de vitrines ─────────────────────────────────
function GridPaginasProdutos() {
  return (
    <section style={{ marginBottom: '32px' }}>
      <style>{`
        .su-card { position: relative; display: flex; flex-direction: column; justify-content: flex-end; min-height: 240px;
          border-radius: 18px; overflow: hidden; text-decoration: none; color: #fff;
          box-shadow: 0 6px 20px rgba(0,0,0,.12); transition: transform .2s, box-shadow .2s; }
        .su-card:hover { transform: translateY(-4px); box-shadow: 0 14px 30px rgba(0,0,0,.18); }
        .su-foto { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
        .su-veu { position: absolute; inset: 0; }
        .su-lupa { position: absolute; top: 12px; right: 12px; width: 62px; height: 62px; border-radius: 50%;
          border: 4px solid rgba(255,255,255,.9); background: rgba(255,255,255,.2); display: grid; place-items: center; font-size: 30px; }
        .su-lupa::after { content: ''; position: absolute; width: 8px; height: 24px; border-radius: 6px; right: -6px; bottom: -16px;
          transform: rotate(-45deg); background: var(--su-ink); }
        .su-txt { position: relative; padding: 18px; display: flex; flex-direction: column; gap: 4px; }
        .su-tit { font-size: 1.15rem; font-weight: 800; line-height: 1.15; text-shadow: 0 1px 6px rgba(0,0,0,.25); }
        .su-desc { font-size: .78rem; opacity: .95; line-height: 1.35; text-shadow: 0 1px 4px rgba(0,0,0,.3); }
        .su-btn { align-self: flex-start; margin-top: 6px; background: var(--su-3); color: var(--su-ink);
          font-weight: 800; font-size: .75rem; padding: 6px 14px; border-radius: 999px; }
        @media (max-width: 640px) {
          .su-card { min-height: 220px; }
          .su-tit { font-size: 1.05rem; }
          .su-lupa { width: 52px; height: 52px; font-size: 24px; }
        }
      `}</style>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <div style={{ width: '4px', height: '28px', backgroundColor: '#dc2626', borderRadius: '2px' }} />
        <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#111827', margin: 0 }}>Seu Universo</h2>
        <span style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 500, marginLeft: '4px' }}>
          ambiente, moda, beleza e mais...
        </span>
      </div>

      <div style={{ marginBottom: '18px' }}>
        <BannerNewsletter />
      </div>

      <Carrossel
        itens={PAGINAS_PRODUTOS}
        slidesVisiveis={{ mobile: 1, tablet: 2, desktop: 3 }}
        gap={14}
        autoplay={6000}
        ariaLabel="Vitrines Seu Universo"
        renderItem={(p) => {
          const T = TEMAS[TEMA_DA_PAGINA[p.href]];
          if (!T) return null;
          const c = T.cores;
          return (
            <a href={p.href} className="su-card" style={{ background: c[1], ['--su-3' as any]: c[3], ['--su-ink' as any]: c[5] }}>
              <img className="su-foto" src={p.imagem} alt=""
                onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              <div className="su-veu" style={{ background: `linear-gradient(160deg, ${c[1]}cc 0%, ${c[2]}f2 75%)` }} />
              <div className="su-lupa" aria-hidden="true">{T.emoji}</div>
              <div className="su-txt">
                <div className="su-tit">{p.titulo}</div>
                <div className="su-desc">{p.descricao}</div>
                <span className="su-btn">Ver produtos →</span>
              </div>
            </a>
          );
        }}
      />

      <div style={{ marginTop: '22px' }}>
        <BannerPraVoce />
      </div>
    </section>
  );
}

// ─── ADS ROTATIVO ─────────────────────────────────────────────────────────
function AdBannerRotating({ ads }: { ads: AdItem[] }) {
  const [current, setCurrent] = useState(0);
  useEffect(() => {
    if (ads.length <= 1) return;
    const interval = setInterval(() => { setCurrent(prev => (prev + 1) % ads.length); }, 6000);
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
            <span style={{ backgroundColor: '#2563eb', color: '#fff', padding: '6px 16px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, whiteSpace: 'nowrap' }}>{ad.cta} →</span>
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

// ─── EDITORIAL ────────────────────────────────────────────────────────────
const CATEGORY_COLORS: Record<string, string> = {
  'Política': '#1e3a8a', 'Economia': '#047857', 'Esportes': '#ea580c',
  'Saúde Mental': '#7c3aed', 'Saúde & Ciência': '#0284c7', 'Psicanálise': '#be185d',
  'Tecnologia & IA': '#0f766e', 'Educação & Carreira': '#b45309',
  'Liderança & Gestão': '#7c2d12', 'Mundo': '#374151',
};

function renderAnalysis(text: string) {
  return text.split('\n').map((line, i) => {
    const parsed = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    if (!parsed.trim()) return <br key={i} />;
    return <p key={i} style={{ margin: '0 0 8px', lineHeight: 1.7 }} dangerouslySetInnerHTML={{ __html: parsed }} />;
  });
}

function EditorialSection({ items }: { items: EditorialItem[] }) {
  const [aberto, setAberto] = useState<EditorialItem | null>(null);
  useEffect(() => {
    if (!aberto) return;
    const fechar = (e: KeyboardEvent) => { if (e.key === 'Escape') setAberto(null); };
    window.addEventListener('keydown', fechar);
    return () => window.removeEventListener('keydown', fechar);
  }, [aberto]);
  if (!items || items.length === 0) return null;

  const color = (cat?: string) => CATEGORY_COLORS[cat || ''] || '#be185d';

  return (
    <section style={{ marginBottom: '32px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <div style={{ width: '4px', height: '28px', backgroundColor: '#be185d', borderRadius: '2px' }} />
        <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#111827', margin: 0 }}>Análises Editoriais</h2>
        <span style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 500, marginLeft: '4px' }}>por Adilson Costa - Psicanalista</span>
        <a href="/arquivo-editorial" style={{ marginLeft: 'auto', fontSize: '0.8rem', color: '#be185d', fontWeight: 600, textDecoration: 'none' }}>Ver todas →</a>
      </div>

      <Carrossel
        itens={items}
        slidesVisiveis={{ mobile: 1, tablet: 2, desktop: 2 }}
        gap={14}
        ariaLabel="Análises editoriais"
        renderItem={(item) => (
          <div style={{ backgroundColor: '#fff', borderRadius: '14px', border: '1px solid #e5e7eb', padding: '22px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', borderLeft: `5px solid ${color(item.category)}`, display: 'flex', flexDirection: 'column', height: '100%', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
              {item.category && (
                <span style={{ backgroundColor: color(item.category), color: '#fff', fontSize: '0.7rem', fontWeight: 700, padding: '3px 10px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{item.category}</span>
              )}
              <small style={{ color: '#9ca3af', fontSize: '0.76rem' }}>
                {new Date(item.publishedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
              </small>
            </div>
            <h3 style={{ fontSize: '1.08rem', fontWeight: 800, color: '#111827', margin: '0 0 10px', lineHeight: 1.35, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.title}</h3>
            <div style={{ fontSize: '0.86rem', color: '#4b5563', overflow: 'hidden', maxHeight: '110px', maskImage: 'linear-gradient(to bottom, black 45%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, black 45%, transparent 100%)' }}>
              {renderAnalysis(item.analysis)}
            </div>
            <div style={{ marginTop: 'auto', paddingTop: '14px', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
              <button onClick={() => setAberto(item)} style={{ backgroundColor: color(item.category), border: 'none', color: '#fff', padding: '7px 14px', borderRadius: '6px', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}>
                Ler análise →
              </button>
              <a href={item.link} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.8rem', color: '#9ca3af', textDecoration: 'none' }}>Notícia original ↗</a>
            </div>
          </div>
        )}
      />

      {aberto && (
        <div role="dialog" aria-modal="true" aria-label={aberto.title} onClick={() => setAberto(null)}
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.55)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div onClick={e => e.stopPropagation()}
            style={{ backgroundColor: '#fff', borderRadius: '16px', maxWidth: '720px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '24px', boxSizing: 'border-box', borderTop: `6px solid ${color(aberto.category)}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', flexWrap: 'wrap' }}>
              {aberto.category && (
                <span style={{ backgroundColor: color(aberto.category), color: '#fff', fontSize: '0.72rem', fontWeight: 700, padding: '3px 10px', borderRadius: '20px', textTransform: 'uppercase' }}>{aberto.category}</span>
              )}
              <small style={{ color: '#9ca3af' }}>{new Date(aberto.publishedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</small>
              <button onClick={() => setAberto(null)} aria-label="Fechar" style={{ marginLeft: 'auto', border: 'none', background: 'none', fontSize: '1.4rem', cursor: 'pointer', color: '#6b7280' }}>✕</button>
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#111827', margin: '0 0 16px', lineHeight: 1.35 }}>{aberto.title}</h3>
            <div style={{ fontSize: '0.95rem', color: '#374151' }}>{renderAnalysis(aberto.analysis)}</div>
            <div style={{ marginTop: '18px', display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap' }}>
              <a href={aberto.link} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.85rem', color: color(aberto.category), fontWeight: 700, textDecoration: 'none' }}>Ver notícia original ↗</a>
              <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>por Adilson Costa - Psicanalista</span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

// ─── SABORES ──────────────────────────────────────────────────────────────
function SaboresCardExpanded({ item }: { item: SaboresItem }) {
  return (
    <button
      onClick={() => window.open(`/sabores/${item.id}`, '_blank')}
      style={{ backgroundColor: '#b45309', color: '#fff', border: 'none', padding: '9px 20px', borderRadius: '8px', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer' }}>
      {item.cta}
    </button>
  );
}

// ─── CARD DE NOTÍCIA ──────────────────────────────────────────────────────
function NewsCard({ item }: { item: FeedItem }) {
  const [imgError, setImgError] = useState(false);
  const showImage = !!item.imageUrl && !imgError;
  const linkNoticia = `/noticia?url=${encodeURIComponent(item.link ?? '#')}&titulo=${encodeURIComponent(item.title ?? '')}&categoria=${encodeURIComponent(item.category ?? '')}&cor=${encodeURIComponent((item.categoryColor ?? '#2563eb').replace('#', ''))}&snippet=${encodeURIComponent(item.contentSnippet ?? '')}`;

  return (
    <article style={{ backgroundColor: '#fff', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', boxShadow: '0 2px 6px rgba(0,0,0,0.05)', height: '100%' }}>
      {showImage && (
        <div style={{ height: '180px', overflow: 'hidden', backgroundColor: '#f3f4f6' }}>
          <img src={item.imageUrl!} alt={item.title || ''} onError={() => setImgError(true)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      )}
      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <div style={{ marginBottom: '10px' }}>
          <span style={{ backgroundColor: item.categoryColor || '#2563eb', color: '#fff', fontSize: '0.72rem', fontWeight: 700, padding: '3px 10px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{item.category}</span>
        </div>
        <h2 style={{ fontSize: '1.02rem', margin: '0 0 8px', lineHeight: 1.4, fontWeight: 700, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          <a href={linkNoticia} style={{ color: '#1f2937', textDecoration: 'none' }}>{item.title}</a>
        </h2>
        {item.pubDate && (
          <small style={{ color: '#9ca3af', display: 'block', marginBottom: '10px', fontSize: '0.78rem' }}>
            📅 {new Date(item.pubDate).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </small>
        )}
        {item.contentSnippet && (
          <p style={{ color: '#4b5563', margin: '0 0 16px', fontSize: '0.875rem', lineHeight: '1.55', display: '-webkit-box', WebkitLineClamp: showImage ? 3 : 6, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.contentSnippet}</p>
        )}
        <div style={{ marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid #f3f4f6' }}>
          <a href={linkNoticia} style={{ color: item.categoryColor || '#2563eb', fontWeight: 600, fontSize: '0.85rem', textDecoration: 'none' }}>Ler matéria completa →</a>
        </div>
      </div>
    </article>
  );
}

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────
export default function NewsClient({ posts, ads, editorial, sabores, artigosProduto, viagemDestaque, comPalavraDestaque, bannerSlides, lupadas }: {
  posts: FeedItem[]; ads: AdItem[]; editorial: EditorialItem[]; sabores: SaboresItem[];
  ofertasMix?: any[]; artigosProduto?: any[]; viagemDestaque?: any; viagensNoticias?: any[];
  comPalavraDestaque?: any; bannerSlides?: any[]; lupadas?: any[];
}) {
  const safePosts = posts ?? [];
  const safeAds = ads ?? [];
  const safeEditorial = editorial ?? [];
  const safeSabores = sabores ?? [];

  const adsTopo = safeAds.filter(a => a.position === 'topo' && a.active !== false);
  const adsRodape = safeAds.filter(a => a.position === 'rodape' && a.active !== false);

  const categories = ['Todas', ...Array.from(new Set(safePosts.map(p => p.category).filter((c): c is string => !!c)))];
  const [active, setActive] = useState('Todas');
  const filtered = active === 'Todas' ? safePosts : safePosts.filter(p => p.category === active);
  const filteredHome = filtered.slice(0, 6);

  return (
    <main style={{ maxWidth: '1060px', margin: '0 auto', padding: '30px 20px', fontFamily: 'system-ui, -apple-system, sans-serif', backgroundColor: '#f9fafb', minHeight: '100vh' }}>

      <header style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', marginBottom: '16px', borderTop: '6px solid #2563eb' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontSize: '2.1rem', color: '#111827', margin: 0, fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#5B3E96" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true" style={{ flexShrink: 0 }}>
                <circle cx="10.5" cy="10.5" r="6.5" />
                <line x1="15.5" y1="15.5" x2="21" y2="21" />
              </svg>
              Com a Lupa
            </h1>
            <p style={{ color: '#6b7280', fontSize: '0.95rem', margin: '6px 0 0' }}>Notícias e ofertas vistas de perto</p>
          </div>
          <a href="/ofertas-todas" style={{ backgroundColor: '#dc2626', color: '#fff', padding: '10px 20px', borderRadius: '999px', fontSize: '0.9rem', fontWeight: 800, textDecoration: 'none', whiteSpace: 'nowrap' }}>🛍 Todas as ofertas →</a>
        </div>
      </header>

      {adsTopo.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <AdBannerRotating ads={adsTopo} />
        </div>
      )}

      {bannerSlides && bannerSlides.length > 0 && (
        <BannerDestaque tipo="outdoor" posicao="topo" altura="grande" overlay="medio" intervalMs={6000} slides={bannerSlides} />
      )}

      <OfertasLupadas itens={lupadas || []} />

      <BannerLupaAjuda />

      <GridPaginasProdutos />

      <EditorialSection items={safeEditorial.slice(0, 6)} />

      {comPalavraDestaque && (
        <section style={{ marginBottom: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
            <div style={{ width: '4px', height: '28px', backgroundColor: '#1e3a5f', borderRadius: '2px' }} />
            <LogoComAPalavra tamanho={24} fundo="claro" />
            <a href="/compalavra" style={{ marginLeft: 'auto', fontSize: '0.8rem', color: '#1e3a5f', fontWeight: 600, textDecoration: 'none' }}>Ver todos os artigos →</a>
          </div>
          <a href={`/compalavra/${comPalavraDestaque.slug}`} style={{ textDecoration: 'none', display: 'block' }}>
            <div style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid #e5e7eb', boxShadow: '0 4px 16px rgba(0,0,0,0.08)', position: 'relative', backgroundColor: '#fff' }}>
              <div style={{ height: '300px', overflow: 'hidden', backgroundColor: '#1e3a5f', position: 'relative' }}>
                {comPalavraDestaque.imagem ? (
                  <img src={comPalavraDestaque.imagem} alt={comPalavraDestaque.titulo} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.7 }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #1e3a5f 0%, #0f2340 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '5rem' }}>✍️</span>
                  </div>
                )}
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '70%', background: 'linear-gradient(to top, rgba(15,25,50,0.95) 0%, transparent 100%)' }} />
                <span style={{ position: 'absolute', top: '16px', left: '16px', backgroundColor: '#1e3a5f', color: '#f5c518', fontSize: '0.72rem', fontWeight: 700, padding: '4px 12px', borderRadius: '20px', letterSpacing: '1px' }}>✍️ COLUNA · ComAPalavra</span>
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '24px' }}>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', margin: '0 0 8px', lineHeight: 1.2 }}>{comPalavraDestaque.titulo}</h3>
                  {comPalavraDestaque.resumo && (
                    <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.9rem', margin: '0 0 14px', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{comPalavraDestaque.resumo}</p>
                  )}
                  <div style={{ backgroundColor: '#1e3a5f', color: '#f5c518', padding: '10px 24px', borderRadius: '8px', fontWeight: 700, fontSize: '0.9rem', display: 'inline-block', border: '1px solid #f5c518' }}>Ler artigo →</div>
                </div>
              </div>
            </div>
          </a>
        </section>
      )}

      <OfertaDestaque />
      <ArtigosProdutoSection artigos={artigosProduto || []} />
      {viagemDestaque && <ViagemDestaque viagem={viagemDestaque} />}

      {safeSabores.slice(0, 6).length > 0 && (
        <section style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ width: '4px', height: '28px', backgroundColor: '#b45309', borderRadius: '2px' }} />
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#111827', margin: 0 }}>Sabores & Destinos</h2>
            <span style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 500, marginLeft: '4px' }}>por Adilson Costa</span>
            <a href="/arquivo-sabores" style={{ marginLeft: 'auto', fontSize: '0.8rem', color: '#b45309', fontWeight: 600, textDecoration: 'none' }}>Ver todos →</a>
          </div>

          <Carrossel
            itens={safeSabores.slice(0, 6)}
            slidesVisiveis={{ mobile: 1, tablet: 1, desktop: 1 }}
            gap={16}
            ariaLabel="Sabores e Destinos"
            renderItem={(item) => (
              <div style={{ borderRadius: '14px', overflow: 'hidden', border: '1px solid #e5e7eb', boxShadow: '0 4px 16px rgba(0,0,0,0.08)', position: 'relative' }}>
                <div style={{ height: '360px', overflow: 'hidden', backgroundColor: '#f3f4f6', position: 'relative' }}>
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.prato} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #b45309 0%, #92400e 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: '4rem' }}>🍽</span>
                    </div>
                  )}
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 65%)' }} />
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '24px' }}>
                    <div style={{ fontSize: '0.72rem', color: '#fcd34d', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '6px' }}>🍽 Sabores & Destinos · {item.destino}</div>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', margin: '0 0 8px', lineHeight: 1.2 }}>{item.prato}</h3>
                    <p style={{ color: 'rgba(255,255,255,0.88)', fontSize: '0.9rem', margin: '0 0 16px', fontStyle: 'italic', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.intro}</p>
                    <SaboresCardExpanded item={item} />
                  </div>
                </div>
              </div>
            )}
          />
        </section>
      )}

      {/* Notícias */}
      <section style={{ marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div style={{ width: '4px', height: '28px', backgroundColor: '#2563eb', borderRadius: '2px' }} />
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#111827', margin: 0 }}>Últimas Notícias</h2>
          <a href="/noticias" style={{ marginLeft: 'auto', fontSize: '0.8rem', color: '#2563eb', fontWeight: 600, textDecoration: 'none' }}>Ver todas as notícias →</a>
        </div>

        <nav style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
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

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {filteredHome.length === 0 ? (
            <p style={{ color: '#6b7280' }}>Nenhuma notícia encontrada.</p>
          ) : (
            filteredHome.map((item, index) => (
              <Fragment key={`item-${index}`}>
                <NewsCard item={item} />
              </Fragment>
            ))
          )}
        </div>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <a href="/noticias" style={{ display: 'inline-block', backgroundColor: '#fff', color: '#2563eb', border: '2px solid #2563eb', padding: '12px 32px', borderRadius: '8px', fontWeight: 700, fontSize: '0.95rem', textDecoration: 'none' }}>📰 Ver todas as notícias →</a>
        </div>
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
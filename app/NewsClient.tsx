'use client';

import { useState, useEffect, Fragment } from 'react';
import { FeedItem, AdItem, EditorialItem, SaboresItem } from './page';
import FooterSite from './FooterSite';
import OfertaDestaque from './OfertaDestaque';
import ArtigosProdutoSection from './ArtigosProdutoSection';
import ViagemDestaque from './ViagemDestaque';

// ─── GRID DAS 5 PÁGINAS DE PRODUTOS ──────────────────────────────────────────
const PAGINAS_PRODUTOS = [
  {
    emoji: '🏠',
    emoji2: '🪴',
    titulo: 'Monte seu Ambiente',
    descricao: 'Móveis, decoração e tudo para transformar sua casa',
    href: '/monte-seu-ambiente',
   cor: '#219BF6',
    corBg: '#eff8ff',
    corBorda: '#bfdbfe',
  },
  {
    emoji: '🍷',
    emoji2: '☕',
    titulo: 'Monte seu Momento',
    descricao: 'Produtos para tornar cada ocasião especial e inesquecível',
    href: '/monte-seu-momento',
    cor: '#7c3aed',
    corBg: '#faf5ff',
    corBorda: '#ddd6fe',
  },
  {
    emoji: '👔',
    emoji2: '👗',
    titulo: 'Vista-se',
    descricao: 'Moda, roupas e acessórios para todos os estilos',
    href: '/vista-se',
    cor: '#be185d',
    corBg: '#fdf2f8',
    corBorda: '#fbcfe8',
  },
 {
    emoji: '👶',
    emoji2: '👟',
    titulo: 'Vista seu Filho',
    descricao: 'Roupas, acessórios e produtos para bebês e crianças',
    href: '/vista-seu-filho',
    cor: '#f59e0b',
    corBg: '#fffbeb',
    corBorda: '#fde68a',
  },
  {
    emoji: '🧴',
    emoji2: '💄',
    titulo: 'Beleza',
    descricao: 'Cosméticos, cuidados pessoais e bem-estar',
    href: '/beleza',
    cor: '#db2777',
    corBg: '#fff1f2',
    corBorda: '#fecdd3',
  },
  {
    emoji: '🛒',
    emoji2: '🧺',
    titulo: 'Mercado',
    descricao: 'Alimentos, bebidas e produtos essenciais do dia a dia',
    href: '/mercado',
    cor: '#047857',
    corBg: '#f0fdf4',
    corBorda: '#bbf7d0',
  },
 ];

function BannerNewsletter() {
  return (
    <>
      <style>{`
        .bn-wrap {
          background: linear-gradient(135deg, #7c3aed, #a855f7);
          border-radius: 14px;
          padding: 20px 24px;
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          box-shadow: 0 4px 16px rgba(124,58,237,0.25);
          box-sizing: border-box;
          width: 100%;
          height: 100%;
          min-height: 80px;
        }
        .bn-left { display: flex; align-items: center; gap: 14px; }
        .bn-icon { font-size: 2rem; line-height: 1; }
        .bn-title { font-weight: 800; font-size: 1.05rem; color: #fff; }
        .bn-sub { font-size: 0.8rem; color: #e9d5ff; margin-top: 2px; }
        .bn-cats {
          background-color: rgba(255,255,255,0.15);
          border-radius: 10px;
          width: 128px;
          padding: 10px 20px;
          font-size: 0.8rem;
          color: #f3e8ff;
          line-height: 1.8;
          flex-shrink: 0;
          white-space: nowrap;
          box-sizing: border-box;
          text-align: center;
        }
        .bn-wrap-container { grid-column: span 2; display: flex; }
        @media (max-width: 640px) {
          .bn-wrap-container { grid-column: 1 / -1; }
          .bn-wrap { flex-direction: column; align-items: flex-start; gap: 14px; padding: 18px 20px; }
          .bn-cats { width: 100%; padding: 8px 12px; }
        }
      `}</style>

      <div className="bn-wrap">
        <div className="bn-left">
          <div className="bn-icon">📧✨</div>
          <div>
            <div className="bn-title">Sua lista, no seu email</div>
            <div className="bn-sub">Escolha produtos e ofertas, receba a lista que você montou e as novidades do seu universo.</div>
          </div>
        </div>
        <div className="bn-cats">🏠🍷👔🧴🛒👶 </div>
      </div>
    </>
  );
}

// ─── TICKER DE OFERTAS ────────────────────────────────────────────────────────
const TICKER_MENSAGEM_PARTES = [
  '✨ Monte a sua lista de ofertas!',
  '📧 Receba tudo no seu email.',
  '🛍 Acesse quando quiser!',
];
const TICKER_DURACAO_OFERTAS_MS = 8000;
const TICKER_DURACAO_MSG_MS     = 3500; // por parte

function TickerOfertas({ itens }: { itens: any[] }) {
  const titulos = itens
    .filter(i => i.title || i.titulo)
    .map(i => (i.title || i.titulo) as string);

  const [modo, setModo] = useState<'ofertas' | 'msg0' | 'msg1' | 'msg2'>('ofertas');
  const [visible, setVisible] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 640px)');
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    if (titulos.length === 0) return;

    const pisca = (cb: () => void) => {
      setVisible(false);
      setTimeout(() => { setVisible(true);
        setTimeout(() => { setVisible(false);
          setTimeout(() => { setVisible(true); cb(); }, 200);
        }, 200);
      }, 200);
    };

    const ciclo = () => {
      setModo('ofertas');
      setVisible(true);

      const t1 = setTimeout(() => {
               if (isMobile) {
          // Mobile: percorre todas as partes em sequência
          const partes = TICKER_MENSAGEM_PARTES.length;
          const modos = ['msg0', 'msg1', 'msg2'] as const;
          let idx = 0;
          const proxParte = () => {
            pisca(() => {
              setModo(modos[idx]);
              idx++;
              if (idx < partes) {
                setTimeout(proxParte, TICKER_DURACAO_MSG_MS);
              }
            });
          };
          proxParte();
        } else {
          // Desktop: mensagem completa numa tacada
          pisca(() => { setModo('msg0'); });
        }
      }, TICKER_DURACAO_OFERTAS_MS);

      const totalMsg = isMobile
        ? TICKER_MENSAGEM_PARTES.length * (700 + TICKER_DURACAO_MSG_MS)
        : 700 + TICKER_DURACAO_MSG_MS;

      const t2 = setTimeout(ciclo, TICKER_DURACAO_OFERTAS_MS + totalMsg);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    };

    const cleanup = ciclo();
    return cleanup;
  }, [titulos.length, isMobile]);

  if (titulos.length === 0) return null;

  const lista = [...titulos, ...titulos];
  const duracaoScroll = Math.max(titulos.length * 4, 20);
  const isMensagem = modo === 'msg0' || modo === 'msg1';
    const textoMsg = isMobile
    ? TICKER_MENSAGEM_PARTES[modo === 'msg0' ? 0 : modo === 'msg1' ? 1 : 2]
    : TICKER_MENSAGEM_PARTES.join(' ');

  return (
    <div style={{
      backgroundColor: '#111827',
      borderRadius: '8px',
      marginBottom: '20px',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      height: '36px',
      opacity: visible ? 1 : 0,
      transition: 'opacity 0.15s ease',
    }}>
      {/* Label fixo */}
      <div style={{
        backgroundColor: isMensagem ? '#7c3aed' : '#dc2626',
        color: '#fff',
        fontSize: '0.72rem',
        fontWeight: 800,
        padding: '0 14px',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        whiteSpace: 'nowrap',
        flexShrink: 0,
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
        transition: 'background-color 0.3s ease',
      }}>
        {isMensagem ? '🌟 Universo' : '🔥 Ofertas'}
      </div>

      {/* Faixa rolante */}
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        <style>{`
          @keyframes ticker-scroll {
            0%   { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          @keyframes ticker-msg {
            0%   { transform: translateX(100%); }
            28%  { transform: translateX(0%); }
            72%  { transform: translateX(0%); }
            100% { transform: translateX(-100%); }
          }
          .ticker-track {
            display: flex;
            animation: ticker-scroll ${duracaoScroll}s linear infinite;
            width: max-content;
          }
          .ticker-track:hover { animation-play-state: paused; }
          .ticker-msg {
            display: flex;
            align-items: center;
            height: 36px;
            animation: ticker-msg ${TICKER_DURACAO_MSG_MS / 1000}s ease 1 forwards;
            white-space: nowrap;
          }
        `}</style>

        {!isMensagem ? (
          <div className="ticker-track">
            {lista.map((titulo, i) => (
              <span key={i} style={{
                color: '#f9fafb',
                fontSize: '0.8rem',
                fontWeight: 500,
                whiteSpace: 'nowrap',
                padding: '0 24px',
                borderRight: '1px solid #374151',
              }}>
                {titulo}
              </span>
            ))}
          </div>
        ) : (
          <div className="ticker-msg" key={modo}>
            <span style={{
              color: '#e9d5ff',
              fontSize: '0.82rem',
              fontWeight: 600,
              padding: '0 24px',
            }}>
              {textoMsg}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function GridPaginasProdutos() {
  const renderCard = (p: typeof PAGINAS_PRODUTOS[number]) => (
    <a
      key={p.href}
      href={p.href}
      style={{ textDecoration: 'none' }}
    >
      <div style={{
        backgroundColor: p.corBg,
        border: `1.5px solid ${p.corBorda}`,
        borderRadius: '14px',
        padding: '20px 16px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: '10px',
        transition: 'transform 0.15s, box-shadow 0.15s',
        cursor: 'pointer',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
      }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
          (e.currentTarget as HTMLDivElement).style.boxShadow = '0 6px 16px rgba(0,0,0,0.10)';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLDivElement).style.transform = '';
          (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
        }}
      >
        <div style={{ display: 'flex', gap: '6px', lineHeight: 1 }}>
          <span style={{ fontSize: '2.2rem' }}>{p.emoji}</span>
          <span style={{ fontSize: '2.2rem' }}>{p.emoji2}</span>
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: '0.92rem', color: p.cor, marginBottom: '4px' }}>{p.titulo}</div>
          <div style={{ fontSize: '0.75rem', color: '#6b7280', lineHeight: 1.4 }}>{p.descricao}</div>
        </div>
        <div style={{
          marginTop: '4px',
          backgroundColor: p.cor,
          color: '#fff',
          fontSize: '0.75rem',
          fontWeight: 700,
          padding: '5px 14px',
          borderRadius: '20px',
        }}>
          Ver produtos →
        </div>
      </div>
    </a>
  );

  return (
    <section style={{ marginBottom: '32px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <div style={{ width: '4px', height: '28px', backgroundColor: '#dc2626', borderRadius: '2px' }} />
        <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#111827', margin: 0 }}>Seu Universo</h2>
        <span style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 500, marginLeft: '4px' }}>ambiente, moda, beleza e mais...</span>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
        gap: '12px',
      }}>
        {/* Os 5 primeiros cards */}
        {PAGINAS_PRODUTOS.slice(0, 5).map(renderCard)}

        {/* Vista seu Filho + Banner lado a lado — ocupam 2 colunas cada */}
               {PAGINAS_PRODUTOS.slice(5).map(renderCard)}

        <div className="bn-wrap-container">
          <BannerNewsletter />
        </div>
      </div>
    </section>
  );
}

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
export default function NewsClient({ posts, ads, editorial, sabores, ofertasMix, artigosProduto, viagemDestaque, viagensNoticias, comPalavraDestaque }: { posts: FeedItem[]; ads: AdItem[]; editorial: EditorialItem[]; sabores: SaboresItem[]; ofertasMix: any[]; artigosProduto?: any[]; viagemDestaque?: any; viagensNoticias?: any[]; comPalavraDestaque?: any }) {
  const safePosts = posts ?? [];
  const safeAds = ads ?? [];
  const safeEditorial = editorial ?? [];
  const safeSabores = sabores ?? [];

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

  // Apenas 3 notícias na home
  const filteredHome = filtered.slice(0, 3);

  return (
    <main style={{ maxWidth: '1060px', margin: '0 auto', padding: '30px 20px', fontFamily: 'system-ui, -apple-system, sans-serif', backgroundColor: '#f9fafb', minHeight: '100vh' }}>

      <header style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', marginBottom: '16px', borderTop: '6px solid #2563eb' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontSize: '2.1rem', color: '#111827', margin: 0, fontWeight: 800 }}>IAIPSI Informa</h1>
            <p style={{ color: '#6b7280', fontSize: '1rem', margin: '6px 0 0' }}>
              Política · Economia · Esportes · Saúde Mental · Ciência · Psicanálise · Tecnologia · Liderança · Mundo · Compras · Turismo 
            </p>
            <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
              <a href="/ofertas" style={{ backgroundColor: '#dc2626', color: '#fff', padding: '6px 16px', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 700, textDecoration: 'none' }}>🛍 Ofertas & Cupons</a>
              <a href="/ofertas-selecionadas" style={{ backgroundColor: '#2563eb', color: '#fff', padding: '6px 16px', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 700, textDecoration: 'none' }}>⭐ Selecionadas</a>
              <a href="/parcelado" style={{ backgroundColor: '#047857', color: '#fff', padding: '6px 16px', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 700, textDecoration: 'none' }}>💳 Parcelado</a>
              <a href="/oferta-do-dia" style={{ backgroundColor: '#b45309', color: '#fff', padding: '6px 16px', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 700, textDecoration: 'none' }}>🔥 Oferta do Dia</a>
              <a href="/viagens-selecionadas" style={{ backgroundColor: '#0f766e', color: '#fff', padding: '6px 16px', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 700, textDecoration: 'none' }}>🌍 Viagens</a>
              <a href="/viagens" style={{ backgroundColor: '#0f766e', color: '#fff', padding: '6px 16px', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 700, textDecoration: 'none' }}>🗺️ Roteiros de Viagem</a>
            </div>
          </div>
        </div>
      </header>

            {adsTopo.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <AdBannerRotating ads={adsTopo} />
        </div>
      )}

      {/* Ticker de ofertas */}
      {ofertasMix && ofertasMix.length > 0 && (
        <TickerOfertas itens={ofertasMix} />
      )}

      {/* Grid das 5 páginas de produtos */}
      <GridPaginasProdutos />

      {comPalavraDestaque && (
        <section style={{ marginBottom: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
            <div style={{ width: '4px', height: '28px', backgroundColor: '#1e3a5f', borderRadius: '2px' }} />
            <img src="/compalavra.png" alt="ComAPalavra" style={{ height: '32px', objectFit: 'contain' }} />
            <a href="/compalavra" style={{ marginLeft: 'auto', fontSize: '0.8rem', color: '#1e3a5f', fontWeight: 600, textDecoration: 'none' }}>Ver todos os artigos →</a>
          </div>
          <a href={`/compalavra/${comPalavraDestaque.slug}`} style={{ textDecoration: 'none', display: 'block' }}>
            <div style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid #e5e7eb', boxShadow: '0 4px 16px rgba(0,0,0,0.08)', position: 'relative', backgroundColor: '#fff' }}>
              <div style={{ height: '320px', overflow: 'hidden', backgroundColor: '#1e3a5f', position: 'relative' }}>
                {comPalavraDestaque.imagem ? (
                  <img src={comPalavraDestaque.imagem} alt={comPalavraDestaque.titulo} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.7 }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #1e3a5f 0%, #0f2340 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '5rem' }}>✍️</span>
                  </div>
                )}
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '70%', background: 'linear-gradient(to top, rgba(15,25,50,0.95) 0%, transparent 100%)' }} />
                <span style={{ position: 'absolute', top: '16px', left: '16px', backgroundColor: '#1e3a5f', color: '#f5c518', fontSize: '0.72rem', fontWeight: 700, padding: '4px 12px', borderRadius: '20px', letterSpacing: '1px' }}>
                  ✍️ COLUNA · ComAPalavra
                </span>
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '24px' }}>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', margin: '0 0 8px', lineHeight: 1.2 }}>
                    {comPalavraDestaque.titulo}
                  </h3>
                  {comPalavraDestaque.resumo && (
                    <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.9rem', margin: '0 0 14px', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {comPalavraDestaque.resumo}
                    </p>
                  )}
                  <div style={{ backgroundColor: '#1e3a5f', color: '#f5c518', padding: '10px 24px', borderRadius: '8px', fontWeight: 700, fontSize: '0.9rem', display: 'inline-block', border: '1px solid #f5c518' }}>
                    Ler artigo →
                  </div>
                </div>
              </div>
            </div>
          </a>
        </section>
      )}

      <OfertaDestaque />
      <ArtigosProdutoSection artigos={artigosProduto || []} />
      {viagemDestaque && <ViagemDestaque viagem={viagemDestaque} />}
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

      {/* Seção de notícias — apenas 3 na home */}
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

        <div style={{ columns: '3 300px', columnGap: '20px' }}>
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

        {/* Botão ver todas */}
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <a
            href="/noticias"
            style={{
              display: 'inline-block',
              backgroundColor: '#fff',
              color: '#2563eb',
              border: '2px solid #2563eb',
              padding: '12px 32px',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.95rem',
              textDecoration: 'none',
              transition: 'all 0.15s',
            }}
          >
            📰 Ver todas as notícias →
          </a>
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

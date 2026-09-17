'use client';

import { useState, useEffect } from 'react';

interface Campanha {
  id: string;
  name: string;
  type: string;
  period: { startAt: string; endAt: string };
  status: string;
  url: string;
  code?: string;
  isHighlight: boolean;
  mediaKit?: { banners?: string[] | null };
  channels: { shortUrls: string[] | null }[];
}

interface Marca {
  id: string;
  name: string;
  logo: string;
  site: string;
  segment: string;
  categoriaInterna: string;
  channels: { shortUrls: string[] | null }[];
}

const CATEGORIA_ICONS: Record<string, string> = {
  'Eletro & Tech': '💻',
  'Gastronomia & Vinhos': '🍷',
  'Viagens': '✈️',
  'Casa & Móveis': '🏠',
  'Moda': '👗',
  'Saúde & Beleza': '💊',
  'Bebês & Kids': '👶',
  'Entretenimento': '🎬',
  'Serviços': '⚙️',
  'Outros': '🛍',
};

const CATEGORIA_COLORS: Record<string, string> = {
  'Eletro & Tech': '#0f766e',
  'Gastronomia & Vinhos': '#7c2d12',
  'Viagens': '#0284c7',
  'Casa & Móveis': '#047857',
  'Moda': '#be185d',
  'Saúde & Beleza': '#7c3aed',
  'Bebês & Kids': '#ea580c',
  'Entretenimento': '#1e3a8a',
  'Serviços': '#374151',
  'Outros': '#6b7280',
};

function tempoRestante(endAt: string): string {
  const diff = new Date(endAt).getTime() - Date.now();
  if (diff <= 0) return 'Expirado';
  const horas = Math.floor(diff / 3600000);
  const dias = Math.floor(horas / 24);
  if (dias > 0) return `${dias}d restantes`;
  return `${horas}h restantes`;
}

function CampanhaCard({ c }: { c: Campanha }) {
  const [copiado, setCopiado] = useState(false);
  const link = c.channels?.[0]?.shortUrls?.[0] || c.url;
  const banner = c.mediaKit?.banners?.[0];
  const isCupom = c.type === 'GenericCoupon' || c.type === 'PersonalCoupon';
  const expira = c.period?.endAt ? tempoRestante(c.period.endAt) : 'Sem prazo';

  function copiarCupom() {
    if (c.code) {
      navigator.clipboard.writeText(c.code);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    }
  }

  return (
    <article
      style={{
        backgroundColor: '#fff',
        borderRadius: '4px',
        overflow: 'hidden',
        border: '1px solid #e8e8e8',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Mídia 16:9 com selos sobrepostos */}
      <div
        style={{
          position: 'relative',
          aspectRatio: '16 / 9',
          backgroundColor: '#eceff1',
          overflow: 'hidden',
        }}
      >
        {banner ? (
          <img
            src={banner}
            alt={c.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            onError={e => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : null}
        <span
          style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            backgroundColor: isCupom ? '#7c3aed' : '#dc2626',
            color: '#fff',
            fontSize: '0.64rem',
            fontWeight: 700,
            letterSpacing: '0.06em',
            padding: '4px 9px',
            borderRadius: '2px',
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
          }}
        >
          {isCupom ? '🏷 Cupom' : '🔥 Oferta'}
        </span>
      </div>

      {/* Corpo */}
      <div
        style={{
          padding: '14px 16px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          flexGrow: 1,
        }}
      >
        <h2
          style={{
            fontSize: '0.95rem',
            fontWeight: 600,
            color: '#1a1a1a',
            margin: 0,
            lineHeight: 1.35,
            textWrap: 'pretty',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {c.name}
        </h2>

        {/* Linha de meta: prazo */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.74rem',
            fontWeight: 600,
            color: expira === 'Expirado' ? '#dc2626' : '#6b7280',
            paddingBottom: '2px',
            borderBottom: '1px solid #f0f0f0',
          }}
        >
          <span>⏱ {expira}</span>
        </div>

        {/* Ações fixadas na base */}
        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {isCupom && c.code && (
            <button
              onClick={copiarCupom}
              style={{
                backgroundColor: copiado ? '#047857' : '#fafafa',
                color: copiado ? '#fff' : '#1a1a1a',
                border: `1px dashed ${copiado ? '#047857' : '#c9c9c9'}`,
                borderRadius: '3px',
                padding: '9px 12px',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer',
                letterSpacing: '0.08em',
                transition: 'all 0.2s',
                textAlign: 'center',
              }}
            >
              {copiado ? '✅ Copiado!' : `${c.code} — Copiar`}
            </button>
          )}
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer sponsored"
            style={{
              backgroundColor: '#dc2626',
              color: '#fff',
              padding: '11px 16px',
              borderRadius: '3px',
              fontWeight: 700,
              fontSize: '0.85rem',
              textAlign: 'center',
              textDecoration: 'none',
            }}
          >
            {isCupom ? 'Usar cupom' : 'Ver oferta'}
          </a>
        </div>
      </div>
    </article>
  );
}

function MarcaCard({ m }: { m: Marca }) {
  const link = m.channels?.[0]?.shortUrls?.[0] || `https://${m.site}`;
  const color = CATEGORIA_COLORS[m.categoriaInterna] || '#374151';
  return (
    <a href={link} target="_blank" rel="noopener noreferrer sponsored" style={{ textDecoration: 'none' }}>
      <article
        style={{
          backgroundColor: '#fff',
          borderRadius: '4px',
          border: '1px solid #e8e8e8',
          padding: '18px 14px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: '10px',
          height: '100%',
          cursor: 'pointer',
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            overflow: 'hidden',
            border: '1px solid #eee',
            flexShrink: 0,
            backgroundColor: '#fafafa',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <img
            src={m.logo}
            alt={m.name}
            style={{ width: '78%', height: '78%', objectFit: 'contain' }}
            onError={e => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
        <div style={{ fontWeight: 600, color: '#1a1a1a', fontSize: '0.9rem', lineHeight: 1.3 }}>{m.name}</div>
        <div
          style={{
            fontSize: '0.7rem',
            color: color,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          {CATEGORIA_ICONS[m.categoriaInterna]} {m.categoriaInterna}
        </div>
      </article>
    </a>
  );
}

function Paginacao({ pagina, setPagina, count }: { pagina: number; setPagina: (p: number) => void; count: number }) {
  const temProxima = count >= 20;
  if (pagina === 1 && !temProxima) return null;
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginTop: '36px' }}>
      <button
        onClick={() => setPagina(pagina - 1)}
        disabled={pagina === 1}
        style={{
          padding: '10px 18px',
          borderRadius: '3px',
          border: '1px solid #ddd',
          backgroundColor: '#fff',
          color: pagina === 1 ? '#bbb' : '#1a1a1a',
          fontWeight: 600,
          fontSize: '0.85rem',
          cursor: pagina === 1 ? 'not-allowed' : 'pointer',
        }}
      >
        ← Anterior
      </button>
      <span style={{ fontSize: '0.85rem', color: '#6b7280', fontWeight: 500, minWidth: '90px', textAlign: 'center' }}>
        Página {pagina}
      </span>
      <button
        onClick={() => setPagina(pagina + 1)}
        disabled={!temProxima}
        style={{
          padding: '10px 18px',
          borderRadius: '3px',
          border: '1px solid #ddd',
          backgroundColor: '#fff',
          color: !temProxima ? '#bbb' : '#1a1a1a',
          fontWeight: 600,
          fontSize: '0.85rem',
          cursor: !temProxima ? 'not-allowed' : 'pointer',
        }}
      >
        Próxima →
      </button>
    </div>
  );
}

export default function OfertasPage() {
  const [campanhas, setCampanhas] = useState<Campanha[]>([]);
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [categorias, setCategorias] = useState<string[]>([]);
  const [aba, setAba] = useState<'campanhas' | 'marcas'>('campanhas');
  const [categoriaAtiva, setCategoriaAtiva] = useState('Todas');
  const [loading, setLoading] = useState(true);
  const [paginaCamp, setPaginaCamp] = useState(1);
  const [paginaMarca, setPaginaMarca] = useState(1);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/lomadee?tipo=campaigns&pagina=${paginaCamp}`)
      .then(r => r.json())
      .then(d => setCampanhas(d.data || []))
      .finally(() => setLoading(false));
  }, [paginaCamp]);

  useEffect(() => {
    // Busca marcas com categorias
    fetch('/api/lomadee?tipo=brands-categoria')
      .then(r => r.json())
      .then(d => {
        setMarcas(d.data || []);
        setCategorias(['Todas', ...(d.categorias || []).filter((c: string) => c !== 'Outros')]);
      });
  }, []);

  const campanhasAtivas = campanhas.filter(c => c.status === 'onTime');

  const marcasFiltradas = categoriaAtiva === 'Todas'
    ? marcas.filter(m => m.categoriaInterna !== 'Outros')
    : marcas.filter(m => m.categoriaInterna === categoriaAtiva);

  const marcasPaginadas = marcasFiltradas.slice((paginaMarca - 1) * 20, paginaMarca * 20);

  return (
    <div style={{ backgroundColor: '#fff', minHeight: '100vh', fontFamily: 'Helvetica, Arial, sans-serif', color: '#1a1a1a' }}>

      {/* Barra utilitária */}
      <div style={{ backgroundColor: '#1a1a1a', color: '#e5e5e5', fontSize: '0.74rem' }}>
        <div style={{ maxWidth: '1160px', margin: '0 auto', padding: '7px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <a href="/" style={{ color: '#e5e5e5', textDecoration: 'none', fontWeight: 500 }}>← Voltar ao site</a>
          <span style={{ color: '#9ca3af' }}>Atualizado automaticamente · links de afiliado</span>
        </div>
      </div>

      {/* Cabeçalho principal */}
      <header style={{ borderBottom: '1px solid #e8e8e8', backgroundColor: '#fff' }}>
        <div style={{ maxWidth: '1160px', margin: '0 auto', padding: '20px 20px 0', display: 'flex', flexDirection: 'column', gap: '18px' }}>

          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, letterSpacing: '-0.01em' }}>
              🛍 Ofertas &amp; Cupons
            </h1>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <a href="/oferta-do-dia" style={{ padding: '8px 14px', borderRadius: '3px', border: '1px solid #e8e8e8', color: '#dc2626', fontWeight: 600, fontSize: '0.8rem', textDecoration: 'none' }}>
                🔥 Oferta do Dia
              </a>
               </div>
          </div>

          {/* Abas sublinhadas */}
          <nav style={{ display: 'flex', gap: '28px' }}>
            {(['campanhas', 'marcas'] as const).map(a => (
              <button
                key={a}
                onClick={() => setAba(a)}
                style={{
                  padding: '0 0 12px',
                  border: 'none',
                  background: 'none',
                  borderBottom: `3px solid ${aba === a ? '#dc2626' : 'transparent'}`,
                  color: aba === a ? '#1a1a1a' : '#6b7280',
                  fontWeight: aba === a ? 700 : 500,
                  fontSize: '0.92rem',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                {a === 'campanhas' ? `Ofertas & Cupons (${campanhasAtivas.length})` : 'Lojas por Categoria'}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main style={{ maxWidth: '1160px', margin: '0 auto', padding: '28px 20px 60px' }}>

        {loading && aba === 'campanhas' ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: '#6b7280', fontSize: '0.9rem' }}>⏳ Carregando...</div>
        ) : (
          <>
            {/* Aba campanhas */}
            {aba === 'campanhas' && (
              campanhasAtivas.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '80px 20px', color: '#6b7280', fontSize: '0.9rem' }}>Nenhuma oferta ativa no momento.</div>
              ) : (
                <>
                  <h2 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 16px' }}>Em destaque hoje</h2>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
                    {campanhasAtivas.map(c => <CampanhaCard key={c.id} c={c} />)}
                  </div>
                  <Paginacao pagina={paginaCamp} setPagina={setPaginaCamp} count={campanhasAtivas.length} />
                </>
              )
            )}

            {/* Aba marcas com categorias */}
            {aba === 'marcas' && (
              <div>
                {/* Filtros de categoria — trilha horizontal */}
                <nav
                  style={{
                    display: 'flex',
                    gap: '8px',
                    marginBottom: '24px',
                    overflowX: 'auto',
                    paddingBottom: '10px',
                    borderBottom: '1px solid #f0f0f0',
                  }}
                >
                  {categorias.map(cat => {
                    const isActive = categoriaAtiva === cat;
                    const color = CATEGORIA_COLORS[cat] || '#374151';
                    return (
                      <button
                        key={cat}
                        onClick={() => { setCategoriaAtiva(cat); setPaginaMarca(1); }}
                        style={{
                          padding: '8px 14px',
                          borderRadius: '999px',
                          border: `1px solid ${isActive ? color : '#e0e0e0'}`,
                          backgroundColor: isActive ? color : '#fff',
                          color: isActive ? '#fff' : '#374151',
                          fontWeight: 600,
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                          flexShrink: 0,
                          fontFamily: 'inherit',
                          transition: 'all 0.15s',
                        }}
                      >
                        {cat === 'Todas' ? '🛍 Todas' : `${CATEGORIA_ICONS[cat] || ''} ${cat}`}
                      </button>
                    );
                  })}
                </nav>

                {marcasPaginadas.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '80px 20px', color: '#6b7280', fontSize: '0.9rem' }}>Nenhuma loja nessa categoria.</div>
                ) : (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: '14px' }}>
                      {marcasPaginadas.map(m => <MarcaCard key={m.id} m={m} />)}
                    </div>
                    <Paginacao pagina={paginaMarca} setPagina={setPaginaMarca} count={marcasPaginadas.length} />
                  </>
                )}
              </div>
            )}
          </>
        )}
      </main>

      <footer style={{ borderTop: '1px solid #e8e8e8', backgroundColor: '#fafafa' }}>
        <div style={{ maxWidth: '1160px', margin: '0 auto', padding: '28px 20px 40px', textAlign: 'center' }}>
          <p style={{ fontSize: '0.74rem', color: '#6b7280', margin: 0, lineHeight: 1.7, maxWidth: '640px', marginInline: 'auto' }}>
            Links de afiliado — ao comprar através deles você apoia o IAIPSI Informa sem custo adicional. Ofertas sujeitas a disponibilidade e prazo.
          </p>
        </div>
      </footer>

    </div>
  );
}

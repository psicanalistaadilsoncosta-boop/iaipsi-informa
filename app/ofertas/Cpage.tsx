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
  const expira = tempoRestante(c.period.endAt);

  function copiarCupom() {
    if (c.code) {
      navigator.clipboard.writeText(c.code);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    }
  }

  return (
    <article style={{ backgroundColor: '#fff', borderRadius: '14px', overflow: 'hidden', border: '1px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
      {banner && (
        <div style={{ height: '140px', overflow: 'hidden', backgroundColor: '#f3f4f6' }}>
          <img src={banner} alt={c.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
        </div>
      )}
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px', gap: '8px' }}>
          <span style={{ backgroundColor: isCupom ? '#7c3aed' : '#dc2626', color: '#fff', fontSize: '0.68rem', fontWeight: 700, padding: '2px 8px', borderRadius: '20px', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
            {isCupom ? '🏷 Cupom' : '🔥 Oferta'}
          </span>
          <span style={{ fontSize: '0.72rem', color: expira.includes('Expirado') ? '#dc2626' : '#9ca3af', fontWeight: 600 }}>
            ⏱ {expira}
          </span>
        </div>
        <h2 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#111827', margin: '0 0 12px', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {c.name}
        </h2>
        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {isCupom && c.code && (
            <button onClick={copiarCupom} style={{ backgroundColor: copiado ? '#047857' : '#f3f4f6', color: copiado ? '#fff' : '#374151', border: '2px dashed #d1d5db', borderRadius: '8px', padding: '8px 12px', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', letterSpacing: '1px', transition: 'all 0.2s', textAlign: 'center' }}>
              {copiado ? '✅ Copiado!' : `${c.code} — Copiar`}
            </button>
          )}
          <a href={link} target="_blank" rel="noopener noreferrer sponsored" style={{ backgroundColor: '#dc2626', color: '#fff', padding: '9px 16px', borderRadius: '8px', fontWeight: 700, fontSize: '0.85rem', textAlign: 'center', textDecoration: 'none' }}>
            {isCupom ? 'Usar cupom →' : 'Ver oferta →'}
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
      <article style={{ backgroundColor: '#fff', borderRadius: '12px', border: `1px solid #e5e7eb`, padding: '16px', boxShadow: '0 2px 6px rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer', borderLeft: `4px solid ${color}` }}>
        <div style={{ width: '52px', height: '52px', borderRadius: '10px', overflow: 'hidden', border: '1px solid #f3f4f6', flexShrink: 0, backgroundColor: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img src={m.logo} alt={m.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, color: '#111827', fontSize: '0.95rem' }}>{m.name}</div>
          <div style={{ fontSize: '0.75rem', color: color, fontWeight: 600, marginTop: '2px' }}>
            {CATEGORIA_ICONS[m.categoriaInterna]} {m.categoriaInterna}
          </div>
        </div>
        <span style={{ color: '#dc2626', fontSize: '1.2rem' }}>→</span>
      </article>
    </a>
  );
}

function Paginacao({ pagina, setPagina, count }: { pagina: number; setPagina: (p: number) => void; count: number }) {
  const temProxima = count >= 20;
  if (pagina === 1 && !temProxima) return null;
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', marginTop: '32px' }}>
      <button onClick={() => setPagina(pagina - 1)} disabled={pagina === 1} style={{ padding: '8px 20px', borderRadius: '8px', border: '1px solid #e5e7eb', backgroundColor: pagina === 1 ? '#f9fafb' : '#fff', color: pagina === 1 ? '#9ca3af' : '#374151', fontWeight: 600, cursor: pagina === 1 ? 'not-allowed' : 'pointer' }}>
        ← Anterior
      </button>
      <span style={{ fontSize: '0.9rem', color: '#6b7280', fontWeight: 500 }}>Página {pagina}</span>
      <button onClick={() => setPagina(pagina + 1)} disabled={!temProxima} style={{ padding: '8px 20px', borderRadius: '8px', border: '1px solid #e5e7eb', backgroundColor: !temProxima ? '#f9fafb' : '#fff', color: !temProxima ? '#9ca3af' : '#374151', fontWeight: 600, cursor: !temProxima ? 'not-allowed' : 'pointer' }}>
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
    <main style={{ maxWidth: '1060px', margin: '0 auto', padding: '30px 20px', fontFamily: 'system-ui, sans-serif', backgroundColor: '#f9fafb', minHeight: '100vh' }}>

      <a href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#2563eb', fontWeight: 600, fontSize: '0.85rem', textDecoration: 'none', marginBottom: '24px' }}>
        ← Voltar ao site
      </a>

      <header style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', marginBottom: '24px', borderTop: '6px solid #dc2626' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#111827', margin: '0 0 6px' }}>🛍 Ofertas & Cupons</h1>
        <p style={{ color: '#6b7280', fontSize: '0.95rem', margin: 0 }}>
          Melhores ofertas, cupons e lojas parceiras — atualizado automaticamente.
        </p>
      </header>

      {/* Links rápidos */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <a href="/oferta-do-dia" style={{ padding: '8px 20px', borderRadius: '8px', backgroundColor: '#fef2f2', color: '#dc2626', fontWeight: 700, fontSize: '0.9rem', textDecoration: 'none', border: '1px solid #fca5a5' }}>
          🔥 Oferta do Dia
        </a>
        <a href="/cupons" style={{ padding: '8px 20px', borderRadius: '8px', backgroundColor: '#f5f3ff', color: '#7c3aed', fontWeight: 700, fontSize: '0.9rem', textDecoration: 'none', border: '1px solid #c4b5fd' }}>
          🏷 Só Cupons
        </a>
      </div>

      {/* Abas */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {(['campanhas', 'marcas'] as const).map(a => (
          <button key={a} onClick={() => setAba(a)} style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', backgroundColor: aba === a ? '#dc2626' : '#fff', color: aba === a ? '#fff' : '#374151', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
            {a === 'campanhas' ? `🔥 Ofertas & Cupons (${campanhasAtivas.length})` : `🏪 Lojas por Categoria`}
          </button>
        ))}
      </div>

      {loading && aba === 'campanhas' ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280' }}>⏳ Carregando...</div>
      ) : (
        <>
          {/* Aba campanhas */}
          {aba === 'campanhas' && (
            campanhasAtivas.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280' }}>Nenhuma oferta ativa no momento.</div>
            ) : (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                  {campanhasAtivas.map(c => <CampanhaCard key={c.id} c={c} />)}
                </div>
                <Paginacao pagina={paginaCamp} setPagina={setPaginaCamp} count={campanhasAtivas.length} />
              </>
            )
          )}

          {/* Aba marcas com categorias */}
          {aba === 'marcas' && (
            <div>
              {/* Filtros de categoria */}
              <nav style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
                {categorias.map(cat => {
                  const isActive = categoriaAtiva === cat;
                  const color = CATEGORIA_COLORS[cat] || '#374151';
                  return (
                    <button key={cat} onClick={() => { setCategoriaAtiva(cat); setPaginaMarca(1); }} style={{ padding: '7px 14px', borderRadius: '999px', border: `2px solid ${isActive ? color : '#e5e7eb'}`, backgroundColor: isActive ? color : '#fff', color: isActive ? '#fff' : '#374151', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer', transition: 'all 0.15s' }}>
                      {cat === 'Todas' ? '🛍 Todas' : `${CATEGORIA_ICONS[cat] || ''} ${cat}`}
                    </button>
                  );
                })}
              </nav>

              {marcasPaginadas.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280' }}>Nenhuma loja nessa categoria.</div>
              ) : (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '14px' }}>
                    {marcasPaginadas.map(m => <MarcaCard key={m.id} m={m} />)}
                  </div>
                  <Paginacao pagina={paginaMarca} setPagina={setPaginaMarca} count={marcasPaginadas.length} />
                </>
              )}
            </div>
          )}
        </>
      )}

      <footer style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #e5e7eb', textAlign: 'center' }}>
        <p style={{ fontSize: '0.72rem', color: '#9ca3af', margin: 0, lineHeight: 1.6 }}>
          Links de afiliado — ao comprar através deles você apoia o IAIPSI Informa sem custo adicional. Ofertas sujeitas a disponibilidade e prazo.
        </p>
      </footer>

    </main>
  );
}
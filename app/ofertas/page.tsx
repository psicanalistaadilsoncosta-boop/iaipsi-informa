'use client';

import { useState, useEffect } from 'react';

interface Campanha {
  id: string;
  name: string;
  type: string;
  offerType: string;
  categories: string[];
  period: { startAt: string; endAt: string };
  status: string;
  url: string;
  code?: string;
  mediaKit?: { banners?: string[] | null };
  channels: { shortUrls: string[] | null; message?: string }[];
}

interface Marca {
  id: string;
  name: string;
  logo: string;
  site: string;
  segment: string;
  commission: { value: number; transfer: string };
  channels: { shortUrls: string[] | null }[];
}

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
          <span style={{ backgroundColor: isCupom ? '#7c3aed' : '#dc2626', color: '#fff', fontSize: '0.68rem', fontWeight: 700, padding: '2px 8px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>
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
  return (
    <a href={link} target="_blank" rel="noopener noreferrer sponsored" style={{ textDecoration: 'none' }}>
      <article style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '16px', boxShadow: '0 2px 6px rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer' }}>
        <div style={{ width: '56px', height: '56px', borderRadius: '10px', overflow: 'hidden', border: '1px solid #f3f4f6', flexShrink: 0, backgroundColor: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img src={m.logo} alt={m.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, color: '#111827', fontSize: '0.95rem' }}>{m.name}</div>
          <div style={{ fontSize: '0.78rem', color: '#6b7280', marginTop: '2px' }}>{m.segment}</div>
          <div style={{ fontSize: '0.72rem', color: '#047857', fontWeight: 600, marginTop: '4px' }}>
            Comissão: {m.commission.value}%
          </div>
        </div>
        <span style={{ color: '#dc2626', fontSize: '1.2rem' }}>→</span>
      </article>
    </a>
  );
}

export default function OfertasPage() {
  const [campanhas, setCampanhas] = useState<Campanha[]>([]);
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [aba, setAba] = useState<'campanhas' | 'marcas'>('campanhas');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch('/api/lomadee?tipo=campaigns').then(r => r.json()),
      fetch('/api/lomadee?tipo=brands').then(r => r.json()),
    ]).then(([camp, brand]) => {
      setCampanhas(camp.data || []);
      setMarcas(brand.data || []);
    }).finally(() => setLoading(false));
  }, []);

  const campanhasAtivas = campanhas.filter(c => c.status === 'onTime');

  return (
    <main style={{ maxWidth: '1060px', margin: '0 auto', padding: '30px 20px', fontFamily: 'system-ui, sans-serif', backgroundColor: '#f9fafb', minHeight: '100vh' }}>

      <a href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#2563eb', fontWeight: 600, fontSize: '0.85rem', textDecoration: 'none', marginBottom: '24px' }}>
        ← Voltar ao site
      </a>

      <header style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', marginBottom: '24px', borderTop: '6px solid #dc2626' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#111827', margin: '0 0 6px' }}>🛍 Ofertas & Cupons</h1>
        <p style={{ color: '#6b7280', fontSize: '0.95rem', margin: 0 }}>
          Melhores ofertas e cupons exclusivos selecionados para você.
        </p>
      </header>

      {/* Abas */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        <button onClick={() => setAba('campanhas')} style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', backgroundColor: aba === 'campanhas' ? '#dc2626' : '#fff', color: aba === 'campanhas' ? '#fff' : '#374151', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          🔥 Ofertas & Cupons ({campanhasAtivas.length})
        </button>
        <button onClick={() => setAba('marcas')} style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', backgroundColor: aba === 'marcas' ? '#dc2626' : '#fff', color: aba === 'marcas' ? '#fff' : '#374151', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          🏪 Lojas Parceiras ({marcas.length})
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280' }}>⏳ Carregando...</div>
      ) : (
        <>
          {aba === 'campanhas' && (
            campanhasAtivas.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280' }}>Nenhuma oferta ativa no momento.</div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                {campanhasAtivas.map(c => <CampanhaCard key={c.id} c={c} />)}
              </div>
            )
          )}

          {aba === 'marcas' && (
            marcas.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280' }}>Nenhuma marca disponível.</div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '14px' }}>
                {marcas.map(m => <MarcaCard key={m.id} m={m} />)}
              </div>
            )
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
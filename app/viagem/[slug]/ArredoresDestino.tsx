'use client';

import { useState, useEffect } from 'react';

interface Lugar {
  name: string;
  rating: number | null;
  total_ratings: number;
  vicinity: string;
  open_now: boolean | null;
  price_level: number | null;
  emoji: string;
}

interface Categoria {
  type: string;
  label: string;
  emoji: string;
  lugares: Lugar[];
}

interface PlacesData {
  destino: string;
  enderecoFormatado: string;
  raio: number;
  categorias: Categoria[];
}

const CATEGORIAS_ORDEM = [
  'restaurant', 'cafe', 'bakery', 'bar',
  'pharmacy', 'supermarket', 'atm', 'subway_station',
];

export default function ArredoresDestino({ destino }: { destino: string }) {
  const [data, setData] = useState<PlacesData | null>(null);
  const [erro, setErro] = useState(false);
  const [catAtiva, setCatAtiva] = useState<string | null>(null);

  useEffect(() => {
    if (!destino) return;
    fetch(`/api/places?destino=${encodeURIComponent(destino)}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) { setErro(true); return; }
        setData(d);
        if (d.categorias?.length) setCatAtiva(d.categorias[0].type);
      })
      .catch(() => setErro(true));
  }, [destino]);

  if (erro || (!data && data !== null)) return null; // falha silenciosa
  if (!data) return (
    <div style={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #e5e7eb', padding: '28px', marginBottom: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
        <div style={{ width: '4px', height: '28px', backgroundColor: '#0f766e', borderRadius: '2px' }} />
        <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#111827', margin: 0 }}>Nos Arredores</h2>
      </div>
      <div style={{ color: '#9ca3af', fontSize: '0.88rem' }}>Carregando pontos de interesse...</div>
    </div>
  );

  if (!data.categorias?.length) return null;

  const categoriaAtual = data.categorias.find(c => c.type === catAtiva) || data.categorias[0];

  function estrelas(rating: number | null) {
    if (!rating) return null;
    return `⭐ ${rating.toFixed(1)}`;
  }

  function precoLabel(level: number | null) {
    if (level === null) return null;
    return ['', '€', '€€', '€€€', '€€€€'][level] || null;
  }

  return (
    <div style={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #e5e7eb', padding: '28px', marginBottom: '24px' }}>

      {/* Cabeçalho */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
        <div style={{ width: '4px', height: '28px', backgroundColor: '#0f766e', borderRadius: '2px' }} />
        <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#111827', margin: 0 }}>Nos Arredores</h2>
      </div>
      <p style={{ fontSize: '0.78rem', color: '#9ca3af', margin: '0 0 18px 14px' }}>
        Pontos de interesse num raio de {data.raio}m em {data.destino} · via Google Places
      </p>

      {/* Tabs de categoria */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
        {data.categorias
          .sort((a, b) => CATEGORIAS_ORDEM.indexOf(a.type) - CATEGORIAS_ORDEM.indexOf(b.type))
          .map(cat => (
            <button key={cat.type} onClick={() => setCatAtiva(cat.type)}
              style={{
                padding: '5px 12px', borderRadius: '20px', fontSize: '0.78rem', cursor: 'pointer', fontWeight: catAtiva === cat.type ? 700 : 400,
                border: `1px solid ${catAtiva === cat.type ? '#0f766e' : '#e5e7eb'}`,
                backgroundColor: catAtiva === cat.type ? '#f0fdfa' : '#fff',
                color: catAtiva === cat.type ? '#0f766e' : '#6b7280',
              }}>
              {cat.emoji} {cat.label.replace(/^[^\s]+\s/, '')}
            </button>
          ))}
      </div>

      {/* Lista de lugares */}
      {categoriaAtual && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {categoriaAtual.lugares.map((lugar, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '10px 12px', backgroundColor: '#f9fafb', borderRadius: '8px', gap: '10px' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#111827', marginBottom: '2px' }}>{lugar.name}</div>
                <div style={{ fontSize: '0.75rem', color: '#9ca3af', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lugar.vicinity}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, fontSize: '0.75rem' }}>
                {lugar.open_now === true && <span style={{ color: '#16a34a', fontWeight: 600 }}>Aberto</span>}
                {lugar.open_now === false && <span style={{ color: '#dc2626', fontWeight: 600 }}>Fechado</span>}
                {precoLabel(lugar.price_level) && <span style={{ color: '#6b7280' }}>{precoLabel(lugar.price_level)}</span>}
                {estrelas(lugar.rating) && (
                  <span style={{ color: '#374151', fontWeight: 600 }}>
                    {estrelas(lugar.rating)}
                    <span style={{ color: '#9ca3af', fontWeight: 400 }}> ({lugar.total_ratings})</span>
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <p style={{ fontSize: '0.68rem', color: '#d1d5db', margin: '12px 0 0', textAlign: 'right' }}>
        Dados: Google Places · Resultados aproximados ao centro do destino
      </p>
    </div>
  );
}

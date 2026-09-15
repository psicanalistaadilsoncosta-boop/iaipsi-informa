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

function CupomCard({ c }: { c: Campanha }) {
  const [copiado, setCopiado] = useState(false);
  const link = c.channels?.[0]?.shortUrls?.[0] || c.url;
  const expira = tempoRestante(c.period.endAt);

  function copiar() {
    if (c.code) {
      navigator.clipboard.writeText(c.code);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    }
  }

  return (
    <article style={{ backgroundColor: '#fff', borderRadius: '14px', border: '2px dashed #7c3aed', padding: '24px', boxShadow: '0 2px 8px rgba(124,58,237,0.08)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ backgroundColor: '#7c3aed', color: '#fff', fontSize: '0.72rem', fontWeight: 700, padding: '3px 10px', borderRadius: '20px', textTransform: 'uppercase' }}>
          🏷 Cupom
        </span>
        <span style={{ fontSize: '0.78rem', color: expira.includes('Expirado') ? '#dc2626' : '#9ca3af', fontWeight: 600 }}>
          ⏱ {expira}
        </span>
      </div>

      <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#111827', margin: 0, lineHeight: 1.4 }}>
        {c.name}
      </h2>

      {c.code && (
        <button onClick={copiar} style={{
          backgroundColor: copiado ? '#047857' : '#f5f3ff',
          color: copiado ? '#fff' : '#7c3aed',
          border: '2px dashed #7c3aed',
          borderRadius: '10px',
          padding: '12px',
          fontWeight: 800,
          fontSize: '1.2rem',
          cursor: 'pointer',
          letterSpacing: '2px',
          transition: 'all 0.2s',
          textAlign: 'center',
          width: '100%',
        }}>
          {copiado ? '✅ Copiado!' : `${c.code}`}
        </button>
      )}

      {c.code && (
        <p style={{ fontSize: '0.78rem', color: '#9ca3af', margin: 0, textAlign: 'center' }}>
          Clique para copiar o código
        </p>
      )}

      <a href={link} target="_blank" rel="noopener noreferrer sponsored" style={{
        backgroundColor: '#7c3aed',
        color: '#fff',
        padding: '10px 16px',
        borderRadius: '8px',
        fontWeight: 700,
        fontSize: '0.9rem',
        textAlign: 'center',
        textDecoration: 'none',
      }}>
        Usar cupom na loja →
      </a>
    </article>
  );
}

export default function CuponsPage() {
  const [cupons, setCupons] = useState<Campanha[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/lomadee?tipo=campaigns&filtro=cupons')
      .then(r => r.json())
      .then(d => setCupons(d.data || []))
      .finally(() => setLoading(false));
  }, []);

  const ativos = cupons.filter(c => c.status === 'onTime');

  return (
    <main style={{ maxWidth: '860px', margin: '0 auto', padding: '30px 20px', fontFamily: 'system-ui, sans-serif', backgroundColor: '#f9fafb', minHeight: '100vh' }}>

      <a href="/ofertas" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#7c3aed', fontWeight: 600, fontSize: '0.85rem', textDecoration: 'none', marginBottom: '24px' }}>
        ← Voltar às ofertas
      </a>

      <header style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', marginBottom: '32px', borderTop: '6px solid #7c3aed' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#111827', margin: '0 0 6px' }}>🏷 Cupons Exclusivos</h1>
        <p style={{ color: '#6b7280', fontSize: '0.95rem', margin: 0 }}>
          {ativos.length} cupons ativos — copie o código e use na loja
        </p>
      </header>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280' }}>⏳ Carregando cupons...</div>
      ) : ativos.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280' }}>Nenhum cupom ativo no momento.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {ativos.map(c => <CupomCard key={c.id} c={c} />)}
        </div>
      )}

      <footer style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #e5e7eb', textAlign: 'center' }}>
        <p style={{ fontSize: '0.72rem', color: '#9ca3af', margin: 0 }}>
          Cupons sujeitos a disponibilidade e prazo. Links de afiliado — ao comprar você apoia o IAIPSI Informa.
        </p>
      </footer>
    </main>
  );
}
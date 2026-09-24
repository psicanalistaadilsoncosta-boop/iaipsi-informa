'use client';

import { useState, useEffect } from 'react';

const AMBIENTES = ['Sala', 'Quarto', 'Escritório', 'Cozinha', 'Banheiro', 'Área externa'];
const TIPOS_AMBIENTE = ['Iluminação', 'Climatização', 'Móveis', 'Decoração', 'Organização', 'Eletrônicos'];

const AMBIENTE_EMOJI: Record<string, string> = {
  'Sala': '🛋', 'Quarto': '🛏', 'Escritório': '💻',
  'Cozinha': '🍳', 'Banheiro': '🚿', 'Área externa': '🌿',
};

const TIPO_EMOJI: Record<string, string> = {
  'Iluminação': '💡', 'Climatização': '❄️', 'Móveis': '🪑',
  'Decoração': '🎨', 'Organização': '📦', 'Eletrônicos': '🔌',
};

interface Lead {
  email: string;
  ambientes: string[];
  criadoEm: string;
}

interface MapaAmbientes {
  [ambiente: string]: {
    [tipo: string]: any[];
  };
}

type Aba = 'cobertura' | 'leads';

export default function AmbientesPainelPage() {
  const [mapa, setMapa] = useState<MapaAmbientes>({});
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [aba, setAba] = useState<Aba>('cobertura');
  const [filtroAmbienteLead, setFiltroAmbienteLead] = useState('');

  useEffect(() => {
    Promise.all([
      fetch('/api/ambientes').then(r => r.json()).catch(() => ({})),
      fetch('/api/ambientes/lead').then(r => r.json()).catch(() => []),
    ]).then(([m, l]) => {
      setMapa(m || {});
      setLeads(Array.isArray(l) ? l : []);
      setLoading(false);
    });
  }, []);

  // Totais por ambiente e tipo
  const totalGeral = AMBIENTES.reduce((s, a) => {
    return s + TIPOS_AMBIENTE.reduce((s2, t) => s2 + (mapa[a]?.[t]?.length || 0), 0);
  }, 0);

  const totalPorAmbiente = (amb: string) =>
    TIPOS_AMBIENTE.reduce((s, t) => s + (mapa[amb]?.[t]?.length || 0), 0);

  // Lacunas = combinações ambiente+tipo com 0 produtos
  const lacunas = AMBIENTES.flatMap(a =>
    TIPOS_AMBIENTE
      .filter(t => !mapa[a]?.[t]?.length)
      .map(t => ({ ambiente: a, tipo: t }))
  );

  // Leads filtrados
  const leadsFiltrados = filtroAmbienteLead
    ? leads.filter(l => l.ambientes?.includes(filtroAmbienteLead))
    : leads;

  // Contagem de interesse por ambiente (de leads)
  const interessePorAmbiente: Record<string, number> = {};
  for (const l of leads) {
    for (const a of (l.ambientes || [])) {
      interessePorAmbiente[a] = (interessePorAmbiente[a] || 0) + 1;
    }
  }

  const cobertura = Math.round(((AMBIENTES.length * TIPOS_AMBIENTE.length - lacunas.length) / (AMBIENTES.length * TIPOS_AMBIENTE.length)) * 100);

  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', backgroundColor: '#f9fafb', minHeight: '100vh', padding: '32px 20px' }}>
      <div style={{ maxWidth: '1060px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#111827', margin: '0 0 6px' }}>
            🏠 Painel de Ambientes
          </h1>
          <p style={{ color: '#6b7280', fontSize: '0.88rem', margin: 0 }}>
            Cobertura de produtos por ambiente e tipo · Leads capturados
          </p>
        </div>

        {/* KPIs */}
        {!loading && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '14px', marginBottom: '28px' }}>
            {[
              { label: 'Produtos categorizados', valor: totalGeral, cor: '#2563eb', emoji: '📦' },
              { label: 'Ambientes com produtos', valor: AMBIENTES.filter(a => totalPorAmbiente(a) > 0).length, cor: '#7c3aed', emoji: '🏠', sufixo: `/ ${AMBIENTES.length}` },
              { label: 'Cobertura ambiente×tipo', valor: `${cobertura}%`, cor: cobertura >= 70 ? '#059669' : cobertura >= 40 ? '#d97706' : '#dc2626', emoji: '📊' },
              { label: 'Lacunas', valor: lacunas.length, cor: '#dc2626', emoji: '⚠️' },
              { label: 'Leads capturados', valor: leads.length, cor: '#047857', emoji: '📧' },
            ].map(k => (
              <div key={k.label} style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '16px', border: '1px solid #e5e7eb', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '4px' }}>{k.emoji}</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: k.cor }}>
                  {k.valor}{k.sufixo ? <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#9ca3af' }}> {k.sufixo}</span> : ''}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#6b7280', fontWeight: 600, marginTop: '2px' }}>{k.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Abas */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '20px', borderBottom: '2px solid #e5e7eb', paddingBottom: '0' }}>
          {([['cobertura', '📊 Cobertura'], ['leads', `📧 Leads (${leads.length})`]] as [Aba, string][]).map(([id, label]) => (
            <button key={id} onClick={() => setAba(id)}
              style={{ padding: '9px 18px', borderRadius: '8px 8px 0 0', border: 'none', backgroundColor: aba === id ? '#fff' : 'transparent', color: aba === id ? '#7c3aed' : '#6b7280', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer', borderBottom: aba === id ? '2px solid #7c3aed' : '2px solid transparent', marginBottom: '-2px' }}>
              {label}
            </button>
          ))}
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: '60px', color: '#9ca3af' }}>⏳ Carregando...</div>
        )}

        {/* ABA: Cobertura */}
        {!loading && aba === 'cobertura' && (
          <>
            {/* Grid de cobertura por ambiente */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
              {AMBIENTES.map(amb => {
                const totalAmb = totalPorAmbiente(amb);
                const interesse = interessePorAmbiente[amb] || 0;
                return (
                  <div key={amb} style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '1.3rem' }}>{AMBIENTE_EMOJI[amb] || '🏠'}</span>
                      <span style={{ fontSize: '1rem', fontWeight: 800, color: '#111827' }}>{amb}</span>
                      <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#2563eb', backgroundColor: '#eff6ff', padding: '2px 10px', borderRadius: '999px' }}>
                        {totalAmb} produto{totalAmb !== 1 ? 's' : ''}
                      </span>
                      {interesse > 0 && (
                        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#047857', backgroundColor: '#f0fdf4', padding: '2px 10px', borderRadius: '999px' }}>
                          📧 {interesse} interesse{interesse !== 1 ? 's' : ''}
                        </span>
                      )}
                      {totalAmb === 0 && (
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#dc2626', backgroundColor: '#fef2f2', padding: '2px 10px', borderRadius: '999px' }}>
                          ⚠️ Sem produtos
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '8px' }}>
                      {TIPOS_AMBIENTE.map(tipo => {
                        const qtd = mapa[amb]?.[tipo]?.length || 0;
                        const vazio = qtd === 0;
                        return (
                          <div key={tipo} style={{
                            padding: '8px 12px', borderRadius: '8px',
                            border: `1px solid ${vazio ? '#fecaca' : '#d1fae5'}`,
                            backgroundColor: vazio ? '#fef2f2' : '#f0fdf4',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          }}>
                            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: vazio ? '#991b1b' : '#065f46' }}>
                              {TIPO_EMOJI[tipo] || ''} {tipo}
                            </span>
                            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: vazio ? '#dc2626' : '#059669', minWidth: '24px', textAlign: 'right' }}>
                              {vazio ? '—' : qtd}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Lacunas — lista de oportunidades */}
            {lacunas.length > 0 && (
              <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #fecaca', padding: '20px' }}>
                <h2 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#dc2626', margin: '0 0 14px' }}>
                  ⚠️ Lacunas — combinações sem produtos ({lacunas.length})
                </h2>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {lacunas.map(({ ambiente, tipo }) => (
                    <div key={`${ambiente}-${tipo}`} style={{ padding: '5px 12px', borderRadius: '999px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', fontSize: '0.78rem', fontWeight: 600, color: '#991b1b' }}>
                      {AMBIENTE_EMOJI[ambiente]} {ambiente} · {TIPO_EMOJI[tipo]} {tipo}
                    </div>
                  ))}
                </div>
                <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '12px', marginBottom: 0 }}>
                  Dica: busque afiliações em lojas que cubram essas categorias e pinie produtos para esses ambientes no painel de busca.
                </p>
              </div>
            )}
          </>
        )}

        {/* ABA: Leads */}
        {!loading && aba === 'leads' && (
          <>
            {/* Filtro por ambiente */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: '0.78rem', color: '#6b7280', fontWeight: 600 }}>Filtrar por ambiente:</span>
              <button onClick={() => setFiltroAmbienteLead('')}
                style={{ padding: '4px 12px', borderRadius: '999px', border: `2px solid ${filtroAmbienteLead === '' ? '#7c3aed' : '#e5e7eb'}`, backgroundColor: filtroAmbienteLead === '' ? '#7c3aed' : '#fff', color: filtroAmbienteLead === '' ? '#fff' : '#374151', fontWeight: 600, fontSize: '0.78rem', cursor: 'pointer' }}>
                Todos ({leads.length})
              </button>
              {AMBIENTES.filter(a => interessePorAmbiente[a] > 0).map(a => (
                <button key={a} onClick={() => setFiltroAmbienteLead(a === filtroAmbienteLead ? '' : a)}
                  style={{ padding: '4px 12px', borderRadius: '999px', border: `2px solid ${filtroAmbienteLead === a ? '#7c3aed' : '#e5e7eb'}`, backgroundColor: filtroAmbienteLead === a ? '#7c3aed' : '#fff', color: filtroAmbienteLead === a ? '#fff' : '#374151', fontWeight: 600, fontSize: '0.78rem', cursor: 'pointer' }}>
                  {AMBIENTE_EMOJI[a]} {a} ({interessePorAmbiente[a]})
                </button>
              ))}
            </div>

            {leadsFiltrados.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px', color: '#9ca3af' }}>
                Nenhum lead capturado ainda.
              </div>
            ) : (
              <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                      <th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 700, color: '#374151' }}>E-mail</th>
                      <th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 700, color: '#374151' }}>Ambientes de interesse</th>
                      <th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 700, color: '#374151', whiteSpace: 'nowrap' }}>Capturado em</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leadsFiltrados.map((l, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #f3f4f6', backgroundColor: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                        <td style={{ padding: '10px 16px', color: '#111827', fontWeight: 600 }}>{l.email}</td>
                        <td style={{ padding: '10px 16px' }}>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                            {(l.ambientes || []).map(a => (
                              <span key={a} style={{ padding: '2px 8px', borderRadius: '999px', backgroundColor: '#f5f3ff', color: '#7c3aed', fontSize: '0.72rem', fontWeight: 700 }}>
                                {AMBIENTE_EMOJI[a] || '🏠'} {a}
                              </span>
                            ))}
                            {(!l.ambientes || l.ambientes.length === 0) && (
                              <span style={{ color: '#9ca3af', fontSize: '0.75rem' }}>—</span>
                            )}
                          </div>
                        </td>
                        <td style={{ padding: '10px 16px', color: '#6b7280', whiteSpace: 'nowrap' }}>
                          {new Date(l.criadoEm).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div style={{ padding: '10px 16px', backgroundColor: '#f9fafb', borderTop: '1px solid #e5e7eb', fontSize: '0.75rem', color: '#9ca3af' }}>
                  {leadsFiltrados.length} lead{leadsFiltrados.length !== 1 ? 's' : ''} {filtroAmbienteLead ? `em "${filtroAmbienteLead}"` : 'no total'}
                </div>
              </div>
            )}
          </>
        )}

      </div>
    </main>
  );
}

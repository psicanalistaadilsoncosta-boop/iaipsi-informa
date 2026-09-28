'use client';

import { useState, useEffect } from 'react';
import AdminGate from '../../AdminGate';

interface Lead {
  email: string;
  origem: string;
  detalhe: string;
  criadoEm: string | null;
}

const CORES: Record<string, string> = {
  'Ambiente': '#219BF6',
  'Beleza': '#db2777',
  'Momento': '#7c3aed',
  'Vista-se': '#be185d',
};

function PainelLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [filtro, setFiltro] = useState('Todas');
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    fetch('/api/leads')
      .then(r => (r.ok ? r.json() : []))
      .then(d => setLeads(Array.isArray(d) ? d : []))
      .catch(() => setLeads([]))
      .finally(() => setCarregando(false));
  }, []);

  const origens = ['Todas', ...Array.from(new Set(leads.map(l => l.origem)))];
  const visiveis = filtro === 'Todas' ? leads : leads.filter(l => l.origem === filtro);
  const unicos = Array.from(new Set(visiveis.map(l => l.email.toLowerCase())));

  function copiarEmails() {
    navigator.clipboard.writeText(unicos.join(', '));
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  function baixarCSV() {
    const linhas = [
      ['email', 'origem', 'detalhe', 'data'],
      ...visiveis.map(l => [l.email, l.origem, l.detalhe, l.criadoEm || '']),
    ];
    const csv = linhas
      .map(cols => cols.map(c => `"${String(c).replace(/"/g, '""')}"`).join(';'))
      .join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `leads-comlupa-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  }

  return (
    <main style={{ maxWidth: '1060px', margin: '0 auto', padding: '30px 20px', fontFamily: 'system-ui, -apple-system, sans-serif', minHeight: '100vh' }}>
      <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#111827', margin: '0 0 4px' }}>📧 Leads do Seu Universo</h1>
      <p style={{ color: '#6b7280', margin: '0 0 24px', fontSize: '0.9rem' }}>
        E-mails de todas as seções · {leads.length} registros · {new Set(leads.map(l => l.email.toLowerCase())).size} e-mails únicos
      </p>

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '16px' }}>
        {origens.map(o => {
          const ativo = filtro === o;
          const cor = CORES[o] || '#5B3E96';
          const qtd = o === 'Todas' ? leads.length : leads.filter(l => l.origem === o).length;
          return (
            <button
              key={o}
              onClick={() => setFiltro(o)}
              style={{
                padding: '6px 14px', borderRadius: '999px', cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem',
                border: `2px solid ${ativo ? cor : '#e5e7eb'}`,
                backgroundColor: ativo ? cor : '#fff',
                color: ativo ? '#fff' : '#374151',
              }}
            >
              {o} ({qtd})
            </button>
          );
        })}

        <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
          <button onClick={copiarEmails} disabled={!unicos.length}
            style={{ padding: '7px 14px', borderRadius: '8px', border: '1px solid #5B3E96', backgroundColor: copiado ? '#047857' : '#fff', color: copiado ? '#fff' : '#5B3E96', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}>
            {copiado ? '✅ Copiados!' : `Copiar e-mails (${unicos.length})`}
          </button>
          <button onClick={baixarCSV} disabled={!visiveis.length}
            style={{ padding: '7px 14px', borderRadius: '8px', border: 'none', backgroundColor: '#5B3E96', color: '#fff', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}>
            Baixar planilha
          </button>
        </div>
      </div>

      {carregando ? (
        <p style={{ color: '#6b7280' }}>Carregando...</p>
      ) : visiveis.length === 0 ? (
        <p style={{ color: '#6b7280' }}>Nenhum lead ainda.</p>
      ) : (
        <div style={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#f9fafb', textAlign: 'left' }}>
                <th style={{ padding: '10px 14px', color: '#6b7280', fontWeight: 600 }}>Data</th>
                <th style={{ padding: '10px 14px', color: '#6b7280', fontWeight: 600 }}>E-mail</th>
                <th style={{ padding: '10px 14px', color: '#6b7280', fontWeight: 600 }}>Origem</th>
                <th style={{ padding: '10px 14px', color: '#6b7280', fontWeight: 600 }}>Interesse</th>
              </tr>
            </thead>
            <tbody>
              {visiveis.map((l, i) => (
                <tr key={i} style={{ borderTop: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '10px 14px', color: '#6b7280', whiteSpace: 'nowrap' }}>
                    {l.criadoEm ? new Date(l.criadoEm).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' }) : '—'}
                  </td>
                  <td style={{ padding: '10px 14px', color: '#111827', fontWeight: 600 }}>{l.email}</td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{ backgroundColor: CORES[l.origem] || '#5B3E96', color: '#fff', fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: '20px' }}>
                      {l.origem}
                    </span>
                  </td>
                  <td style={{ padding: '10px 14px', color: '#4b5563', maxWidth: '380px' }}>{l.detalhe || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}

export default function LeadsPage() {
  return (
    <AdminGate titulo="Leads do Seu Universo">
      <PainelLeads />
    </AdminGate>
  );
}

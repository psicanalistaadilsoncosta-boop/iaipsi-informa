'use client';

import { useState } from 'react';
import AdminGate from '../../AdminGate';

type Angulo = {
  angulo: string;
  porque: string;
  buscas: string[];
  titulos: string[];
};

const ROXO = '#5B3E96';

function baixarCSV(semente: string, google: string[], youtube: string[]) {
  const esc = (t: string) => `"${t.replace(/"/g, '""')}"`;
  const linhas = ['fonte;busca', ...google.map(b => `Google;${esc(b)}`), ...youtube.map(b => `YouTube;${esc(b)}`)];
  // BOM para o Excel abrir os acentos corretamente
  const blob = new Blob(['﻿' + linhas.join('\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `pesquisas-${semente.replace(/\s+/g, '-').toLowerCase()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function PainelPesquisas() {
  const [semente, setSemente] = useState('');
  const [buscado, setBuscado] = useState('');
  const [google, setGoogle] = useState<string[]>([]);
  const [youtube, setYoutube] = useState<string[]>([]);
  const [aba, setAba] = useState<'google' | 'youtube'>('google');
  const [buscando, setBuscando] = useState(false);
  const [organizando, setOrganizando] = useState(false);
  const [angulos, setAngulos] = useState<Angulo[]>([]);
  const [erro, setErro] = useState('');
  const [copiado, setCopiado] = useState('');

  async function buscar(e: React.FormEvent) {
    e.preventDefault();
    if (!semente.trim()) return;
    setBuscando(true);
    setErro('');
    setAngulos([]);
    try {
      const res = await fetch('/api/pesquisas/sugestoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ semente }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || 'Erro na busca');
      setGoogle(d.google || []);
      setYoutube(d.youtube || []);
      setBuscado(d.semente);
      if (!d.google?.length && !d.youtube?.length) setErro('Nenhuma busca encontrada. Tente um tema mais amplo.');
    } catch (err) {
      setErro(String(err instanceof Error ? err.message : err));
    } finally {
      setBuscando(false);
    }
  }

  async function organizar() {
    setOrganizando(true);
    setErro('');
    try {
      const res = await fetch('/api/pesquisas/organizar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ semente: buscado, google, youtube }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || 'Erro ao organizar');
      setAngulos(d.angulos || []);
    } catch (err) {
      setErro(String(err instanceof Error ? err.message : err));
    } finally {
      setOrganizando(false);
    }
  }

  async function copiar(texto: string, marca: string) {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(marca);
      setTimeout(() => setCopiado(''), 1500);
    } catch {
      /* navegador bloqueou a área de transferência */
    }
  }

  const lista = aba === 'google' ? google : youtube;
  const temResultado = google.length > 0 || youtube.length > 0;

  const botao = (ativo = true): React.CSSProperties => ({
    padding: '9px 16px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: ativo ? ROXO : '#e5e7eb',
    color: ativo ? '#fff' : '#374151',
    fontWeight: 700,
    fontSize: '0.88rem',
    cursor: 'pointer',
  });

  return (
    <main style={{ maxWidth: '980px', margin: '0 auto', padding: '32px 16px', fontFamily: 'system-ui', color: '#111827' }}>
      <h1 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0 0 4px' }}>O que as pessoas estão buscando</h1>
      <p style={{ color: '#6b7280', margin: '0 0 24px', fontSize: '0.92rem' }}>
        Buscas reais do autocompletar do Google e do YouTube, para achar ângulos e títulos do Com a Palavra.
      </p>

      <form onSubmit={buscar} style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
        <input
          value={semente}
          onChange={e => setSemente(e.target.value)}
          placeholder='Ex.: repetição, ansiedade, "por que eu sempre"'
          maxLength={80}
          autoFocus
          style={{ flex: '1 1 280px', padding: '10px 14px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.95rem' }}
        />
        <button type="submit" disabled={buscando} style={botao()}>
          {buscando ? 'Buscando… (uns 15 s)' : 'Buscar'}
        </button>
      </form>

      {erro && <p style={{ color: '#dc2626', fontSize: '0.88rem', margin: '0 0 16px' }}>{erro}</p>}

      {temResultado && (
        <>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '12px' }}>
            <button onClick={() => setAba('google')} style={botao(aba === 'google')}>Google ({google.length})</button>
            <button onClick={() => setAba('youtube')} style={botao(aba === 'youtube')}>YouTube ({youtube.length})</button>
            <span style={{ flex: 1 }} />
            <button onClick={() => copiar(lista.join('\n'), 'lista')} style={botao(false)}>
              {copiado === 'lista' ? 'Copiado ✓' : 'Copiar'}
            </button>
            <button onClick={() => baixarCSV(buscado, google, youtube)} style={botao(false)}>Baixar CSV</button>
            <button onClick={organizar} disabled={organizando} style={botao()}>
              {organizando ? 'Organizando…' : '✨ Organizar com IA'}
            </button>
          </div>

          <div style={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '12px 16px', maxHeight: '340px', overflowY: 'auto', marginBottom: '28px' }}>
            {lista.length === 0 ? (
              <p style={{ color: '#6b7280', fontSize: '0.88rem' }}>Nada nesta aba.</p>
            ) : (
              <ul style={{ margin: 0, paddingLeft: '18px', columns: '2 260px', fontSize: '0.88rem', lineHeight: 1.7 }}>
                {lista.map(b => <li key={b}>{b}</li>)}
              </ul>
            )}
          </div>
        </>
      )}

      {angulos.length > 0 && (
        <section>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 14px' }}>Ângulos para o Com a Palavra</h2>
          <div style={{ display: 'grid', gap: '14px' }}>
            {angulos.map((a, i) => (
              <div key={i} style={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderLeft: `5px solid ${ROXO}`, borderRadius: '12px', padding: '16px 18px' }}>
                <h3 style={{ margin: '0 0 6px', fontSize: '1.05rem', fontWeight: 800 }}>{a.angulo}</h3>
                <p style={{ margin: '0 0 12px', color: '#4b5563', fontSize: '0.9rem' }}>{a.porque}</p>

                <p style={{ margin: '0 0 6px', fontSize: '0.78rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>Buscas que sustentam</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
                  {a.buscas?.map(b => (
                    <span key={b} style={{ backgroundColor: '#f3f0fa', color: ROXO, fontSize: '0.8rem', padding: '3px 10px', borderRadius: '20px' }}>{b}</span>
                  ))}
                </div>

                <p style={{ margin: '0 0 6px', fontSize: '0.78rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>Títulos possíveis</p>
                <ul style={{ margin: 0, paddingLeft: 0, listStyle: 'none' }}>
                  {a.titulos?.map((t, j) => (
                    <li key={j} style={{ display: 'flex', gap: '10px', alignItems: 'center', padding: '4px 0', fontSize: '0.92rem' }}>
                      <span style={{ flex: 1 }}>{t}</span>
                      <button
                        onClick={() => copiar(t, `${i}-${j}`)}
                        style={{ border: '1px solid #d1d5db', background: '#fff', borderRadius: '6px', padding: '2px 8px', fontSize: '0.75rem', cursor: 'pointer' }}
                      >
                        {copiado === `${i}-${j}` ? '✓' : 'Copiar'}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

export default function PesquisasPage() {
  return (
    <AdminGate titulo="Pesquisas do público">
      <PainelPesquisas />
    </AdminGate>
  );
}

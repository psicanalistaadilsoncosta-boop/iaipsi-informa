'use client';

import { useState, useEffect } from 'react';

interface Marca {
  id: string;
  name: string;
  site?: string;
  logo?: string;
}

export default function BrandsPage() {
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('');
  const [copiado, setCopiado] = useState<string | null>(null);
  const [cadastradas, setCadastradas] = useState<string[]>([]); // urls já no KV
  const [cadastrando, setCadastrando] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/lomadee?tipo=brands-categoria')
      .then(r => r.json())
      .then(d => setMarcas(d.data || []))
      .finally(() => setLoading(false));

    fetch('/api/produtos/lojas')
      .then(r => r.json())
      .then(d => {
        if (Array.isArray(d)) setCadastradas(d.map((l: any) => l.url));
      });
  }, []);

  async function handleCadastrar(m: Marca) {
    const dom = dominio(m.site);
    if (!dom) return;
    const url = `https://www.${dom}`;
    setCadastrando(m.id);
    try {
      await fetch('/api/produtos/lojas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipo: 'lomadee', nome: m.name, url }),
      });
      setCadastradas(prev => [...prev, url]);
    } catch { alert('Erro ao cadastrar.'); }
    finally { setCadastrando(null); }
  }
  function copiar(texto: string, chave: string) {
    navigator.clipboard.writeText(texto);
    setCopiado(chave);
    setTimeout(() => setCopiado(null), 1500);
  }

  function dominio(site?: string) {
    if (!site) return '';
    try {
      return new URL(site.startsWith('http') ? site : 'https://' + site)
        .hostname.replace('www.', '');
    } catch {
      return site.replace('www.', '').replace('https://', '').split('/')[0];
    }
  }

  const filtradas = marcas.filter(m => {
    const q = filtro.toLowerCase();
    return !q || m.name?.toLowerCase().includes(q) || dominio(m.site).includes(q);
  });

  return (
    <main style={{ maxWidth: '900px', margin: '0 auto', padding: '30px 20px', fontFamily: 'system-ui, sans-serif', backgroundColor: '#f9fafb', minHeight: '100vh' }}>

      <header style={{ backgroundColor: '#fff', padding: '20px 24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', marginBottom: '20px', borderTop: '5px solid #be185d' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#111827', margin: 0 }}>🏪 Marcas Lomadee</h1>
            <p style={{ color: '#6b7280', fontSize: '0.85rem', margin: '3px 0 0' }}>
              {loading ? 'Carregando...' : `${marcas.length} lojas disponíveis`}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <a href="/produtos/cadastra-lojas" style={{ backgroundColor: '#7c3aed', color: '#fff', padding: '6px 12px', borderRadius: '6px', textDecoration: 'none', fontSize: '0.78rem', fontWeight: 600 }}>🏪 Cadastrar loja</a>
            <a href="/produtos/buscar" style={{ backgroundColor: '#f3f4f6', color: '#374151', padding: '6px 12px', borderRadius: '6px', textDecoration: 'none', fontSize: '0.78rem', fontWeight: 600 }}>📌 Buscar</a>
          </div>
        </div>
      </header>

      <input
        value={filtro}
        onChange={e => setFiltro(e.target.value)}
        placeholder="Filtrar por nome ou domínio..."
        style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.9rem', boxSizing: 'border-box', marginBottom: '16px', backgroundColor: '#fff' }}
        autoFocus
      />

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#9ca3af' }}>⏳ Carregando marcas...</div>
      ) : (
        <>
          <div style={{ fontSize: '0.78rem', color: '#9ca3af', marginBottom: '10px' }}>
            {filtradas.length} {filtradas.length === 1 ? 'loja' : 'lojas'}{filtro ? ` para "${filtro}"` : ''}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {filtradas.map(m => {
              const dom = dominio(m.site);
              return (
                <div key={m.id} style={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  {m.logo && (
  <img src={m.logo} alt={m.name} style={{ width: '32px', height: '32px', objectFit: 'contain', flexShrink: 0 }} />
)}
                  <div style={{ flex: 1, minWidth: '140px' }}>
                    <div style={{ fontWeight: 700, color: '#111827', fontSize: '0.9rem' }}>{m.name}</div>
                    {dom && <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '1px' }}>{dom}</div>}
                  </div>

                                   {/* Domínio — para cadastrar loja */}
                  {dom && (
                    <button
                      onClick={() => copiar(`https://www.${dom}`, `url-${m.id}`)}
                      title="Copiar URL"
                      style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid #e5e7eb', backgroundColor: copiado === `url-${m.id}` ? '#f0fdf4' : '#f9fafb', color: copiado === `url-${m.id}` ? '#047857' : '#374151', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                      {copiado === `url-${m.id}` ? '✅ Copiado' : `🔗 ${dom}`}
                    </button>
                  )}

                  {/* Cadastrar no KV */}
                  {dom && (
                    cadastradas.includes(`https://www.${dom}`) ? (
                      <span style={{ padding: '4px 10px', borderRadius: '6px', backgroundColor: '#f0fdf4', color: '#047857', fontSize: '0.75rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
                        ✅ Cadastrada
                      </span>
                    ) : (
                      <button
                        onClick={() => handleCadastrar(m)}
                        disabled={cadastrando === m.id}
                        style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid #be185d', backgroundColor: '#fff', color: '#be185d', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                        {cadastrando === m.id ? '⏳' : '＋ Cadastrar'}
                      </button>
                    )
                  )}

                  {/* ID — organizationId Lomadee */}
                  <button
                    onClick={() => copiar(m.id, `id-${m.id}`)}
                    title="Copiar ID"
                    style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid #e5e7eb', backgroundColor: copiado === `id-${m.id}` ? '#f0fdf4' : '#f9fafb', color: copiado === `id-${m.id}` ? '#047857' : '#6b7280', fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'monospace' }}>
                    {copiado === `id-${m.id}` ? '✅ Copiado' : `ID: ${m.id}`}
                  </button>
                </div>
              );
            })}
          </div>
        </>
      )}
    </main>
  );
}

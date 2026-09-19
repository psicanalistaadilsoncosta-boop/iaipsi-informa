'use client';

import { useState, useEffect } from 'react';

interface ArtigoViagem {
  id: string;
  slug: string;
  titulo: string;
  destino: string;
  duracao: string;
  imagem: string;
  precoBase: number;
  precoData: string;
  affiliateUrl: string;
  publicado: boolean;
  createdAt: string;
}

export default function GerenciarViagensPage() {
  const [auth, setAuth] = useState(false);
  const [senha, setSenha] = useState('');
  const [artigos, setArtigos] = useState<ArtigoViagem[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetch('/api/editorial/auth/check')
      .then(r => r.json())
      .then(d => { if (d.ok) { setAuth(true); carregar(); } else { setCarregando(false); } });
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch('/api/editorial/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: senha }),
    });
    if (res.ok) { setAuth(true); carregar(); }
    else alert('Senha incorreta');
  }

  async function carregar() {
    setCarregando(true);
    try {
      const res = await fetch('/api/viagens/save');
      const data = await res.json();
      setArtigos(Array.isArray(data) ? data.sort((a: ArtigoViagem, b: ArtigoViagem) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) : []);
    } catch { alert('Erro ao carregar artigos'); }
    finally { setCarregando(false); }
  }

  async function togglePublicado(artigo: ArtigoViagem) {
    await fetch('/api/viagens/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...artigo, publicado: !artigo.publicado }),
    });
    setMsg(`${!artigo.publicado ? '✅ Publicado' : '🚫 Despublicado'}: ${artigo.titulo}`);
    carregar();
  }

  async function handleDeletar(artigo: ArtigoViagem) {
    if (!confirm(`Deletar "${artigo.titulo}"? Esta ação não pode ser desfeita.`)) return;
    await fetch('/api/viagens/save', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: artigo.id }),
    });
    setMsg(`🗑️ Deletado: ${artigo.titulo}`);
    carregar();
  }

  if (!auth) return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9fafb', fontFamily: 'system-ui' }}>
      <div style={{ backgroundColor: '#fff', borderRadius: '14px', padding: '40px', maxWidth: '380px', width: '100%', borderTop: '5px solid #0f766e' }}>
        <h1 style={{ fontSize: '1.3rem', fontWeight: 800, margin: '0 0 24px' }}>Gerenciar Viagens</h1>
        <form onSubmit={handleLogin}>
          <input type="password" placeholder="Senha" value={senha} onChange={e => setSenha(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', marginBottom: '12px', boxSizing: 'border-box' }} autoFocus />
          <button type="submit" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: 'none', backgroundColor: '#0f766e', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
            Entrar
          </button>
        </form>
      </div>
    </main>
  );

  return (
    <main style={{ maxWidth: '1060px', margin: '0 auto', padding: '30px 20px', fontFamily: 'system-ui, sans-serif', backgroundColor: '#f9fafb', minHeight: '100vh' }}>

      <header style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', marginBottom: '24px', borderTop: '6px solid #0f766e', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>🌍 Gerenciar Artigos de Viagem</h1>
            <p style={{ color: '#6b7280', fontSize: '0.88rem', margin: '4px 0 0' }}>
              {artigos.length} artigo(s) · {artigos.filter(a => a.publicado).length} publicado(s)
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <a href="/viagem/criar" style={{ backgroundColor: '#0f766e', color: '#fff', padding: '8px 16px', borderRadius: '8px', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 700 }}>
              + Novo artigo
            </a>
            <a href="/" style={{ backgroundColor: '#f3f4f6', color: '#374151', padding: '7px 14px', borderRadius: '6px', textDecoration: 'none', fontSize: '0.82rem', fontWeight: 600 }}>← Site</a>
          </div>
        </div>
      </header>

      {msg && (
        <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '10px 16px', marginBottom: '16px', fontSize: '0.88rem', color: '#166534', fontWeight: 600 }}>
          {msg}
        </div>
      )}

      {carregando ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#9ca3af' }}>Carregando...</div>
      ) : artigos.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#9ca3af' }}>
          <p style={{ fontSize: '1.1rem' }}>Nenhum artigo ainda.</p>
          <a href="/viagem/criar" style={{ color: '#0f766e', fontWeight: 700, textDecoration: 'none' }}>Criar o primeiro →</a>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {artigos.map(artigo => (
            <div key={artigo.id} style={{ backgroundColor: '#fff', borderRadius: '12px', border: `1px solid ${artigo.publicado ? '#e5e7eb' : '#fef3c7'}`, padding: '16px 20px', display: 'flex', gap: '16px', alignItems: 'center' }}>

              {/* Imagem */}
              {artigo.imagem && (
                <img src={artigo.imagem} alt={artigo.titulo}
                  style={{ width: '72px', height: '56px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0 }} />
              )}

              {/* Dados */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                  <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#111827' }}>{artigo.titulo}</span>
                  <span style={{ fontSize: '0.68rem', padding: '2px 8px', borderRadius: '20px', backgroundColor: artigo.publicado ? '#dcfce7' : '#fef9c3', color: artigo.publicado ? '#166534' : '#854d0e', fontWeight: 700 }}>
                    {artigo.publicado ? '● Publicado' : '○ Rascunho'}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', fontSize: '0.78rem', color: '#6b7280' }}>
                  {artigo.destino && <span>📍 {artigo.destino}</span>}
                  {artigo.duracao && <span>⏱ {artigo.duracao}</span>}
                  {artigo.precoBase > 0 && <span style={{ color: '#0f766e', fontWeight: 700 }}>R$ {artigo.precoBase.toFixed(2).replace('.', ',')}</span>}
                  <span>📅 {new Date(artigo.createdAt).toLocaleDateString('pt-BR')}</span>
                  <a href={`/viagem/${artigo.slug}`} target="_blank" rel="noopener"
                    style={{ color: '#0f766e', textDecoration: 'none', fontWeight: 600 }}>
                    Ver página →
                  </a>
                </div>
              </div>

              {/* Ações */}
              <div style={{ display: 'flex', gap: '8px', flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                <a href={`/viagem/criar?editar=${artigo.id}`}
                  style={{ padding: '6px 14px', borderRadius: '6px', border: '1px solid #d1d5db', backgroundColor: '#fff', color: '#374151', fontSize: '0.82rem', fontWeight: 600, textDecoration: 'none', cursor: 'pointer' }}>
                  ✏️ Editar
                </a>
                <button onClick={() => togglePublicado(artigo)}
                  style={{ padding: '6px 14px', borderRadius: '6px', border: 'none', backgroundColor: artigo.publicado ? '#fef3c7' : '#dcfce7', color: artigo.publicado ? '#92400e' : '#166534', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}>
                  {artigo.publicado ? '🚫 Despublicar' : '✅ Publicar'}
                </button>
                <button onClick={() => handleDeletar(artigo)}
                  style={{ padding: '6px 14px', borderRadius: '6px', border: 'none', backgroundColor: '#fef2f2', color: '#dc2626', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}>
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

    </main>
  );
}

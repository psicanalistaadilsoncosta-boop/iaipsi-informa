'use client';

import { useState, useEffect } from 'react';

interface ArtigoProduto {
  id: string;
  slug: string;
  titulo: string;
  marca: string;
  categoria: string;
  gtin: string;
  imagem: string;
  descricaoCurta: string;
  ofertas: { loja: string; preco: number; link: string }[];
  publicado: boolean;
  createdAt: string;
}

export default function GerenciarArtigosPage() {
  const [auth, setAuth] = useState(false);
  const [senha, setSenha] = useState('');
  const [artigos, setArtigos] = useState<ArtigoProduto[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('');
  const [removendo, setRemovendo] = useState<string | null>(null);

    useEffect(() => {
    fetch('/api/editorial/auth/check')
      .then(r => r.json())
      .then(d => { if (d.ok) setAuth(true); });
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch('/api/editorial/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: senha }),
    });
    if (res.ok) setAuth(true);
    else alert('Senha incorreta');
  }

  async function loadArtigos() {
    setLoading(true);
    try {
      const res = await fetch('/api/produtos-artigos');
      const data = await res.json();
      setArtigos(Array.isArray(data) ? data : []);
    } catch { setArtigos([]); }
    finally { setLoading(false); }
  }

  useEffect(() => { if (auth) loadArtigos(); }, [auth]);

  async function handleRemover(id: string) {
    if (!confirm('Remover este artigo?')) return;
    setRemovendo(id);
    try {
      await fetch('/api/produtos-artigos', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      await loadArtigos();
    } finally { setRemovendo(null); }
  }

  async function handleTogglePublicado(artigo: ArtigoProduto) {
    await fetch('/api/produtos-artigos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...artigo, publicado: !artigo.publicado }),
    });
    await loadArtigos();
  }

  const filtrados = artigos.filter(a =>
    !filtro || a.titulo.toLowerCase().includes(filtro.toLowerCase()) ||
    a.marca.toLowerCase().includes(filtro.toLowerCase()) ||
    a.categoria.toLowerCase().includes(filtro.toLowerCase())
  );

  if (!auth) return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9fafb', fontFamily: 'system-ui' }}>
      <div style={{ backgroundColor: '#fff', borderRadius: '14px', padding: '40px', maxWidth: '380px', width: '100%', borderTop: '5px solid #2563eb' }}>
        <h1 style={{ fontSize: '1.3rem', fontWeight: 800, margin: '0 0 24px' }}>Gerenciar Artigos</h1>
        <form onSubmit={handleLogin}>
          <input type="password" placeholder="Senha" value={senha} onChange={e => setSenha(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', marginBottom: '12px', boxSizing: 'border-box' }} autoFocus />
          <button type="submit" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: 'none', backgroundColor: '#2563eb', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
            Entrar
          </button>
        </form>
      </div>
    </main>
  );

  return (
    <main style={{ maxWidth: '1060px', margin: '0 auto', padding: '30px 20px', fontFamily: 'system-ui, sans-serif', backgroundColor: '#f9fafb', minHeight: '100vh' }}>

      <header style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', marginBottom: '24px', borderTop: '6px solid #2563eb', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>📋 Artigos de Produto</h1>
            <p style={{ color: '#6b7280', fontSize: '0.88rem', margin: '4px 0 0' }}>{artigos.length} artigos cadastrados</p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <a href="/produto/criar" style={{ backgroundColor: '#2563eb', color: '#fff', padding: '8px 18px', borderRadius: '8px', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 700 }}>
              + Criar artigo
            </a>
            <a href="/" style={{ backgroundColor: '#f3f4f6', color: '#374151', padding: '8px 14px', borderRadius: '8px', textDecoration: 'none', fontSize: '0.82rem', fontWeight: 600 }}>← Site</a>
          </div>
        </div>
      </header>

      {/* Filtro */}
      <div style={{ marginBottom: '20px' }}>
        <input value={filtro} onChange={e => setFiltro(e.target.value)}
          placeholder="🔍 Filtrar por nome, marca ou categoria..."
          style={{ width: '100%', padding: '10px 16px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.9rem', boxSizing: 'border-box', backgroundColor: '#fff' }} />
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280' }}>⏳ Carregando...</div>
      ) : filtrados.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280' }}>
          {artigos.length === 0 ? (
            <>
              <p style={{ fontSize: '1.1rem', marginBottom: '16px' }}>Nenhum artigo criado ainda.</p>
              <a href="/produto/criar" style={{ backgroundColor: '#2563eb', color: '#fff', padding: '10px 24px', borderRadius: '8px', textDecoration: 'none', fontWeight: 700 }}>
                + Criar primeiro artigo
              </a>
            </>
          ) : 'Nenhum artigo encontrado para o filtro.'}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {filtrados.map(artigo => {
            const melhorPreco = artigo.ofertas?.length
              ? Math.min(...artigo.ofertas.map(o => o.preco))
              : null;

            return (
              <div key={artigo.id} style={{ backgroundColor: '#fff', borderRadius: '12px', border: `1px solid ${artigo.publicado ? '#e5e7eb' : '#fde68a'}`, padding: '20px', boxShadow: '0 2px 6px rgba(0,0,0,0.04)', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>

                {/* Imagem */}
                <div style={{ width: '80px', height: '80px', flexShrink: 0, backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px' }}>
                  {artigo.imagem ? (
                    <img src={artigo.imagem} alt={artigo.titulo} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                  ) : (
                    <span style={{ fontSize: '2rem' }}>📦</span>
                  )}
                </div>

                {/* Dados */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6b7280' }}>{artigo.marca}</span>
                    <span style={{ fontSize: '0.65rem', color: '#9ca3af', backgroundColor: '#f3f4f6', padding: '2px 8px', borderRadius: '20px' }}>{artigo.categoria}</span>
                    {!artigo.publicado && (
                      <span style={{ fontSize: '0.65rem', color: '#92400e', backgroundColor: '#fef3c7', padding: '2px 8px', borderRadius: '20px', fontWeight: 700 }}>
                        ⚠️ Rascunho
                      </span>
                    )}
                    {artigo.gtin && (
                      <span style={{ fontSize: '0.65rem', color: '#9ca3af' }}>EAN: {artigo.gtin}</span>
                    )}
                  </div>
                  <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#111827', margin: '0 0 4px', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {artigo.titulo}
                  </h2>
                  <p style={{ fontSize: '0.78rem', color: '#6b7280', margin: '0 0 8px', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {artigo.descricaoCurta}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    {melhorPreco && (
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#dc2626' }}>
                        R$ {melhorPreco.toFixed(2).replace('.', ',')}
                      </span>
                    )}
                    {artigo.ofertas?.length > 0 && (
                      <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                        {artigo.ofertas.length} {artigo.ofertas.length === 1 ? 'loja' : 'lojas'}
                      </span>
                    )}
                    <span style={{ fontSize: '0.72rem', color: '#9ca3af' }}>
                      {new Date(artigo.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>

                {/* Ações */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flexShrink: 0 }}>
                                   <a href={`/produto/${artigo.slug}`} target="_blank"
                    style={{ padding: '6px 14px', borderRadius: '6px', border: '1px solid #e5e7eb', backgroundColor: '#f9fafb', color: '#374151', fontWeight: 600, fontSize: '0.78rem', textDecoration: 'none', textAlign: 'center' }}>
                    👁 Ver
                  </a>
                  <a href={`/produto/criar?editar=${artigo.id}`}
                    style={{ padding: '6px 14px', borderRadius: '6px', border: '1px solid #bfdbfe', backgroundColor: '#eff6ff', color: '#2563eb', fontWeight: 600, fontSize: '0.78rem', textDecoration: 'none', textAlign: 'center' }}>
                    ✏️ Editar
                  </a>
                  <button onClick={() => handleTogglePublicado(artigo)}
                    style={{ padding: '6px 14px', borderRadius: '6px', border: 'none', backgroundColor: artigo.publicado ? '#fef3c7' : '#d1fae5', color: artigo.publicado ? '#92400e' : '#047857', fontWeight: 600, fontSize: '0.78rem', cursor: 'pointer' }}>
                    {artigo.publicado ? '📤 Despublicar' : '✅ Publicar'}
                  </button>
                  <button onClick={() => handleRemover(artigo.id)} disabled={removendo === artigo.id}
                    style={{ padding: '6px 14px', borderRadius: '6px', border: '1px solid #fca5a5', backgroundColor: '#fff', color: '#dc2626', fontWeight: 600, fontSize: '0.78rem', cursor: 'pointer' }}>
                    {removendo === artigo.id ? '⏳' : '🗑 Remover'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </main>
  );
}

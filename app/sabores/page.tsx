'use client';

import { useState, useEffect } from 'react';

interface SaboresItem {
  id: string;
  prato: string;
  destino: string;
  intro: string;
  cta: string;
  content: string;
  imageUrl: string | null;
  imageQuery: string;
  publishedAt: string;
}

function renderContent(text: string) {
  return text.split('\n').map((line, i) => {
    const parsed = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    if (!parsed.trim()) return <br key={i} />;
    return <p key={i} style={{ margin: '0 0 8px', lineHeight: 1.7 }} dangerouslySetInnerHTML={{ __html: parsed }} />;
  });
}

function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/editorial/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (res.ok) onLogin();
      else setError('Senha incorreta.');
    } catch {
      setError('Erro ao verificar senha.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9fafb', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ backgroundColor: '#fff', borderRadius: '14px', padding: '40px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', width: '100%', maxWidth: '380px', borderTop: '5px solid #b45309' }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#111827', margin: '0 0 4px' }}>Sabores & Destinos</h1>
        <p style={{ color: '#6b7280', fontSize: '0.9rem', margin: '0 0 28px' }}>Painel de criação — Adilson Costa</p>
        <form onSubmit={handleSubmit}>
          <input type="password" placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)}
            style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.95rem', marginBottom: '12px', boxSizing: 'border-box' }} autoFocus />
          {error && <p style={{ color: '#dc2626', fontSize: '0.82rem', margin: '0 0 10px' }}>{error}</p>}
          <button type="submit" disabled={loading} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: 'none', backgroundColor: '#b45309', color: '#fff', fontWeight: 700, fontSize: '0.95rem', cursor: loading ? 'wait' : 'pointer' }}>
            {loading ? 'Verificando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </main>
  );
}

export default function SaboresPage() {
  const [auth, setAuth] = useState<boolean | null>(null);
  const [published, setPublished] = useState<SaboresItem[]>([]);
  const [prato, setPrato] = useState('');
  const [destino, setDestino] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'criar' | 'publicados'>('criar');
  const [editingImage, setEditingImage] = useState<string | null>(null);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [suggesting, setSuggesting] = useState(false);
  const [sugestaoIA, setSugestaoIA] = useState<any>(null);
  const [dificuldade, setDificuldade] = useState('');

  useEffect(() => {
    fetch('/api/editorial/auth/check').then(r => r.json()).then(d => setAuth(d.ok)).catch(() => setAuth(false));
  }, []);

  useEffect(() => { if (auth) loadPublished(); }, [auth]);

  async function loadPublished() {
    try {
      const res = await fetch('/sabores.json');
      setPublished(await res.json());
    } catch { setPublished([]); }
  }
const SUGESTOES = [
  { prato: 'Bouillabaisse', destino: 'Marselha, França', dificuldade: '🔴 Elaborado' },
  { prato: 'Cacio e Pepe', destino: 'Roma, Itália', dificuldade: '🟢 Simples' },
  { prato: 'Moqueca de Camarão', destino: 'Salvador, Bahia', dificuldade: '🟡 Médio' },
  { prato: 'Ramen Tonkotsu', destino: 'Fukuoka, Japão', dificuldade: '🔴 Elaborado' },
  { prato: 'Ceviche', destino: 'Lima, Peru', dificuldade: '🟢 Simples' },
  { prato: 'Tagine de Cordeiro', destino: 'Marrakech, Marrocos', dificuldade: '🟡 Médio' },
  { prato: 'Pad Thai', destino: 'Bangkok, Tailândia', dificuldade: '🟡 Médio' },
  { prato: 'Paella Valenciana', destino: 'Valência, Espanha', dificuldade: '🔴 Elaborado' },
  { prato: 'Pierogi', destino: 'Cracóvia, Polônia', dificuldade: '🟡 Médio' },
  { prato: 'Shakshuka', destino: 'Tel Aviv, Israel', dificuldade: '🟢 Simples' },
  { prato: 'Feijoada', destino: 'Rio de Janeiro, Brasil', dificuldade: '🟡 Médio' },
  { prato: 'Croissant au Beurre', destino: 'Paris, França', dificuldade: '🔴 Elaborado' },
  { prato: 'Pho Bo', destino: 'Hanói, Vietnã', dificuldade: '🟡 Médio' },
  { prato: 'Moussaka', destino: 'Atenas, Grécia', dificuldade: '🟡 Médio' },
  { prato: 'Empanadas', destino: 'Buenos Aires, Argentina', dificuldade: '🟢 Simples' },
  { prato: 'Dim Sum', destino: 'Hong Kong', dificuldade: '🔴 Elaborado' },
  { prato: 'Bacalhau à Brás', destino: 'Lisboa, Portugal', dificuldade: '🟢 Simples' },
  { prato: 'Curry de Frango', destino: 'Mumbai, Índia', dificuldade: '🟡 Médio' },
];

  async function handleSuggest() {
    setSuggesting(true);
    setSugestaoIA(null);
    try {
      const usados = published.map(p => p.prato);
      const res = await fetch('/api/sabores/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usados }),
      });
      const data = await res.json();
      setSugestaoIA(data);
    } catch {
      alert('Erro ao buscar sugestão.');
    } finally {
      setSuggesting(false);
    }
  }

  function aplicarSugestao(s: any) {
    setPrato(s.prato);
    setDestino(s.destino);
    setDificuldade(s.dificuldade);
    setSugestaoIA(null);
  }



  async function handleGenerate() {
    if (!prato || !destino) return;
    setGenerating(true);
    setGenerated(null);
    try {
      const res = await fetch('/api/sabores/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prato, destino, dificuldade }),
      });
      const data = await res.json();
      setGenerated(data);
    } catch {
      alert('Erro ao gerar post.');
    } finally {
      setGenerating(false);
    }
  }

   async function handleSave() {
    if (!generated) return;
    setSaving(true);
    try {
      // Gera receita antes de salvar
      let recipe = null;
      try {
        const recipeRes = await fetch('/api/sabores/recipe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prato: generated.prato, destino: generated.destino }),
        });
        recipe = await recipeRes.json();
      } catch {
        recipe = null;
      }

      await fetch('/api/sabores/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...generated, recipe }),
      });
      await loadPublished();
      setGenerated(null);
      setPrato('');
      setDestino('');
      setActiveTab('publicados');
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdateImage(id: string) {
    await fetch('/api/sabores/save', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, imageUrl: newImageUrl }),
    });
    setEditingImage(null);
    setNewImageUrl('');
    await loadPublished();
  }

  async function handleDelete(id: string) {
    if (!confirm('Remover este post?')) return;
    await fetch('/api/sabores/save', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    await loadPublished();
  }

  if (auth === null) return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9fafb' }}>
      <p style={{ color: '#9ca3af', fontFamily: 'system-ui' }}>Verificando acesso...</p>
    </main>
  );

  if (!auth) return <LoginScreen onLogin={() => setAuth(true)} />;

  return (
    <main style={{ maxWidth: '900px', margin: '0 auto', padding: '30px 20px', fontFamily: 'system-ui, sans-serif', backgroundColor: '#f9fafb', minHeight: '100vh' }}>

      <header style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', marginBottom: '24px', borderTop: '6px solid #b45309' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontSize: '1.8rem', color: '#111827', margin: 0, fontWeight: 800 }}>Sabores & Destinos</h1>
            <p style={{ color: '#6b7280', fontSize: '0.95rem', margin: '4px 0 0' }}>Painel de criação — Adilson Costa</p>
          </div>
          <a href="/" style={{ backgroundColor: '#f3f4f6', color: '#374151', padding: '8px 16px', borderRadius: '8px', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600 }}>← Voltar ao site</a>
        </div>
      </header>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        {(['criar', 'publicados'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', backgroundColor: activeTab === tab ? '#b45309' : '#fff', color: activeTab === tab ? '#fff' : '#374151', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
            {tab === 'criar' ? '✨ Criar post' : `📋 Publicados (${published.length})`}
          </button>
        ))}
      </div>

      {/* Tab: Criar */}
      {activeTab === 'criar' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#111827', margin: '0 0 16px' }}>Novo post</h2>

            {/* Sugestões */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>
                Sugestões — clique para preencher
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {SUGESTOES.map((s, i) => (
                  <button key={i} onClick={() => { setPrato(s.prato); setDestino(s.destino); }}
                    style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #e5e7eb', backgroundColor: prato === s.prato ? '#b45309' : '#fff', color: prato === s.prato ? '#fff' : '#374151', fontSize: '0.8rem', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.1s' }}>
                    <span>{s.dificuldade}</span>
                    <span>{s.prato}</span>
                    <span style={{ color: prato === s.prato ? '#fde68a' : '#9ca3af', fontSize: '0.72rem' }}>{s.destino.split(',')[1]?.trim()}</span>
                  </button>
                ))}
              </div>
                            <div style={{ marginTop: '8px', fontSize: '0.72rem', color: '#9ca3af' }}>
                🟢 Simples · 🟡 Médio · 🔴 Elaborado
              </div>
            </div>

            {/* Sugestão da IA */}
            <div style={{ marginBottom: '20px' }}>
              <button onClick={handleSuggest} disabled={suggesting} style={{ padding: '8px 18px', borderRadius: '8px', border: '1px dashed #b45309', backgroundColor: 'transparent', color: '#b45309', fontWeight: 600, fontSize: '0.85rem', cursor: suggesting ? 'wait' : 'pointer' }}>
                {suggesting ? '⏳ Buscando...' : '🎲 Surpreenda-me — sugestão da IA'}
              </button>

              {sugestaoIA && (
                <div style={{ marginTop: '12px', backgroundColor: '#fef3c7', border: '1px solid #fbbf24', borderRadius: '10px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <div style={{ fontWeight: 700, color: '#111827', fontSize: '0.95rem' }}>
                      {sugestaoIA.prato} · {sugestaoIA.destino}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '4px' }}>
                      {sugestaoIA.dificuldade === 'Simples' ? '🟢' : sugestaoIA.dificuldade === 'Médio' ? '🟡' : '🔴'} {sugestaoIA.dificuldade} · {sugestaoIA.porque}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => aplicarSugestao(sugestaoIA)} style={{ padding: '7px 14px', borderRadius: '7px', border: 'none', backgroundColor: '#b45309', color: '#fff', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer' }}>
                      Usar esta →
                    </button>
                    <button onClick={handleSuggest} disabled={suggesting} style={{ padding: '7px 14px', borderRadius: '7px', border: '1px solid #e5e7eb', backgroundColor: '#fff', color: '#374151', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer' }}>
                      Outra
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <label style={{ fontSize: '0.78rem', color: '#6b7280', fontWeight: 600, display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Prato</label>
                <input value={prato} onChange={e => setPrato(e.target.value)} placeholder="ex: Bouillabaisse" style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.95rem', boxSizing: 'border-box' }} />
              </div>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <label style={{ fontSize: '0.78rem', color: '#6b7280', fontWeight: 600, display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Destino</label>
                <input value={destino} onChange={e => setDestino(e.target.value)} placeholder="ex: Marselha, França" style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.95rem', boxSizing: 'border-box' }} />
              </div>
            </div>
            <button onClick={handleGenerate} disabled={generating || !prato || !destino} style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', backgroundColor: '#b45309', color: '#fff', fontWeight: 700, fontSize: '0.9rem', cursor: generating ? 'wait' : 'pointer', opacity: generating || !prato || !destino ? 0.7 : 1 }}>
              {generating ? '⏳ Gerando...' : '✨ Gerar post'}
            </button>
          </div>

          {/* Preview do gerado */}
          {generated && (
            <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>

              {/* Imagem */}
              <div style={{ position: 'relative' }}>
                {generated.imageUrl ? (
                  <img src={generated.imageUrl} alt={generated.prato} style={{ width: '100%', height: '280px', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '280px', backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: '0.9rem' }}>
                    Sem imagem — cole uma URL abaixo
                  </div>
                )}
                {/* Botão trocar imagem */}
                <button onClick={() => { setEditingImage('new'); setNewImageUrl(generated.imageUrl || ''); }}
                  style={{ position: 'absolute', top: '12px', right: '12px', backgroundColor: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: '6px', padding: '6px 12px', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}>
                  🖼 Trocar imagem
                </button>
              </div>

              {/* Trocar imagem inline */}
              {editingImage === 'new' && (
                <div style={{ padding: '16px 24px', backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb', display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <input value={newImageUrl} onChange={e => setNewImageUrl(e.target.value)} placeholder="Cole a URL da nova imagem" style={{ flex: 1, minWidth: '200px', padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '0.85rem', boxSizing: 'border-box' }} />
                  <button onClick={() => { setGenerated({ ...generated, imageUrl: newImageUrl }); setEditingImage(null); }}
                    style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', backgroundColor: '#b45309', color: '#fff', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>
                    Aplicar
                  </button>
                  <button onClick={() => setEditingImage(null)} style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #e5e7eb', backgroundColor: '#fff', color: '#374151', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>
                    Cancelar
                  </button>
                </div>
              )}

              <div style={{ padding: '28px' }}>
                <div style={{ fontSize: '0.72rem', color: '#b45309', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px' }}>
                  Sabores & Destinos
                </div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#111827', margin: '0 0 8px' }}>
                  {generated.prato} <span style={{ color: '#9ca3af', fontWeight: 400 }}>·</span> {generated.destino}
                </h2>
                <p style={{ color: '#6b7280', fontSize: '0.95rem', margin: '0 0 20px', fontStyle: 'italic' }}>{generated.intro}</p>
                <div style={{ fontSize: '0.9rem', color: '#374151', marginBottom: '24px' }}>
                  {renderContent(generated.content)}
                </div>
                <div style={{ display: 'inline-block', backgroundColor: '#b45309', color: '#fff', padding: '10px 22px', borderRadius: '8px', fontWeight: 700, fontSize: '0.9rem' }}>
                  {generated.cta}
                </div>

                {/* Ações */}
                <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #f3f4f6', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button onClick={handleGenerate} disabled={generating} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', backgroundColor: '#f3f4f6', color: '#374151', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>
                    🔄 Regenerar
                  </button>
                  <button onClick={handleSave} disabled={saving} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', backgroundColor: '#b45309', color: '#fff', fontWeight: 600, fontSize: '0.85rem', cursor: saving ? 'wait' : 'pointer' }}>
                    {saving ? '💾 Salvando...' : '✅ Publicar'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab: Publicados */}
      {activeTab === 'publicados' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {published.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>Nenhum post publicado ainda.</div>
          ) : (
            published.map(item => (
              <div key={item.id} style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                <div style={{ display: 'flex', gap: '0', flexDirection: 'column' }}>

                  {/* Imagem + botão trocar */}
                  <div style={{ position: 'relative' }}>
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.prato} style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '120px', backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: '0.85rem' }}>
                        Sem imagem
                      </div>
                    )}
                    <button onClick={() => { setEditingImage(item.id); setNewImageUrl(item.imageUrl || ''); }}
                      style={{ position: 'absolute', top: '8px', right: '8px', backgroundColor: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: '6px', padding: '5px 10px', fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer' }}>
                      🖼 Trocar imagem
                    </button>
                  </div>

                  {/* Trocar imagem publicado */}
                  {editingImage === item.id && (
                    <div style={{ padding: '12px 16px', backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb', display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                      <input value={newImageUrl} onChange={e => setNewImageUrl(e.target.value)} placeholder="Cole a URL da nova imagem" style={{ flex: 1, minWidth: '200px', padding: '7px 12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '0.82rem', boxSizing: 'border-box' }} />
                      <button onClick={() => handleUpdateImage(item.id)} style={{ padding: '7px 14px', borderRadius: '6px', border: 'none', backgroundColor: '#b45309', color: '#fff', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer' }}>Aplicar</button>
                      <button onClick={() => setEditingImage(null)} style={{ padding: '7px 14px', borderRadius: '6px', border: '1px solid #e5e7eb', backgroundColor: '#fff', color: '#374151', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer' }}>Cancelar</button>
                    </div>
                  )}

                  <div style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap' }}>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>{item.prato} · {item.destino}</h3>
                        <p style={{ fontSize: '0.82rem', color: '#6b7280', margin: '0 0 8px', fontStyle: 'italic' }}>{item.intro}</p>
                        <small style={{ color: '#9ca3af', fontSize: '0.75rem' }}>
                          {new Date(item.publishedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                        </small>
                      </div>
                      <button onClick={() => handleDelete(item.id)} style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #fca5a5', backgroundColor: '#fff', color: '#dc2626', fontWeight: 600, fontSize: '0.78rem', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                        🗑 Remover
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </main>
  );
}
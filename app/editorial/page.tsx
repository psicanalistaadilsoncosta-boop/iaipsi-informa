'use client';

import { useState, useEffect } from 'react';

interface NewsItem {
  title: string;
  link: string;
  snippet: string;
  category: string;
}

interface EditorialItem {
  id: string;
  title: string;
  analysis: string;
  link: string;
  category?: string;
  publishedAt: string;
  author: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  'Política': '#1e3a8a', 'Economia': '#047857', 'Esportes': '#ea580c',
  'Saúde Mental': '#7c3aed', 'Saúde & Ciência': '#0284c7', 'Psicanálise': '#be185d',
  'Tecnologia & IA': '#0f766e', 'Educação & Carreira': '#b45309',
  'Liderança & Gestão': '#7c2d12', 'Mundo': '#374151',
};

function renderAnalysis(text: string) {
  return text.split('\n').map((line, i) => {
    const parsed = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    if (!parsed.trim()) return <br key={i} />;
    return <p key={i} style={{ margin: '0 0 8px', lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: parsed }} />;
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
      <div style={{ backgroundColor: '#fff', borderRadius: '14px', padding: '40px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', width: '100%', maxWidth: '380px', borderTop: '5px solid #be185d' }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#111827', margin: '0 0 4px' }}>Painel Editorial</h1>
        <p style={{ color: '#6b7280', fontSize: '0.9rem', margin: '0 0 28px' }}>Acesso restrito — Adilson Costa</p>
        <form onSubmit={handleSubmit}>
          <input type="password" placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)}
            style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.95rem', marginBottom: '12px', boxSizing: 'border-box' }} autoFocus />
          {error && <p style={{ color: '#dc2626', fontSize: '0.82rem', margin: '0 0 10px' }}>{error}</p>}
          <button type="submit" disabled={loading} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: 'none', backgroundColor: '#be185d', color: '#fff', fontWeight: 700, fontSize: '0.95rem', cursor: loading ? 'wait' : 'pointer' }}>
            {loading ? 'Verificando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </main>
  );
}

export default function EditorialPage() {
  const [auth, setAuth] = useState<boolean | null>(null);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [published, setPublished] = useState<EditorialItem[]>([]);
  const [loadingNews, setLoadingNews] = useState(true);
  const [analyzing, setAnalyzing] = useState<string | null>(null);
  const [analyses, setAnalyses] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'rascunhos' | 'publicados'>('rascunhos');
  const [activeCategory, setActiveCategory] = useState<string>('Todas');

  useEffect(() => {
    fetch('/api/editorial/auth/check').then(r => r.json()).then(d => setAuth(d.ok)).catch(() => setAuth(false));
  }, []);

  useEffect(() => {
    if (auth) { loadNews(); loadPublished(); }
  }, [auth]);

  async function loadNews() {
    setLoadingNews(true);
    try {
      const res = await fetch('/api/editorial/news');
      const data = await res.json();
      setNews(data.items || []);
    } catch {
      setNews([]);
    } finally {
      setLoadingNews(false);
    }
  }

  async function loadPublished() {
    try {
      const res = await fetch('/editorial.json');
      const data = await res.json();
      setPublished(data);
    } catch {
      setPublished([]);
    }
  }

  async function handleAnalyze(item: NewsItem) {
    setAnalyzing(item.link);
    try {
      const res = await fetch('/api/editorial/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: item.title, snippet: item.snippet, link: item.link }),
      });
      const data = await res.json();
      setAnalyses(prev => ({ ...prev, [item.link]: data.analysis || 'Erro ao gerar análise.' }));
    } catch {
      setAnalyses(prev => ({ ...prev, [item.link]: 'Erro ao gerar análise.' }));
    } finally {
      setAnalyzing(null);
    }
  }

  async function handleSave(item: NewsItem) {
    const analysis = analyses[item.link];
    if (!analysis) return;
    setSaving(item.link);
    try {
      await fetch('/api/editorial/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: item.title, analysis, link: item.link, category: item.category }),
      });
      await loadPublished();
      setActiveTab('publicados');
    } finally {
      setSaving(null);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Remover esta análise?')) return;
    await fetch('/api/editorial/save', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    await loadPublished();
  }

  const color = (cat: string) => CATEGORY_COLORS[cat] || '#2563eb';
  const filteredNews = activeCategory === 'Todas' ? news : news.filter(n => n.category === activeCategory);
  const newsCategories = ['Todas', ...Array.from(new Set(news.map(n => n.category)))];

  if (auth === null) return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9fafb' }}>
      <p style={{ color: '#9ca3af', fontFamily: 'system-ui' }}>Verificando acesso...</p>
    </main>
  );

  if (!auth) return <LoginScreen onLogin={() => setAuth(true)} />;

  return (
    <main style={{ maxWidth: '900px', margin: '0 auto', padding: '30px 20px', fontFamily: 'system-ui, sans-serif', backgroundColor: '#f9fafb', minHeight: '100vh' }}>

      <header style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', marginBottom: '24px', borderTop: '6px solid #be185d' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontSize: '1.8rem', color: '#111827', margin: 0, fontWeight: 800 }}>Painel Editorial</h1>
            <p style={{ color: '#6b7280', fontSize: '0.95rem', margin: '4px 0 0' }}>Análises assinadas por Adilson Costa</p>
          </div>
          <a href="/" style={{ backgroundColor: '#f3f4f6', color: '#374151', padding: '8px 16px', borderRadius: '8px', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600 }}>
            ← Voltar ao site
          </a>
        </div>
      </header>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        {(['rascunhos', 'publicados'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', backgroundColor: activeTab === tab ? '#be185d' : '#fff', color: activeTab === tab ? '#fff' : '#374151', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
            {tab === 'rascunhos' ? `📰 Notícias (${news.length})` : `✅ Publicados (${published.length})`}
          </button>
        ))}
        <button onClick={loadNews} style={{ marginLeft: 'auto', padding: '8px 16px', borderRadius: '8px', border: '1px solid #e5e7eb', backgroundColor: '#fff', color: '#374151', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>
          🔄 Atualizar
        </button>
      </div>

      {activeTab === 'rascunhos' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {!loadingNews && news.length > 0 && (
            <nav style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
              {newsCategories.map(cat => {
                const isActive = activeCategory === cat;
                const catColor = CATEGORY_COLORS[cat] || '#2563eb';
                return (
                  <button key={cat} onClick={() => setActiveCategory(cat)} style={{ padding: '6px 14px', borderRadius: '999px', border: `2px solid ${isActive ? catColor : '#e5e7eb'}`, backgroundColor: isActive ? catColor : '#fff', color: isActive ? '#fff' : '#374151', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.15s' }}>
                    {cat}
                  </button>
                );
              })}
            </nav>
          )}

          {loadingNews ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>⏳ Carregando notícias...</div>
          ) : filteredNews.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>Nenhuma notícia encontrada.</div>
          ) : (
            filteredNews.map((item) => {
              const hasAnalysis = !!analyses[item.link];
              const isAnalyzing = analyzing === item.link;
              const isSaving = saving === item.link;

              return (
                <div key={item.link} style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                  <div style={{ marginBottom: '8px' }}>
                    <span style={{ backgroundColor: color(item.category), color: '#fff', fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {item.category}
                    </span>
                  </div>
                  <h2 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 6px', color: '#111827', lineHeight: 1.4 }}>{item.title}</h2>
                  <p style={{ fontSize: '0.85rem', color: '#6b7280', margin: '0 0 10px', lineHeight: 1.5 }}>{item.snippet}</p>
                  <a href={item.link} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.8rem', color: color(item.category), fontWeight: 600, textDecoration: 'none' }}>
                    Ver notícia original ↗
                  </a>

                  {hasAnalysis && (
                    <div style={{ marginTop: '16px' }}>
                      <div style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 600, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Rascunho — edite antes de publicar
                      </div>
                      <textarea
                        value={analyses[item.link]}
                        onChange={e => setAnalyses(prev => ({ ...prev, [item.link]: e.target.value }))}
                        style={{ width: '100%', minHeight: '220px', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.875rem', lineHeight: 1.6, color: '#374151', fontFamily: 'system-ui, sans-serif', resize: 'vertical', boxSizing: 'border-box' }}
                      />
                      <div style={{ marginTop: '12px', padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '0.875rem', color: '#374151' }}>
                        <div style={{ fontSize: '0.72rem', color: '#9ca3af', fontWeight: 600, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Preview</div>
                        {renderAnalysis(analyses[item.link])}
                      </div>
                    </div>
                  )}

                  <div style={{ marginTop: '14px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button onClick={() => handleAnalyze(item)} disabled={isAnalyzing} style={{ padding: '7px 16px', borderRadius: '8px', border: 'none', backgroundColor: '#f3f4f6', color: '#374151', fontWeight: 600, fontSize: '0.85rem', cursor: isAnalyzing ? 'wait' : 'pointer', opacity: isAnalyzing ? 0.7 : 1 }}>
                      {isAnalyzing ? '⏳ Gerando...' : hasAnalysis ? '🔄 Regenerar' : '✨ Gerar análise'}
                    </button>
                    {hasAnalysis && (
                      <button onClick={() => handleSave(item)} disabled={isSaving} style={{ padding: '7px 16px', borderRadius: '8px', border: 'none', backgroundColor: '#be185d', color: '#fff', fontWeight: 600, fontSize: '0.85rem', cursor: isSaving ? 'wait' : 'pointer', opacity: isSaving ? 0.7 : 1 }}>
                        {isSaving ? '💾 Salvando...' : '✅ Aprovar e publicar'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {activeTab === 'publicados' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {published.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>Nenhuma análise publicada ainda.</div>
          ) : (
            published.map((item) => (
              <div key={item.id} style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                      {item.category && (
                        <span style={{ backgroundColor: color(item.category), color: '#fff', fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          {item.category}
                        </span>
                      )}
                      <small style={{ color: '#9ca3af', fontSize: '0.78rem' }}>
                        {new Date(item.publishedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })} · {item.author}
                      </small>
                    </div>
                    <h2 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 12px', color: '#111827', lineHeight: 1.4 }}>{item.title}</h2>
                    <div style={{ fontSize: '0.875rem', color: '#4b5563' }}>
                      {renderAnalysis(item.analysis)}
                    </div>
                    <a href={item.link} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', marginTop: '12px', fontSize: '0.8rem', color: color(item.category || ''), fontWeight: 600, textDecoration: 'none' }}>
                      Ver notícia original ↗
                    </a>
                  </div>
                  <button onClick={() => handleDelete(item.id)} style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #fca5a5', backgroundColor: '#fff', color: '#dc2626', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                    🗑 Remover
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

    </main>
  );
}

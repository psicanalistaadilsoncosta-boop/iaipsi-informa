'use client';

import { useState, useEffect } from 'react';

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface Passeio {
  product_code: string;
  titulo: string;
  descricao: string;
  duracao: string;
  destaques: string[];
  precoBase: number;
  moeda: string;
  imagem: string;
  gallery: string[];
  affiliate_url: string;
  destination_code: string;
  source: 'viator';
}

interface PasseioPinado extends Passeio {
  id: string;           // mesmo que product_code — compatível com o padrão do KV
  slug: string;
  pinedAt: string;
  destinos: string[];   // 'viagens-selecionadas' | 'viagem-destaque' | 'viagens'
  precoData: string;    // "set/2026"
  descricaoCurta?: string;
  conteudo?: string;    // artigo gerado
  publicado?: boolean;
}

// ─── Destinos (equivalente às seções de produto) ──────────────────────────────

const DESTINOS_VIAGEM = [
  { id: 'viagens-selecionadas', label: '⭐ Viagens Selecionadas', cor: '#0f766e' },
  { id: 'viagem-destaque',      label: '🌍 Destaque do Dia',     cor: '#0369a1' },
  { id: 'viagens',              label: '📰 Entre Notícias',      cor: '#7c3aed' },
];

// ─── Destinos Viator populares ─────────────────────────────────────────────────

const DESTINOS_SUGERIDOS = [
  { code: '732', label: '🇵🇹 Lisboa' },
  { code: '737', label: '🇵🇹 Porto' },
  { code: '562', label: '🇪🇸 Barcelona' },
  { code: '687', label: '🇮🇹 Roma' },
  { code: '546', label: '🇫🇷 Paris' },
  { code: '684', label: '🇯🇵 Tóquio' },
  { code: '684', label: '🇧🇷 Rio de Janeiro' },
  { code: '946', label: '🇦🇷 Buenos Aires' },
];

// ─── Login ────────────────────────────────────────────────────────────────────

function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/editorial/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (res.ok) onLogin();
      else setError('Senha incorreta.');
    } catch { setError('Erro.'); }
    finally { setLoading(false); }
  }

  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0fdfa', fontFamily: 'system-ui' }}>
      <div style={{ backgroundColor: '#fff', borderRadius: '14px', padding: '40px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', width: '100%', maxWidth: '380px', borderTop: '5px solid #0f766e' }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#111827', margin: '0 0 4px' }}>Curadoria de Viagens</h1>
        <p style={{ color: '#6b7280', fontSize: '0.9rem', margin: '0 0 28px' }}>Painel de gestão</p>
        <form onSubmit={handleSubmit}>
          <input type="password" placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)}
            style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.95rem', marginBottom: '12px', boxSizing: 'border-box' }} autoFocus />
          {error && <p style={{ color: '#dc2626', fontSize: '0.82rem', margin: '0 0 10px' }}>{error}</p>}
          <button type="submit" disabled={loading}
            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: 'none', backgroundColor: '#0f766e', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
            {loading ? 'Verificando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </main>
  );
}

// ─── Modal de destinos ────────────────────────────────────────────────────────

function ModalDestinos({ passeio, onConfirm, onCancel }: {
  passeio: Passeio;
  onConfirm: (destinos: string[]) => void;
  onCancel: () => void;
}) {
  const [destinos, setDestinos] = useState<string[]>(['viagens-selecionadas']);

  function toggle(id: string) {
    setDestinos(prev => prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]);
  }

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
      <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '28px', maxWidth: '420px', width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#111827', margin: '0 0 6px' }}>Onde publicar?</h2>
        <p style={{ fontSize: '0.82rem', color: '#6b7280', margin: '0 0 20px', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {passeio.titulo}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
          {DESTINOS_VIAGEM.map(d => (
            <label key={d.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '8px', border: `2px solid ${destinos.includes(d.id) ? d.cor : '#e5e7eb'}`, backgroundColor: destinos.includes(d.id) ? `${d.cor}15` : '#fff', cursor: 'pointer' }}>
              <input type="checkbox" checked={destinos.includes(d.id)} onChange={() => toggle(d.id)}
                style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: d.cor }} />
              <span style={{ fontWeight: 600, color: destinos.includes(d.id) ? d.cor : '#374151', fontSize: '0.9rem' }}>{d.label}</span>
            </label>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={onCancel}
            style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #e5e7eb', backgroundColor: '#fff', color: '#374151', fontWeight: 600, cursor: 'pointer' }}>
            Cancelar
          </button>
          <button onClick={() => onConfirm(destinos)} disabled={destinos.length === 0}
            style={{ flex: 2, padding: '10px', borderRadius: '8px', border: 'none', backgroundColor: '#0f766e', color: '#fff', fontWeight: 700, cursor: destinos.length === 0 ? 'not-allowed' : 'pointer', opacity: destinos.length === 0 ? 0.6 : 1 }}>
            📌 Confirmar e pinar
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Utilitários ──────────────────────────────────────────────────────────────

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);
}

function precoDataAtual() {
  return new Date().toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function BuscarViagensPage() {
  const [auth, setAuth] = useState<boolean | null>(null);
  const [aba, setAba] = useState<'buscar' | 'pinados'>('buscar');

  // Busca
  const [modoBusca, setModoBusca] = useState<'destino' | 'keyword'>('destino');
  const [destCode, setDestCode] = useState('');
  const [keyword, setKeyword] = useState('');
  const [passeios, setPasseios] = useState<Passeio[]>([]);
  const [loading, setLoading] = useState(false);

  // Pinados
  const [pinados, setPinados] = useState<PasseioPinado[]>([]);
  const [filtroDestino, setFiltroDestino] = useState('todos');

  // Modal
  const [modalPasseio, setModalPasseio] = useState<Passeio | null>(null);

  // Geração de artigo
  const [gerando, setGerando] = useState<string | null>(null);
  const [gerandoArtigo, setGerandoArtigo] = useState<string | null>(null);
  const [artigoGerado, setArtigoGerado] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch('/api/editorial/auth/check').then(r => r.json()).then(d => setAuth(d.ok)).catch(() => setAuth(false));
  }, []);

  useEffect(() => {
    if (auth) loadPinados();
  }, [auth]);

  async function loadPinados() {
    try {
      const res = await fetch('/api/viagens/save');
      const json = await res.json();
      setPinados(Array.isArray(json) ? json : []);
    } catch { setPinados([]); }
  }

  // ── Busca Viator ────────────────────────────────────────────────────────────

  async function handleBuscar() {
    const params = new URLSearchParams();
    if (modoBusca === 'destino' && destCode.trim()) params.set('destCode', destCode.trim());
    else if (modoBusca === 'keyword' && keyword.trim()) params.set('keyword', keyword.trim());
    else return;

    setLoading(true);
    setPasseios([]);
    try {
      const res = await fetch(`/api/viator?${params}`);
      const json = await res.json();
      if (json.error) { alert(`Erro Viator: ${json.error}`); return; }
      setPasseios(json.products || []);
      if ((json.products || []).length === 0) alert('Nenhum passeio encontrado. Tente outro destino ou palavra-chave.');
    } catch { alert('Erro ao buscar passeios.'); }
    finally { setLoading(false); }
  }

  // ── Pinar ───────────────────────────────────────────────────────────────────

  async function handleConfirmarPinar(passeio: Passeio, destinos: string[]) {
    setModalPasseio(null);
    setGerando(passeio.product_code);
    try {
      const payload: PasseioPinado = {
        ...passeio,
        id: passeio.product_code,
        slug: slugify(passeio.titulo),
        pinedAt: new Date().toISOString(),
        destinos,
        precoData: precoDataAtual(),
        publicado: false,
      };
      await fetch('/api/viagens/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      await loadPinados();
    } catch { alert('Erro ao pinar passeio.'); }
    finally { setGerando(null); }
  }

  // ── Gerar artigo ────────────────────────────────────────────────────────────

  async function handleGerarArtigo(pinado: PasseioPinado) {
    setGerandoArtigo(pinado.id);
    try {
      const res = await fetch('/api/viagem-artigo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo:       pinado.titulo,
          destino:      pinado.destination_code,
          duracao:      pinado.duracao,
          descricao:    pinado.descricao,
          destaques:    pinado.destaques,
          precoBase:    pinado.precoBase,
          precoData:    pinado.precoData,
          affiliateUrl: pinado.affiliate_url,
        }),
      });
      const json = await res.json();
      if (json.error) { alert(`Erro ao gerar artigo: ${json.error}`); return; }
      setArtigoGerado(prev => ({ ...prev, [pinado.id]: json.conteudo }));
    } catch { alert('Erro ao gerar artigo.'); }
    finally { setGerandoArtigo(null); }
  }

  // ── Publicar artigo ─────────────────────────────────────────────────────────

  async function handlePublicar(pinado: PasseioPinado) {
    const conteudo = artigoGerado[pinado.id] || pinado.conteudo || '';
    if (!conteudo.trim()) { alert('Gere o artigo antes de publicar.'); return; }

    const descricaoCurta = pinado.descricao.slice(0, 160);
    await fetch('/api/viagens/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...pinado, conteudo, descricaoCurta, publicado: true }),
    });
    await loadPinados();
    alert(`✅ Publicado em /viagem/${pinado.slug}`);
  }

  // ── Atualizar destinos ───────────────────────────────────────────────────────

  async function handleAtualizarDestinos(pinado: PasseioPinado, novosDestinos: string[]) {
    await fetch('/api/viagens/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...pinado, destinos: novosDestinos }),
    });
    await loadPinados();
  }

  // ── Despinar ─────────────────────────────────────────────────────────────────

  async function handleDespinar(id: string) {
    if (!confirm('Remover este passeio?')) return;
    await fetch('/api/viagens/save', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    await loadPinados();
  }

  const isPinado = (code: string) => pinados.some(p => p.id === code);
  const pinadosFiltrados = filtroDestino === 'todos' ? pinados : pinados.filter(p => p.destinos?.includes(filtroDestino));

  // ── Auth ──────────────────────────────────────────────────────────────────────

  if (auth === null) return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0fdfa' }}>
      <p style={{ color: '#9ca3af', fontFamily: 'system-ui' }}>Verificando...</p>
    </main>
  );
  if (!auth) return <LoginScreen onLogin={() => setAuth(true)} />;

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <main style={{ maxWidth: '1060px', margin: '0 auto', padding: '30px 20px', fontFamily: 'system-ui, sans-serif', backgroundColor: '#f0fdfa', minHeight: '100vh' }}>

      {modalPasseio && (
        <ModalDestinos
          passeio={modalPasseio}
          onConfirm={(destinos) => handleConfirmarPinar(modalPasseio, destinos)}
          onCancel={() => setModalPasseio(null)}
        />
      )}

      {/* Header */}
      <header style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', marginBottom: '24px', borderTop: '6px solid #0f766e' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#111827', margin: 0 }}>🌍 Curadoria de Viagens</h1>
            <p style={{ color: '#6b7280', fontSize: '0.9rem', margin: '4px 0 0' }}>Busque passeios Viator, pine e publique artigos editoriais</p>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <a href="/viagens" target="_blank" style={{ backgroundColor: '#f3f4f6', color: '#374151', padding: '6px 12px', borderRadius: '6px', textDecoration: 'none', fontSize: '0.78rem', fontWeight: 600 }}>🌍 Ver Viagens</a>
            <a href="/viagens-selecionadas" target="_blank" style={{ backgroundColor: '#f3f4f6', color: '#374151', padding: '6px 12px', borderRadius: '6px', textDecoration: 'none', fontSize: '0.78rem', fontWeight: 600 }}>⭐ Selecionadas</a>
            <a href="/produtos/buscar" style={{ backgroundColor: '#f3f4f6', color: '#374151', padding: '6px 12px', borderRadius: '6px', textDecoration: 'none', fontSize: '0.78rem', fontWeight: 600 }}>📦 Produtos</a>
            <a href="/" style={{ backgroundColor: '#f3f4f6', color: '#374151', padding: '6px 12px', borderRadius: '6px', textDecoration: 'none', fontSize: '0.78rem', fontWeight: 600 }}>← Site</a>
          </div>
        </div>
      </header>

      {/* Abas principais */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        <button onClick={() => setAba('buscar')}
          style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', backgroundColor: aba === 'buscar' ? '#0f766e' : '#fff', color: aba === 'buscar' ? '#fff' : '#374151', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          🔍 Buscar passeios
        </button>
        <button onClick={() => setAba('pinados')}
          style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', backgroundColor: aba === 'pinados' ? '#0f766e' : '#fff', color: aba === 'pinados' ? '#fff' : '#374151', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          📌 Pinados ({pinados.length})
        </button>
      </div>

      {/* ── ABA: BUSCAR ──────────────────────────────────────────────────────── */}
      {aba === 'buscar' && (
        <div>
          {/* Toggle modo de busca */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            <button onClick={() => setModoBusca('destino')}
              style={{ padding: '7px 18px', borderRadius: '8px', border: 'none', backgroundColor: modoBusca === 'destino' ? '#0f766e' : '#fff', color: modoBusca === 'destino' ? '#fff' : '#374151', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
              🗺 Por código de destino
            </button>
            <button onClick={() => setModoBusca('keyword')}
              style={{ padding: '7px 18px', borderRadius: '8px', border: 'none', backgroundColor: modoBusca === 'keyword' ? '#0369a1' : '#fff', color: modoBusca === 'keyword' ? '#fff' : '#374151', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
              🔍 Por palavra-chave
            </button>
          </div>

          {/* Formulário de busca */}
          <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '20px', marginBottom: '20px' }}>

            {modoBusca === 'destino' && (
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '8px' }}>
                  Código do destino Viator
                </label>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                  <input value={destCode} onChange={e => setDestCode(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleBuscar()}
                    placeholder="ex: 732 (Lisboa), 562 (Barcelona)"
                    style={{ flex: 1, padding: '9px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.88rem', boxSizing: 'border-box' }} />
                  <button onClick={handleBuscar} disabled={loading || !destCode.trim()}
                    style={{ padding: '9px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#0f766e', color: '#fff', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                    {loading ? '⏳ Buscando...' : '🔍 Buscar'}
                  </button>
                </div>
                {/* Atalhos de destino */}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {DESTINOS_SUGERIDOS.map(d => (
                    <button key={d.code + d.label} onClick={() => { setDestCode(d.code); }}
                      style={{ padding: '4px 10px', borderRadius: '20px', border: `1px solid ${destCode === d.code ? '#0f766e' : '#e5e7eb'}`, backgroundColor: destCode === d.code ? '#f0fdfa' : '#fff', color: destCode === d.code ? '#0f766e' : '#6b7280', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {modoBusca === 'keyword' && (
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '8px' }}>
                  Palavra-chave
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input value={keyword} onChange={e => setKeyword(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleBuscar()}
                    placeholder="ex: cruzeiro Douro, tour Alhambra, passeio de barco..."
                    style={{ flex: 1, padding: '9px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.88rem', boxSizing: 'border-box' }} />
                  <button onClick={handleBuscar} disabled={loading || !keyword.trim()}
                    style={{ padding: '9px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#0369a1', color: '#fff', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                    {loading ? '⏳ Buscando...' : '🔍 Buscar'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Resultados */}
          {loading && (
            <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>⏳ Buscando passeios na Viator...</div>
          )}

          {!loading && passeios.length > 0 && (
            <>
              <div style={{ fontSize: '0.82rem', color: '#6b7280', marginBottom: '12px' }}>
                {passeios.length} passeios encontrados
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
                {passeios.map(p => (
                  <div key={p.product_code} style={{ backgroundColor: '#fff', borderRadius: '12px', border: `2px solid ${isPinado(p.product_code) ? '#0f766e' : '#e5e7eb'}`, overflow: 'hidden', boxShadow: '0 2px 6px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ height: '160px', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                      {p.imagem
                        ? <img src={p.imagem} alt={p.titulo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <span style={{ fontSize: '3rem' }}>🌍</span>
                      }
                      {isPinado(p.product_code) && (
                        <span style={{ position: 'absolute', top: '8px', right: '8px', backgroundColor: '#0f766e', color: '#fff', fontSize: '0.7rem', fontWeight: 700, padding: '2px 6px', borderRadius: '4px' }}>
                          📌 Pinado
                        </span>
                      )}
                    </div>
                    <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', flexGrow: 1, gap: '6px' }}>
                      <h3 style={{ fontSize: '0.82rem', fontWeight: 600, color: '#111827', margin: 0, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {p.titulo}
                      </h3>
                      <div style={{ fontSize: '0.72rem', color: '#6b7280' }}>
                        ⏱ {p.duracao}
                      </div>
                      {p.destaques?.length > 0 && (
                        <ul style={{ margin: 0, padding: '0 0 0 14px', fontSize: '0.72rem', color: '#6b7280', lineHeight: 1.5 }}>
                          {p.destaques.slice(0, 2).map((d, i) => <li key={i}>{d}</li>)}
                        </ul>
                      )}
                      <div style={{ marginTop: 'auto' }}>
                        <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0f766e' }}>
                          R$ {p.precoBase.toFixed(2).replace('.', ',')}
                        </div>
                        <div style={{ fontSize: '0.68rem', color: '#9ca3af' }}>a partir de · Viator</div>
                      </div>
                      <a href={p.affiliate_url} target="_blank" rel="noopener noreferrer"
                        style={{ display: 'block', padding: '6px', borderRadius: '6px', border: '1px solid #e5e7eb', backgroundColor: '#f9fafb', color: '#374151', fontWeight: 600, fontSize: '0.78rem', textAlign: 'center', textDecoration: 'none' }}>
                        🔗 Ver na Viator
                      </a>
                      <button
                        onClick={() => !isPinado(p.product_code) && gerando !== p.product_code && setModalPasseio(p)}
                        disabled={isPinado(p.product_code) || gerando === p.product_code}
                        style={{ width: '100%', padding: '7px', borderRadius: '6px', border: 'none', backgroundColor: isPinado(p.product_code) ? '#f0fdfa' : '#0f766e', color: isPinado(p.product_code) ? '#0f766e' : '#fff', fontWeight: 700, fontSize: '0.8rem', cursor: isPinado(p.product_code) ? 'default' : 'pointer' }}>
                        {gerando === p.product_code ? '⏳ Pinando...' : isPinado(p.product_code) ? '✅ Já pinado' : '📌 Pinar passeio'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* ── ABA: PINADOS ─────────────────────────────────────────────────────── */}
      {aba === 'pinados' && (
        <div>
          {/* Filtros */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <button onClick={() => setFiltroDestino('todos')}
              style={{ padding: '6px 14px', borderRadius: '999px', border: `2px solid ${filtroDestino === 'todos' ? '#0f766e' : '#e5e7eb'}`, backgroundColor: filtroDestino === 'todos' ? '#0f766e' : '#fff', color: filtroDestino === 'todos' ? '#fff' : '#374151', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer' }}>
              Todos ({pinados.length})
            </button>
            {DESTINOS_VIAGEM.map(d => {
              const count = pinados.filter(p => p.destinos?.includes(d.id)).length;
              const isActive = filtroDestino === d.id;
              return (
                <button key={d.id} onClick={() => setFiltroDestino(d.id)}
                  style={{ padding: '6px 14px', borderRadius: '999px', border: `2px solid ${isActive ? d.cor : '#e5e7eb'}`, backgroundColor: isActive ? d.cor : '#fff', color: isActive ? '#fff' : '#374151', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer' }}>
                  {d.label} ({count})
                </button>
              );
            })}
          </div>

          {pinadosFiltrados.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280' }}>
              {filtroDestino === 'todos' ? 'Nenhum passeio pinado ainda.' : `Nenhum passeio em "${DESTINOS_VIAGEM.find(d => d.id === filtroDestino)?.label}".`}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
              {pinadosFiltrados.map(p => (
                <div key={p.id} style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 2px 6px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ height: '140px', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' }}>
                    {p.imagem
                      ? <img src={p.imagem} alt={p.titulo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <span style={{ fontSize: '3rem' }}>🌍</span>
                    }
                    {p.publicado && (
                      <span style={{ position: 'absolute', top: '8px', left: '8px', backgroundColor: '#0f766e', color: '#fff', fontSize: '0.68rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px' }}>
                        ✅ Publicado
                      </span>
                    )}
                  </div>
                  <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', flexGrow: 1, gap: '8px' }}>
                    <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#111827', margin: 0, lineHeight: 1.4 }}>
                      {p.titulo}
                    </h3>
                    <div style={{ fontSize: '0.78rem', color: '#0f766e', fontWeight: 700 }}>
                      R$ {p.precoBase.toFixed(2).replace('.', ',')}
                      <span style={{ color: '#9ca3af', fontWeight: 400, marginLeft: '4px' }}>· {p.precoData}</span>
                    </div>

                    {/* Destinos */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {DESTINOS_VIAGEM.map(d => {
                        const ativo = p.destinos?.includes(d.id);
                        return (
                          <button key={d.id} onClick={() => {
                            const novos = ativo
                              ? (p.destinos || []).filter(x => x !== d.id)
                              : [...(p.destinos || []), d.id];
                            handleAtualizarDestinos(p, novos);
                          }} style={{ fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px', borderRadius: '20px', border: `1px solid ${ativo ? d.cor : '#e5e7eb'}`, backgroundColor: ativo ? d.cor : '#fff', color: ativo ? '#fff' : '#9ca3af', cursor: 'pointer' }}>
                            {d.label}
                          </button>
                        );
                      })}
                    </div>

                    <small style={{ color: '#9ca3af', fontSize: '0.7rem' }}>
                      Pinado em {new Date(p.pinedAt).toLocaleDateString('pt-BR')}
                    </small>

                    {/* Artigo gerado — preview */}
                    {artigoGerado[p.id] && (
                      <div style={{ backgroundColor: '#f0fdfa', border: '1px solid #99f6e4', borderRadius: '8px', padding: '10px', fontSize: '0.75rem', color: '#374151', maxHeight: '100px', overflow: 'auto', lineHeight: 1.5 }}>
                        {artigoGerado[p.id].slice(0, 300)}...
                      </div>
                    )}

                    {/* Ações */}
                    <button onClick={() => handleGerarArtigo(p)} disabled={gerandoArtigo === p.id}
                      style={{ padding: '7px', borderRadius: '6px', border: 'none', backgroundColor: gerandoArtigo === p.id ? '#f3f4f6' : '#0369a1', color: gerandoArtigo === p.id ? '#6b7280' : '#fff', fontWeight: 700, fontSize: '0.8rem', cursor: gerandoArtigo === p.id ? 'not-allowed' : 'pointer', width: '100%' }}>
                      {gerandoArtigo === p.id ? '⏳ Gerando artigo...' : (artigoGerado[p.id] || p.conteudo) ? '🔄 Regerar artigo' : '✍️ Gerar artigo'}
                    </button>

                    {(artigoGerado[p.id] || p.conteudo) && (
                      <button onClick={() => handlePublicar(p)}
                        style={{ padding: '7px', borderRadius: '6px', border: 'none', backgroundColor: '#0f766e', color: '#fff', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', width: '100%' }}>
                        🚀 {p.publicado ? 'Republicar' : 'Publicar artigo'}
                      </button>
                    )}

                    {p.publicado && (
                      <a href={`/viagem/${p.slug}`} target="_blank"
                        style={{ display: 'block', padding: '6px', borderRadius: '6px', border: '1px solid #99f6e4', backgroundColor: '#f0fdfa', color: '#0f766e', fontWeight: 600, fontSize: '0.78rem', textAlign: 'center', textDecoration: 'none' }}>
                        🔗 Ver artigo publicado
                      </a>
                    )}

                    <button onClick={() => handleDespinar(p.id)}
                      style={{ padding: '6px', borderRadius: '6px', border: '1px solid #fca5a5', backgroundColor: '#fff', color: '#dc2626', fontWeight: 600, fontSize: '0.78rem', cursor: 'pointer' }}>
                      🗑 Remover
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </main>
  );
}

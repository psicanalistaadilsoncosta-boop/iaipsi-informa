'use client';

import { useState, useEffect } from 'react';

const AMBIENTES = ['Sala', 'Quarto', 'Escritório', 'Cozinha', 'Banheiro', 'Área externa'];
const TIPOS_AMBIENTE = ['Iluminação', 'Climatização', 'Móveis', 'Decoração', 'Organização', 'Eletrônicos'];
const MOMENTOS = ['Café da manhã', 'Vinho', 'Churrasco', 'Lareira', 'Domingo relaxado', 'Festa em casa'];
const TIPOS_MOMENTO = ['Eletro', 'Móveis', 'Acessórios', 'Alimentos'];
const DESTINOS = [
  { id: 'ofertas-selecionadas', label: '⭐ Ofertas Selecionadas' },
  { id: 'oferta-do-dia', label: '🔥 Oferta do Dia' },
  { id: 'parcelado', label: '💳 Parcelado' },
  { id: 'mix', label: '📰 Entre Notícias' },
];

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
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9fafb', fontFamily: 'system-ui' }}>
      <div style={{ backgroundColor: '#fff', borderRadius: '14px', padding: '40px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', width: '100%', maxWidth: '380px', borderTop: '5px solid #7c3aed' }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#111827', margin: '0 0 4px' }}>Categorizar Produtos</h1>
        <p style={{ color: '#6b7280', fontSize: '0.9rem', margin: '0 0 28px' }}>Painel de curadoria</p>
        <form onSubmit={handleSubmit}>
          <input type="password" placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)}
            style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.95rem', marginBottom: '12px', boxSizing: 'border-box' }} autoFocus />
          {error && <p style={{ color: '#dc2626', fontSize: '0.82rem', margin: '0 0 10px' }}>{error}</p>}
          <button type="submit" disabled={loading} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: 'none', backgroundColor: '#7c3aed', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
            {loading ? 'Verificando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </main>
  );
}

interface Produto {
  id: string;
  nome: string;
  imagem?: string;
  link: string;
  linkOriginal?: string;
  preco: number;
  loja?: string;
  destinos?: string[];
  ambiente?: string;
  tipoAmbiente?: string;
  momento?: string;
  tipoMomento?: string;
  _sugestao?: {
    ambiente?: string;
    tipoAmbiente?: string;
    momento?: string;
    tipoMomento?: string;
    lojaNome?: string;
  } | null;
}

function ProdutoCard({ produto, onSave }: { produto: Produto; onSave: (atualizado: any) => void }) {
  const [ambiente, setAmbiente] = useState(produto.ambiente || produto._sugestao?.ambiente || '');
  const [tipoAmbiente, setTipoAmbiente] = useState(produto.tipoAmbiente || produto._sugestao?.tipoAmbiente || '');
  const [momento, setMomento] = useState(produto.momento || produto._sugestao?.momento || '');
  const [tipoMomento, setTipoMomento] = useState(produto.tipoMomento || produto._sugestao?.tipoMomento || '');
  const [destinos, setDestinos] = useState<string[]>(produto.destinos || []);
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);

  const temSugestao = produto._sugestao && (produto._sugestao.ambiente || produto._sugestao.momento);
  const jaTemCategoria = produto.ambiente || produto.momento;

  function toggleDestino(id: string) {
    setDestinos(prev => prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]);
  }

  async function handleSalvar() {
    setSalvando(true);
    try {
      await fetch('/api/produtos/categorizar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: produto.id, ambiente, tipoAmbiente, momento, tipoMomento, destinos }),
      });
      setSalvo(true);
      onSave({ ...produto, ambiente, tipoAmbiente, momento, tipoMomento, destinos });
    } finally {
      setSalvando(false);
    }
  }

  const selectStyle: React.CSSProperties = { padding: '5px 8px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '0.78rem', backgroundColor: '#fff' };

  return (
    <div style={{ backgroundColor: salvo ? '#f0fdf4' : '#fff', borderRadius: '12px', border: `1px solid ${salvo ? '#bbf7d0' : jaTemCategoria ? '#ddd6fe' : '#e5e7eb'}`, padding: '14px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
      {produto.imagem && (
        <img src={produto.imagem} alt="" style={{ width: '60px', height: '60px', objectFit: 'contain', borderRadius: '6px', backgroundColor: '#f9fafb', flexShrink: 0 }} />
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#111827', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{produto.nome}</div>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
          {produto.loja && <span style={{ fontSize: '0.7rem', color: '#047857', backgroundColor: '#f0fdf4', padding: '1px 7px', borderRadius: '999px', fontWeight: 600 }}>🏪 {produto.loja}</span>}
          {temSugestao && !jaTemCategoria && (
            <span style={{ fontSize: '0.7rem', color: '#d97706', backgroundColor: '#fef3c7', padding: '1px 7px', borderRadius: '999px', fontWeight: 600 }}>
              💡 Sugestão: {produto._sugestao?.ambiente || produto._sugestao?.momento}
            </span>
          )}
          {jaTemCategoria && (
            <span style={{ fontSize: '0.7rem', color: '#7c3aed', backgroundColor: '#f5f3ff', padding: '1px 7px', borderRadius: '999px', fontWeight: 600 }}>
              ✓ Já categorizado
            </span>
          )}
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px', alignItems: 'flex-end' }}>
          <div>
            <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#6b7280', marginBottom: '2px' }}>🏠 AMBIENTE</div>
            <select value={ambiente} onChange={e => { setAmbiente(e.target.value); setTipoAmbiente(''); }} style={selectStyle}>
              <option value="">—</option>
              {AMBIENTES.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          {ambiente && (
            <div>
              <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#6b7280', marginBottom: '2px' }}>TIPO</div>
              <select value={tipoAmbiente} onChange={e => setTipoAmbiente(e.target.value)} style={selectStyle}>
                <option value="">—</option>
                {TIPOS_AMBIENTE.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          )}
          <div>
            <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#6b7280', marginBottom: '2px' }}>✨ MOMENTO</div>
            <select value={momento} onChange={e => { setMomento(e.target.value); setTipoMomento(''); }} style={selectStyle}>
              <option value="">—</option>
              {MOMENTOS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          {momento && (
            <div>
              <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#6b7280', marginBottom: '2px' }}>TIPO</div>
              <select value={tipoMomento} onChange={e => setTipoMomento(e.target.value)} style={selectStyle}>
                <option value="">—</option>
                {TIPOS_MOMENTO.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
          {DESTINOS.map(d => (
            <label key={d.id} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer', color: destinos.includes(d.id) ? '#7c3aed' : '#6b7280' }}>
              <input type="checkbox" checked={destinos.includes(d.id)} onChange={() => toggleDestino(d.id)} style={{ accentColor: '#7c3aed' }} />
              {d.label}
            </label>
          ))}
        </div>

        <button onClick={handleSalvar} disabled={salvando}
          style={{ padding: '6px 16px', borderRadius: '7px', border: 'none', backgroundColor: salvo ? '#059669' : '#7c3aed', color: '#fff', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer' }}>
          {salvando ? '⏳' : salvo ? '✓ Salvo' : '✅ OK'}
        </button>
      </div>
    </div>
  );
}

export default function CategorizarPage() {
  const [auth, setAuth] = useState<boolean | null>(null);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState<'todos' | 'sem-categoria' | 'com-categoria'>('sem-categoria');

  useEffect(() => {
    fetch('/api/editorial/auth/check').then(r => r.json()).then(d => setAuth(d.ok)).catch(() => setAuth(false));
  }, []);

  useEffect(() => {
    if (auth) {
      fetch('/api/produtos/categorizar')
        .then(r => r.json())
        .then(d => { setProdutos(Array.isArray(d) ? d : []); setLoading(false); });
    }
  }, [auth]);

  if (auth === null) return <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9fafb' }}><p style={{ color: '#9ca3af', fontFamily: 'system-ui' }}>Verificando...</p></main>;
  if (!auth) return <LoginScreen onLogin={() => setAuth(true)} />;

  const semCategoria = produtos.filter(p => !p.ambiente && !p.momento);
  const comCategoria = produtos.filter(p => p.ambiente || p.momento);
  const filtrados = filtro === 'sem-categoria' ? semCategoria : filtro === 'com-categoria' ? comCategoria : produtos;

  function handleSave(atualizado: Produto) {
    setProdutos(prev => prev.map(p => p.id === atualizado.id ? atualizado : p));
  }

  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', backgroundColor: '#f9fafb', minHeight: '100vh', padding: '28px 20px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#111827', margin: '0 0 4px' }}>🗂 Categorizar Produtos</h1>
            <p style={{ color: '#6b7280', fontSize: '0.82rem', margin: 0 }}>
              {semCategoria.length} sem categoria · {comCategoria.length} categorizados · {produtos.length} total
            </p>
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            {(['sem-categoria', 'com-categoria', 'todos'] as const).map(f => (
              <button key={f} onClick={() => setFiltro(f)}
                style={{ padding: '6px 14px', borderRadius: '8px', border: 'none', backgroundColor: filtro === f ? '#7c3aed' : '#fff', color: filtro === f ? '#fff' : '#374151', fontWeight: 600, fontSize: '0.78rem', cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                {f === 'sem-categoria' ? `⚠️ Sem categoria (${semCategoria.length})` : f === 'com-categoria' ? `✓ Categorizados (${comCategoria.length})` : `Todos (${produtos.length})`}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#9ca3af' }}>⏳ Carregando...</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {filtrados.map(p => (
              <ProdutoCard key={p.id} produto={p} onSave={handleSave} />
            ))}
            {filtrados.length === 0 && (
              <div style={{ textAlign: 'center', padding: '60px', color: '#9ca3af', backgroundColor: '#fff', borderRadius: '12px' }}>
                Nenhum produto neste filtro.
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
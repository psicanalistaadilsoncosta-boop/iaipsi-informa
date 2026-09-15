'use client';

import { useState, useEffect } from 'react';

interface OfertaDia {
  titulo: string;
  descricao: string;
  imagem: string;
  imagens: string[]; // múltiplas imagens
  link: string;
  loja: string;
  logo: string;
  preco: string;
  precoOriginal: string;
  parcelas: string;
  valorParcela: string;
  cupom: string;
  validade: string;
  categoria: string;
}

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
    } catch { setError('Erro ao verificar.'); }
    finally { setLoading(false); }
  }

  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9fafb', fontFamily: 'system-ui' }}>
      <div style={{ backgroundColor: '#fff', borderRadius: '14px', padding: '40px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', width: '100%', maxWidth: '380px', borderTop: '5px solid #dc2626' }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#111827', margin: '0 0 4px' }}>Oferta do Dia</h1>
        <p style={{ color: '#6b7280', fontSize: '0.9rem', margin: '0 0 28px' }}>Painel de edição</p>
        <form onSubmit={handleSubmit}>
          <input type="password" placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)}
            style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.95rem', marginBottom: '12px', boxSizing: 'border-box' }} autoFocus />
          {error && <p style={{ color: '#dc2626', fontSize: '0.82rem', margin: '0 0 10px' }}>{error}</p>}
          <button type="submit" disabled={loading} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: 'none', backgroundColor: '#dc2626', color: '#fff', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer' }}>
            {loading ? 'Verificando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </main>
  );
}

export default function EditarOfertaDia() {
  const [auth, setAuth] = useState<boolean | null>(null);
  const [url, setUrl] = useState('');
  const [buscando, setBuscando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);
     const [oferta, setOferta] = useState<OfertaDia>({
    titulo: '', descricao: '', imagem: '', imagens: [],
    link: '', loja: '', logo: '', preco: '', precoOriginal: '',
    cupom: '', validade: '', categoria: '',
    parcelas: '', valorParcela: '',
  });
  const [novaImagem, setNovaImagem] = useState('');

  useEffect(() => {
    fetch('/api/editorial/auth/check').then(r => r.json()).then(d => setAuth(d.ok)).catch(() => setAuth(false));
  }, []);

  useEffect(() => {
    // Carrega oferta atual
    if (auth) {
      fetch('/oferta-do-dia.json').then(r => r.json()).then(d => {
        if (d.titulo) setOferta(d);
      }).catch(() => {});
    }
  }, [auth]);

  async function handleBuscar() {
    if (!url) return;
    setBuscando(true);
    try {
      const res = await fetch('/api/og-fetch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      setOferta(prev => ({
        ...prev,
        link: url,
        titulo: data.titulo || prev.titulo,
        imagem: data.imagem || prev.imagem,
        descricao: data.descricao || prev.descricao,
        preco: data.preco || prev.preco,
        precoOriginal: data.precoOriginal || prev.precoOriginal,
      }));
    } catch { alert('Não foi possível buscar os dados.'); }
    finally { setBuscando(false); }
  }

  async function handleSalvar() {
    setSalvando(true);
    try {
      const res = await fetch('/api/oferta-do-dia/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(oferta),
      });
      if (res.ok) { setSalvo(true); setTimeout(() => setSalvo(false), 3000); }
    } catch { alert('Erro ao salvar.'); }
    finally { setSalvando(false); }
  }

  if (auth === null) return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9fafb' }}>
      <p style={{ color: '#9ca3af', fontFamily: 'system-ui' }}>Verificando acesso...</p>
    </main>
  );

  if (!auth) return <LoginScreen onLogin={() => setAuth(true)} />;

  const campo = (label: string, key: keyof OfertaDia, placeholder = '') => (
    <div style={{ marginBottom: '14px' }}>
      <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '4px' }}>{label}</label>
      <input value={oferta[key]} onChange={e => setOferta(prev => ({ ...prev, [key]: e.target.value }))}
        placeholder={placeholder}
        style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.9rem', boxSizing: 'border-box' }} />
    </div>
  );

  return (
    <main style={{ maxWidth: '900px', margin: '0 auto', padding: '30px 20px', fontFamily: 'system-ui, sans-serif', backgroundColor: '#f9fafb', minHeight: '100vh' }}>

      <header style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', marginBottom: '24px', borderTop: '6px solid #dc2626' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#111827', margin: 0 }}>🔥 Editar Oferta do Dia</h1>
            <p style={{ color: '#6b7280', fontSize: '0.9rem', margin: '4px 0 0' }}>Cole o link do produto e busque os dados automaticamente</p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <a href="/oferta-do-dia" target="_blank" style={{ backgroundColor: '#f3f4f6', color: '#374151', padding: '8px 16px', borderRadius: '8px', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600 }}>
              Ver página →
            </a>
            <a href="/" style={{ backgroundColor: '#f3f4f6', color: '#374151', padding: '8px 16px', borderRadius: '8px', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600 }}>
              ← Site
            </a>
          </div>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>

        {/* Coluna esquerda — busca e formulário */}
        <div>
          {/* Busca automática */}
          <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '20px', marginBottom: '16px' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>
              🔗 Buscar dados automaticamente
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input value={url} onChange={e => setUrl(e.target.value)}
                placeholder="Cole o link do produto (Lomadee ou direto)"
                style={{ flex: 1, padding: '9px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.85rem', boxSizing: 'border-box' }} />
              <button onClick={handleBuscar} disabled={buscando || !url} style={{ padding: '9px 16px', borderRadius: '8px', border: 'none', backgroundColor: '#2563eb', color: '#fff', fontWeight: 700, fontSize: '0.85rem', cursor: buscando ? 'wait' : 'pointer', whiteSpace: 'nowrap' }}>
                {buscando ? '⏳' : '🔍 Buscar'}
              </button>
            </div>
            <p style={{ fontSize: '0.72rem', color: '#9ca3af', margin: '6px 0 0' }}>
              Tenta extrair título, imagem, preço e descrição automaticamente
            </p>
          </div>

          {/* Formulário */}
          <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '20px' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '16px' }}>
              ✏️ Dados da oferta
            </div>
            {campo('Título', 'titulo', 'Nome do produto ou oferta')}
            {campo('Descrição', 'descricao', 'Breve descrição da oferta')}
                       {campo('Imagem principal (URL)', 'imagem', 'https://...')}

            {/* Múltiplas imagens */}
            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>
                Imagens adicionais (outras cores/ângulos)
              </label>
              <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
                <input value={novaImagem} onChange={e => setNovaImagem(e.target.value)}
                  placeholder="Cole a URL da imagem e clique em +"
                  style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.85rem', boxSizing: 'border-box' }} />
                <button onClick={() => {
                  if (novaImagem.trim()) {
                    setOferta(prev => ({ ...prev, imagens: [...(prev.imagens || []), novaImagem.trim()] }));
                    setNovaImagem('');
                  }
                }} style={{ padding: '8px 14px', borderRadius: '8px', border: 'none', backgroundColor: '#2563eb', color: '#fff', fontWeight: 700, fontSize: '1rem', cursor: 'pointer' }}>
                  +
                </button>
              </div>
              {(oferta.imagens || []).map((img, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', backgroundColor: '#f9fafb', borderRadius: '6px', padding: '6px 10px' }}>
                  <img src={img} alt="" style={{ width: '40px', height: '40px', objectFit: 'contain', borderRadius: '4px', backgroundColor: '#fff', border: '1px solid #e5e7eb' }} />
                  <span style={{ flex: 1, fontSize: '0.72rem', color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{img}</span>
                  <button onClick={() => setOferta(prev => ({ ...prev, imagens: prev.imagens.filter((_, j) => j !== i) }))}
                    style={{ border: 'none', backgroundColor: 'transparent', color: '#dc2626', cursor: 'pointer', fontWeight: 700, fontSize: '1rem', padding: '0 4px' }}>
                    ×
                  </button>
                </div>
              ))}
            </div>
            {campo('Link de afiliado', 'link', 'https://lmdee.link/...')}
            {campo('Loja', 'loja', 'ex: MiBrasil, Malwee...')}
            {campo('Logo da loja (URL)', 'logo', 'https://cdn.lomadee.com.br/logos/...')}
            {campo('Preço atual', 'preco', 'ex: 2391.99')}
            {campo('Preço original', 'precoOriginal', 'ex: 2599.99')}
            {campo('Parcelas', 'parcelas', 'ex: 12')}
            {campo('Valor da parcela', 'valorParcela', 'ex: 216.67')}
            {campo('Cupom (se tiver)', 'cupom', 'ex: CLIENTE')}
            {campo('Categoria', 'categoria', 'ex: Eletro & Tech')}
            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '4px' }}>Válido até</label>
              <input type="datetime-local" value={oferta.validade ? oferta.validade.slice(0, 16) : ''}
                onChange={e => setOferta(prev => ({ ...prev, validade: new Date(e.target.value).toISOString() }))}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.9rem', boxSizing: 'border-box' }} />
            </div>

            <button onClick={handleSalvar} disabled={salvando} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: salvo ? '#047857' : '#dc2626', color: '#fff', fontWeight: 700, fontSize: '1rem', cursor: salvando ? 'wait' : 'pointer', transition: 'background 0.2s' }}>
              {salvando ? '💾 Salvando...' : salvo ? '✅ Salvo!' : '🔥 Publicar Oferta do Dia'}
            </button>
          </div>
        </div>

        {/* Coluna direita — preview */}
        <div style={{ position: 'sticky', top: '20px', alignSelf: 'start' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>
            👁 Preview
          </div>
          <div style={{ backgroundColor: '#fff', borderRadius: '16px', overflow: 'hidden', border: '1px solid #e5e7eb', boxShadow: '0 4px 16px rgba(220,38,38,0.08)' }}>
                       {(oferta.imagem || oferta.imagens?.length > 0) && (
              <div style={{ backgroundColor: '#f3f4f6', padding: '12px', display: 'flex', gap: '8px', overflowX: 'auto' }}>
                {oferta.imagem && (
                  <img src={oferta.imagem} alt="" style={{ height: '160px', objectFit: 'contain', borderRadius: '8px', backgroundColor: '#fff', border: '2px solid #2563eb', padding: '4px', flexShrink: 0 }} />
                )}
                {(oferta.imagens || []).map((img, i) => (
                  <img key={i} src={img} alt="" style={{ height: '160px', objectFit: 'contain', borderRadius: '8px', backgroundColor: '#fff', border: '1px solid #e5e7eb', padding: '4px', flexShrink: 0 }} />
                ))}
              </div>
            )}
            <div style={{ padding: '20px' }}>
              {oferta.loja && (
                <div style={{ fontSize: '0.78rem', color: '#9ca3af', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {oferta.logo && <img src={oferta.logo} alt="" style={{ height: '20px', objectFit: 'contain' }} />}
                  {oferta.loja}
                </div>
              )}
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#111827', margin: '0 0 8px', lineHeight: 1.3 }}>
                {oferta.titulo || 'Título da oferta'}
              </h2>
              {oferta.descricao && (
                <p style={{ fontSize: '0.85rem', color: '#6b7280', margin: '0 0 12px', lineHeight: 1.5 }}>{oferta.descricao}</p>
              )}
              {(oferta.preco || oferta.precoOriginal) && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  {oferta.precoOriginal && (
                    <span style={{ fontSize: '0.85rem', color: '#9ca3af', textDecoration: 'line-through' }}>
                      R$ {parseFloat(oferta.precoOriginal).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  )}
                  {oferta.preco && (
                    <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#dc2626' }}>
                      R$ {parseFloat(oferta.preco).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  )}
                  {oferta.preco && oferta.precoOriginal && (
                    <span style={{ backgroundColor: '#dc2626', color: '#fff', fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: '6px' }}>
                      -{Math.round((1 - parseFloat(oferta.preco) / parseFloat(oferta.precoOriginal)) * 100)}%
                    </span>
                  )}
                </div>
              )}
              {oferta.cupom && (
                <div style={{ backgroundColor: '#f5f3ff', border: '2px dashed #7c3aed', borderRadius: '8px', padding: '8px 12px', textAlign: 'center', fontWeight: 800, fontSize: '1rem', color: '#7c3aed', letterSpacing: '2px', marginBottom: '12px' }}>
                  {oferta.cupom}
                </div>
              )}
              {oferta.validade && (
                <div style={{ fontSize: '0.78rem', color: '#9ca3af', marginBottom: '12px' }}>
                  ⏱ Válido até {new Date(oferta.validade).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </div>
              )}
              <div style={{ backgroundColor: '#dc2626', color: '#fff', padding: '10px', borderRadius: '8px', textAlign: 'center', fontWeight: 700, fontSize: '0.9rem' }}>
                Ver oferta completa →
              </div>
            </div>
          </div>
        </div>
      </div>

    </main>
  );
}
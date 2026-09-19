'use client';

import { useState, useEffect } from 'react';

function slugify(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

interface ViatorResult {
  product_code: string;
  titulo: string;
  descricao: string;
  duracao: string;
  destaques: string[];
  precoBase: number;
  imagem: string;
  gallery: string[];
  affiliate_url: string;
  rating: number;
  totalReviews: number;
  destination_code: string;
  source: 'viator';
}

export default function CriarArtigoViagemPage() {
  const [auth, setAuth] = useState(false);
  const [senha, setSenha] = useState('');
  const [buscando, setBuscando] = useState(false);
  const [gerando, setGerando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);

  // Busca Viator
  const [keyword, setKeyword] = useState('');
  const [destCode, setDestCode] = useState('');
  const [resultados, setResultados] = useState<ViatorResult[]>([]);
  const [selecionado, setSelecionado] = useState<ViatorResult | null>(null);

  // Campos do artigo
  const [titulo, setTitulo] = useState('');
  const [destino, setDestino] = useState('');
  const [duracao, setDuracao] = useState('');
  const [precoBase, setPrecoBase] = useState('');
  const [precoData, setPrecoData] = useState('');
  const [affiliateUrl, setAffiliateUrl] = useState('');
  const [imagem, setImagem] = useState('');
  const [gallery, setGallery] = useState<string[]>([]);
  const [imagemAtiva, setImagemAtiva] = useState(0);
  const [descricaoCurta, setDescricaoCurta] = useState('');
  const [conteudo, setConteudo] = useState('');

  const [msg, setMsg] = useState('');

  // Mês/ano atual para precoData default
  const mesAnoAtual = new Date().toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }).replace('. ', '/').replace('.', '');

  useEffect(() => {
    fetch('/api/editorial/auth/check')
      .then(r => r.json())
      .then(d => { if (d.ok) setAuth(true); });
  }, []);

  useEffect(() => {
    if (!auth) return;
    const params = new URLSearchParams(window.location.search);
    const editarId = params.get('editar');
    if (!editarId) return;

    fetch('/api/viagens/save')
      .then(r => r.json())
      .then((artigos: any[]) => {
        const artigo = artigos.find(a => a.id === editarId);
        if (!artigo) return;
        setEditandoId(artigo.id);
        setTitulo(artigo.titulo || '');
        setDestino(artigo.destino || '');
        setDuracao(artigo.duracao || '');
        setPrecoBase(artigo.precoBase?.toString() || '');
        setPrecoData(artigo.precoData || '');
        setAffiliateUrl(artigo.affiliateUrl || '');
        setImagem(artigo.imagem || '');
        setGallery(artigo.gallery || []);
        setDescricaoCurta(artigo.descricaoCurta || '');
        setConteudo(artigo.conteudo || '');
        setImagemAtiva(0);
      });
  }, [auth]);

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

  async function handleBuscar() {
    if (!keyword && !destCode) return;
    setBuscando(true);
    setResultados([]);
    setSelecionado(null);
    try {
      const params = new URLSearchParams();
      if (keyword) params.set('keyword', keyword);
      else params.set('destCode', destCode);
      const res = await fetch(`/api/viator?${params}`);
      const data = await res.json();
      if (data.error) { alert(data.error); return; }
      setResultados(Array.isArray(data) ? data : [data]);
    } catch { alert('Erro ao buscar na Viator'); }
    finally { setBuscando(false); }
  }

  function handleSelecionar(item: ViatorResult) {
    setSelecionado(item);
    setTitulo(item.titulo);
    setDestino(''); // preencher manualmente
    setDuracao(item.duracao || '');
    setPrecoBase(item.precoBase?.toString() || '');
    setPrecoData(mesAnoAtual);
    setAffiliateUrl(item.affiliate_url || '');
    setImagem(item.imagem || '');
    setGallery(item.gallery || []);
    setDescricaoCurta(item.descricao?.slice(0, 200) || '');
    setImagemAtiva(0);
    setConteudo('');
    window.scrollTo({ top: 400, behavior: 'smooth' });
  }

  async function handleGerarArtigo() {
    if (!titulo) return;
    setGerando(true);
    setConteudo('');
    try {
      const res = await fetch('/api/viagem-artigo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo,
          destino,
          duracao,
          descricao: selecionado?.descricao || descricaoCurta,
          destaques: selecionado?.destaques || [],
          precoBase: parseFloat(precoBase) || 0,
          precoData: precoData || mesAnoAtual,
          affiliateUrl,
        }),
      });
      const data = await res.json();
      setConteudo(data.conteudo || '');
    } catch { alert('Erro ao gerar artigo'); }
    finally { setGerando(false); }
  }

  async function handlePublicar() {
    if (!titulo || !conteudo) return;
    setSalvando(true);
    setMsg('');
    try {
      const todasImagens = [imagem, ...gallery.filter(g => g !== imagem)].filter(Boolean);
      const imagemPrincipal = todasImagens[imagemAtiva] || imagem;

      const artigo = {
        id: editandoId || Date.now().toString(),
        slug: slugify(titulo),
        titulo,
        destino,
        duracao,
        imagem: imagemPrincipal,
        gallery: todasImagens,
        descricaoCurta,
        conteudo,
        precoBase: parseFloat(precoBase) || 0,
        precoData: precoData || mesAnoAtual,
        affiliateUrl,
        publicado: true,
        createdAt: new Date().toISOString(),
      };

      await fetch('/api/viagens/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(artigo),
      });
      setMsg(`✅ Publicado! Acesse: /viagem/${artigo.slug}`);
    } catch { alert('Erro ao publicar'); }
    finally { setSalvando(false); }
  }

  const todasImagens = [imagem, ...gallery.filter(g => g !== imagem)].filter(Boolean);

  if (!auth) return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9fafb', fontFamily: 'system-ui' }}>
      <div style={{ backgroundColor: '#fff', borderRadius: '14px', padding: '40px', maxWidth: '380px', width: '100%', borderTop: '5px solid #0f766e' }}>
        <h1 style={{ fontSize: '1.3rem', fontWeight: 800, margin: '0 0 24px' }}>Criar Artigo de Viagem</h1>
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
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>{editandoId ? '✏️ Editar Artigo de Viagem' : '🌍 Criar Artigo de Viagem'}</h1>
            <p style={{ color: '#6b7280', fontSize: '0.88rem', margin: '4px 0 0' }}>{editandoId ? 'Edite o conteúdo e republique' : 'Busca passeios na Viator e gera artigo editorial com IA'}</p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <a href="/viagem/gerenciar" style={{ backgroundColor: '#f3f4f6', color: '#374151', padding: '7px 14px', borderRadius: '6px', textDecoration: 'none', fontSize: '0.82rem', fontWeight: 600 }}>
              📋 Gerenciar artigos
            </a>
            <a href="/" style={{ backgroundColor: '#f3f4f6', color: '#374151', padding: '7px 14px', borderRadius: '6px', textDecoration: 'none', fontSize: '0.82rem', fontWeight: 600 }}>← Site</a>
          </div>
        </div>
      </header>

      {/* Busca Viator */}
      {!editandoId && (
        <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '24px', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 16px' }}>1. Buscar passeio na Viator</h2>

          {/* Atalhos de destino */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '14px' }}>
            {[
              { label: '🇵🇹 Lisboa', code: '318' },
              { label: '🇵🇹 Porto', code: '740' },
              { label: '🇪🇸 Barcelona', code: '562' },
              { label: '🇮🇹 Roma', code: '511' },
              { label: '🇫🇷 Paris', code: '479' },
              { label: '🇧🇷 Rio', code: '318' },
            ].map(d => (
              <button key={d.code} onClick={() => { setDestCode(d.code); setKeyword(''); }}
                style={{ padding: '5px 12px', borderRadius: '20px', border: `1px solid ${destCode === d.code ? '#0f766e' : '#e5e7eb'}`, backgroundColor: destCode === d.code ? '#f0fdfa' : '#fff', fontSize: '0.78rem', cursor: 'pointer', fontWeight: destCode === d.code ? 700 : 400, color: destCode === d.code ? '#0f766e' : '#374151' }}>
                {d.label}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '4px' }}>Keyword</label>
              <input value={keyword} onChange={e => { setKeyword(e.target.value); setDestCode(''); }} placeholder="ex: tour barca gondola veneza"
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.9rem', boxSizing: 'border-box' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', padding: '0 8px', color: '#9ca3af', fontWeight: 600 }}>ou destCode</div>
            <div style={{ width: '140px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '4px' }}>Dest. Code</label>
              <input value={destCode} onChange={e => { setDestCode(e.target.value); setKeyword(''); }} placeholder="ex: 318"
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.9rem', boxSizing: 'border-box' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button onClick={handleBuscar} disabled={buscando || (!keyword && !destCode)}
                style={{ padding: '9px 24px', borderRadius: '8px', border: 'none', backgroundColor: '#0f766e', color: '#fff', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                {buscando ? '⏳ Buscando...' : '🔍 Buscar'}
              </button>
            </div>
          </div>

          {/* Resultados */}
          {resultados.length > 0 && (
            <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <p style={{ fontSize: '0.82rem', color: '#6b7280', margin: 0 }}>{resultados.length} resultado(s) — clique para selecionar</p>
              {resultados.map(item => (
                <div key={item.product_code} onClick={() => handleSelecionar(item)}
                  style={{ display: 'flex', gap: '14px', padding: '14px', borderRadius: '10px', border: `2px solid ${selecionado?.product_code === item.product_code ? '#0f766e' : '#e5e7eb'}`, backgroundColor: selecionado?.product_code === item.product_code ? '#f0fdfa' : '#fff', cursor: 'pointer' }}>
                  {item.imagem && (
                    <img src={item.imagem} alt={item.titulo} style={{ width: '72px', height: '72px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0 }} />
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#111827', marginBottom: '4px' }}>{item.titulo}</div>
                    <div style={{ fontSize: '0.78rem', color: '#6b7280', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      {item.duracao && <span>⏱ {item.duracao}</span>}
                      {item.precoBase > 0 && <span style={{ color: '#0f766e', fontWeight: 700 }}>R$ {item.precoBase.toFixed(2).replace('.', ',')}</span>}
                      {item.rating > 0 && <span>⭐ {item.rating.toFixed(1)} ({item.totalReviews})</span>}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.descricao}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Dados do artigo (preenchimento manual ou via seleção) */}
      {(selecionado || editandoId) && (
        <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '24px', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 16px' }}>{editandoId ? '1.' : '2.'} Dados do passeio</h2>

          <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '24px' }}>
            {/* Galeria */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {todasImagens[imagemAtiva] && (
                <div style={{ height: '200px', backgroundColor: '#f1f5f9', borderRadius: '10px', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  <img src={todasImagens[imagemAtiva]} alt={titulo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}
              {todasImagens.length > 1 && (
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {todasImagens.map((img, i) => (
                    <button key={i} onClick={() => setImagemAtiva(i)}
                      style={{ width: '48px', height: '48px', borderRadius: '6px', border: `2px solid ${imagemAtiva === i ? '#0f766e' : '#e5e7eb'}`, backgroundColor: '#fff', cursor: 'pointer', padding: '2px', overflow: 'hidden' }}>
                      <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </button>
                  ))}
                </div>
              )}
              <p style={{ fontSize: '0.72rem', color: '#9ca3af', margin: 0 }}>Clique para definir imagem principal</p>
            </div>

            {/* Campos */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '4px' }}>Título do artigo</label>
                <input value={titulo} onChange={e => setTitulo(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.9rem', boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 2 }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '4px' }}>Destino</label>
                  <input value={destino} onChange={e => setDestino(e.target.value)} placeholder="ex: Lisboa, Portugal"
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.9rem', boxSizing: 'border-box' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '4px' }}>Duração</label>
                  <input value={duracao} onChange={e => setDuracao(e.target.value)} placeholder="ex: 3 horas"
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.9rem', boxSizing: 'border-box' }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '4px' }}>Preço base (R$)</label>
                  <input value={precoBase} onChange={e => setPrecoBase(e.target.value)} type="number" placeholder="ex: 299.90"
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.9rem', boxSizing: 'border-box' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '4px' }}>Mês/ano pesquisa</label>
                  <input value={precoData} onChange={e => setPrecoData(e.target.value)} placeholder="ex: set/2026"
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.9rem', boxSizing: 'border-box' }} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '4px' }}>Link de afiliado (Viator)</label>
                <input value={affiliateUrl} onChange={e => setAffiliateUrl(e.target.value)} placeholder="https://www.viator.com/..."
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.9rem', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '4px' }}>Descrição curta</label>
                <textarea value={descricaoCurta} onChange={e => setDescricaoCurta(e.target.value)} rows={2}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.88rem', lineHeight: 1.5, fontFamily: 'system-ui', boxSizing: 'border-box', resize: 'vertical' }} />
              </div>
            </div>
          </div>

          <div style={{ marginTop: '20px' }}>
            <button onClick={handleGerarArtigo} disabled={gerando || !titulo}
              style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', backgroundColor: '#0f766e', color: '#fff', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer' }}>
              {gerando ? '⏳ Gerando artigo...' : '✍️ Gerar artigo com IA'}
            </button>
          </div>
        </div>
      )}

      {/* Editor */}
      {conteudo && (
        <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '24px', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 16px' }}>{editandoId ? '2.' : '3.'} Revisar e editar artigo</h2>
          <textarea
            value={conteudo}
            onChange={e => setConteudo(e.target.value)}
            style={{ width: '100%', minHeight: '420px', padding: '16px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.88rem', lineHeight: 1.7, fontFamily: 'system-ui', boxSizing: 'border-box', resize: 'vertical' }}
          />
          <div style={{ marginTop: '16px', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button onClick={handlePublicar} disabled={salvando}
              style={{ padding: '10px 28px', borderRadius: '8px', border: 'none', backgroundColor: '#0f766e', color: '#fff', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer' }}>
              {salvando ? '⏳ Publicando...' : '🚀 Publicar artigo'}
            </button>
            <button onClick={handleGerarArtigo} disabled={gerando}
              style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #e5e7eb', backgroundColor: '#fff', color: '#374151', fontWeight: 600, cursor: 'pointer' }}>
              🔄 Regenerar
            </button>
            {msg && <span style={{ color: '#047857', fontWeight: 600, fontSize: '0.88rem' }}>{msg}</span>}
          </div>
        </div>
      )}

    </main>
  );
}

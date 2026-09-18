'use client';

import { useState, useEffect } from 'react';

interface IcecatData {
  icecatId: number;
  titulo: string;
  marca: string;
  marcaLogo: string;
  categoria: string;
  gtin: string;
  descricaoLonga: string;
  descricaoCurta: string;
  bulletPoints: string[];
  imagem: string;
  imagemMedia: string;
  gallery: string[];
  specs: Record<string, { grupo: string; itens: { nome: string; valor: string }[] }>;
}

function slugify(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export default function CriarArtigoProdutoPage() {
  const [auth, setAuth] = useState(false);
  const [senha, setSenha] = useState('');
  const [gtin, setGtin] = useState('');
  const [nome, setNome] = useState('');
  const [marca, setMarca] = useState('');
  const [buscando, setBuscando] = useState(false);
  const [gerando, setGerando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [icecat, setIcecat] = useState<IcecatData | null>(null);
  const [conteudo, setConteudo] = useState('');
  const [imagemAtiva, setImagemAtiva] = useState(0);
  const [ofertaLoja, setOfertaLoja] = useState('');
  const [ofertaPreco, setOfertaPreco] = useState('');
  const [ofertaLink, setOfertaLink] = useState('');
  const [ofertas, setOfertas] = useState<{ loja: string; preco: number; link: string }[]>([]);
  const [msg, setMsg] = useState('');
  const [editandoId, setEditandoId] = useState<string | null>(null);

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

    fetch('/api/produtos-artigos')
      .then(r => r.json())
      .then((artigos: any[]) => {
        const artigo = artigos.find(a => a.id === editarId);
        if (!artigo) return;
        setEditandoId(artigo.id);
        setIcecat({
          icecatId: 0,
          titulo: artigo.titulo,
          marca: artigo.marca,
          categoria: artigo.categoria,
          gtin: artigo.gtin || '',
          descricaoLonga: artigo.descricaoCurta || '',
          descricaoCurta: artigo.descricaoCurta || '',
          bulletPoints: [],
          imagem: artigo.imagem,
          imagemMedia: artigo.imagem,
          gallery: artigo.gallery || [],
          marcaLogo: '',
          specs: artigo.specs || {},
        });
        setConteudo(artigo.conteudo || '');
        setOfertas(artigo.ofertas || []);
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
    if (!gtin && !nome) return;
    setBuscando(true);
    setIcecat(null);
    setConteudo('');
    setOfertas([]);
    try {
      const params = new URLSearchParams();
      if (gtin) params.set('gtin', gtin);
      else { params.set('nome', nome); params.set('marca', marca); }
      const res = await fetch(`/api/icecat?${params}`);
      const data = await res.json();
      if (data.error) { alert(data.error); return; }
      setIcecat(data);
      setImagemAtiva(0);
    } catch { alert('Erro ao buscar no Icecat'); }
    finally { setBuscando(false); }
  }

  async function handleGerarArtigo() {
    if (!icecat) return;
    setGerando(true);
    setConteudo('');
    try {
      const specsTexto = Object.values(icecat.specs)
        .map(g => `${g.grupo}: ${g.itens.map(i => `${i.nome}: ${i.valor}`).join(', ')}`)
        .join('\n');






           const res = await fetch('/api/produto-artigo-gera', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo: icecat.titulo,
          marca: icecat.marca,
          categoria: icecat.categoria,
          descricao: icecat.descricaoLonga,
          specs: icecat.specs,
        }),
      });
      const data = await res.json();
      setConteudo(data.conteudo || '');
    } catch { alert('Erro ao gerar artigo'); }
    finally { setGerando(false); }
  }

  function adicionarOferta() {
    if (!ofertaLoja || !ofertaPreco || !ofertaLink) return;
    setOfertas(prev => [...prev, { loja: ofertaLoja, preco: parseFloat(ofertaPreco), link: ofertaLink }]);
    setOfertaLoja(''); setOfertaPreco(''); setOfertaLink('');
  }

  async function handlePublicar() {
    if (!icecat || !conteudo) return;
    setSalvando(true);
    try {
      const slug = slugify(icecat.titulo);
        const artigo = {
        id: editandoId || Date.now().toString(),
        slug,
        titulo: icecat.titulo,
        marca: icecat.marca,
        categoria: icecat.categoria,
        gtin: icecat.gtin,
        imagem: icecat.gallery[imagemAtiva] || icecat.imagem,
        gallery: icecat.gallery,
        descricaoCurta: icecat.descricaoCurta,
        conteudo,
        specs: icecat.specs,
        ofertas,
        publicado: true,
        createdAt: new Date().toISOString(),
      };
      await fetch('/api/produtos-artigos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(artigo),
      });
      setMsg(`✅ Publicado! Acesse: /produto/${slug}`);
    } catch { alert('Erro ao publicar'); }
    finally { setSalvando(false); }
  }

  if (!auth) return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9fafb', fontFamily: 'system-ui' }}>
      <div style={{ backgroundColor: '#fff', borderRadius: '14px', padding: '40px', maxWidth: '380px', width: '100%', borderTop: '5px solid #2563eb' }}>
        <h1 style={{ fontSize: '1.3rem', fontWeight: 800, margin: '0 0 24px' }}>Criar Artigo de Produto</h1>
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
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>{editandoId ? '✏️ Editar Artigo' : '📦 Criar Artigo de Produto'}</h1>
            <p style={{ color: '#6b7280', fontSize: '0.88rem', margin: '4px 0 0' }}>{editandoId ? 'Edite o conteúdo e republique' : 'Busca dados técnicos no Icecat e gera artigo editorial com IA'}</p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <a href="/produto/gerenciar" style={{ backgroundColor: '#f3f4f6', color: '#374151', padding: '7px 14px', borderRadius: '6px', textDecoration: 'none', fontSize: '0.82rem', fontWeight: 600 }}>
              📋 Gerenciar artigos
            </a>
            <a href="/" style={{ backgroundColor: '#f3f4f6', color: '#374151', padding: '7px 14px', borderRadius: '6px', textDecoration: 'none', fontSize: '0.82rem', fontWeight: 600 }}>← Site</a>
          </div>
        </div>
      </header>

      {/* Busca */}
      <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '24px', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 16px' }}>1. Buscar produto no Icecat</h2>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '12px' }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '4px' }}>EAN / GTIN</label>
            <input value={gtin} onChange={e => setGtin(e.target.value)} placeholder="ex: 8806090562815"
              style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.9rem', boxSizing: 'border-box' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', padding: '0 8px', color: '#9ca3af', fontWeight: 600 }}>ou</div>
          <div style={{ flex: 2, minWidth: '200px' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '4px' }}>Nome do produto</label>
            <input value={nome} onChange={e => setNome(e.target.value)} placeholder="ex: RB34T674EB1"
              style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.9rem', boxSizing: 'border-box' }} />
          </div>
          <div style={{ flex: 1, minWidth: '140px' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '4px' }}>Marca</label>
            <input value={marca} onChange={e => setMarca(e.target.value)} placeholder="ex: Samsung"
              style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.9rem', boxSizing: 'border-box' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button onClick={handleBuscar} disabled={buscando || (!gtin && !nome)} style={{ padding: '9px 24px', borderRadius: '8px', border: 'none', backgroundColor: '#2563eb', color: '#fff', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
              {buscando ? '⏳ Buscando...' : '🔍 Buscar'}
            </button>
          </div>
        </div>
      </div>

      {/* Preview dos dados do Icecat */}
      {icecat && (
        <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '24px', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 16px' }}>2. Dados encontrados no Icecat</h2>

          <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '24px' }}>
            {/* Galeria */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ height: '240px', backgroundColor: '#f9fafb', borderRadius: '10px', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', padding: '12px' }}>
                <img src={icecat.gallery[imagemAtiva] || icecat.imagem} alt={icecat.titulo} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
              </div>
              {icecat.gallery.length > 1 && (
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {icecat.gallery.map((img, i) => (
                    <button key={i} onClick={() => setImagemAtiva(i)} style={{ width: '52px', height: '52px', borderRadius: '6px', border: `2px solid ${imagemAtiva === i ? '#2563eb' : '#e5e7eb'}`, backgroundColor: '#fff', cursor: 'pointer', padding: '3px', overflow: 'hidden' }}>
                      <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </button>
                  ))}
                </div>
              )}
              <p style={{ fontSize: '0.72rem', color: '#9ca3af', margin: 0 }}>Clique na imagem que será usada como principal</p>
            </div>

            {/* Dados */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                {icecat.marcaLogo && <img src={icecat.marcaLogo} alt={icecat.marca} style={{ height: '24px', objectFit: 'contain' }} />}
                <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>{icecat.marca}</span>
                <span style={{ fontSize: '0.7rem', color: '#9ca3af', backgroundColor: '#f3f4f6', padding: '2px 8px', borderRadius: '20px' }}>{icecat.categoria}</span>
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 10px', color: '#111827' }}>{icecat.titulo}</h3>
              <p style={{ fontSize: '0.85rem', color: '#4b5563', lineHeight: 1.6, margin: '0 0 16px' }}>{icecat.descricaoLonga}</p>

              {/* Specs resumidas */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {Object.values(icecat.specs).slice(0, 4).map(grupo => (
                  <div key={grupo.grupo}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>{grupo.grupo}</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {grupo.itens.slice(0, 4).map((item, i) => (
                        <span key={i} style={{ fontSize: '0.72rem', backgroundColor: '#f3f4f6', color: '#374151', padding: '2px 8px', borderRadius: '20px' }}>
                          {item.nome}: <strong>{item.valor}</strong>
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Adicionar ofertas */}
          <div style={{ marginTop: '24px', borderTop: '1px solid #f3f4f6', paddingTop: '20px' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, margin: '0 0 12px' }}>Links de afiliado (opcional)</h3>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
              <input value={ofertaLoja} onChange={e => setOfertaLoja(e.target.value)} placeholder="Loja (ex: Brinox)" style={{ flex: 1, minWidth: '120px', padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '0.85rem', boxSizing: 'border-box' }} />
              <input value={ofertaPreco} onChange={e => setOfertaPreco(e.target.value)} placeholder="Preço (ex: 399.90)" type="number" style={{ width: '130px', padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '0.85rem' }} />
              <input value={ofertaLink} onChange={e => setOfertaLink(e.target.value)} placeholder="Link de afiliado" style={{ flex: 2, minWidth: '200px', padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '0.85rem', boxSizing: 'border-box' }} />
              <button onClick={adicionarOferta} style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', backgroundColor: '#047857', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>+ Adicionar</button>
            </div>
            {ofertas.map((o, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: '#374151', backgroundColor: '#f0fdf4', borderRadius: '6px', padding: '6px 10px', marginBottom: '4px' }}>
                <span>🏪 {o.loja}</span>
                <span style={{ color: '#dc2626', fontWeight: 700 }}>R$ {o.preco.toFixed(2).replace('.', ',')}</span>
                <span style={{ color: '#9ca3af', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{o.link}</span>
                <button onClick={() => setOfertas(prev => prev.filter((_, j) => j !== i))} style={{ border: 'none', backgroundColor: 'transparent', color: '#dc2626', cursor: 'pointer', fontWeight: 700 }}>✕</button>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '20px' }}>
            <button onClick={handleGerarArtigo} disabled={gerando} style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', backgroundColor: '#be185d', color: '#fff', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer' }}>
              {gerando ? '⏳ Gerando artigo...' : '✍️ Gerar artigo com IA'}
            </button>
          </div>
        </div>
      )}

      {/* Editor do artigo */}
      {conteudo && (
        <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '24px', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 16px' }}>3. Revisar e editar artigo</h2>
          <textarea
            value={conteudo}
            onChange={e => setConteudo(e.target.value)}
            style={{ width: '100%', minHeight: '400px', padding: '16px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.88rem', lineHeight: 1.7, fontFamily: 'system-ui', boxSizing: 'border-box', resize: 'vertical' }}
          />
          <div style={{ marginTop: '16px', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button onClick={handlePublicar} disabled={salvando} style={{ padding: '10px 28px', borderRadius: '8px', border: 'none', backgroundColor: '#2563eb', color: '#fff', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer' }}>
              {salvando ? '⏳ Publicando...' : '🚀 Publicar artigo'}
            </button>
            <button onClick={handleGerarArtigo} disabled={gerando} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #e5e7eb', backgroundColor: '#fff', color: '#374151', fontWeight: 600, cursor: 'pointer' }}>
              🔄 Regenerar
            </button>
            {msg && <span style={{ color: '#047857', fontWeight: 600, fontSize: '0.88rem' }}>{msg}</span>}
          </div>
        </div>
      )}

    </main>
  );
}

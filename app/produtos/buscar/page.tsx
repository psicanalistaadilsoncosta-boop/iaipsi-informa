'use client';

import { useState, useEffect } from 'react';

const DESTINOS = [
  { id: 'ofertas-selecionadas', label: '⭐ Ofertas Selecionadas', cor: '#2563eb' },
  { id: 'oferta-do-dia', label: '🔥 Oferta do Dia', cor: '#dc2626' },
  { id: 'parcelado', label: '💳 Parcelado sem Juros', cor: '#047857' },
  { id: 'mix', label: '📰 Entre Notícias', cor: '#7c3aed' },
];

interface Produto {
  id: string;
  nome: string;
  imagem: string;
  link: string;
  preco: number;
  precoOriginal: number;
  desconto: number;
  organizationId: string;
  estoque: number;
  loja?: string;
  skuId?: string;
  linkOriginal?: string;
  plataforma?: string;
  categoria?: string;
}

interface ProdutoPinado extends Produto {
  pinedAt: string;
  destinos: string[];
  parcelas?: string;
  valorParcela?: string;
  ativo?: boolean;
  categoria?: string;
  loja?: string;
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
    } catch { setError('Erro.'); }
    finally { setLoading(false); }
  }

  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9fafb', fontFamily: 'system-ui' }}>
      <div style={{ backgroundColor: '#fff', borderRadius: '14px', padding: '40px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', width: '100%', maxWidth: '380px', borderTop: '5px solid #2563eb' }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#111827', margin: '0 0 4px' }}>Curadoria de Produtos</h1>
        <p style={{ color: '#6b7280', fontSize: '0.9rem', margin: '0 0 28px' }}>Painel de gestão</p>
        <form onSubmit={handleSubmit}>
          <input type="password" placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)}
            style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.95rem', marginBottom: '12px', boxSizing: 'border-box' }} autoFocus />
          {error && <p style={{ color: '#dc2626', fontSize: '0.82rem', margin: '0 0 10px' }}>{error}</p>}
          <button type="submit" disabled={loading} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: 'none', backgroundColor: '#2563eb', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
            {loading ? 'Verificando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </main>
  );
}

function ModalDestinos({ produto, onConfirm, onCancel }: {
  produto: Produto;
  onConfirm: (destinos: string[], parcelas: string, valorParcela: string) => void;
  onCancel: () => void;
}) {
  const [destinos, setDestinos] = useState<string[]>(['selecionadas']);
  const [parcelas, setParcelas] = useState('');
  const [valorParcela, setValorParcela] = useState('');

  function toggle(id: string) {
    setDestinos(prev => prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]);
  }

  const temParcelado = destinos.includes('parcelado');

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
      <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '28px', maxWidth: '420px', width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#111827', margin: '0 0 6px' }}>Onde publicar?</h2>
        <p style={{ fontSize: '0.82rem', color: '#6b7280', margin: '0 0 20px', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {produto.nome}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
          {DESTINOS.map(d => (
            <label key={d.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '8px', border: `2px solid ${destinos.includes(d.id) ? d.cor : '#e5e7eb'}`, backgroundColor: destinos.includes(d.id) ? `${d.cor}10` : '#fff', cursor: 'pointer' }}>
              <input type="checkbox" checked={destinos.includes(d.id)} onChange={() => toggle(d.id)}
                style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: d.cor }} />
              <span style={{ fontWeight: 600, color: destinos.includes(d.id) ? d.cor : '#374151', fontSize: '0.9rem' }}>{d.label}</span>
            </label>
          ))}
        </div>
        {temParcelado && (
          <div style={{ backgroundColor: '#f0fdf4', borderRadius: '8px', padding: '14px', marginBottom: '16px', border: '1px solid #bbf7d0' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#047857', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              💳 Dados do parcelamento
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '0.72rem', color: '#6b7280', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Nº parcelas</label>
                <input value={parcelas} onChange={e => setParcelas(e.target.value)} placeholder="ex: 12"
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '0.88rem', boxSizing: 'border-box' }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '0.72rem', color: '#6b7280', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Valor (R$)</label>
                <input value={valorParcela} onChange={e => setValorParcela(e.target.value)} placeholder="ex: 216.67"
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '0.88rem', boxSizing: 'border-box' }} />
              </div>
            </div>
          </div>
        )}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={onCancel} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #e5e7eb', backgroundColor: '#fff', color: '#374151', fontWeight: 600, cursor: 'pointer' }}>
            Cancelar
          </button>
          <button onClick={() => onConfirm(destinos, parcelas, valorParcela)} disabled={destinos.length === 0}
            style={{ flex: 2, padding: '10px', borderRadius: '8px', border: 'none', backgroundColor: '#2563eb', color: '#fff', fontWeight: 700, cursor: destinos.length === 0 ? 'not-allowed' : 'pointer', opacity: destinos.length === 0 ? 0.6 : 1 }}>
            📌 Confirmar e pinar
          </button>
        </div>
      </div>
    </div>
  );
}

export default function BuscarProdutosPage() {
  const [auth, setAuth] = useState<boolean | null>(null);
  const [busca, setBusca] = useState('');
  const [precoMin, setPrecoMin] = useState('');
  const [precoMax, setPrecoMax] = useState('');
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [pinados, setPinados] = useState<ProdutoPinado[]>([]);
  const [loading, setLoading] = useState(false);
  const [gerando, setGerando] = useState<string | null>(null);
  const [aba, setAba] = useState<'buscar' | 'pinados'>('buscar');
  const [filtroDestino, setFiltroDestino] = useState('todos');
  const [pagina, setPagina] = useState(1);
  const [total, setTotal] = useState(0);
  const [excluirShopee, setExcluirShopee] = useState(true);
  const [modalProduto, setModalProduto] = useState<Produto | null>(null);
  const [destaqueHomeId, setDestaqueHomeId] = useState<string | null>(null);
  const [modoBusca, setModoBusca] = useState<'palavra' | 'link' | 'awin' | 'spicy' | 'loja'>('palavra');
  const [lojaAwin, setLojaAwin] = useState('arno');
  const [urlLoja, setUrlLoja] = useState('');
  const [buscandoLoja, setBuscandoLoja] = useState(false);
  const [linkLoja, setLinkLoja] = useState('');
  const [buscandoLink, setBuscandoLink] = useState(false);

  useEffect(() => {
    fetch('/api/editorial/auth/check').then(r => r.json()).then(d => setAuth(d.ok)).catch(() => setAuth(false));
  }, []);

  useEffect(() => {
    if (auth) {
      loadPinados();
      fetch('/api/produtos/save?tipo=destaque-home')
        .then(r => r.json())
        .then(d => setDestaqueHomeId(d.id || null));
    }
  }, [auth]);

   async function loadPinados() {
    try {
      const res = await fetch('/api/produtos/save');
      const json = await res.json();
      setPinados(Array.isArray(json) ? json : []);
    } catch { setPinados([]); }
  }

  async function handleBuscar(pag = 1) {
    if (!busca.trim()) return;
    setLoading(true);
    setPagina(pag);
    try {
      const params = new URLSearchParams({ tipo: 'products', q: busca, pagina: String(pag) });
      if (precoMin) params.set('priceMin', precoMin);
      if (precoMax) params.set('priceMax', precoMax);
      if (excluirShopee) params.set('excluirShopee', 'true');
      const res = await fetch(`/api/lomadee?${params}`);
      const json = await res.json();
      setProdutos(json.data || []);
      setTotal(json.total || 0);
    } finally { setLoading(false); }
  }

  async function handleBuscarLoja(q = '') {
    if (!urlLoja.trim()) return;
    setBuscandoLoja(true);
    setProdutos([]);
    try {
         // Busca o organizationId da loja no Lomadee pelo domínio
      let orgId = '';
      try {
        const brandsRes = await fetch('/api/lomadee?tipo=brands-categoria');
        const brandsJson = await brandsRes.json();
        const dominio = new URL(urlLoja).hostname.replace('www.', '');
        const marca = (brandsJson.data || []).find((m: any) =>
          m.site && m.site.replace('www.', '').replace('https://', '').includes(dominio)
        );
        orgId = marca?.id || '';
      } catch {}

      const params = new URLSearchParams({ url: urlLoja, limit: '50' });
      if (orgId) params.set('orgId', orgId);
      if (q) params.set('q', q);
      const res = await fetch(`/api/scrape?${params}`);
      const json = await res.json();
      if (json.error) { alert(`Erro: ${json.error}`); return; }
      setProdutos(json.data || []);
      setTotal(json.total || 0);
    } catch {
      alert('Erro ao buscar produtos da loja.');
    } finally { setBuscandoLoja(false); }
  }

   async function handleBuscarAwin(q = '', loja = 'arno') {
    setLoading(true);
    setProdutos([]);
    try {
      const params = new URLSearchParams({ limit: '400', loja });
      if (q) params.set('q', q);
      const res = await fetch(`/api/awin?${params}`);
      const json = await res.json();
      setProdutos(json.data || []);
      setTotal(json.total || 0);
    } catch {
      alert('Erro ao buscar produtos Arno.');
    } finally { setLoading(false); }
  }


  async function handleBuscarPorLink() {
    if (!linkLoja.trim()) return;
    setBuscandoLink(true);
    setProdutos([]);
    try {
      // Resolve o redirect e pega domínio + organizationId
      const resolveRes = await fetch('/api/resolve-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: linkLoja }),
      });
      const resolveData = await resolveRes.json();
      let orgId = resolveData.organizationId || '';

      // Se não achou no utm_campaign, busca pelo domínio nas marcas
      if (!orgId && resolveData.dominio) {
        const brandsRes = await fetch('/api/lomadee?tipo=brands-categoria');
        const brandsJson = await brandsRes.json();
        const marcas = brandsJson.data || [];
        const marca = marcas.find((m: any) =>
          m.site && (
            m.site.replace('www.', '').includes(resolveData.dominio) ||
            resolveData.dominio.includes(m.site.replace('www.', ''))
          )
        );
        orgId = marca?.id || '';
      }

      if (!orgId) {
        alert('Loja não identificada. Tente buscar por palavra-chave.');
        return;
      }

      const prodRes = await fetch(`/api/lomadee?tipo=products&orgId=${orgId}`);
      const prodJson = await prodRes.json();
      setProdutos(prodJson.data || []);
      setTotal(prodJson.total || 0);

      if ((prodJson.data || []).length === 0) {
        alert('Loja encontrada mas sem produtos na API. Tente buscar por palavra-chave.');
      }
    } catch {
      alert('Erro ao buscar produtos da loja.');
    } finally { setBuscandoLink(false); }
  }

    async function handleConfirmarPinar(produto: Produto, destinos: string[], parcelas: string, valorParcela: string) {
    setModalProduto(null);
    setGerando(produto.id);
    try {
      // Gera link de afiliado
      const shortRes = await fetch('/api/produtos/shorten', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: produto.link, organizationId: produto.organizationId }),
      });
      const shortData = await shortRes.json();
      const linkAfiliado = shortData.shortUrl || produto.link;

      // Se não tem parcelas e é VTEX, busca via simulação
      let parcelasFinal = parcelas;
      let valorParcelaFinal = valorParcela;

      if (!parcelasFinal && (produto as any).plataforma === 'vtex' && (produto as any).skuId) {
        try {
          const lojaUrl = new URL((produto as any).linkOriginal || produto.link).origin;
          const simRes = await fetch('/api/vtex-parcelas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ lojaUrl, skuId: (produto as any).skuId }),
          });
          const simData = await simRes.json();
          parcelasFinal = simData.parcelas || '';
          valorParcelaFinal = simData.valorParcela || '';
        } catch {}
      }

      await fetch('/api/produtos/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...produto,
          link: linkAfiliado,
          linkOriginal: produto.link,
          destinos,
          parcelas: parcelasFinal,
          valorParcela: valorParcelaFinal,
        }),
      });
      await loadPinados();
    } catch {
      alert('Erro ao pinar produto.');
    } finally { setGerando(null); }
  }

   async function handleAtualizarDestinos(pinado: ProdutoPinado, novosDestinos: string[]) {
    await fetch('/api/produtos/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...pinado, destinos: novosDestinos }),
    });
    await loadPinados();
  }

   async function handleDestacarHome(pinado: ProdutoPinado) {
    setGerando(pinado.id);
    try {
      // Gera frase editorial via IA
      const fraseRes = await fetch('/api/oferta-frase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: pinado.nome, categoria: pinado.categoria }),
      });
      const fraseData = await fraseRes.json();
      const fraseGerada = fraseData.frase || '';

      // Pede confirmação/edição
      const fraseEditada = window.prompt(
        '🔹 Frase editorial gerada pela IA — edite se quiser:',
        fraseGerada
      );
      if (fraseEditada === null) return; // cancelou

      // Salva destaque + frase no KV
      await fetch('/api/produtos/save', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: pinado.id, frase: fraseEditada }),
      });
      setDestaqueHomeId(pinado.id);
    } catch {
      alert('Erro ao gerar frase.');
    } finally {
      setGerando(null);
    }
  }

  async function handleAtivarOfertaDia(pinado: ProdutoPinado) {
    await fetch('/api/produtos/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...pinado, ativo: true }),
    });
    await loadPinados();
  }

  async function handleDespinar(id: string) {
    if (!confirm('Remover este produto?')) return;
    await fetch('/api/produtos/save', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    await loadPinados();
  }

  const isPinado = (id: string) => pinados.some(p => p.id === id);
  const pinadosFiltrados = filtroDestino === 'todos' ? pinados : pinados.filter(p => p.destinos?.includes(filtroDestino));

  if (auth === null) return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9fafb' }}>
      <p style={{ color: '#9ca3af', fontFamily: 'system-ui' }}>Verificando...</p>
    </main>
  );

  if (!auth) return <LoginScreen onLogin={() => setAuth(true)} />;

  return (
    <main style={{ maxWidth: '1060px', margin: '0 auto', padding: '30px 20px', fontFamily: 'system-ui, sans-serif', backgroundColor: '#f9fafb', minHeight: '100vh' }}>

      {modalProduto && (
        <ModalDestinos
          produto={modalProduto}
          onConfirm={(destinos, parcelas, valorParcela) => handleConfirmarPinar(modalProduto, destinos, parcelas, valorParcela)}
          onCancel={() => setModalProduto(null)}
        />
      )}

      <header style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', marginBottom: '24px', borderTop: '6px solid #2563eb' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#111827', margin: 0 }}>📌 Curadoria de Produtos</h1>
            <p style={{ color: '#6b7280', fontSize: '0.9rem', margin: '4px 0 0' }}>Busque, pine e escolha onde cada produto aparece</p>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {DESTINOS.map(d => (
              <a key={d.id} href={`/${d.id === 'mix' ? '' : d.id}`} target="_blank"
                style={{ backgroundColor: '#f3f4f6', color: '#374151', padding: '6px 12px', borderRadius: '6px', textDecoration: 'none', fontSize: '0.78rem', fontWeight: 600 }}>
                {d.label.split(' ')[0]} Ver
              </a>
            ))}
            <a href="/" style={{ backgroundColor: '#f3f4f6', color: '#374151', padding: '6px 12px', borderRadius: '6px', textDecoration: 'none', fontSize: '0.78rem', fontWeight: 600 }}>← Site</a>
          </div>
        </div>
      </header>

      {/* Abas principais */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        <button onClick={() => setAba('buscar')} style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', backgroundColor: aba === 'buscar' ? '#2563eb' : '#fff', color: aba === 'buscar' ? '#fff' : '#374151', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          🔍 Buscar produtos
        </button>
        <button onClick={() => setAba('pinados')} style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', backgroundColor: aba === 'pinados' ? '#2563eb' : '#fff', color: aba === 'pinados' ? '#fff' : '#374151', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          📌 Pinados ({pinados.length})
        </button>
      </div>

      {/* Aba buscar */}
      {aba === 'buscar' && (
        <div>
          {/* Toggle modo */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            <button onClick={() => setModoBusca('palavra')} style={{ padding: '7px 18px', borderRadius: '8px', border: 'none', backgroundColor: modoBusca === 'palavra' ? '#2563eb' : '#fff', color: modoBusca === 'palavra' ? '#fff' : '#374151', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
              🔍 Por palavra-chave
            </button>
                      <button onClick={() => setModoBusca('link')} style={{ padding: '7px 18px', borderRadius: '8px', border: 'none', backgroundColor: modoBusca === 'link' ? '#2563eb' : '#fff', color: modoBusca === 'link' ? '#fff' : '#374151', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
              🔗 Por link da loja
            </button>
            <button onClick={() => setModoBusca('loja')} style={{ padding: '7px 18px', borderRadius: '8px', border: 'none', backgroundColor: modoBusca === 'loja' ? '#be185d' : '#fff', color: modoBusca === 'loja' ? '#fff' : '#374151', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
              🌐 Por site da loja
            </button>
             <button onClick={() => { setModoBusca('awin'); setLojaAwin('arno'); handleBuscarAwin('', 'arno'); }} style={{ padding: '7px 18px', borderRadius: '8px', border: 'none', backgroundColor: modoBusca === 'awin' ? '#00AE98' : '#fff', color: modoBusca === 'awin' ? '#fff' : '#374151', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
              🏠 Arno (Awin)
            </button>
             <button onClick={() => { setModoBusca('spicy'); setLojaAwin('spicy'); handleBuscarAwin('', 'spicy'); }} style={{ padding: '7px 18px', borderRadius: '8px', border: 'none', backgroundColor: modoBusca === 'spicy' ? '#dc2626' : '#fff', color: modoBusca === 'spicy' ? '#fff' : '#374151', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
              🌶 Spicy (Awin)
            </button>
          </div>

          <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '20px', marginBottom: '20px' }}>

            {/* Busca por link */}
            {modoBusca === 'link' && (
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '8px' }}>
                  Cole o link de afiliado da loja
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input value={linkLoja} onChange={e => setLinkLoja(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleBuscarPorLink()}
                    placeholder="https://lmdee.link/... ou https://www.loja.com.br"
                    style={{ flex: 1, padding: '9px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.88rem', boxSizing: 'border-box' }} />
                  <button onClick={handleBuscarPorLink} disabled={buscandoLink || !linkLoja.trim()}
                    style={{ padding: '9px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#2563eb', color: '#fff', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                    {buscandoLink ? '⏳ Buscando...' : '🔍 Buscar loja'}
                  </button>
                </div>
                <p style={{ fontSize: '0.72rem', color: '#9ca3af', margin: '6px 0 0' }}>
                  O sistema identifica a loja e exibe seus produtos disponíveis.
                </p>
              </div>
            )}

            {/* Awin — Arno */}
                      {(modoBusca === 'awin' || modoBusca === 'spicy') && (
              <div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    placeholder="Filtrar por nome..."
                    onChange={e => handleBuscarAwin(e.target.value, lojaAwin)}
                    style={{ flex: 1, padding: '9px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.88rem', boxSizing: 'border-box' }} />
                </div>
                <p style={{ fontSize: '0.72rem', color: '#9ca3af', margin: '6px 0 0' }}>
                  Produtos da Arno via Awin — links de afiliado já inclusos.
                </p>
              </div>
            )}

            {/* Busca por site — VTEX/Shopify */}
            {modoBusca === 'loja' && (
              <div>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <input value={urlLoja} onChange={e => setUrlLoja(e.target.value)}
                    placeholder="https://www.vivavinho.com.br"
                    style={{ flex: 1, padding: '9px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.88rem', boxSizing: 'border-box' }} />
                  <button onClick={() => handleBuscarLoja()} disabled={buscandoLoja || !urlLoja.trim()}
                    style={{ padding: '9px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#be185d', color: '#fff', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                    {buscandoLoja ? '⏳' : '🔍 Buscar'}
                  </button>
                </div>
                <input placeholder="Filtrar por nome (ex: malbec, ventilador...)"
                  onChange={e => handleBuscarLoja(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.85rem', boxSizing: 'border-box' }} />
                <p style={{ fontSize: '0.72rem', color: '#9ca3af', margin: '6px 0 0' }}>
                  Detecta automaticamente Shopify e VTEX (Vivavinho, Arno, etc.)
                </p>
              </div>
            )}

            {/* Busca por palavra */}
            {modoBusca === 'palavra' && (
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                <div style={{ flex: 2, minWidth: '200px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '4px' }}>Busca</label>
                  <input value={busca} onChange={e => setBusca(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleBuscar(1)}
                    placeholder="ex: smartwatch, notebook, vinho..."
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.9rem', boxSizing: 'border-box' }} />
                </div>
                <div style={{ flex: 1, minWidth: '120px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '4px' }}>Preço mín (R$)</label>
                  <input value={precoMin} onChange={e => setPrecoMin(e.target.value)} placeholder="ex: 100"
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.9rem', boxSizing: 'border-box' }} />
                </div>
                <div style={{ flex: 1, minWidth: '120px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '4px' }}>Preço máx (R$)</label>
                  <input value={precoMax} onChange={e => setPrecoMax(e.target.value)} placeholder="ex: 500"
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.9rem', boxSizing: 'border-box' }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 0' }}>
                  <input type="checkbox" id="excluirShopee" checked={excluirShopee}
                    onChange={e => setExcluirShopee(e.target.checked)}
                    style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
                  <label htmlFor="excluirShopee" style={{ fontSize: '0.85rem', fontWeight: 600, color: '#374151', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                    Excluir Shopee
                  </label>
                </div>
                <button onClick={() => handleBuscar(1)} disabled={loading || !busca.trim()} style={{ padding: '9px 24px', borderRadius: '8px', border: 'none', backgroundColor: '#2563eb', color: '#fff', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                  {loading ? '⏳' : '🔍 Buscar'}
                </button>
              </div>
            )}
          </div>

          {/* Resultados */}
          {(loading || buscandoLink) && (
            <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>⏳ Buscando produtos...</div>
          )}

          {!loading && !buscandoLink && produtos.length > 0 && (
            <>
              <div style={{ fontSize: '0.82rem', color: '#6b7280', marginBottom: '12px' }}>
                {total > 0 ? `${total.toLocaleString('pt-BR')} produtos encontrados — ` : ''} página {pagina}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                {produtos.map(p => (
                  <div key={p.id} style={{ backgroundColor: '#fff', borderRadius: '12px', border: `2px solid ${isPinado(p.id) ? '#047857' : '#e5e7eb'}`, overflow: 'hidden', boxShadow: '0 2px 6px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ height: '160px', backgroundColor: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px', position: 'relative' }}>
                      {p.imagem && <img src={p.imagem} alt={p.nome} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />}
                      {p.desconto > 0 && (
                        <span style={{ position: 'absolute', top: '8px', left: '8px', backgroundColor: '#dc2626', color: '#fff', fontSize: '0.7rem', fontWeight: 700, padding: '2px 6px', borderRadius: '4px' }}>
                          -{p.desconto}%
                        </span>
                      )}
                      {isPinado(p.id) && (
                        <span style={{ position: 'absolute', top: '8px', right: '8px', backgroundColor: '#047857', color: '#fff', fontSize: '0.7rem', fontWeight: 700, padding: '2px 6px', borderRadius: '4px' }}>
                          📌 Pinado
                        </span>
                      )}
                    </div>
                    <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', flexGrow: 1, gap: '6px' }}>
                      <h3 style={{ fontSize: '0.82rem', fontWeight: 600, color: '#111827', margin: 0, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {p.nome}
                      </h3>
                      <div style={{ fontSize: '0.7rem', color: p.loja === 'Shopee' ? '#ea580c' : '#047857', fontWeight: 600 }}>
                        🏪 {p.loja}
                      </div>
                      {p.estoque !== undefined && p.estoque <= 5 && (
                        <div style={{ fontSize: '0.72rem', color: p.estoque === 0 ? '#dc2626' : '#ea580c', fontWeight: 600 }}>
                          {p.estoque === 0 ? '⚠️ Esgotado' : `⚠️ Últimas ${p.estoque} unidades`}
                        </div>
                      )}
                      <div style={{ marginTop: 'auto' }}>
                        {p.precoOriginal > p.preco && (
                          <div style={{ fontSize: '0.72rem', color: '#9ca3af', textDecoration: 'line-through' }}>
                            R$ {p.precoOriginal.toFixed(2).replace('.', ',')}
                          </div>
                        )}
                        <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#dc2626' }}>
                          R$ {p.preco.toFixed(2).replace('.', ',')}
                        </div>
                      </div>
                      <a href={p.link} target="_blank" rel="noopener noreferrer"
                        style={{ display: 'block', padding: '6px', borderRadius: '6px', border: '1px solid #e5e7eb', backgroundColor: '#f9fafb', color: '#374151', fontWeight: 600, fontSize: '0.78rem', textAlign: 'center', textDecoration: 'none' }}>
                        🔗 Ver na loja
                      </a>
                      <button
                        onClick={() => !isPinado(p.id) && gerando !== p.id && setModalProduto(p)}
                        disabled={isPinado(p.id) || gerando === p.id}
                        style={{ width: '100%', padding: '7px', borderRadius: '6px', border: 'none', backgroundColor: isPinado(p.id) ? '#f0fdf4' : '#2563eb', color: isPinado(p.id) ? '#047857' : '#fff', fontWeight: 700, fontSize: '0.8rem', cursor: isPinado(p.id) ? 'default' : 'pointer' }}>
                        {gerando === p.id ? '⏳ Gerando link...' : isPinado(p.id) ? '✅ Já pinado' : '📌 Pinar produto'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              {modoBusca === 'palavra' && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                  <button onClick={() => handleBuscar(pagina - 1)} disabled={pagina === 1 || loading} style={{ padding: '8px 20px', borderRadius: '8px', border: '1px solid #e5e7eb', backgroundColor: '#fff', fontWeight: 600, cursor: 'pointer' }}>← Anterior</button>
                  <span style={{ padding: '8px 16px', color: '#6b7280', fontSize: '0.9rem' }}>Página {pagina}</span>
                  <button onClick={() => handleBuscar(pagina + 1)} disabled={produtos.length < 20 || loading} style={{ padding: '8px 20px', borderRadius: '8px', border: '1px solid #e5e7eb', backgroundColor: '#fff', fontWeight: 600, cursor: 'pointer' }}>Próxima →</button>
                </div>
              )}
            </>
          )}

          {!loading && !buscandoLink && produtos.length === 0 && (busca || linkLoja) && (
            <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280' }}>
              Nenhum produto encontrado. Tente outros termos.
            </div>
          )}
        </div>
      )}

      {/* Aba pinados */}
      {aba === 'pinados' && (
        <div>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <button onClick={() => setFiltroDestino('todos')} style={{ padding: '6px 14px', borderRadius: '999px', border: `2px solid ${filtroDestino === 'todos' ? '#2563eb' : '#e5e7eb'}`, backgroundColor: filtroDestino === 'todos' ? '#2563eb' : '#fff', color: filtroDestino === 'todos' ? '#fff' : '#374151', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer' }}>
              Todos ({pinados.length})
            </button>
            {DESTINOS.map(d => {
              const count = pinados.filter(p => p.destinos?.includes(d.id)).length;
              const isActive = filtroDestino === d.id;
              return (
                <button key={d.id} onClick={() => setFiltroDestino(d.id)} style={{ padding: '6px 14px', borderRadius: '999px', border: `2px solid ${isActive ? d.cor : '#e5e7eb'}`, backgroundColor: isActive ? d.cor : '#fff', color: isActive ? '#fff' : '#374151', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer' }}>
                  {d.label} ({count})
                </button>
              );
            })}
          </div>

          {pinadosFiltrados.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280' }}>
              {filtroDestino === 'todos' ? 'Nenhum produto pinado ainda.' : `Nenhum produto em "${DESTINOS.find(d => d.id === filtroDestino)?.label}".`}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
              {pinadosFiltrados.map(p => (
                <div key={p.id} style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 2px 6px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ height: '140px', backgroundColor: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px' }}>
                    {p.imagem && <img src={p.imagem} alt={p.nome} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />}
                  </div>
                  <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', flexGrow: 1, gap: '8px' }}>
                    <h3 style={{ fontSize: '0.82rem', fontWeight: 600, color: '#111827', margin: 0, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {p.nome}
                    </h3>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: '#dc2626' }}>
                      R$ {p.preco.toFixed(2).replace('.', ',')}
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {DESTINOS.map(d => {
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
                    {p.parcelas && p.valorParcela && (
                      <div style={{ fontSize: '0.75rem', color: '#047857', fontWeight: 600 }}>
                        💳 {p.parcelas}x de R$ {parseFloat(p.valorParcela).toFixed(2).replace('.', ',')}
                      </div>
                    )}
                    <small style={{ color: '#9ca3af', fontSize: '0.7rem' }}>
                      Pinado em {new Date(p.pinedAt).toLocaleDateString('pt-BR')}
                    </small>
                                         {p.destinos?.includes('oferta-do-dia') && (
                      <button onClick={() => handleAtivarOfertaDia(p)} style={{ padding: '6px', borderRadius: '6px', border: 'none', backgroundColor: p.ativo ? '#dc2626' : '#f3f4f6', color: p.ativo ? '#fff' : '#374151', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer', marginBottom: '4px', width: '100%' }}>
                        {p.ativo ? '🔥 Ativa agora' : '🔥 Ativar como Oferta do Dia'}
                      </button>
                    )}
                    {p.destinos?.includes('oferta-do-dia') && (
                    <button onClick={() => handleDestacarHome(p)} style={{ padding: '6px', borderRadius: '6px', border: 'none', backgroundColor: destaqueHomeId === p.id ? '#b45309' : '#f3f4f6', color: destaqueHomeId === p.id ? '#fff' : '#374151', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer', marginBottom: '4px', width: '100%' }}>
                        {destaqueHomeId === p.id ? '⭐ Destacado na Home' : '⭐ Destacar na Home'}
                      </button>
                    )}
                    <button onClick={() => handleDespinar(p.id)} style={{ padding: '6px', borderRadius: '6px', border: '1px solid #fca5a5', backgroundColor: '#fff', color: '#dc2626', fontWeight: 600, fontSize: '0.78rem', cursor: 'pointer' }}>
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

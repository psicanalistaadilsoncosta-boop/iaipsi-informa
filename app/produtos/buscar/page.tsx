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

interface LojaLomadee {
  tipo: 'lomadee';
  nome: string;
  url: string;
}

interface LojaAwin {
  tipo: 'awin';
  nome: string;
  url: string;
  anuncianteId: string;
  moedaUSD?: boolean;
}

type Loja = LojaLomadee | LojaAwin;

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
  const [destinos, setDestinos] = useState<string[]>(['ofertas-selecionadas']);
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
  const [modoBusca, setModoBusca] = useState<'palavra' | 'link' | 'awin' | 'spicy' | 'loja' | 'loja-awin'>('palavra');
  const [urlLojaAwin, setUrlLojaAwin] = useState('');
  const [awinAnunciante, setAwinAnunciante] = useState('');
  const [lojaAwin, setLojaAwin] = useState('arno');
  const [urlLoja, setUrlLoja] = useState('');
  const [buscandoLoja, setBuscandoLoja] = useState(false);
  const [linkLoja, setLinkLoja] = useState('');
  const [buscandoLink, setBuscandoLink] = useState(false);

  // Lojas do KV
  const [lojasKV, setLojasKV] = useState<Loja[]>([]);
  const [lojaLomadeeSelect, setLojaLomadeeSelect] = useState('');
  const [lojaAwinSelect, setLojaAwinSelect] = useState('');

  // Seleção em massa
  const [modoSelecao, setModoSelecao] = useState(false);
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set());
  const [modalMassa, setModalMassa] = useState<'pinar' | 'substituir' | null>(null);
  const [pinandoMassa, setPinandoMassa] = useState(false);
  const [substituindo, setSubstituindo] = useState(false);

  const lojasLomadee = lojasKV.filter(l => l.tipo === 'lomadee') as LojaLomadee[];
  const lojasAwin = lojasKV.filter(l => l.tipo === 'awin') as LojaAwin[];

  // URL da loja atualmente buscada (para substituição)
  const lojaAtualUrl = modoBusca === 'loja' ? urlLoja : modoBusca === 'loja-awin' ? urlLojaAwin : '';

  useEffect(() => {
    fetch('/api/editorial/auth/check').then(r => r.json()).then(d => setAuth(d.ok)).catch(() => setAuth(false));
  }, []);

  useEffect(() => {
    if (auth) {
      loadPinados();
      fetch('/api/produtos/save?tipo=destaque-home')
        .then(r => r.json())
        .then(d => setDestaqueHomeId(d.id || null));
      fetch('/api/produtos/lojas')
        .then(r => r.json())
        .then(d => { if (Array.isArray(d)) setLojasKV(d); })
        .catch(() => {});
    }
  }, [auth]);

  useEffect(() => {
    if (lojaLomadeeSelect) setUrlLoja(lojaLomadeeSelect);
  }, [lojaLomadeeSelect]);

  useEffect(() => {
    if (lojaAwinSelect) {
      const loja = lojasAwin.find(l => l.url === lojaAwinSelect);
      if (loja) {
        setUrlLojaAwin(loja.url);
        setAwinAnunciante(loja.anuncianteId);
      }
    }
  }, [lojaAwinSelect, lojasAwin]);

  // Resetar seleção ao mudar de busca
  useEffect(() => {
    setSelecionados(new Set());
    setModoSelecao(false);
  }, [produtos]);

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

  async function handleBuscarLojaAwin() {
    if (!urlLojaAwin.trim()) return;
    setBuscandoLoja(true);
    setProdutos([]);
    try {
      const params = new URLSearchParams({ url: urlLojaAwin, limit: '150', orgId: awinAnunciante });
      const res = await fetch(`/api/scrape?${params}`);
      const json = await res.json();
      if (json.error) { alert(`Erro: ${json.error}`); return; }
      setProdutos(json.data || []);
      setTotal(json.total || 0);
      if ((json.data || []).length === 0) alert('Nenhum produto encontrado. Tente outro URL.');
    } catch {
      alert('Erro ao buscar produtos.');
    } finally { setBuscandoLoja(false); }
  }

  async function handleBuscarLoja(q = '') {
    if (!urlLoja.trim()) return;
    setBuscandoLoja(true);
    setProdutos([]);
    try {
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

      const params = new URLSearchParams({ url: urlLoja, limit: '150' });
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
      const params = new URLSearchParams({ limit: '150', loja });
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
      const resolveRes = await fetch('/api/resolve-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: linkLoja }),
      });
      const resolveData = await resolveRes.json();
      let orgId = resolveData.organizationId || '';

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
      const shortRes = await fetch('/api/produtos/shorten', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: produto.link, organizationId: produto.organizationId }),
      });
      const shortData = await shortRes.json();
      const linkAfiliado = shortData.shortUrl || produto.link;

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

  // Pinar em massa (sem substituir)
  async function handlePinarMassa(destinos: string[], parcelas: string, valorParcela: string) {
    setModalMassa(null);
    setPinandoMassa(true);
    const lista = produtos.filter(p => selecionados.has(p.id) && !isPinado(p.id));
    let ok = 0;
    for (const produto of lista) {
      try {
        const shortRes = await fetch('/api/produtos/shorten', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: produto.link, organizationId: produto.organizationId }),
        });
        const shortData = await shortRes.json();
        const linkAfiliado = shortData.shortUrl || produto.link;
        await fetch('/api/produtos/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...produto,
            link: linkAfiliado,
            linkOriginal: produto.link,
            destinos,
            parcelas,
            valorParcela,
          }),
        });
        ok++;
      } catch {}
    }
    await loadPinados();
    setSelecionados(new Set());
    setModoSelecao(false);
    setPinandoMassa(false);
    if (ok > 0) alert(`✅ ${ok} produto${ok > 1 ? 's' : ''} pinado${ok > 1 ? 's' : ''}!`);
  }

  // Substituir produtos da loja: remove todos os pinados da loja, pina os selecionados
  async function handleSubstituirLoja(destinos: string[], parcelas: string, valorParcela: string) {
    setModalMassa(null);
    setSubstituindo(true);
    try {
      // Identifica pinados da loja atual pelo campo loja ou pelo domínio
      const dominioAtual = lojaAtualUrl ? new URL(lojaAtualUrl).hostname.replace('www.', '') : '';
      const pinadosDaLoja = pinados.filter(p => {
        if (!dominioAtual) return false;
        const lojaField = p.loja || '';
        const link = p.linkOriginal || p.link || '';
        try {
          const d = new URL(link).hostname.replace('www.', '');
          return d === dominioAtual || lojaField.toLowerCase().includes(dominioAtual.split('.')[0]);
        } catch { return false; }
      });

      // Remove todos os pinados dessa loja
      for (const p of pinadosDaLoja) {
        await fetch('/api/produtos/save', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: p.id }),
        });
      }

      // Pina os selecionados
      const lista = produtos.filter(p => selecionados.has(p.id));
      for (const produto of lista) {
        try {
          const shortRes = await fetch('/api/produtos/shorten', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: produto.link, organizationId: produto.organizationId }),
          });
          const shortData = await shortRes.json();
          const linkAfiliado = shortData.shortUrl || produto.link;
          await fetch('/api/produtos/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...produto,
              link: linkAfiliado,
              linkOriginal: produto.link,
              destinos,
              parcelas,
              valorParcela,
            }),
          });
        } catch {}
      }

      await loadPinados();
      setSelecionados(new Set());
      setModoSelecao(false);
      alert(`✅ Substituição concluída! ${pinadosDaLoja.length} removidos, ${lista.length} pinados.`);
    } catch {
      alert('Erro ao substituir produtos.');
    } finally { setSubstituindo(false); }
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
      const fraseRes = await fetch('/api/oferta-frase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: pinado.nome, categoria: pinado.categoria }),
      });
      const fraseData = await fraseRes.json();
      const fraseGerada = fraseData.frase || '';

      const fraseEditada = window.prompt(
        '🔹 Frase editorial gerada pela IA — edite se quiser:',
        fraseGerada
      );
      if (fraseEditada === null) return;

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

  function toggleSelecao(id: string) {
    setSelecionados(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  const isPinado = (id: string) => pinados.some(p => p.id === id);
  const pinadosFiltrados = filtroDestino === 'todos' ? pinados : pinados.filter(p => p.destinos?.includes(filtroDestino));
  const naoSelecionadosDaLoja = selecionados.size > 0;
  const produtosMassaFake: Produto = {
    id: '__massa__',
    nome: `${selecionados.size} produto${selecionados.size > 1 ? 's' : ''} selecionado${selecionados.size > 1 ? 's' : ''}`,
    imagem: '',
    link: '',
    preco: 0,
    precoOriginal: 0,
    desconto: 0,
    organizationId: '',
    estoque: 999,
  };

  if (auth === null) return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9fafb' }}>
      <p style={{ color: '#9ca3af', fontFamily: 'system-ui' }}>Verificando...</p>
    </main>
  );

  if (!auth) return <LoginScreen onLogin={() => setAuth(true)} />;

  const selectStyle: React.CSSProperties = { width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.88rem', boxSizing: 'border-box', backgroundColor: '#fff' };
  const labelStyle: React.CSSProperties = { fontSize: '0.75rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '4px' };

  return (
    <main style={{ maxWidth: '1060px', margin: '0 auto', padding: '30px 20px', fontFamily: 'system-ui, sans-serif', backgroundColor: '#f9fafb', minHeight: '100vh' }}>

      {/* Modal pinar em massa */}
      {modalMassa && (
        <ModalDestinos
          produto={produtosMassaFake}
          onConfirm={(destinos, parcelas, valorParcela) => {
            if (modalMassa === 'substituir') {
              handleSubstituirLoja(destinos, parcelas, valorParcela);
            } else {
              handlePinarMassa(destinos, parcelas, valorParcela);
            }
          }}
          onCancel={() => setModalMassa(null)}
        />
      )}

      {/* Modal pinar produto individual */}
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
            <a href="/produtos/cadastra-lojas" style={{ backgroundColor: '#7c3aed', color: '#fff', padding: '6px 12px', borderRadius: '6px', textDecoration: 'none', fontSize: '0.78rem', fontWeight: 600 }}>
              🏪 Lojas
            </a>
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
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <button onClick={() => setModoBusca('palavra')} style={{ padding: '7px 18px', borderRadius: '8px', border: 'none', backgroundColor: modoBusca === 'palavra' ? '#2563eb' : '#fff', color: modoBusca === 'palavra' ? '#fff' : '#374151', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
              🔍 Por palavra-chave
            </button>
            <button onClick={() => setModoBusca('link')} style={{ padding: '7px 18px', borderRadius: '8px', border: 'none', backgroundColor: modoBusca === 'link' ? '#2563eb' : '#fff', color: modoBusca === 'link' ? '#fff' : '#374151', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
              🔗 Por link da loja
            </button>
            <button onClick={() => setModoBusca('loja')} style={{ padding: '7px 18px', borderRadius: '8px', border: 'none', backgroundColor: modoBusca === 'loja' ? '#be185d' : '#fff', color: modoBusca === 'loja' ? '#fff' : '#374151', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
              🌐 Por site (Lomadee)
            </button>
            <button onClick={() => setModoBusca('loja-awin')} style={{ padding: '7px 18px', borderRadius: '8px', border: 'none', backgroundColor: modoBusca === 'loja-awin' ? '#f59e0b' : '#fff', color: modoBusca === 'loja-awin' ? '#fff' : '#374151', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
              🏷 Por site (Awin)
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
                <label style={{ ...labelStyle, marginBottom: '8px' }}>
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

            {/* Awin — Arno / Spicy (acesso rápido) */}
            {(modoBusca === 'awin' || modoBusca === 'spicy') && (
              <div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    placeholder="Filtrar por nome..."
                    onChange={e => handleBuscarAwin(e.target.value, lojaAwin)}
                    style={{ flex: 1, padding: '9px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.88rem', boxSizing: 'border-box' }} />
                </div>
                <p style={{ fontSize: '0.72rem', color: '#9ca3af', margin: '6px 0 0' }}>
                  Produtos da {modoBusca === 'awin' ? 'Arno' : 'Spicy'} via Awin — links de afiliado já inclusos.
                </p>
              </div>
            )}

            {/* Busca por site — Lomadee */}
            {modoBusca === 'loja' && (
              <div>
                {lojasLomadee.length > 0 ? (
                  <div style={{ marginBottom: '10px' }}>
                    <label style={labelStyle}>Selecionar loja cadastrada</label>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                      <select
                        value={lojaLomadeeSelect}
                        onChange={e => setLojaLomadeeSelect(e.target.value)}
                        style={selectStyle}
                      >
                        <option value="">— Escolha uma loja —</option>
                        {lojasLomadee.map(l => (
                          <option key={l.url} value={l.url}>{l.nome} ({l.url.replace('https://','').replace('www.','').split('/')[0]})</option>
                        ))}
                      </select>
                      <button onClick={() => handleBuscarLoja()} disabled={buscandoLoja || !urlLoja.trim()}
                        style={{ padding: '9px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#be185d', color: '#fff', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                        {buscandoLoja ? '⏳' : '🔍 Buscar'}
                      </button>
                    </div>
                    <input placeholder="Filtrar por nome (ex: malbec, ventilador...)"
                      onChange={e => handleBuscarLoja(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.85rem', boxSizing: 'border-box' }} />
                  </div>
                ) : (
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
                  </div>
                )}
                <p style={{ fontSize: '0.72rem', color: '#9ca3af', margin: '6px 0 0' }}>
                  Detecta automaticamente Shopify, VTEX, Nuvemshop, MiBrasil…{' '}
                  {lojasLomadee.length === 0 && (
                    <a href="/produtos/cadastra-lojas" style={{ color: '#be185d', fontWeight: 600 }}>Cadastrar lojas</a>
                  )}
                </p>
              </div>
            )}

            {/* Busca por site Awin */}
            {modoBusca === 'loja-awin' && (
              <div>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                  <div style={{ flex: 2, minWidth: '200px' }}>
                    <label style={labelStyle}>Selecionar loja Awin</label>
                    {lojasAwin.length > 0 ? (
                      <select
                        value={lojaAwinSelect}
                        onChange={e => setLojaAwinSelect(e.target.value)}
                        style={selectStyle}
                      >
                        <option value="">— Escolha uma loja —</option>
                        {lojasAwin.map(l => (
                          <option key={l.url} value={l.url}>
                            {l.nome}{l.moedaUSD ? ' 💵' : ''} ({l.anuncianteId})
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input value={urlLojaAwin} onChange={e => setUrlLojaAwin(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleBuscarLojaAwin()}
                        placeholder="https://www.arno.com.br"
                        style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.88rem', boxSizing: 'border-box' }} />
                    )}
                  </div>
                  {lojasAwin.length === 0 && (
                    <div style={{ flex: 1, minWidth: '160px' }}>
                      <label style={labelStyle}>Anunciante Awin</label>
                      <select value={awinAnunciante} onChange={e => setAwinAnunciante(e.target.value)}
                        style={selectStyle}>
                        <option value="awin-arno">Arno (108626)</option>
                        <option value="awin-spicy">Spicy (30615)</option>
                        <option value="awin-italist">Italist (127855)</option>
                      </select>
                    </div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                    <button onClick={handleBuscarLojaAwin} disabled={buscandoLoja || (!urlLojaAwin.trim() && !lojaAwinSelect)}
                      style={{ padding: '9px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#f59e0b', color: '#fff', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                      {buscandoLoja ? '⏳' : '🔍 Buscar'}
                    </button>
                  </div>
                </div>
                {lojaAwinSelect && (() => {
                  const loja = lojasAwin.find(l => l.url === lojaAwinSelect);
                  return loja ? (
                    <div style={{ fontSize: '0.72rem', color: '#6b7280', marginBottom: '6px' }}>
                      URL: <code style={{ backgroundColor: '#f3f4f6', padding: '1px 4px', borderRadius: '3px' }}>{loja.url}</code>
                      {' · '}ID: <code style={{ backgroundColor: '#f3f4f6', padding: '1px 4px', borderRadius: '3px' }}>{loja.anuncianteId}</code>
                      {loja.moedaUSD && <span style={{ marginLeft: '6px', color: '#92400e', backgroundColor: '#fef3c7', padding: '1px 5px', borderRadius: '3px', fontWeight: 600 }}>💵 USD</span>}
                    </div>
                  ) : null;
                })()}
                <p style={{ fontSize: '0.72rem', color: '#9ca3af', margin: 0 }}>
                  Produtos com link de afiliado Awin gerado automaticamente.{' '}
                  {lojasAwin.length === 0 && (
                    <a href="/produtos/cadastra-lojas" style={{ color: '#f59e0b', fontWeight: 600 }}>Cadastrar lojas Awin</a>
                  )}
                </p>
              </div>
            )}

            {/* Busca por palavra */}
            {modoBusca === 'palavra' && (
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                <div style={{ flex: 2, minWidth: '200px' }}>
                  <label style={{ ...labelStyle, marginBottom: '4px' }}>Busca</label>
                  <input value={busca} onChange={e => setBusca(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleBuscar(1)}
                    placeholder="ex: smartwatch, notebook, vinho..."
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.9rem', boxSizing: 'border-box' }} />
                </div>
                <div style={{ flex: 1, minWidth: '120px' }}>
                  <label style={{ ...labelStyle, marginBottom: '4px' }}>Preço mín (R$)</label>
                  <input value={precoMin} onChange={e => setPrecoMin(e.target.value)} placeholder="ex: 100"
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.9rem', boxSizing: 'border-box' }} />
                </div>
                <div style={{ flex: 1, minWidth: '120px' }}>
                  <label style={{ ...labelStyle, marginBottom: '4px' }}>Preço máx (R$)</label>
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
          {(loading || buscandoLink || buscandoLoja) && (
            <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>⏳ Buscando produtos...</div>
          )}

          {!loading && !buscandoLink && !buscandoLoja && produtos.length > 0 && (
            <>
              {/* Toolbar de seleção em massa */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', flexWrap: 'wrap' }}>
                <div style={{ fontSize: '0.82rem', color: '#6b7280', flex: 1 }}>
                  {total > 0 ? `${total.toLocaleString('pt-BR')} produtos — ` : ''} página {pagina}
                </div>
                {!modoSelecao ? (
                  <button
                    onClick={() => { setModoSelecao(true); setSelecionados(new Set()); }}
                    style={{ padding: '6px 14px', borderRadius: '8px', border: '1px solid #d1d5db', backgroundColor: '#fff', color: '#374151', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}>
                    ☑️ Selecionar em massa
                  </button>
                ) : (
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.82rem', color: '#374151', fontWeight: 700 }}>
                      {selecionados.size} selecionado{selecionados.size !== 1 ? 's' : ''}
                    </span>
                    <button
                      onClick={() => setSelecionados(new Set(produtos.filter(p => !isPinado(p.id)).map(p => p.id)))}
                      style={{ padding: '5px 12px', borderRadius: '6px', border: '1px solid #d1d5db', backgroundColor: '#fff', color: '#374151', fontWeight: 600, fontSize: '0.78rem', cursor: 'pointer' }}>
                      Selecionar todos
                    </button>
                    <button
                      onClick={() => setSelecionados(new Set())}
                      style={{ padding: '5px 12px', borderRadius: '6px', border: '1px solid #d1d5db', backgroundColor: '#fff', color: '#374151', fontWeight: 600, fontSize: '0.78rem', cursor: 'pointer' }}>
                      Limpar
                    </button>
                    <button
                      onClick={() => { setModoSelecao(false); setSelecionados(new Set()); }}
                      style={{ padding: '5px 12px', borderRadius: '6px', border: '1px solid #d1d5db', backgroundColor: '#fff', color: '#6b7280', fontWeight: 600, fontSize: '0.78rem', cursor: 'pointer' }}>
                      Cancelar
                    </button>
                    {selecionados.size > 0 && (
                      <>
                        <button
                          onClick={() => setModalMassa('pinar')}
                          disabled={pinandoMassa || substituindo}
                          style={{ padding: '6px 14px', borderRadius: '8px', border: 'none', backgroundColor: '#2563eb', color: '#fff', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}>
                          {pinandoMassa ? '⏳ Pinando...' : `📌 Pinar ${selecionados.size}`}
                        </button>
                        {lojaAtualUrl && (
                          <button
                            onClick={() => setModalMassa('substituir')}
                            disabled={pinandoMassa || substituindo}
                            style={{ padding: '6px 14px', borderRadius: '8px', border: 'none', backgroundColor: '#ea580c', color: '#fff', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}>
                            {substituindo ? '⏳ Substituindo...' : `🔄 Substituir produtos desta loja`}
                          </button>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                {produtos.map(p => {
                  const pinado = isPinado(p.id);
                  const sel = selecionados.has(p.id);
                  return (
                    <div
                      key={p.id}
                      onClick={() => modoSelecao && !pinado && toggleSelecao(p.id)}
                      style={{
                        backgroundColor: '#fff',
                        borderRadius: '12px',
                        border: `2px solid ${pinado ? '#047857' : sel ? '#2563eb' : '#e5e7eb'}`,
                        overflow: 'hidden',
                        boxShadow: sel ? '0 0 0 3px #2563eb30' : '0 2px 6px rgba(0,0,0,0.04)',
                        display: 'flex',
                        flexDirection: 'column',
                        cursor: modoSelecao && !pinado ? 'pointer' : 'default',
                        opacity: modoSelecao && pinado ? 0.6 : 1,
                      }}>
                      <div style={{ height: '160px', backgroundColor: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px', position: 'relative' }}>
                        {p.imagem && <img src={p.imagem} alt={p.nome} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />}
                        {p.desconto > 0 && (
                          <span style={{ position: 'absolute', top: '8px', left: '8px', backgroundColor: '#dc2626', color: '#fff', fontSize: '0.7rem', fontWeight: 700, padding: '2px 6px', borderRadius: '4px' }}>
                            -{p.desconto}%
                          </span>
                        )}
                        {/* Badge selecionar / pinado */}
                        {modoSelecao && !pinado && (
                          <span style={{ position: 'absolute', top: '8px', right: '8px', width: '22px', height: '22px', borderRadius: '50%', border: `2px solid ${sel ? '#2563eb' : '#d1d5db'}`, backgroundColor: sel ? '#2563eb' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', color: '#fff', fontWeight: 700 }}>
                            {sel ? '✓' : ''}
                          </span>
                        )}
                        {pinado && (
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
                        {(p as any).moedaOriginal === 'USD' && (
                          <div style={{ fontSize: '0.68rem', color: '#92400e', fontWeight: 600, backgroundColor: '#fef3c7', padding: '2px 6px', borderRadius: '4px' }}>
                            💵 Preço convertido de USD para R$ · cotação do dia: R$ {((p as any).cotacaoUsada || 5.7).toFixed(2).replace('.', ',')}
                          </div>
                        )}
                        {(p as any).ean && (
                          <div style={{ fontSize: '0.68rem', color: '#9ca3af', fontWeight: 500 }}>
                            EAN: {(p as any).ean}
                          </div>
                        )}
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
                        {!modoSelecao && (
                          <>
                            <a href={p.link} target="_blank" rel="noopener noreferrer"
                              style={{ display: 'block', padding: '6px', borderRadius: '6px', border: '1px solid #e5e7eb', backgroundColor: '#f9fafb', color: '#374151', fontWeight: 600, fontSize: '0.78rem', textAlign: 'center', textDecoration: 'none' }}>
                              🔗 Ver na loja
                            </a>
                            <button
                              onClick={() => !pinado && gerando !== p.id && setModalProduto(p)}
                              disabled={pinado || gerando === p.id}
                              style={{ width: '100%', padding: '7px', borderRadius: '6px', border: 'none', backgroundColor: pinado ? '#f0fdf4' : '#2563eb', color: pinado ? '#047857' : '#fff', fontWeight: 700, fontSize: '0.8rem', cursor: pinado ? 'default' : 'pointer' }}>
                              {gerando === p.id ? '⏳ Gerando link...' : pinado ? '✅ Já pinado' : '📌 Pinar produto'}
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
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

          {!loading && !buscandoLink && !buscandoLoja && produtos.length === 0 && (busca || linkLoja) && (
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
                      {p.loja && <span> · {p.loja}</span>}
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

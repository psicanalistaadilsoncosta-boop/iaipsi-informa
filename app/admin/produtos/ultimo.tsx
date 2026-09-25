'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

type Categoria = 'ambiente' | 'vistaSe' | 'beleza' | 'momento' | null;

interface Produto {
  id: string;
  nome: string;
  loja?: string;
  imagem?: string;
  foto?: string;
  thumbnail?: string;
  ambiente?: string;
  tipoAmbiente?: string;
  momento?: string;
  tipoMomento?: string;
  vistaSe?: boolean;
  tipoVistaSe?: string;
  beleza?: boolean;
}

const BADGE_COLORS: Record<string, string> = {
  ambiente: '#7c3aed',
  vistaSe: '#be185d',
  beleza: '#9d174d',
  momento: '#d97706',
};

const CATEGORIA_LABELS: Record<string, string> = {
  ambiente: 'Ambiente',
  vistaSe: 'Vista-se',
  beleza: 'Beleza',
  momento: 'Momento',
};

// Ambiente: primeiro nível = cômodo, segundo nível = tipo
const AMBIENTES = ['Sala', 'Quarto', 'Escritório', 'Cozinha', 'Banheiro', 'Área externa'];
const TIPOS_AMBIENTE = ['Iluminação', 'Climatização', 'Móveis', 'Decoração', 'Organização', 'Eletrônicos'];

const TIPOS_POR_CATEGORIA: Record<string, string[]> = {
  ambiente: AMBIENTES,
  vistaSe:  ['Roupas', 'Calçados', 'Acessórios', 'Infantil', 'Bebê'],
  momento:  ['Café da manhã', 'Vinho', 'Churrasco', 'Lareira', 'Domingo relaxado', 'Festa em Casa'],
  beleza:   ['Perfumes', 'Skincare', 'Maquiagem', 'Cabelos', 'Massagem', 'Solar', 'Cuidados'],
};

const MOVER_OPTIONS: { value: Categoria; label: string }[] = [
  { value: 'ambiente', label: 'Ambiente' },
  { value: 'vistaSe', label: 'Vista-se' },
  { value: 'beleza', label: 'Beleza' },
  { value: 'momento', label: 'Momento' },
];

const PAGE_SIZE = 50;

function getCategoria(p: Produto): Categoria {
  if (p.ambiente || p.tipoAmbiente) return 'ambiente';
  if (p.momento || p.tipoMomento) return 'momento';
  if (p.vistaSe) return 'vistaSe';
  if (p.beleza) return 'beleza';
  return null;
}

function getImageSrc(p: Produto): string {
  return p.imagem || p.foto || p.thumbnail || '';
}

export default function AdminProdutosPage() {
  const [authed, setAuthed] = useState(false);
  const [loginError, setLoginError] = useState('');

  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(false);

  const [busca, setBusca] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState<string>('todos');
  const [pagina, setPagina] = useState(1);

  const [savingId, setSavingId] = useState<string | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [subCategoria, setSubCategoria] = useState<Categoria>(null); // qual cat está expandida no submenu
  const [subAmbienteNome, setSubAmbienteNome] = useState<string | null>(null); // cômodo escolhido → mostra tipos
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set());
  const [movendoLote, setMovendoLote] = useState(false);
  const [loteSubCategoria, setLoteSubCategoria] = useState<Categoria>(null);
  const [loteAmbienteNome, setLoteAmbienteNome] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Checa cookie ao carregar
  useEffect(() => {
    fetch('/api/admin/produtos')
      .then(r => {
        if (r.ok) setAuthed(true);
        else setLoginError('Acesse primeiro /cadastra-lojas para fazer login.');
      })
      .catch(() => setLoginError('Erro ao verificar autenticação.'));
  }, []);

  const fetchProdutos = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/produtos');
      const data = await res.json();
      setProdutos(Array.isArray(data) ? data : []);
    } catch {
      setProdutos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authed) fetchProdutos();
  }, [authed, fetchProdutos]);

  // Filtragem (declarada cedo para uso nas funções abaixo)
  const produtosFiltradosBase = produtos.filter(p => {
    const matchBusca =
      !busca ||
      (p.nome || '').toLowerCase().includes(busca.toLowerCase()) ||
      (p.loja || '').toLowerCase().includes(busca.toLowerCase());
    const cat = getCategoria(p);
    const matchCat =
      filtroCategoria === 'todos' ||
      (filtroCategoria === 'sem-categoria' ? cat === null : cat === filtroCategoria);
    return matchBusca && matchCat;
  });
  const totalPaginasBase = Math.max(1, Math.ceil(produtosFiltradosBase.length / PAGE_SIZE));
  const paginaAtualBase = Math.min(pagina, totalPaginasBase);
  const produtosPagina = produtosFiltradosBase.slice((paginaAtualBase - 1) * PAGE_SIZE, paginaAtualBase * PAGE_SIZE);

  // Reset page on filter/search change
  useEffect(() => {
    setPagina(1);
    setSelecionados(new Set());
  }, [busca, filtroCategoria]);

  function toggleSelecionado(id: string) {
    setSelecionados(prev => {
      const novo = new Set(prev);
      if (novo.has(id)) novo.delete(id); else novo.add(id);
      return novo;
    });
  }

  function toggleTodosNaPagina() {
    const idsPagina = produtosPagina.map(p => p.id);
    const todosSelecionados = idsPagina.every(id => selecionados.has(id));
    setSelecionados(prev => {
      const novo = new Set(prev);
      if (todosSelecionados) idsPagina.forEach(id => novo.delete(id));
      else idsPagina.forEach(id => novo.add(id));
      return novo;
    });
  }

  async function moverLote(novaCategoria: Categoria, tipo?: string, nomeAmb?: string) {
    if (!novaCategoria || selecionados.size === 0) return;
    // Ambiente: passo 1 = escolher cômodo, passo 2 = escolher tipo
    if (novaCategoria === 'ambiente') {
      if (!nomeAmb) { setLoteSubCategoria('ambiente'); setLoteAmbienteNome(null); return; }
      if (!tipo) { setLoteAmbienteNome(nomeAmb); return; }
    } else if (TIPOS_POR_CATEGORIA[novaCategoria].length > 0 && !tipo) {
      setLoteSubCategoria(novaCategoria);
      return;
    }
    setMovendoLote(true);
    setLoteSubCategoria(null);
    setLoteAmbienteNome(null);

    setProdutos(prev => prev.map(p => !selecionados.has(p.id) ? p : aplicarCategoria(p, novaCategoria, tipo, nomeAmb)));

    try {
      await Promise.all([...selecionados].map(id =>
        fetch('/api/admin/produtos', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, categoria: novaCategoria, nomeAmbiente: nomeAmb, tipoAmbiente: tipo, tipoMomento: tipo, tipoVistaSe: tipo, tipoBeleza: tipo }),
        })
      ));
      setSelecionados(new Set());
    } catch {
      await fetchProdutos();
    } finally {
      setMovendoLote(false);
    }
  }

  function aplicarCategoria(p: Produto, novaCategoria: Categoria, tipo?: string, nomeAmb?: string) {
    const novo = { ...p };
    delete novo.ambiente; delete novo.tipoAmbiente;
    delete novo.momento; delete novo.tipoMomento;
    delete novo.vistaSe; delete novo.tipoVistaSe;
    delete novo.beleza; delete (novo as any).tipoBeleza;
    if (novaCategoria === 'ambiente') {
      novo.ambiente = nomeAmb || 'Sala';
      novo.tipoAmbiente = tipo || 'Organização';
    }
    else if (novaCategoria === 'momento') { novo.momento = tipo || 'Café da manhã'; novo.tipoMomento = 'Acessórios'; }
    else if (novaCategoria === 'vistaSe') { novo.vistaSe = true; novo.tipoVistaSe = tipo || 'Roupas'; }
    else if (novaCategoria === 'beleza') { novo.beleza = true; (novo as any).tipoBeleza = tipo || 'Cuidados'; }
    return novo;
  }

  async function moverCategoria(produto: Produto, novaCategoria: Categoria, tipo?: string, nomeAmb?: string) {
    if (!novaCategoria) return;
    // Ambiente: passo 1 = escolher cômodo, passo 2 = escolher tipo
    if (novaCategoria === 'ambiente') {
      if (!nomeAmb) { setSubCategoria('ambiente'); setSubAmbienteNome(null); return; }
      if (!tipo) { setSubAmbienteNome(nomeAmb); return; }
    } else if (TIPOS_POR_CATEGORIA[novaCategoria].length > 0 && !tipo) {
      setSubCategoria(novaCategoria);
      return;
    }
    setSavingId(produto.id);
    setOpenDropdown(null);
    setSubCategoria(null);
    setSubAmbienteNome(null);

    setProdutos(prev => prev.map(p => p.id !== produto.id ? p : aplicarCategoria(p, novaCategoria, tipo, nomeAmb)));

    try {
      await fetch('/api/admin/produtos', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: produto.id, categoria: novaCategoria, nomeAmbiente: nomeAmb, tipoAmbiente: tipo, tipoMomento: tipo, tipoVistaSe: tipo, tipoBeleza: tipo }),
      });
    } catch {
      await fetchProdutos();
    } finally {
      setSavingId(null);
    }
  }

  const produtosFiltrados = produtosFiltradosBase;
  const totalPaginas = totalPaginasBase;
  const paginaAtual = paginaAtualBase;

  // ---------- NÃO AUTENTICADO ----------
  if (!authed) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#f9fafb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}>
        <div style={{
          background: '#fff',
          borderRadius: 12,
          boxShadow: '0 2px 16px rgba(0,0,0,0.08)',
          padding: '40px 36px',
          width: 340,
          textAlign: 'center',
        }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12, color: '#111' }}>
            Admin — Produtos
          </h1>
          {loginError ? (
            <>
              <p style={{ color: '#dc2626', fontSize: 14, marginBottom: 20 }}>{loginError}</p>
              <a href="/cadastra-lojas" style={{
                display: 'inline-block',
                padding: '10px 24px',
                background: '#7c3aed',
                color: '#fff',
                borderRadius: 8,
                fontWeight: 600,
                textDecoration: 'none',
                fontSize: 14,
              }}>Fazer login em Cadastro de Lojas</a>
            </>
          ) : (
            <p style={{ color: '#6b7280', fontSize: 14 }}>Verificando autenticação...</p>
          )}
        </div>
      </div>
    );
  }

  // ---------- PAINEL ----------
  return (
    <div style={{
      minHeight: '100vh',
      background: '#f9fafb',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '32px 24px',
    }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111', margin: 0 }}>
            Produtos
          </h1>
          <p style={{ color: '#6b7280', fontSize: 14, marginTop: 4 }}>
            {produtos.length} produtos carregados
          </p>
        </div>

        {/* Barra de seleção em lote */}
        {selecionados.size > 0 && (
          <div style={{
            background: '#111',
            color: '#fff',
            borderRadius: 10,
            padding: '12px 20px',
            marginBottom: 12,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 14, fontWeight: 600 }}>{selecionados.size} selecionado{selecionados.size !== 1 ? 's' : ''}</span>
              <span style={{ color: '#9ca3af', fontSize: 13 }}>Mover para:</span>
              {MOVER_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => moverLote(opt.value)}
                  disabled={movendoLote}
                  style={{
                    padding: '5px 14px',
                    borderRadius: 7,
                    border: loteSubCategoria === opt.value ? '2px solid #fff' : 'none',
                    background: BADGE_COLORS[opt.value!],
                    color: '#fff',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: movendoLote ? 'not-allowed' : 'pointer',
                    opacity: movendoLote ? 0.6 : 1,
                  }}
                >
                  {opt.label} {TIPOS_POR_CATEGORIA[opt.value!].length > 0 ? '▾' : ''}
                </button>
              ))}
              <button
                onClick={() => { setSelecionados(new Set()); setLoteSubCategoria(null); }}
                style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: 13 }}
              >
                Cancelar
              </button>
            </div>
            {/* Submenu lote: ambiente nível 2 — cômodos */}
            {loteSubCategoria === 'ambiente' && !loteAmbienteNome && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10, paddingTop: 10, borderTop: '1px solid #333' }}>
                <span style={{ color: '#9ca3af', fontSize: 13, alignSelf: 'center' }}>Cômodo:</span>
                {AMBIENTES.map(amb => (
                  <button key={amb} onClick={() => moverLote('ambiente', undefined, amb)} disabled={movendoLote}
                    style={{ padding: '4px 12px', borderRadius: 6, border: '1px solid #444', background: '#222', color: '#fff', fontSize: 13, cursor: 'pointer' }}>
                    {amb}
                  </button>
                ))}
                <button onClick={() => setLoteSubCategoria(null)} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: 12 }}>✕</button>
              </div>
            )}

            {/* Submenu lote: ambiente nível 3 — tipo */}
            {loteSubCategoria === 'ambiente' && loteAmbienteNome && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10, paddingTop: 10, borderTop: '1px solid #333' }}>
                <span style={{ color: '#9ca3af', fontSize: 13, alignSelf: 'center' }}>{loteAmbienteNome} →</span>
                {TIPOS_AMBIENTE.map(tipo => (
                  <button key={tipo} onClick={() => moverLote('ambiente', tipo, loteAmbienteNome)} disabled={movendoLote}
                    style={{ padding: '4px 12px', borderRadius: 6, border: '1px solid #444', background: '#222', color: '#fff', fontSize: 13, cursor: 'pointer' }}>
                    {tipo}
                  </button>
                ))}
                <button onClick={() => setLoteAmbienteNome(null)} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: 12 }}>← voltar</button>
              </div>
            )}

            {/* Submenu lote: outros tipos (vistaSe, beleza, momento) */}
            {loteSubCategoria && loteSubCategoria !== 'ambiente' && TIPOS_POR_CATEGORIA[loteSubCategoria].length > 0 && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10, paddingTop: 10, borderTop: '1px solid #333' }}>
                <span style={{ color: '#9ca3af', fontSize: 13, alignSelf: 'center' }}>Tipo:</span>
                {TIPOS_POR_CATEGORIA[loteSubCategoria].map(tipo => (
                  <button key={tipo} onClick={() => moverLote(loteSubCategoria, tipo)} disabled={movendoLote}
                    style={{ padding: '4px 12px', borderRadius: 6, border: '1px solid #444', background: '#222', color: '#fff', fontSize: 13, cursor: 'pointer' }}>
                    {tipo}
                  </button>
                ))}
                <button onClick={() => setLoteSubCategoria(null)} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: 12 }}>✕</button>
              </div>
            )}
          </div>
        )}

        {/* Filtros */}
        <div style={{
          background: '#fff',
          borderRadius: 10,
          border: '1px solid #e5e7eb',
          padding: '16px 20px',
          marginBottom: 20,
          display: 'flex',
          gap: 12,
          alignItems: 'center',
          flexWrap: 'wrap',
        }}>
          <input
            type="text"
            placeholder="Buscar por nome ou loja..."
            value={busca}
            onChange={e => setBusca(e.target.value)}
            style={{
              padding: '8px 12px',
              border: '1.5px solid #e5e7eb',
              borderRadius: 7,
              fontSize: 14,
              flex: '1 1 220px',
              minWidth: 180,
              outline: 'none',
            }}
          />
          <select
            value={filtroCategoria}
            onChange={e => setFiltroCategoria(e.target.value)}
            style={{
              padding: '8px 12px',
              border: '1.5px solid #e5e7eb',
              borderRadius: 7,
              fontSize: 14,
              background: '#fff',
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            <option value="todos">Todas as categorias</option>
            <option value="ambiente">Ambiente</option>
            <option value="vistaSe">Vista-se</option>
            <option value="beleza">Beleza</option>
            <option value="momento">Momento</option>
            <option value="sem-categoria">Sem categoria</option>
          </select>
          <span style={{ fontSize: 13, color: '#9ca3af', whiteSpace: 'nowrap' }}>
            {produtosFiltrados.length} resultado{produtosFiltrados.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Lista */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#6b7280', fontSize: 15 }}>
            Carregando produtos...
          </div>
        ) : (
          <>
            <div style={{
              background: '#fff',
              borderRadius: 10,
              border: '1px solid #e5e7eb',
              overflow: 'hidden',
            }}>
              {/* Cabeçalho da tabela */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '32px 60px 1fr 160px 140px 120px',
                padding: '10px 16px',
                background: '#f3f4f6',
                borderBottom: '1px solid #e5e7eb',
                fontSize: 12,
                fontWeight: 600,
                color: '#6b7280',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                gap: 12,
                alignItems: 'center',
              }}>
                <input
                  type="checkbox"
                  checked={produtosPagina.length > 0 && produtosPagina.every(p => selecionados.has(p.id))}
                  onChange={toggleTodosNaPagina}
                  style={{ cursor: 'pointer', width: 15, height: 15 }}
                />
                <span>Img</span>
                <span>Nome</span>
                <span>Loja</span>
                <span>Categoria</span>
                <span>Ação</span>
              </div>

              {produtosPagina.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 48, color: '#9ca3af', fontSize: 14 }}>
                  Nenhum produto encontrado.
                </div>
              ) : (
                produtosPagina.map((produto, idx) => {
                  const cat = getCategoria(produto);
                  const isSaving = savingId === produto.id;
                  const isOpen = openDropdown === produto.id;
                  const imgSrc = getImageSrc(produto);

                  return (
                    <div
                      key={produto.id}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '32px 60px 1fr 160px 140px 120px',
                        padding: '10px 16px',
                        borderBottom: idx < produtosPagina.length - 1 ? '1px solid #f3f4f6' : 'none',
                        alignItems: 'center',
                        gap: 12,
                        background: selecionados.has(produto.id) ? '#f5f3ff' : isSaving ? '#fafafa' : '#fff',
                        transition: 'background 0.15s',
                      }}
                    >
                      {/* Checkbox */}
                      <input
                        type="checkbox"
                        checked={selecionados.has(produto.id)}
                        onChange={() => toggleSelecionado(produto.id)}
                        style={{ cursor: 'pointer', width: 15, height: 15 }}
                      />

                      {/* Imagem */}
                      <div style={{
                        width: 48,
                        height: 48,
                        borderRadius: 6,
                        overflow: 'hidden',
                        background: '#f3f4f6',
                        flexShrink: 0,
                      }}>
                        {imgSrc ? (
                          <img
                            src={imgSrc}
                            alt={produto.nome}
                            width={48}
                            height={48}
                            style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          />
                        ) : (
                          <div style={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 18,
                            color: '#d1d5db',
                          }}>
                            □
                          </div>
                        )}
                      </div>

                      {/* Nome */}
                      <span style={{
                        fontSize: 14,
                        color: '#111',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }} title={produto.nome}>
                        {produto.nome || '—'}
                      </span>

                      {/* Loja */}
                      <span style={{
                        fontSize: 13,
                        color: '#6b7280',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }} title={produto.loja}>
                        {produto.loja || '—'}
                      </span>

                      {/* Badge categoria */}
                      <div>
                        {cat ? (
                          <span style={{
                            display: 'inline-block',
                            padding: '3px 10px',
                            borderRadius: 20,
                            background: BADGE_COLORS[cat] + '18',
                            color: BADGE_COLORS[cat],
                            fontSize: 12,
                            fontWeight: 600,
                            border: `1px solid ${BADGE_COLORS[cat]}40`,
                          }}>
                            {CATEGORIA_LABELS[cat]}
                          </span>
                        ) : (
                          <span style={{
                            display: 'inline-block',
                            padding: '3px 10px',
                            borderRadius: 20,
                            background: '#f3f4f6',
                            color: '#9ca3af',
                            fontSize: 12,
                            fontWeight: 500,
                            border: '1px solid #e5e7eb',
                          }}>
                            Sem categoria
                          </span>
                        )}
                      </div>

                      {/* Botão mover */}
                      <div style={{ position: 'relative' }} ref={isOpen ? dropdownRef : undefined}>
                        <button
                          onClick={() => { setOpenDropdown(isOpen ? null : produto.id); setSubCategoria(null); }}
                          disabled={isSaving}
                          style={{
                            padding: '5px 12px',
                            borderRadius: 7,
                            border: '1.5px solid #e5e7eb',
                            background: '#fff',
                            fontSize: 13,
                            fontWeight: 500,
                            color: isSaving ? '#9ca3af' : '#374151',
                            cursor: isSaving ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 5,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {isSaving ? (
                            <>
                              <span style={{
                                display: 'inline-block',
                                width: 12,
                                height: 12,
                                border: '2px solid #e5e7eb',
                                borderTopColor: '#6b7280',
                                borderRadius: '50%',
                                animation: 'spin 0.7s linear infinite',
                              }} />
                              Salvando
                            </>
                          ) : (
                            <>Mover para <span style={{ fontSize: 10 }}>▾</span></>
                          )}
                        </button>

                        {isOpen && (
                          <div style={{
                            position: 'absolute',
                            right: 0,
                            top: 'calc(100% + 4px)',
                            background: '#fff',
                            border: '1.5px solid #e5e7eb',
                            borderRadius: 9,
                            boxShadow: '0 4px 20px rgba(0,0,0,0.10)',
                            zIndex: 100,
                            minWidth: 180,
                            overflow: 'hidden',
                          }}>
                            {/* Nível 1: categorias */}
                            {!subCategoria && MOVER_OPTIONS.map(opt => (
                              <button
                                key={opt.value}
                                onClick={() => moverCategoria(produto, opt.value)}
                                style={{
                                  display: 'flex', alignItems: 'center', gap: 8,
                                  width: '100%', padding: '9px 14px',
                                  background: cat === opt.value ? '#f9fafb' : '#fff',
                                  border: 'none', borderBottom: '1px solid #f3f4f6',
                                  fontSize: 14, color: '#111', cursor: 'pointer', textAlign: 'left',
                                }}
                                onMouseEnter={e => (e.currentTarget.style.background = '#f3f4f6')}
                                onMouseLeave={e => (e.currentTarget.style.background = cat === opt.value ? '#f9fafb' : '#fff')}
                              >
                                <span style={{ width: 8, height: 8, borderRadius: '50%', background: BADGE_COLORS[opt.value!], flexShrink: 0 }} />
                                {opt.label}
                                {TIPOS_POR_CATEGORIA[opt.value!].length > 0 && <span style={{ marginLeft: 'auto', color: '#9ca3af', fontSize: 11 }}>▶</span>}
                              </button>
                            ))}

                            {/* Ambiente nível 2: cômodos */}
                            {subCategoria === 'ambiente' && !subAmbienteNome && (
                              <>
                                <button onClick={() => setSubCategoria(null)}
                                  style={{ display: 'flex', alignItems: 'center', gap: 6, width: '100%', padding: '8px 14px', background: '#f9fafb', border: 'none', borderBottom: '1px solid #e5e7eb', fontSize: 13, color: '#6b7280', cursor: 'pointer' }}>
                                  ← Ambiente
                                </button>
                                {AMBIENTES.map(amb => (
                                  <button key={amb} onClick={() => moverCategoria(produto, 'ambiente', undefined, amb)}
                                    style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '9px 14px', background: '#fff', border: 'none', borderBottom: '1px solid #f3f4f6', fontSize: 14, color: '#111', cursor: 'pointer', textAlign: 'left' }}
                                    onMouseEnter={e => (e.currentTarget.style.background = '#f3f4f6')}
                                    onMouseLeave={e => (e.currentTarget.style.background = '#fff')}>
                                    {amb} <span style={{ marginLeft: 'auto', color: '#9ca3af', fontSize: 11 }}>▶</span>
                                  </button>
                                ))}
                              </>
                            )}

                            {/* Ambiente nível 3: tipos */}
                            {subCategoria === 'ambiente' && subAmbienteNome && (
                              <>
                                <button onClick={() => setSubAmbienteNome(null)}
                                  style={{ display: 'flex', alignItems: 'center', gap: 6, width: '100%', padding: '8px 14px', background: '#f9fafb', border: 'none', borderBottom: '1px solid #e5e7eb', fontSize: 13, color: '#6b7280', cursor: 'pointer' }}>
                                  ← {subAmbienteNome}
                                </button>
                                {TIPOS_AMBIENTE.map(tipo => (
                                  <button key={tipo} onClick={() => moverCategoria(produto, 'ambiente', tipo, subAmbienteNome)}
                                    style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '9px 14px', background: '#fff', border: 'none', borderBottom: '1px solid #f3f4f6', fontSize: 14, color: '#111', cursor: 'pointer', textAlign: 'left' }}
                                    onMouseEnter={e => (e.currentTarget.style.background = '#f3f4f6')}
                                    onMouseLeave={e => (e.currentTarget.style.background = '#fff')}>
                                    {tipo}
                                  </button>
                                ))}
                              </>
                            )}

                            {/* Nível 2: tipos das outras categorias */}
                            {subCategoria && subCategoria !== 'ambiente' && (
                              <>
                                <button onClick={() => setSubCategoria(null)}
                                  style={{ display: 'flex', alignItems: 'center', gap: 6, width: '100%', padding: '8px 14px', background: '#f9fafb', border: 'none', borderBottom: '1px solid #e5e7eb', fontSize: 13, color: '#6b7280', cursor: 'pointer' }}>
                                  ← {CATEGORIA_LABELS[subCategoria]}
                                </button>
                                {TIPOS_POR_CATEGORIA[subCategoria].map(tipo => (
                                  <button key={tipo} onClick={() => moverCategoria(produto, subCategoria, tipo)}
                                    style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '9px 14px', background: '#fff', border: 'none', borderBottom: '1px solid #f3f4f6', fontSize: 14, color: '#111', cursor: 'pointer', textAlign: 'left' }}
                                    onMouseEnter={e => (e.currentTarget.style.background = '#f3f4f6')}
                                    onMouseLeave={e => (e.currentTarget.style.background = '#fff')}>
                                    {tipo}
                                  </button>
                                ))}
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Paginação */}
            {totalPaginas > 1 && (
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 8,
                marginTop: 24,
                flexWrap: 'wrap',
              }}>
                <button
                  onClick={() => setPagina(p => Math.max(1, p - 1))}
                  disabled={paginaAtual === 1}
                  style={paginaBtnStyle(false, paginaAtual === 1)}
                >
                  ← Anterior
                </button>

                {/* Páginas numeradas */}
                {getPaginasVisiveis(paginaAtual, totalPaginas).map((p, i) =>
                  p === '...' ? (
                    <span key={`dots-${i}`} style={{ color: '#9ca3af', padding: '0 4px' }}>…</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setPagina(p as number)}
                      style={paginaBtnStyle(p === paginaAtual, false)}
                    >
                      {p}
                    </button>
                  )
                )}

                <button
                  onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))}
                  disabled={paginaAtual === totalPaginas}
                  style={paginaBtnStyle(false, paginaAtual === totalPaginas)}
                >
                  Próxima →
                </button>
              </div>
            )}

            {/* Info paginação */}
            <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: 13, marginTop: 12 }}>
              Página {paginaAtual} de {totalPaginas} —{' '}
              mostrando {(paginaAtual - 1) * PAGE_SIZE + 1}–{Math.min(paginaAtual * PAGE_SIZE, produtosFiltrados.length)} de {produtosFiltrados.length}
            </p>
          </>
        )}
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

function paginaBtnStyle(active: boolean, disabled: boolean): React.CSSProperties {
  return {
    padding: '6px 12px',
    borderRadius: 7,
    border: active ? '1.5px solid #111' : '1.5px solid #e5e7eb',
    background: active ? '#111' : '#fff',
    color: active ? '#fff' : disabled ? '#d1d5db' : '#374151',
    fontSize: 13,
    fontWeight: active ? 600 : 400,
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.15s',
    minWidth: 36,
  };
}

function getPaginasVisiveis(atual: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | '...')[] = [];
  if (atual <= 4) {
    pages.push(1, 2, 3, 4, 5, '...', total);
  } else if (atual >= total - 3) {
    pages.push(1, '...', total - 4, total - 3, total - 2, total - 1, total);
  } else {
    pages.push(1, '...', atual - 1, atual, atual + 1, '...', total);
  }
  return pages;
}

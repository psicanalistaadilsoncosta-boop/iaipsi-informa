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
  const [senha, setSenha] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(false);

  const [busca, setBusca] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState<string>('todos');
  const [pagina, setPagina] = useState(1);

  const [savingId, setSavingId] = useState<string | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
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

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');
    try {
      const res = await fetch('/api/editorial/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senha }),
      });
      if (res.ok) {
        setAuthed(true);
      } else {
        setLoginError('Senha incorreta.');
      }
    } catch {
      setLoginError('Erro ao autenticar.');
    } finally {
      setLoginLoading(false);
    }
  }

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

  // Reset page on filter/search change
  useEffect(() => {
    setPagina(1);
  }, [busca, filtroCategoria]);

  async function moverCategoria(produto: Produto, novaCategoria: Categoria) {
    if (!novaCategoria) return;
    setSavingId(produto.id);
    setOpenDropdown(null);

    // Optimistic UI
    setProdutos(prev =>
      prev.map(p => {
        if (p.id !== produto.id) return p;
        const novo = { ...p };
        delete novo.ambiente; delete novo.tipoAmbiente;
        delete novo.momento; delete novo.tipoMomento;
        delete novo.vistaSe; delete novo.tipoVistaSe;
        delete novo.beleza;
        if (novaCategoria === 'ambiente') { novo.ambiente = 'Sala'; novo.tipoAmbiente = 'Decoração'; }
        else if (novaCategoria === 'momento') { novo.momento = 'Café da manhã'; novo.tipoMomento = 'Acessórios'; }
        else if (novaCategoria === 'vistaSe') { novo.vistaSe = true; novo.tipoVistaSe = 'Roupas'; }
        else if (novaCategoria === 'beleza') { novo.beleza = true; }
        return novo;
      })
    );

    try {
      await fetch('/api/admin/produtos', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: produto.id, categoria: novaCategoria }),
      });
    } catch {
      // Reverte se falhar
      await fetchProdutos();
    } finally {
      setSavingId(null);
    }
  }

  // Filtragem
  const produtosFiltrados = produtos.filter(p => {
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

  const totalPaginas = Math.max(1, Math.ceil(produtosFiltrados.length / PAGE_SIZE));
  const paginaAtual = Math.min(pagina, totalPaginas);
  const produtosPagina = produtosFiltrados.slice((paginaAtual - 1) * PAGE_SIZE, paginaAtual * PAGE_SIZE);

  // ---------- LOGIN ----------
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
        }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6, color: '#111' }}>
            Admin — Produtos
          </h1>
          <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 28 }}>
            Digite a senha para acessar.
          </p>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              placeholder="Senha"
              value={senha}
              onChange={e => setSenha(e.target.value)}
              autoFocus
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 8,
                border: '1.5px solid #e5e7eb',
                fontSize: 15,
                outline: 'none',
                boxSizing: 'border-box',
                marginBottom: 12,
              }}
            />
            {loginError && (
              <p style={{ color: '#dc2626', fontSize: 13, marginBottom: 10 }}>{loginError}</p>
            )}
            <button
              type="submit"
              disabled={loginLoading}
              style={{
                width: '100%',
                padding: '10px 0',
                background: '#111',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                fontSize: 15,
                fontWeight: 600,
                cursor: loginLoading ? 'not-allowed' : 'pointer',
                opacity: loginLoading ? 0.7 : 1,
              }}
            >
              {loginLoading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
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
                gridTemplateColumns: '60px 1fr 160px 140px 120px',
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
                        gridTemplateColumns: '60px 1fr 160px 140px 120px',
                        padding: '10px 16px',
                        borderBottom: idx < produtosPagina.length - 1 ? '1px solid #f3f4f6' : 'none',
                        alignItems: 'center',
                        gap: 12,
                        background: isSaving ? '#fafafa' : '#fff',
                        transition: 'background 0.15s',
                      }}
                    >
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
                          onClick={() => setOpenDropdown(isOpen ? null : produto.id)}
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
                            minWidth: 150,
                            overflow: 'hidden',
                          }}>
                            {MOVER_OPTIONS.map(opt => (
                              <button
                                key={opt.value}
                                onClick={() => moverCategoria(produto, opt.value)}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 8,
                                  width: '100%',
                                  padding: '9px 14px',
                                  background: cat === opt.value ? '#f9fafb' : '#fff',
                                  border: 'none',
                                  borderBottom: '1px solid #f3f4f6',
                                  fontSize: 14,
                                  color: '#111',
                                  cursor: 'pointer',
                                  textAlign: 'left',
                                  transition: 'background 0.1s',
                                }}
                                onMouseEnter={e => (e.currentTarget.style.background = '#f3f4f6')}
                                onMouseLeave={e => (e.currentTarget.style.background = cat === opt.value ? '#f9fafb' : '#fff')}
                              >
                                <span style={{
                                  width: 8,
                                  height: 8,
                                  borderRadius: '50%',
                                  background: BADGE_COLORS[opt.value!],
                                  flexShrink: 0,
                                }} />
                                {opt.label}
                                {cat === opt.value && (
                                  <span style={{ marginLeft: 'auto', color: BADGE_COLORS[opt.value!], fontSize: 12 }}>✓</span>
                                )}
                              </button>
                            ))}
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

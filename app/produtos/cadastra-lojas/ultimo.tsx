'use client';

import { useState, useEffect } from 'react';

interface LojaCron {
  ativo: boolean;
  frequencia: 'diario' | '2dias' | 'semanal';
  destino: string;
  ultimaAtualizacao: string | null;
  limite?: number;
}

interface LojaLomadee {
  tipo: 'lomadee';
  nome: string;
  url: string;
  moedaUSD?: boolean;
  cron?: LojaCron;
  ambiente?: string;
  tipoAmbiente?: string;
  momento?: string;
  tipoMomento?: string;
  vistaSe?: boolean;
  tipoVistaSe?: string;
  beleza?: boolean;
  tipoBeleza?: string;
}

interface LojaAwin {
  tipo: 'awin';
  nome: string;
  url: string;
  anuncianteId: string;
  moedaUSD?: boolean;
  cron?: LojaCron;
  ambiente?: string;
  tipoAmbiente?: string;
  momento?: string;
  tipoMomento?: string;
  vistaSe?: boolean;
  tipoVistaSe?: string;
  beleza?: boolean;
  tipoBeleza?: string;
}

type Loja = LojaLomadee | LojaAwin;

const AMBIENTES = ['Sala', 'Quarto', 'Escritório', 'Cozinha', 'Banheiro', 'Área externa'];
const TIPOS_AMBIENTE = ['Iluminação', 'Climatização', 'Móveis', 'Decoração', 'Organização', 'Eletrônicos'];
const MOMENTOS = ['Café da manhã', 'Vinho', 'Churrasco', 'Lareira', 'Domingo relaxado', 'Festa em casa'];
const TIPOS_MOMENTO = ['Eletro', 'Móveis', 'Acessórios', 'Alimentos'];
const TIPOS_VISTASE = ['Roupas', 'Calçados', 'Acessórios', 'Infantil', 'Bebê'];
const TIPOS_BELEZA = ['Perfumes', 'Skincare', 'Maquiagem', 'Cabelos', 'Massagem', 'Solar', 'Cuidados'];

const DESTINO_LABELS: Record<string, string> = {
  'ofertas-selecionadas': '⭐ Ofertas Selecionadas',
  'oferta-do-dia': '🔥 Oferta do Dia',
  'parcelado': '💳 Parcelado',
  'mix': '📰 Entre Notícias',
};

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
        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#111827', margin: '0 0 4px' }}>Cadastro de Lojas</h1>
        <p style={{ color: '#6b7280', fontSize: '0.9rem', margin: '0 0 28px' }}>Painel de gestão</p>
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

// ──────────────────────────────────────────────
// Seletor de categoria reutilizável
// ──────────────────────────────────────────────
interface CatState {
  ambiente: string; tipoAmbiente: string;
  momento: string;  tipoMomento: string;
  vistaSe: boolean; tipoVistaSe: string;
  beleza: boolean;  tipoBeleza: string;
}

function CategoriaSelector({ value, onChange }: {
  value: CatState;
  onChange: (v: CatState) => void;
}) {
  const set = (patch: Partial<CatState>) => onChange({ ...value, ...patch });

  const selectStyle: React.CSSProperties = {
    padding: '5px 8px', borderRadius: '6px', border: '1px solid #d1d5db',
    fontSize: '0.78rem', backgroundColor: '#fff', cursor: 'pointer',
  };
  const labelStyle: React.CSSProperties = {
    fontSize: '0.7rem', fontWeight: 700, color: '#6b7280', marginBottom: '3px', display: 'block',
  };

  return (
    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
      {/* Ambiente */}
      <div>
        <label style={labelStyle}>🏠 AMBIENTE</label>
        <select value={value.ambiente} onChange={e => set({ ambiente: e.target.value, tipoAmbiente: '' })} style={selectStyle}>
          <option value="">— Nenhum —</option>
          {AMBIENTES.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>
      {value.ambiente && (
        <div>
          <label style={labelStyle}>TIPO AMBIENTE</label>
          <select value={value.tipoAmbiente} onChange={e => set({ tipoAmbiente: e.target.value })} style={selectStyle}>
            <option value="">— Nenhum —</option>
            {TIPOS_AMBIENTE.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      )}

      {/* Momento */}
      <div>
        <label style={labelStyle}>✨ MOMENTO</label>
        <select value={value.momento} onChange={e => set({ momento: e.target.value, tipoMomento: '' })} style={selectStyle}>
          <option value="">— Nenhum —</option>
          {MOMENTOS.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>
      {value.momento && (
        <div>
          <label style={labelStyle}>TIPO MOMENTO</label>
          <select value={value.tipoMomento} onChange={e => set({ tipoMomento: e.target.value })} style={selectStyle}>
            <option value="">— Nenhum —</option>
            {TIPOS_MOMENTO.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      )}

      {/* Vista-se */}
      <div>
        <label style={labelStyle}>👗 VISTA-SE</label>
        <select
          value={value.vistaSe ? (value.tipoVistaSe || '__sim__') : ''}
          onChange={e => {
            if (!e.target.value) set({ vistaSe: false, tipoVistaSe: '' });
            else set({ vistaSe: true, tipoVistaSe: e.target.value === '__sim__' ? '' : e.target.value });
          }}
          style={selectStyle}
        >
          <option value="">— Nenhum —</option>
          {TIPOS_VISTASE.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {/* Beleza */}
      <div>
        <label style={labelStyle}>💄 BELEZA</label>
        <select
          value={value.beleza ? (value.tipoBeleza || '__sim__') : ''}
          onChange={e => {
            if (!e.target.value) set({ beleza: false, tipoBeleza: '' });
            else set({ beleza: true, tipoBeleza: e.target.value === '__sim__' ? '' : e.target.value });
          }}
          style={selectStyle}
        >
          <option value="">— Nenhum —</option>
          {TIPOS_BELEZA.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
    </div>
  );
}

function emptyCat(): CatState {
  return { ambiente: '', tipoAmbiente: '', momento: '', tipoMomento: '', vistaSe: false, tipoVistaSe: '', beleza: false, tipoBeleza: '' };
}

function lojaTocat(l: Loja): CatState {
  return {
    ambiente: l.ambiente ?? '',
    tipoAmbiente: l.tipoAmbiente ?? '',
    momento: l.momento ?? '',
    tipoMomento: l.tipoMomento ?? '',
    vistaSe: l.vistaSe ?? false,
    tipoVistaSe: l.tipoVistaSe ?? '',
    beleza: l.beleza ?? false,
    tipoBeleza: (l as any).tipoBeleza ?? '',
  };
}

function catToFields(c: CatState) {
  return {
    ambiente: c.ambiente || undefined,
    tipoAmbiente: c.tipoAmbiente || undefined,
    momento: c.momento || undefined,
    tipoMomento: c.tipoMomento || undefined,
    vistaSe: c.vistaSe || undefined,
    tipoVistaSe: c.tipoVistaSe || undefined,
    beleza: c.beleza || undefined,
    tipoBeleza: c.tipoBeleza || undefined,
  };
}

// ──────────────────────────────────────────────
// Badge de categorias na listagem
// ──────────────────────────────────────────────
function CatBadges({ loja }: { loja: Loja }) {
  return (
    <span style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginTop: '3px' }}>
      {loja.ambiente && (
        <span style={{ fontSize: '0.72rem', color: '#7c3aed', backgroundColor: '#f5f3ff', padding: '1px 6px', borderRadius: '3px', fontWeight: 600 }}>
          🏠 {loja.ambiente}{loja.tipoAmbiente ? ` · ${loja.tipoAmbiente}` : ''}
        </span>
      )}
      {loja.momento && (
        <span style={{ fontSize: '0.72rem', color: '#d97706', backgroundColor: '#fef3c7', padding: '1px 6px', borderRadius: '3px', fontWeight: 600 }}>
          ✨ {loja.momento}{loja.tipoMomento ? ` · ${loja.tipoMomento}` : ''}
        </span>
      )}
      {loja.vistaSe && (
        <span style={{ fontSize: '0.72rem', color: '#be185d', backgroundColor: '#fdf2f8', padding: '1px 6px', borderRadius: '3px', fontWeight: 600 }}>
          👗 Vista-se{loja.tipoVistaSe ? ` · ${loja.tipoVistaSe}` : ''}
        </span>
      )}
      {loja.beleza && (
        <span style={{ fontSize: '0.72rem', color: '#9d174d', backgroundColor: '#fdf2f8', padding: '1px 6px', borderRadius: '3px', fontWeight: 600 }}>
          💄 Beleza{(loja as any).tipoBeleza ? ` · ${(loja as any).tipoBeleza}` : ''}
        </span>
      )}
    </span>
  );
}

// ──────────────────────────────────────────────
// Painel Cron
// ──────────────────────────────────────────────
function CronPanel({ loja, onSave }: {
  loja: Loja;
  onSave: (cron: LojaCron | null, cats: CatState) => void;
}) {
  const cronAtual = loja.cron;
  const [ativo, setAtivo] = useState(cronAtual?.ativo ?? false);
  const [frequencia, setFrequencia] = useState<LojaCron['frequencia']>(cronAtual?.frequencia ?? 'semanal');
  const [destino, setDestino] = useState(cronAtual?.destino ?? 'ofertas-selecionadas');
  const [limite, setLimite] = useState(cronAtual?.limite ?? 50);
  const [expandido, setExpandido] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [cats, setCats] = useState<CatState>(lojaTocat(loja));

  const selectSmall: React.CSSProperties = {
    padding: '5px 8px', borderRadius: '6px', border: '1px solid #d1d5db',
    fontSize: '0.78rem', backgroundColor: '#fff', cursor: 'pointer',
  };

  async function handleSalvar() {
    setSalvando(true);
    await onSave(
      { ativo, frequencia, destino, limite, ultimaAtualizacao: cronAtual?.ultimaAtualizacao ?? null },
      cats,
    );
    setSalvando(false);
    setExpandido(false);
  }

  async function handleDesativar() {
    setSalvando(true);
    await onSave(null, cats);
    setAtivo(false);
    setSalvando(false);
    setExpandido(false);
  }

  if (!expandido) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {cronAtual?.ativo ? (
          <span style={{ fontSize: '0.72rem', color: '#047857', fontWeight: 600, backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', padding: '2px 8px', borderRadius: '20px' }}>
            🔁 Auto {cronAtual.frequencia === 'diario' ? 'diária' : cronAtual.frequencia === '2dias' ? 'a cada 2 dias' : 'semanal'}
          </span>
        ) : (
          <span style={{ fontSize: '0.72rem', color: '#9ca3af' }}>Sem automação</span>
        )}
        <button onClick={() => setExpandido(true)}
          style={{ padding: '3px 10px', borderRadius: '6px', border: '1px solid #e5e7eb', backgroundColor: '#f9fafb', color: '#374151', fontWeight: 600, fontSize: '0.72rem', cursor: 'pointer' }}>
          ⚙️ Configurar
        </button>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '12px', marginTop: '8px' }}>
      <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#374151', marginBottom: '10px' }}>⚙️ Configurar loja</div>

      {/* Categorias */}
      <div style={{ marginBottom: '14px' }}>
        <CategoriaSelector value={cats} onChange={setCats} />
      </div>

      <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#374151', marginBottom: '10px' }}>🔁 Automação de atualização</div>
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '10px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 600, color: '#374151', cursor: 'pointer' }}>
          <input type="checkbox" checked={ativo} onChange={e => setAtivo(e.target.checked)}
            style={{ width: '15px', height: '15px', accentColor: '#7c3aed', cursor: 'pointer' }} />
          Ativar automação
        </label>
        <div>
          <span style={{ fontSize: '0.72rem', color: '#6b7280', marginRight: '4px' }}>Qtd. produtos:</span>
          <select value={limite} onChange={e => setLimite(parseInt(e.target.value))} style={selectSmall}>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={80}>80</option>
            <option value={100}>100</option>
            <option value={150}>150</option>
          </select>
        </div>
        {ativo && (
          <>
            <div>
              <span style={{ fontSize: '0.72rem', color: '#6b7280', marginRight: '4px' }}>Frequência:</span>
              <select value={frequencia} onChange={e => setFrequencia(e.target.value as LojaCron['frequencia'])} style={selectSmall}>
                <option value="diario">Diária</option>
                <option value="2dias">A cada 2 dias</option>
                <option value="semanal">Semanal</option>
              </select>
            </div>
            <div>
              <span style={{ fontSize: '0.72rem', color: '#6b7280', marginRight: '4px' }}>Destino:</span>
              <select value={destino} onChange={e => setDestino(e.target.value)} style={selectSmall}>
                {Object.entries(DESTINO_LABELS).map(([id, label]) => (
                  <option key={id} value={id}>{label}</option>
                ))}
              </select>
            </div>
          </>
        )}
      </div>
      {cronAtual?.ultimaAtualizacao && (
        <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginBottom: '8px' }}>
          Última atualização: {new Date(cronAtual.ultimaAtualizacao).toLocaleString('pt-BR')}
        </div>
      )}
      <div style={{ display: 'flex', gap: '8px' }}>
        <button onClick={handleSalvar} disabled={salvando}
          style={{ padding: '5px 14px', borderRadius: '6px', border: 'none', backgroundColor: '#7c3aed', color: '#fff', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer' }}>
          {salvando ? '⏳' : '✅ Salvar'}
        </button>
        {cronAtual?.ativo && (
          <button onClick={handleDesativar} disabled={salvando}
            style={{ padding: '5px 14px', borderRadius: '6px', border: '1px solid #fca5a5', backgroundColor: '#fff', color: '#dc2626', fontWeight: 600, fontSize: '0.78rem', cursor: 'pointer' }}>
            🗑 Desativar
          </button>
        )}
        <button onClick={() => setExpandido(false)}
          style={{ padding: '5px 14px', borderRadius: '6px', border: '1px solid #e5e7eb', backgroundColor: '#fff', color: '#6b7280', fontWeight: 600, fontSize: '0.78rem', cursor: 'pointer' }}>
          Cancelar
        </button>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// Página principal
// ──────────────────────────────────────────────
export default function CadastraLojasPage() {
  const [auth, setAuth] = useState<boolean | null>(null);
  const [lojas, setLojas] = useState<Loja[]>([]);
  const [loading, setLoading] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [aba, setAba] = useState<'lomadee' | 'awin'>('lomadee');

  // Form Lomadee
  const [nomeL, setNomeL] = useState('');
  const [urlL, setUrlL] = useState('');
  const [moedaUSDL, setMoedaUSDL] = useState(false);
  const [catsL, setCatsL] = useState<CatState>(emptyCat());

  // Form Awin
  const [nomeA, setNomeA] = useState('');
  const [urlA, setUrlA] = useState('');
  const [anuncianteId, setAnuncianteId] = useState('');
  const [moedaUSD, setMoedaUSD] = useState(false);
  const [catsA, setCatsA] = useState<CatState>(emptyCat());

  useEffect(() => {
    fetch('/api/editorial/auth/check').then(r => r.json()).then(d => setAuth(d.ok)).catch(() => setAuth(false));
  }, []);

  useEffect(() => {
    if (auth) carregarLojas();
  }, [auth]);

  async function carregarLojas() {
    setLoading(true);
    try {
      const res = await fetch('/api/produtos/lojas');
      const json = await res.json();
      setLojas(Array.isArray(json) ? json : []);
    } catch { setLojas([]); }
    finally { setLoading(false); }
  }

  async function salvarLoja(loja: Loja) {
    setSalvando(true);
    try {
      await fetch('/api/produtos/lojas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loja),
      });
      await carregarLojas();
    } catch { alert('Erro ao salvar loja.'); }
    finally { setSalvando(false); }
  }

  async function removerLoja(url: string, tipo: string) {
    if (!confirm('Remover esta loja?')) return;
    await fetch('/api/produtos/lojas', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, tipo }),
    });
    await carregarLojas();
  }

  async function atualizarCron(loja: Loja, cron: LojaCron | null, cats: CatState) {
    const atualizada: Loja = { ...loja, cron: cron ?? undefined, ...catToFields(cats) };
    await salvarLoja(atualizada);
  }

  async function handleAdicionarLomadee(e: React.FormEvent) {
    e.preventDefault();
    if (!nomeL.trim() || !urlL.trim()) return;
    let url = urlL.trim();
    if (!url.startsWith('http')) url = 'https://' + url;
    await salvarLoja({ tipo: 'lomadee', nome: nomeL.trim(), url, moedaUSD: moedaUSDL, ...catToFields(catsL) });
    setNomeL(''); setUrlL(''); setMoedaUSDL(false); setCatsL(emptyCat());
  }

  async function handleAdicionarAwin(e: React.FormEvent) {
    e.preventDefault();
    if (!nomeA.trim() || !urlA.trim() || !anuncianteId.trim()) return;
    let url = urlA.trim();
    if (!url.startsWith('http')) url = 'https://' + url;
    await salvarLoja({ tipo: 'awin', nome: nomeA.trim(), url, anuncianteId: anuncianteId.trim(), moedaUSD, ...catToFields(catsA) });
    setNomeA(''); setUrlA(''); setAnuncianteId(''); setMoedaUSD(false); setCatsA(emptyCat());
  }

  const lojasFiltradas = lojas.filter(l => l.tipo === aba);

  if (auth === null) return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9fafb' }}>
      <p style={{ color: '#9ca3af', fontFamily: 'system-ui' }}>Verificando...</p>
    </main>
  );

  if (!auth) return <LoginScreen onLogin={() => setAuth(true)} />;

  const inputStyle: React.CSSProperties = { width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.88rem', boxSizing: 'border-box' };
  const labelStyle: React.CSSProperties = { fontSize: '0.75rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '4px' };

  return (
    <main style={{ maxWidth: '800px', margin: '0 auto', padding: '30px 20px', fontFamily: 'system-ui, sans-serif', backgroundColor: '#f9fafb', minHeight: '100vh' }}>

      <header style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', marginBottom: '24px', borderTop: '6px solid #7c3aed' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#111827', margin: 0 }}>🏪 Cadastro de Lojas</h1>
            <p style={{ color: '#6b7280', fontSize: '0.9rem', margin: '4px 0 0' }}>Lojas cadastradas aparecem como opção ao buscar produtos</p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <a href="/admin/produtos" style={{ backgroundColor: '#f3f4f6', color: '#374151', padding: '6px 12px', borderRadius: '6px', textDecoration: 'none', fontSize: '0.78rem', fontWeight: 600 }}>🗂 Admin Produtos</a>
            <a href="/produtos/buscar" style={{ backgroundColor: '#f3f4f6', color: '#374151', padding: '6px 12px', borderRadius: '6px', textDecoration: 'none', fontSize: '0.78rem', fontWeight: 600 }}>📌 Buscar produtos</a>
            <a href="/" style={{ backgroundColor: '#f3f4f6', color: '#374151', padding: '6px 12px', borderRadius: '6px', textDecoration: 'none', fontSize: '0.78rem', fontWeight: 600 }}>← Site</a>
          </div>
        </div>
      </header>

      {/* Info cron */}
      <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', fontSize: '0.82rem', color: '#1e40af' }}>
        🔁 <strong>Automação:</strong> O cron da Vercel roda diariamente às 6h UTC. Para cada loja com automação ativa, ele scrapa os produtos, remove os pinados antigos dessa loja e pina os novos no destino configurado.
      </div>

      {/* Abas */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        <button onClick={() => setAba('lomadee')} style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', backgroundColor: aba === 'lomadee' ? '#be185d' : '#fff', color: aba === 'lomadee' ? '#fff' : '#374151', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          🌐 Lomadee ({lojas.filter(l => l.tipo === 'lomadee').length})
        </button>
        <button onClick={() => setAba('awin')} style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', backgroundColor: aba === 'awin' ? '#f59e0b' : '#fff', color: aba === 'awin' ? '#fff' : '#374151', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          🏷 Awin ({lojas.filter(l => l.tipo === 'awin').length})
        </button>
      </div>

      {/* Formulário Lomadee */}
      {aba === 'lomadee' && (
        <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '20px', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#111827', margin: '0 0 16px' }}>➕ Adicionar loja Lomadee</h2>
          <form onSubmit={handleAdicionarLomadee}>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: '12px' }}>
              <div style={{ flex: 1, minWidth: '160px' }}>
                <label style={labelStyle}>Nome da loja</label>
                <input value={nomeL} onChange={e => setNomeL(e.target.value)} placeholder="ex: Viva Vinho" style={inputStyle} required />
              </div>
              <div style={{ flex: 2, minWidth: '220px' }}>
                <label style={labelStyle}>URL do site</label>
                <input value={urlL} onChange={e => setUrlL(e.target.value)} placeholder="https://www.vivavinho.com.br" style={inputStyle} required />
              </div>
            </div>
            <div style={{ marginBottom: '12px' }}>
              <CategoriaSelector value={catsL} onChange={setCatsL} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.88rem', fontWeight: 600, color: '#374151' }}>
                <input type="checkbox" checked={moedaUSDL} onChange={e => setMoedaUSDL(e.target.checked)}
                  style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#be185d' }} />
                💵 Preços em USD (converte para R$)
              </label>
              <button type="submit" disabled={salvando} style={{ padding: '9px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#be185d', color: '#fff', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                {salvando ? '⏳' : '✅ Adicionar'}
              </button>
            </div>
          </form>
          <p style={{ fontSize: '0.72rem', color: '#9ca3af', margin: '10px 0 0' }}>
            A URL é usada para buscar produtos via scraping (Shopify, VTEX, Nuvemshop, MiBrasil…)
          </p>
        </div>
      )}

      {/* Formulário Awin */}
      {aba === 'awin' && (
        <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '20px', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#111827', margin: '0 0 16px' }}>➕ Adicionar loja Awin</h2>
          <form onSubmit={handleAdicionarAwin}>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: '12px' }}>
              <div style={{ flex: 1, minWidth: '140px' }}>
                <label style={labelStyle}>Nome da loja</label>
                <input value={nomeA} onChange={e => setNomeA(e.target.value)} placeholder="ex: Arno" style={inputStyle} required />
              </div>
              <div style={{ flex: 2, minWidth: '200px' }}>
                <label style={labelStyle}>URL do site</label>
                <input value={urlA} onChange={e => setUrlA(e.target.value)} placeholder="https://www.arno.com.br" style={inputStyle} required />
              </div>
              <div style={{ flex: 1, minWidth: '160px' }}>
                <label style={labelStyle}>ID do anunciante Awin</label>
                <input value={anuncianteId} onChange={e => setAnuncianteId(e.target.value)} placeholder="ex: awin-arno" style={inputStyle} required />
              </div>
            </div>
            <div style={{ marginBottom: '12px' }}>
              <CategoriaSelector value={catsA} onChange={setCatsA} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.88rem', fontWeight: 600, color: '#374151' }}>
                <input type="checkbox" checked={moedaUSD} onChange={e => setMoedaUSD(e.target.checked)}
                  style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#f59e0b' }} />
                💵 Preços em USD (converte para R$)
              </label>
              <button type="submit" disabled={salvando} style={{ padding: '9px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#f59e0b', color: '#fff', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                {salvando ? '⏳' : '✅ Adicionar'}
              </button>
            </div>
          </form>
          <p style={{ fontSize: '0.72rem', color: '#9ca3af', margin: '10px 0 0' }}>
            O ID do anunciante é passado como <code>orgId</code> na API de scrape Awin (ex: <code>awin-arno</code>, <code>awin-spicy</code>, <code>awin-italist</code>).
          </p>
        </div>
      )}

      {/* Lista de lojas */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>⏳ Carregando...</div>
      ) : lojasFiltradas.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#9ca3af', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
          Nenhuma loja {aba === 'lomadee' ? 'Lomadee' : 'Awin'} cadastrada ainda.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {lojasFiltradas.map((loja, i) => (
            <div key={i} style={{ backgroundColor: '#fff', borderRadius: '10px', border: '1px solid #e5e7eb', padding: '14px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <div style={{ fontWeight: 700, color: '#111827', fontSize: '0.95rem' }}>{loja.nome}</div>
                  <div style={{ fontSize: '0.78rem', color: '#6b7280', marginTop: '2px' }}>{loja.url}</div>
                  <div style={{ fontSize: '0.72rem', color: loja.tipo === 'awin' ? '#f59e0b' : '#be185d', fontWeight: 600, marginTop: '2px' }}>
                    {loja.tipo === 'awin' ? `Awin ID: ${(loja as LojaAwin).anuncianteId}` : 'Lomadee'}
                    {loja.moedaUSD && <span style={{ marginLeft: '6px', color: '#92400e', backgroundColor: '#fef3c7', padding: '1px 5px', borderRadius: '3px' }}>💵 USD</span>}
                  </div>
                  <CatBadges loja={loja} />
                </div>
                <button onClick={() => removerLoja(loja.url, loja.tipo)}
                  style={{ padding: '6px 14px', borderRadius: '6px', border: '1px solid #fca5a5', backgroundColor: '#fff', color: '#dc2626', fontWeight: 600, fontSize: '0.78rem', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                  🗑 Remover
                </button>
              </div>

              {/* Painel de automação cron */}
              <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #f3f4f6' }}>
                <CronPanel loja={loja} onSave={(cron, cats) => atualizarCron(loja, cron, cats)} />
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

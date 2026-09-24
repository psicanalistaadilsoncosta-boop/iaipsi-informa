'use client';

import { useState, useEffect } from 'react';

const MOMENTOS = ['Café da manhã', 'Vinho', 'Churrasco', 'Lareira', 'Domingo relaxado', 'Festa em casa'];
const TIPOS_MOMENTO = ['Eletro', 'Móveis', 'Acessórios', 'Alimentos'];

const MOMENTO_EMOJI: Record<string, string> = {
  'Café da manhã': '☕', 'Vinho': '🍷', 'Churrasco': '🥩',
  'Lareira': '🔥', 'Domingo relaxado': '🌅', 'Festa em casa': '🎉',
};

const TIPO_EMOJI: Record<string, string> = {
  'Eletro': '🔌', 'Móveis': '🪑', 'Acessórios': '✨', 'Alimentos': '🛒',
};

interface Produto {
  nome: string;
  preco: number;
  precoOriginal?: number;
  desconto?: number;
  parcelas?: string;
  valorParcela?: string;
  link: string;
  imagem?: string;
  momento?: string;
  tipoMomento?: string;
  loja?: string;
}

export default function MonteSeuMomentoPage() {
  const [mapa, setMapa] = useState<Record<string, Record<string, Produto[]>>>({});
  const [momentoSel, setMomentoSel] = useState('');
  const [tipoSel, setTipoSel] = useState('');
  const [carrinho, setCarrinho] = useState<Produto[]>([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [email, setEmail] = useState('');
  const [emailsExtra, setEmailsExtra] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/momentos')
      .then(r => r.json())
      .then(d => { setMapa(d || {}); setLoading(false); });
  }, []);

  const momentosDisponiveis = MOMENTOS.filter(m => mapa[m] && Object.keys(mapa[m]).length > 0);

  const produtosFiltrados: Produto[] = momentoSel
    ? Object.entries(mapa[momentoSel] || {})
        .filter(([tipo]) => !tipoSel || tipo === tipoSel)
        .flatMap(([, prods]) => prods)
    : [];

  const noCarrinho = (p: Produto) => carrinho.some(c => c.link === p.link);

  const toggleCarrinho = (p: Produto) => {
    setCarrinho(prev => noCarrinho(p) ? prev.filter(c => c.link !== p.link) : [...prev, p]);
  };

  const total = carrinho.reduce((s, p) => s + p.preco, 0);

  const handleEnviar = async () => {
    if (!email) return;
    setEnviando(true);
    try {
      await fetch('/api/momentos/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, momentos: [...new Set(carrinho.map(p => p.momento).filter(Boolean))] }),
      });
      const res = await fetch('/api/ambientes/enviar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, emailsExtra, produtos: carrinho }),
      });
      if (!res.ok) {
        const err = await res.json();
        alert('Erro ao enviar: ' + (err.error || 'tente novamente'));
        return;
      }
      setEnviado(true);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', backgroundColor: '#f9fafb', minHeight: '100vh', padding: '32px 20px' }}>
      <div style={{ maxWidth: '1060px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#111827', margin: '0 0 8px' }}>
            ✨ Monte seu Momento
          </h1>
          <p style={{ color: '#6b7280', fontSize: '0.95rem', margin: 0 }}>
            Escolha o clima, monte sua lista e receba os links de oferta no e-mail
          </p>
        </div>

        {/* Seletor de momento */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center', marginBottom: '28px' }}>
          {loading ? (
            <span style={{ color: '#9ca3af' }}>⏳ Carregando momentos...</span>
          ) : momentosDisponiveis.length === 0 ? (
            <span style={{ color: '#9ca3af' }}>Nenhum momento disponível ainda.</span>
          ) : MOMENTOS.map(m => {
            const disponivel = momentosDisponiveis.includes(m);
            const ativo = momentoSel === m;
            return (
              <button key={m} onClick={() => { if (disponivel) { setMomentoSel(ativo ? '' : m); setTipoSel(''); } }}
                style={{
                  padding: '12px 20px', borderRadius: '999px', border: '2px solid',
                  borderColor: ativo ? '#d97706' : disponivel ? '#e5e7eb' : '#f3f4f6',
                  backgroundColor: ativo ? '#d97706' : disponivel ? '#fff' : '#f9fafb',
                  color: ativo ? '#fff' : disponivel ? '#374151' : '#d1d5db',
                  fontWeight: 700, fontSize: '0.95rem', cursor: disponivel ? 'pointer' : 'default',
                  boxShadow: ativo ? '0 2px 8px rgba(217,119,6,0.3)' : 'none',
                  transition: 'all 0.15s',
                }}>
                {MOMENTO_EMOJI[m]} {m}
              </button>
            );
          })}
        </div>

        {/* Filtro por tipo */}
        {momentoSel && (
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '24px' }}>
            <button onClick={() => setTipoSel('')}
              style={{ padding: '6px 14px', borderRadius: '999px', border: `2px solid ${tipoSel === '' ? '#d97706' : '#e5e7eb'}`, backgroundColor: tipoSel === '' ? '#d97706' : '#fff', color: tipoSel === '' ? '#fff' : '#374151', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer' }}>
              Todos
            </button>
            {TIPOS_MOMENTO.filter(t => mapa[momentoSel]?.[t]?.length).map(t => (
              <button key={t} onClick={() => setTipoSel(tipoSel === t ? '' : t)}
                style={{ padding: '6px 14px', borderRadius: '999px', border: `2px solid ${tipoSel === t ? '#d97706' : '#e5e7eb'}`, backgroundColor: tipoSel === t ? '#d97706' : '#fff', color: tipoSel === t ? '#fff' : '#374151', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer' }}>
                {TIPO_EMOJI[t]} {t}
              </button>
            ))}
          </div>
        )}

        {/* Grid de produtos */}
        {momentoSel && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px', marginBottom: '32px' }}>
            {produtosFiltrados.map((p, i) => {
              const adicionado = noCarrinho(p);
              return (
                <div key={i} style={{ backgroundColor: '#fff', borderRadius: '14px', border: `2px solid ${adicionado ? '#d97706' : '#e5e7eb'}`, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', transition: 'border-color 0.15s' }}>
                  {p.imagem && (
                    <div style={{ height: '160px', backgroundColor: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px', position: 'relative' }}>
                      <img src={p.imagem} alt={p.nome} style={{ maxHeight: '136px', maxWidth: '100%', objectFit: 'contain' }} />
                      {p.desconto && p.desconto > 0 && (
                        <span style={{ position: 'absolute', top: '8px', right: '8px', backgroundColor: '#dc2626', color: '#fff', fontSize: '0.7rem', fontWeight: 800, padding: '2px 7px', borderRadius: '999px' }}>
                          -{p.desconto}%
                        </span>
                      )}
                      {p.tipoMomento && (
                        <span style={{ position: 'absolute', top: '8px', left: '8px', backgroundColor: '#fef3c7', color: '#92400e', fontSize: '0.68rem', fontWeight: 700, padding: '2px 7px', borderRadius: '999px' }}>
                          {TIPO_EMOJI[p.tipoMomento]} {p.tipoMomento}
                        </span>
                      )}
                    </div>
                  )}
                  <div style={{ padding: '12px' }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#111827', marginBottom: '6px', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {p.nome}
                    </div>
                    {p.loja && <div style={{ fontSize: '0.72rem', color: '#047857', marginBottom: '4px' }}>🏪 {p.loja}</div>}
                    {p.precoOriginal && p.precoOriginal > p.preco && (
                      <div style={{ fontSize: '0.75rem', color: '#9ca3af', textDecoration: 'line-through' }}>
                        R$ {p.precoOriginal.toFixed(2).replace('.', ',')}
                      </div>
                    )}
                    <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#dc2626', marginBottom: '2px' }}>
                      R$ {p.preco.toFixed(2).replace('.', ',')}
                    </div>
                    {p.parcelas && p.valorParcela && (
                      <div style={{ fontSize: '0.72rem', color: '#047857', fontWeight: 600, marginBottom: '10px' }}>
                        {p.parcelas}x de R$ {parseFloat(p.valorParcela).toFixed(2).replace('.', ',')}
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <a href={p.link} target="_blank" rel="noopener noreferrer"
                        style={{ flex: 1, textAlign: 'center', padding: '7px', backgroundColor: '#2563eb', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontSize: '0.78rem', fontWeight: 700 }}>
                        Ver
                      </a>
                      <button onClick={() => toggleCarrinho(p)}
                        style={{ flex: 1, padding: '7px', backgroundColor: adicionado ? '#d97706' : '#f3f4f6', color: adicionado ? '#fff' : '#374151', border: 'none', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}>
                        {adicionado ? '✓ Na lista' : '+ Lista'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Carrinho */}
        {carrinho.length > 0 && (
          <div style={{ backgroundColor: '#fff', borderRadius: '16px', border: '2px solid #d97706', padding: '20px', marginBottom: '24px', boxShadow: '0 4px 16px rgba(217,119,6,0.1)' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 800, color: '#92400e', margin: '0 0 14px' }}>
              ✨ Sua lista — {carrinho.length} produto{carrinho.length !== 1 ? 's' : ''}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
              {carrinho.map((p, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #fef3c7' }}>
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#111827' }}>{p.nome}</div>
                    {p.momento && <div style={{ fontSize: '0.72rem', color: '#d97706' }}>{MOMENTO_EMOJI[p.momento]} {p.momento}</div>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#dc2626' }}>R$ {p.preco.toFixed(2).replace('.', ',')}</span>
                    <button onClick={() => toggleCarrinho(p)}
                      style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: '1rem' }}>✕</button>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderTop: '2px solid #fef3c7', marginBottom: '14px' }}>
              <span style={{ fontSize: '0.9rem', color: '#6b7280', fontWeight: 600 }}>Total estimado:</span>
              <span style={{ fontSize: '1.4rem', fontWeight: 900, color: '#d97706' }}>R$ {total.toFixed(2).replace('.', ',')}</span>
            </div>
            <button onClick={() => setModalAberto(true)}
              style={{ width: '100%', padding: '14px', backgroundColor: '#d97706', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '1rem', fontWeight: 800, cursor: 'pointer' }}>
              📧 Enviar para meu e-mail
            </button>
          </div>
        )}

        {/* Modal de e-mail */}
        {modalAberto && (
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '20px' }}>
            <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '440px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
              {enviado ? (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '12px' }}>✅</div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#111827', margin: '0 0 8px' }}>Lista enviada!</h3>
                  <p style={{ color: '#6b7280', fontSize: '0.88rem', margin: '0 0 20px' }}>Verifique sua caixa de entrada com os links de oferta.</p>
                  <button onClick={() => { setModalAberto(false); setEnviado(false); }}
                    style={{ padding: '10px 24px', backgroundColor: '#d97706', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>
                    Fechar
                  </button>
                </div>
              ) : (
                <>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#111827', margin: '0 0 6px' }}>📧 Enviar sua lista</h3>
                  <p style={{ color: '#6b7280', fontSize: '0.82rem', margin: '0 0 20px' }}>Você receberá os links de oferta diretamente no e-mail.</p>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Seu e-mail *</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="voce@email.com"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #e5e7eb', fontSize: '0.9rem', marginBottom: '14px', boxSizing: 'border-box' }} />
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Compartilhar com (opcional)</label>
                  <input type="text" value={emailsExtra} onChange={e => setEmailsExtra(e.target.value)} placeholder="amigo@email.com, outro@email.com"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #e5e7eb', fontSize: '0.9rem', marginBottom: '20px', boxSizing: 'border-box' }} />
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => setModalAberto(false)}
                      style={{ flex: 1, padding: '11px', backgroundColor: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>
                      Cancelar
                    </button>
                    <button onClick={handleEnviar} disabled={!email || enviando}
                      style={{ flex: 2, padding: '11px', backgroundColor: email && !enviando ? '#d97706' : '#d1d5db', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 800, cursor: email && !enviando ? 'pointer' : 'default' }}>
                      {enviando ? 'Enviando...' : 'Enviar lista →'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
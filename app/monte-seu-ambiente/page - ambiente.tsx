'use client';

import { useState, useEffect } from 'react';

const AMBIENTES = ['Sala', 'Quarto', 'Escritório', 'Cozinha', 'Banheiro', 'Área externa'];
const TIPOS_AMBIENTE = ['Iluminação', 'Climatização', 'Móveis', 'Decoração', 'Organização', 'Eletrônicos'];

const AMBIENTE_EMOJI: Record<string, string> = {
  'Sala': '🛋',
  'Quarto': '🛏',
  'Escritório': '💻',
  'Cozinha': '🍳',
  'Banheiro': '🚿',
  'Área externa': '🌿',
};

const TIPO_EMOJI: Record<string, string> = {
  'Iluminação': '💡',
  'Climatização': '❄️',
  'Móveis': '🪑',
  'Decoração': '🎨',
  'Organização': '📦',
  'Eletrônicos': '🔌',
};

interface Produto {
  id: string;
  nome: string;
  imagem: string;
  link: string;
  preco: number;
  precoOriginal: number;
  desconto: number;
  parcelas?: string;
  valorParcela?: string;
  loja?: string;
  ambiente?: string;
  tipoAmbiente?: string;
}

export default function MonteSeuAmbientePage() {
  const [mapa, setMapa] = useState<Record<string, Record<string, Produto[]>>>({});
  const [loading, setLoading] = useState(true);
  const [ambienteSel, setAmbienteSel] = useState('');
  const [tipoSel, setTipoSel] = useState('');
  const [carrinho, setCarrinho] = useState<Produto[]>([]);
  const [modalEmail, setModalEmail] = useState(false);
  const [email, setEmail] = useState('');
  const [emailsExtra, setEmailsExtra] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  useEffect(() => {
    fetch('/api/ambientes')
      .then(r => r.json())
      .then(d => { setMapa(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const ambientesDisponiveis = AMBIENTES.filter(a => mapa[a]);
  const tiposDisponiveis = ambienteSel
    ? TIPOS_AMBIENTE.filter(t => mapa[ambienteSel]?.[t]?.length > 0)
    : [];

  const produtosVisiveis: Produto[] = (() => {
    if (!ambienteSel) return [];
    if (tipoSel) return mapa[ambienteSel]?.[tipoSel] || [];
    // todos os tipos do ambiente selecionado
    return Object.values(mapa[ambienteSel] || {}).flat();
  })();

  function toggleCarrinho(p: Produto) {
    setCarrinho(prev =>
      prev.find(x => x.id === p.id)
        ? prev.filter(x => x.id !== p.id)
        : [...prev, p]
    );
  }

  const noCarrinho = (id: string) => carrinho.some(x => x.id === id);

    async function handleEnviar() {
    if (!email.trim()) return;
    setEnviando(true);
    try {
      const ambientesInteresse = [...new Set(carrinho.map(p => p.ambiente).filter(Boolean))];
      await fetch('/api/ambientes/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, ambientes: ambientesInteresse }),
      });

      const res = await fetch('/api/ambientes/enviar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, emailsExtra, produtos: carrinho }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert('Erro ao enviar: ' + (err.error || res.status));
        return;
      }

      setEnviado(true);
    } catch (e) {
      alert('Erro inesperado: ' + String(e));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
    <div style={{ maxWidth: '1060px', margin: '0 auto' }}>

      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)', color: '#fff', padding: '48px 24px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 900, margin: '0 0 12px', letterSpacing: '-0.5px' }}>
          🏠 Monte seu Ambiente
        </h1>
        <p style={{ fontSize: '1.05rem', margin: 0, opacity: 0.9, maxWidth: '520px', marginInline: 'auto', lineHeight: 1.5 }}>
          Escolha o ambiente, descubra produtos selecionados e monte sua lista de compras com links de oferta.</p>
<p style={{ margin: 0, opacity: 0.65, fontSize: '0.65rem' }}>
         Atenção: os preços, descontos, frete, disponibilidade e demais condições apresentados são apenas referenciais.<br />Valem as condições exibidas no momento da compra, diretamente na loja e no carrinho do site.
        </p>
      </div>
</div>
      <div style={{ maxWidth: '1060px', margin: '0 auto', padding: '32px 20px' }}>

        {loading && (
          <div style={{ textAlign: 'center', padding: '60px', color: '#9ca3af' }}>⏳ Carregando ambientes...</div>
        )}

        {!loading && ambientesDisponiveis.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px', color: '#9ca3af' }}>
            Nenhum produto categorizado ainda.
          </div>
        )}

        {!loading && ambientesDisponiveis.length > 0 && (
          <>
            {/* Seleção de ambiente */}
            <div style={{ marginBottom: '28px' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#374151', margin: '0 0 14px' }}>
                1. Qual ambiente você quer montar?
              </h2>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {ambientesDisponiveis.map(a => {
                  const total = Object.values(mapa[a] || {}).flat().length;
                  const ativo = ambienteSel === a;
                  return (
                    <button key={a} onClick={() => { setAmbienteSel(a); setTipoSel(''); }}
                      style={{
                        padding: '12px 20px', borderRadius: '12px', border: `2px solid ${ativo ? '#7c3aed' : '#e5e7eb'}`,
                        backgroundColor: ativo ? '#7c3aed' : '#fff', color: ativo ? '#fff' : '#374151',
                        fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer',
                        boxShadow: ativo ? '0 4px 12px rgba(124,58,237,0.25)' : '0 1px 3px rgba(0,0,0,0.06)',
                        transition: 'all 0.15s',
                      }}>
                      {AMBIENTE_EMOJI[a] || '🏠'} {a}
                      <span style={{ marginLeft: '6px', fontSize: '0.75rem', opacity: 0.75 }}>({total})</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Seleção de tipo */}
            {ambienteSel && tiposDisponiveis.length > 1 && (
              <div style={{ marginBottom: '28px' }}>
                <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#374151', margin: '0 0 14px' }}>
                  2. Filtrar por categoria <span style={{ fontWeight: 400, color: '#9ca3af' }}>(opcional)</span>
                </h2>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button onClick={() => setTipoSel('')}
                    style={{ padding: '7px 16px', borderRadius: '999px', border: `2px solid ${tipoSel === '' ? '#2563eb' : '#e5e7eb'}`, backgroundColor: tipoSel === '' ? '#2563eb' : '#fff', color: tipoSel === '' ? '#fff' : '#374151', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>
                    Todos
                  </button>
                  {tiposDisponiveis.map(t => (
                    <button key={t} onClick={() => setTipoSel(t)}
                      style={{ padding: '7px 16px', borderRadius: '999px', border: `2px solid ${tipoSel === t ? '#2563eb' : '#e5e7eb'}`, backgroundColor: tipoSel === t ? '#2563eb' : '#fff', color: tipoSel === t ? '#fff' : '#374151', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>
                      {TIPO_EMOJI[t] || ''} {t} ({mapa[ambienteSel]?.[t]?.length || 0})
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Produtos */}
            {ambienteSel && produtosVisiveis.length > 0 && (
              <div style={{ marginBottom: '32px' }}>
                <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#374151', margin: '0 0 14px' }}>
                  {tipoSel ? `${TIPO_EMOJI[tipoSel] || ''} ${tipoSel} — ${ambienteSel}` : `🏠 ${ambienteSel} — todos os produtos`}
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '16px' }}>
                  {produtosVisiveis.map(p => {
                    const sel = noCarrinho(p.id);
                    return (
                      <div key={p.id} style={{
                        backgroundColor: '#fff', borderRadius: '12px',
                        border: `2px solid ${sel ? '#7c3aed' : '#e5e7eb'}`,
                        boxShadow: sel ? '0 0 0 3px rgba(124,58,237,0.15)' : '0 2px 6px rgba(0,0,0,0.04)',
                        overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'all 0.15s',
                      }}>
                        <div style={{ height: '150px', backgroundColor: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px', position: 'relative' }}>
                          {p.imagem && <img src={p.imagem} alt={p.nome} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />}
                          {p.desconto > 0 && (
                            <span style={{ position: 'absolute', top: '8px', left: '8px', backgroundColor: '#dc2626', color: '#fff', fontSize: '0.68rem', fontWeight: 700, padding: '2px 6px', borderRadius: '4px' }}>
                              -{p.desconto}%
                            </span>
                          )}
                          {p.tipoAmbiente && (
                            <span style={{ position: 'absolute', top: '8px', right: '8px', backgroundColor: '#f3f4f6', color: '#6b7280', fontSize: '0.65rem', fontWeight: 600, padding: '2px 6px', borderRadius: '4px' }}>
                              {TIPO_EMOJI[p.tipoAmbiente] || ''} {p.tipoAmbiente}
                            </span>
                          )}
                        </div>
                        <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', flexGrow: 1, gap: '6px' }}>
                          <h3 style={{ fontSize: '0.8rem', fontWeight: 600, color: '#111827', margin: 0, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {p.nome}
                          </h3>
                           {p.loja && (
                            <div style={{ fontSize: '0.68rem', color: '#047857', fontWeight: 600 }}>🏪 {p.loja}</div>
                          )}
                          {(p as any).moedaUSD && (
                            <div style={{ fontSize: '0.68rem', color: '#92400e', background: '#fef3c7', padding: '2px 6px', borderRadius: '4px', display: 'inline-block', marginBottom: '0.25rem', fontWeight: 600 }}>
                              💵 Preço convertido de USD
                            </div>
                          )}
                          <div style={{ marginTop: 'auto' }}>
                            {p.precoOriginal > p.preco && (
                              <div style={{ fontSize: '0.7rem', color: '#9ca3af', textDecoration: 'line-through' }}>
                                R$ {p.precoOriginal.toFixed(2).replace('.', ',')}
                              </div>
                            )}
                            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#dc2626' }}>
                              R$ {p.preco.toFixed(2).replace('.', ',')}
                            </div>
                            {p.parcelas && p.valorParcela && (
                              <div style={{ fontSize: '0.7rem', color: '#047857', fontWeight: 600 }}>
                                {p.parcelas}x de R$ {parseFloat(p.valorParcela).toFixed(2).replace('.', ',')}
                              </div>
                            )}
                          </div>
                          <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                            <a href={p.link} target="_blank" rel="noopener noreferrer"
                              style={{ flex: 1, padding: '6px', borderRadius: '6px', border: '1px solid #e5e7eb', backgroundColor: '#f9fafb', color: '#374151', fontWeight: 600, fontSize: '0.75rem', textAlign: 'center', textDecoration: 'none' }}>
                              🔗 Ver
                            </a>
                            <button onClick={() => toggleCarrinho(p)}
                              style={{ flex: 2, padding: '6px', borderRadius: '6px', border: 'none', backgroundColor: sel ? '#7c3aed' : '#2563eb', color: '#fff', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer' }}>
                              {sel ? '✅ Na lista' : '+ Adicionar'}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Carrinho / lista montada */}
            {carrinho.length > 0 && (
              <div style={{ backgroundColor: '#fff', borderRadius: '16px', border: '2px solid #7c3aed', padding: '24px', marginBottom: '32px', boxShadow: '0 4px 20px rgba(124,58,237,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                  <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#7c3aed', margin: 0 }}>
                    🛒 Sua lista ({carrinho.length} produto{carrinho.length > 1 ? 's' : ''})
                  </h2>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => setCarrinho([])}
                      style={{ padding: '6px 14px', borderRadius: '8px', border: '1px solid #fca5a5', backgroundColor: '#fff', color: '#dc2626', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}>
                      Limpar lista
                    </button>
                    <button onClick={() => setModalEmail(true)}
                      style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', backgroundColor: '#7c3aed', color: '#fff', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>
                      📧 Enviar para meu e-mail
                    </button>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {carrinho.map(p => (
                    <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', borderRadius: '8px', backgroundColor: '#faf5ff', border: '1px solid #ede9fe' }}>
                      {p.imagem && <img src={p.imagem} alt={p.nome} style={{ width: '48px', height: '48px', objectFit: 'contain', borderRadius: '6px', backgroundColor: '#fff' }} />}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.nome}</div>
                        <div style={{ fontSize: '0.75rem', color: '#dc2626', fontWeight: 700 }}>R$ {p.preco.toFixed(2).replace('.', ',')}</div>
                        {p.ambiente && <div style={{ fontSize: '0.68rem', color: '#7c3aed', fontWeight: 600 }}>{AMBIENTE_EMOJI[p.ambiente] || '🏠'} {p.ambiente}{p.tipoAmbiente ? ` · ${p.tipoAmbiente}` : ''}</div>}
                      </div>
                      <a href={p.link} target="_blank" rel="noopener noreferrer"
                        style={{ padding: '5px 10px', borderRadius: '6px', border: '1px solid #ddd6fe', backgroundColor: '#fff', color: '#7c3aed', fontWeight: 600, fontSize: '0.75rem', textDecoration: 'none', whiteSpace: 'nowrap' }}>
                        Ver oferta
                      </a>
                      <button onClick={() => toggleCarrinho(p)}
                        style={{ padding: '4px 8px', borderRadius: '6px', border: 'none', backgroundColor: '#fecaca', color: '#dc2626', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}>
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#f5f3ff', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.88rem', color: '#6b7280' }}>Total estimado:</span>
                  <span style={{ fontSize: '1.2rem', fontWeight: 900, color: '#7c3aed' }}>
                    R$ {carrinho.reduce((s, p) => s + p.preco, 0).toFixed(2).replace('.', ',')}
                  </span>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal e-mail */}
      {modalEmail && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '28px', maxWidth: '420px', width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
            {!enviado ? (
              <>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#111827', margin: '0 0 6px' }}>📧 Enviar minha lista</h2>
                <p style={{ fontSize: '0.82rem', color: '#6b7280', margin: '0 0 20px', lineHeight: 1.5 }}>
                  Enviaremos sua lista com os links de oferta direto para o seu e-mail. Ao enviar, você concorda em receber novidades sobre produtos para o seu ambiente.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#374151', display: 'block', marginBottom: '4px' }}>Seu e-mail *</label>
                    <input value={email} onChange={e => setEmail(e.target.value)} placeholder="voce@email.com" type="email"
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.9rem', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#374151', display: 'block', marginBottom: '4px' }}>
                      Compartilhar com <span style={{ fontWeight: 400, color: '#9ca3af' }}>(opcional — outros e-mails separados por vírgula)</span>
                    </label>
                    <input value={emailsExtra} onChange={e => setEmailsExtra(e.target.value)} placeholder="amigo@email.com, parceiro@email.com"
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.9rem', boxSizing: 'border-box' }} />
                  </div>
                </div>
                  <p style={{ fontSize: '0.7rem', color: '#9ca3af', margin: '0 0 16px', lineHeight: 1.4 }}>
                  Ao confirmar, você receberá a lista com os links de oferta e concorda em receber novidades sobre produtos para o seu ambiente.
                </p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => setModalEmail(false)}
                    style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #e5e7eb', backgroundColor: '#fff', color: '#374151', fontWeight: 600, cursor: 'pointer' }}>
                    Cancelar
                  </button>
                  <button onClick={handleEnviar} disabled={!email.trim() || enviando}
                    style={{ flex: 2, padding: '10px', borderRadius: '8px', border: 'none', backgroundColor: '#7c3aed', color: '#fff', fontWeight: 700, cursor: 'pointer', opacity: !email.trim() ? 0.6 : 1 }}>
                    {enviando ? '⏳ Salvando...' : '📧 Confirmar'}
                  </button>
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ fontSize: '3rem', marginBottom: '12px' }}>✅</div>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#111827', margin: '0 0 8px' }}>Interesse registrado!</h2>
                  <p style={{ fontSize: '0.85rem', color: '#6b7280', margin: '0 0 20px', lineHeight: 1.5 }}>
                  Sua lista foi enviada! Verifique sua caixa de entrada com os links de oferta.
                </p>
                <button onClick={() => { setModalEmail(false); setEnviado(false); }}
                  style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', backgroundColor: '#7c3aed', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
                  Fechar
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </main>
  );
}

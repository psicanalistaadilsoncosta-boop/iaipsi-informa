'use client';

import { useEffect, useState } from 'react';

const TIPOS = ['Roupas', 'Calçados', 'Acessórios'];

const COR = '#be185d'; // rosa escuro
const COR_LIGHT = '#fdf2f8';
const COR_BADGE = '#fbcfe8';

export default function VistaSePage() {
  const [dados, setDados] = useState<Record<string, any[]>>({});
  const [tipoAtivo, setTipoAtivo] = useState('Roupas');
  const [carrinho, setCarrinho] = useState<any[]>([]);
  const [email, setEmail] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/vista-se')
      .then(r => r.json())
      .then(d => {
        setDados(d.adulto || {});
        setLoading(false);
      });
  }, []);

  const produtos = dados[tipoAtivo] || [];

  function toggleCarrinho(p: any) {
    setCarrinho(prev =>
      prev.find(x => x.id === p.id)
        ? prev.filter(x => x.id !== p.id)
        : [...prev, p]
    );
  }

  function noCarrinho(p: any) {
    return carrinho.some(x => x.id === p.id);
  }

  async function enviarLista() {
    if (!email || carrinho.length === 0) return;

    // salva lead
    await fetch('/api/vista-se/lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, tipo: 'adulto', itens: carrinho.map(p => p.nome || p.name) }),
    });

    // envia email
    const linhas = carrinho.map(p =>
      `• ${p.nome || p.name} — ${p.link}`
    ).join('\n');

    await fetch('/api/ambientes/enviar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        assunto: '👗 Seu look favorito — links de oferta',
        corpo: `Olá!\n\nVocê selecionou estes itens no Vista-se:\n\n${linhas}\n\nBoas compras!`,
      }),
    });

    setEnviado(true);
  }

  const total = carrinho.reduce((s, p) => s + (parseFloat(p.preco || p.price || '0') || 0), 0);

  return (
    <div style={{ fontFamily: 'sans-serif', minHeight: '100vh', background: COR_LIGHT }}>
      {/* Header */}
      <div style={{ background: COR, color: '#fff', padding: '2rem 1rem 1.5rem', textAlign: 'center' }}>
        <div style={{ fontSize: '2rem' }}>👗</div>
        <h1 style={{ margin: '0.5rem 0 0.25rem', fontSize: '1.8rem', fontWeight: 700 }}>Vista-se</h1>
        <p style={{ margin: 0, opacity: 0.85, fontSize: '1rem' }}>
          Escolha seu estilo, monte sua lista e receba os links no e-mail
        </p>
      </div>

      {/* Abas de tipo */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', padding: '1rem', flexWrap: 'wrap', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
        {TIPOS.map(t => (
          <button
            key={t}
            onClick={() => setTipoAtivo(t)}
            style={{
              padding: '0.5rem 1.25rem',
              borderRadius: '2rem',
              border: 'none',
              cursor: 'pointer',
              fontWeight: tipoAtivo === t ? 700 : 400,
              background: tipoAtivo === t ? COR : '#f3f4f6',
              color: tipoAtivo === t ? '#fff' : '#374151',
              fontSize: '0.95rem',
              transition: 'all 0.2s',
            }}
          >
            {t} {dados[t] ? `(${dados[t].length})` : ''}
          </button>
        ))}
      </div>

      {/* Produtos */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '1.5rem 1rem' }}>
        {loading ? (
          <p style={{ textAlign: 'center', color: '#9ca3af' }}>Carregando...</p>
        ) : produtos.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#9ca3af' }}>Nenhum produto nesta categoria ainda.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
            {produtos.map((p: any) => {
              const nome = p.nome || p.name || '';
              const preco = p.preco || p.price || '';
              const img = p.imagem || p.thumbnail || p.imageUrl || '';
              const loja = p.loja || p.storeName || p.nomeLoja || '';
              const selected = noCarrinho(p);
              return (
                <div
                  key={p.id}
                  onClick={() => toggleCarrinho(p)}
                  style={{
                    background: '#fff',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    border: selected ? `2px solid ${COR}` : '2px solid transparent',
                    boxShadow: selected ? `0 0 0 3px ${COR_BADGE}` : '0 1px 4px rgba(0,0,0,0.08)',
                    transition: 'all 0.2s',
                    position: 'relative',
                  }}
                >
                  {selected && (
                    <div style={{
                      position: 'absolute', top: 8, right: 8,
                      background: COR, color: '#fff',
                      borderRadius: '50%', width: 24, height: 24,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.8rem', fontWeight: 700,
                    }}>✓</div>
                  )}
                  {img && (
                    <img src={img} alt={nome} style={{ width: '100%', height: '160px', objectFit: 'cover' }} />
                  )}
                  <div style={{ padding: '0.75rem' }}>
                    <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: '0.25rem' }}>{loja}</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1f2937', lineHeight: 1.3, marginBottom: '0.4rem' }}>
                      {nome.length > 60 ? nome.slice(0, 57) + '...' : nome}
                    </div>
                    {preco && (
                      <div style={{ fontSize: '0.95rem', fontWeight: 700, color: COR }}>
                        R$ {parseFloat(preco).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Carrinho flutuante */}
      {carrinho.length > 0 && (
        <div style={{
          position: 'fixed', bottom: '1.5rem', right: '1.5rem',
          background: COR, color: '#fff',
          borderRadius: '16px', padding: '1rem 1.25rem',
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
          minWidth: '220px', zIndex: 100,
        }}>
          <div style={{ fontWeight: 700, marginBottom: '0.5rem' }}>
            👗 {carrinho.length} {carrinho.length === 1 ? 'item' : 'itens'}
          </div>
          {total > 0 && (
            <div style={{ fontSize: '0.85rem', marginBottom: '0.75rem', opacity: 0.9 }}>
              Total aprox: R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          )}
          <button
            onClick={() => setShowModal(true)}
            style={{
              width: '100%', padding: '0.5rem',
              background: '#fff', color: COR,
              border: 'none', borderRadius: '8px',
              fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem',
            }}
          >
            Receber links por e-mail
          </button>
        </div>
      )}

      {/* Modal email */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200,
        }}>
          <div style={{
            background: '#fff', borderRadius: '16px', padding: '2rem',
            width: '90%', maxWidth: '400px', textAlign: 'center',
          }}>
            {!enviado ? (
              <>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>👗</div>
                <h2 style={{ margin: '0 0 0.5rem', color: '#1f2937' }}>Receber minha lista</h2>
                <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '1rem' }}>
                  {carrinho.length} {carrinho.length === 1 ? 'item selecionado' : 'itens selecionados'}
                </p>
                <input
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  style={{
                    width: '100%', padding: '0.75rem', borderRadius: '8px',
                    border: '1px solid #d1d5db', fontSize: '1rem',
                    boxSizing: 'border-box', marginBottom: '0.75rem',
                  }}
                />
                <button
                  onClick={enviarLista}
                  style={{
                    width: '100%', padding: '0.75rem',
                    background: COR, color: '#fff',
                    border: 'none', borderRadius: '8px',
                    fontWeight: 700, cursor: 'pointer', fontSize: '1rem',
                    marginBottom: '0.5rem',
                  }}
                >
                  Enviar links
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}
                >
                  Cancelar
                </button>
              </>
            ) : (
              <>
                <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>✅</div>
                <h2 style={{ color: '#1f2937' }}>Enviado!</h2>
                <p style={{ color: '#6b7280' }}>Verifique sua caixa de entrada.</p>
                <button
                  onClick={() => { setShowModal(false); setEnviado(false); setCarrinho([]); }}
                  style={{
                    padding: '0.75rem 2rem', background: COR, color: '#fff',
                    border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer',
                  }}
                >
                  Fechar
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

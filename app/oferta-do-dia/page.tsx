'use client';

import { useState, useEffect } from 'react';

interface OfertaDia {
  titulo: string;
  descricao: string;
  imagem: string;
  imagens?: string[];
  link: string;
  loja: string;
  logo: string;
  preco: string;
  precoOriginal: string;
  parcelas?: string;
  valorParcela?: string;
  cupom: string;
  validade: string;
  categoria: string;
}

function Countdown({ endAt }: { endAt: string }) {
  const [tempo, setTempo] = useState('');

  useEffect(() => {
    function atualizar() {
      const diff = new Date(endAt).getTime() - Date.now();
      if (diff <= 0) { setTempo('Expirado'); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTempo(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
    }
    atualizar();
    const interval = setInterval(atualizar, 1000);
    return () => clearInterval(interval);
  }, [endAt]);

  return (
    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', margin: '16px 0' }}>
      {tempo.split(':').map((t, i) => (
        <div key={i} style={{ backgroundColor: '#dc2626', color: '#fff', borderRadius: '10px', padding: '10px 14px', textAlign: 'center', minWidth: '56px' }}>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, lineHeight: 1 }}>{t}</div>
          <div style={{ fontSize: '0.6rem', marginTop: '4px', opacity: 0.8 }}>{['HORAS', 'MIN', 'SEG'][i]}</div>
        </div>
      ))}
    </div>
  );
}

export default function OfertaDoDiaPage() {
  const [oferta, setOferta] = useState<OfertaDia | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiado, setCopiado] = useState(false);
  const [imagemAtiva, setImagemAtiva] = useState(0);

  useEffect(() => {
    fetch('/oferta-do-dia.json')
      .then(r => r.json())
      .then(d => { if (d.titulo) setOferta(d); })
      .finally(() => setLoading(false));
  }, []);

  function copiar() {
    if (oferta?.cupom) {
      navigator.clipboard.writeText(oferta.cupom);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    }
  }

  if (loading) return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif', backgroundColor: '#f9fafb' }}>
      <p style={{ color: '#9ca3af' }}>⏳ Carregando...</p>
    </main>
  );

  if (!oferta) return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif', backgroundColor: '#f9fafb' }}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ color: '#6b7280', fontSize: '1.1rem', marginBottom: '16px' }}>Nenhuma oferta do dia no momento.</p>
        <a href="/ofertas" style={{ color: '#dc2626', fontWeight: 600, textDecoration: 'none' }}>Ver todas as ofertas →</a>
      </div>
    </main>
  );

  const todasImagens = [oferta.imagem, ...(oferta.imagens || [])].filter(Boolean);
  const desconto = oferta.preco && oferta.precoOriginal
    ? Math.round((1 - parseFloat(oferta.preco) / parseFloat(oferta.precoOriginal)) * 100)
    : 0;

  return (
    <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '30px 20px', fontFamily: 'system-ui, sans-serif', backgroundColor: '#f9fafb', minHeight: '100vh' }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <a href="/ofertas" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#dc2626', fontWeight: 600, fontSize: '0.85rem', textDecoration: 'none' }}>
          ← Voltar às ofertas
        </a>
        <span style={{ backgroundColor: '#dc2626', color: '#fff', fontSize: '0.78rem', fontWeight: 700, padding: '4px 14px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '1px' }}>
          🔥 Oferta do Dia
        </span>
      </div>

      <div style={{ backgroundColor: '#fff', borderRadius: '20px', overflow: 'hidden', border: '1px solid #e5e7eb', boxShadow: '0 8px 32px rgba(0,0,0,0.06)' }}>

        {/* Layout lado a lado */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0' }}>

          {/* Esquerda — imagens */}
          <div style={{ backgroundColor: '#f9fafb', padding: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', borderRight: '1px solid #f3f4f6' }}>

            {/* Imagem principal */}
            <div style={{ width: '100%', maxWidth: '340px', height: '320px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #e5e7eb', overflow: 'hidden', padding: '16px' }}>
              {todasImagens[imagemAtiva] ? (
                <img src={todasImagens[imagemAtiva]} alt={oferta.titulo} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
              ) : (
                <span style={{ fontSize: '4rem' }}>🛍</span>
              )}
            </div>

            {/* Miniaturas */}
            {todasImagens.length > 1 && (
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
                {todasImagens.map((img, i) => (
                  <button key={i} onClick={() => setImagemAtiva(i)} style={{
                    width: '56px', height: '56px', borderRadius: '8px', overflow: 'hidden', border: `2px solid ${imagemAtiva === i ? '#dc2626' : '#e5e7eb'}`, backgroundColor: '#fff', cursor: 'pointer', padding: '4px', flexShrink: 0,
                  }}>
                    <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Direita — dados */}
          <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

                       {/* Loja */}
            {oferta.loja && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                {oferta.logo && (
                  <img src={oferta.logo} alt={oferta.loja}
                    style={{ height: '28px', objectFit: 'contain', backgroundColor: '#fff', borderRadius: '6px', border: '1px solid #e5e7eb', padding: '2px 6px' }}
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                )}
                <span style={{ fontSize: '0.85rem', color: '#6b7280', fontWeight: 500 }}>{oferta.loja}</span>
                {oferta.categoria && (
                  <span style={{ fontSize: '0.68rem', color: '#9ca3af', backgroundColor: '#f3f4f6', padding: '2px 8px', borderRadius: '20px' }}>{oferta.categoria}</span>
                )}
                        </div>
            )}

            {/* Título */}
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#111827', margin: 0, lineHeight: 1.3 }}>
              {oferta.titulo}
            </h1>

            {/* Descrição */}
            {oferta.descricao && (
              <p style={{ fontSize: '0.9rem', color: '#6b7280', margin: 0, lineHeight: 1.6 }}>
                {oferta.descricao}
              </p>
            )}

            {/* Preço */}
            {oferta.preco && (
              <div>
                {oferta.precoOriginal && (
                                    <div style={{ fontSize: '0.9rem', color: '#9ca3af', textDecoration: 'line-through' }}>
                    R$ {parseFloat(oferta.precoOriginal).toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                 <span style={{ fontSize: '2rem', fontWeight: 800, color: '#dc2626' }}>
                  R$ {parseFloat(oferta.preco).toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                </span>
                  {desconto > 0 && (
                    <span style={{ backgroundColor: '#dc2626', color: '#fff', fontSize: '0.85rem', fontWeight: 700, padding: '4px 10px', borderRadius: '6px' }}>
                      -{desconto}%
                    </span>
                  )}
                </div>
              </div>
            )}
            {/* Parcelas */}
            {oferta.parcelas && oferta.valorParcela && (
              <div style={{ fontSize: '0.88rem', color: '#6b7280' }}>
                ou em <strong style={{ color: '#111827' }}>{oferta.parcelas}x</strong> de{' '}
                <strong style={{ color: '#111827' }}>
                  R$ {parseFloat(oferta.valorParcela).toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                </strong>{' '}
                sem juros
              </div>
            )}


            {/* Countdown */}
            {oferta.validade && (
              <div>
                <p style={{ fontSize: '0.78rem', color: '#6b7280', margin: '0 0 4px' }}>⏱ Termina em:</p>
                <Countdown endAt={oferta.validade} />
              </div>
            )}

            {/* Cupom */}
            {oferta.cupom && (
              <div>
                <p style={{ fontSize: '0.78rem', color: '#6b7280', margin: '0 0 6px' }}>🏷 Use o cupom:</p>
                <button onClick={copiar} style={{
                  width: '100%', backgroundColor: copiado ? '#047857' : '#f5f3ff',
                  color: copiado ? '#fff' : '#7c3aed', border: '2px dashed #7c3aed',
                  borderRadius: '10px', padding: '10px', fontWeight: 800, fontSize: '1.2rem',
                  cursor: 'pointer', letterSpacing: '2px', transition: 'all 0.2s', textAlign: 'center',
                }}>
                  {copiado ? '✅ Copiado!' : oferta.cupom}
                </button>
              </div>
            )}

            {/* CTA */}
            <a href={oferta.link} target="_blank" rel="noopener noreferrer sponsored" style={{
              display: 'block', backgroundColor: '#dc2626', color: '#fff',
              padding: '14px 24px', borderRadius: '12px', fontWeight: 800,
              fontSize: '1.1rem', textAlign: 'center', textDecoration: 'none',
            }}>
              Comprar agora →
            </a>

            <p style={{ fontSize: '0.7rem', color: '#9ca3af', margin: 0, textAlign: 'center' }}>
              Link de afiliado · Preço sujeito a alteração
            </p>
          </div>
        </div>
      </div>

    </main>
  );
}
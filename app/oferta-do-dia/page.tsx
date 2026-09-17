'use client';

import { useState, useEffect } from 'react';

interface ProdutoPinado {
  id: string;
  nome: string;
  imagem: string;
  imagens?: string[];
  link: string;
  loja?: string;
  preco: number;
  precoOriginal: number;
  desconto: number;
  parcelas?: string;
  valorParcela?: string;
  cupom?: string;
  validade?: string;
  categoria?: string;
  ativo?: boolean;
  destinos: string[];
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
    <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
      {tempo.split(':').map((t, i) => (
        <div key={i} style={{ backgroundColor: '#dc2626', color: '#fff', borderRadius: '8px', padding: '8px 10px', textAlign: 'center', minWidth: '48px' }}>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, lineHeight: 1 }}>{t}</div>
          <div style={{ fontSize: '0.55rem', marginTop: '3px', opacity: 0.8 }}>{['HORAS', 'MIN', 'SEG'][i]}</div>
        </div>
      ))}
    </div>
  );
}

function formatarPreco(valor: number) {
  return valor.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function CardOferta({ p }: { p: ProdutoPinado }) {
  const [copiado, setCopiado] = useState(false);
  const [imagemAtiva, setImagemAtiva] = useState(0);
  const todasImagens = [p.imagem, ...(p.imagens || [])].filter(Boolean);
  const desconto = p.precoOriginal > p.preco
    ? Math.round((1 - p.preco / p.precoOriginal) * 100)
    : p.desconto || 0;

  return (
    <div style={{ backgroundColor: '#fff', borderRadius: '16px', overflow: 'hidden', border: '1px solid #e5e7eb', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>

      {/* Imagem */}
      <div style={{ position: 'relative', backgroundColor: '#f9fafb', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
        <div style={{ width: '100%', height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #f3f4f6', overflow: 'hidden', padding: '12px' }}>
          {todasImagens[imagemAtiva] ? (
            <img src={todasImagens[imagemAtiva]} alt={p.nome} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
          ) : (
            <span style={{ fontSize: '3rem' }}>🛍</span>
          )}
        </div>

        {/* Badge desconto */}
        {desconto > 0 && (
          <div style={{ position: 'absolute', top: '16px', left: '16px', backgroundColor: '#dc2626', color: '#fff', fontWeight: 800, fontSize: '1rem', padding: '6px 12px', borderRadius: '8px' }}>
            -{desconto}%
          </div>
        )}

        {/* Miniaturas */}
        {todasImagens.length > 1 && (
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {todasImagens.map((img, i) => (
              <button key={i} onClick={() => setImagemAtiva(i)} style={{
                width: '44px', height: '44px', borderRadius: '6px', overflow: 'hidden',
                border: `2px solid ${imagemAtiva === i ? '#dc2626' : '#e5e7eb'}`,
                backgroundColor: '#fff', cursor: 'pointer', padding: '3px', flexShrink: 0,
              }}>
                <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Dados */}
      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

        {/* Loja e categoria */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {p.loja && <span style={{ fontSize: '0.78rem', color: '#6b7280', fontWeight: 500 }}>🏪 {p.loja}</span>}
          {p.categoria && <span style={{ fontSize: '0.65rem', color: '#9ca3af', backgroundColor: '#f3f4f6', padding: '2px 8px', borderRadius: '20px' }}>{p.categoria}</span>}
        </div>

        {/* Título */}
        <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#111827', margin: 0, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {p.nome}
        </h2>

        {/* Preço */}
        <div>
          {p.precoOriginal > p.preco && (
            <div style={{ fontSize: '0.82rem', color: '#9ca3af', textDecoration: 'line-through' }}>
              R$ {formatarPreco(p.precoOriginal)}
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.6rem', fontWeight: 800, color: '#dc2626' }}>
              R$ {formatarPreco(p.preco)}
            </span>
          </div>
          {p.parcelas && p.valorParcela && (
            <div style={{ fontSize: '0.78rem', color: '#6b7280', marginTop: '4px' }}>
              ou <strong>{p.parcelas}x</strong> de <strong>R$ {formatarPreco(parseFloat(p.valorParcela))}</strong> sem juros
            </div>
          )}
        </div>

        {/* Countdown */}
        {p.validade && (
          <div>
            <p style={{ fontSize: '0.72rem', color: '#6b7280', margin: '0 0 6px', textAlign: 'center' }}>⏱ Termina em:</p>
            <Countdown endAt={p.validade} />
          </div>
        )}

        {/* Cupom */}
        {p.cupom && (
          <button onClick={() => { navigator.clipboard.writeText(p.cupom!); setCopiado(true); setTimeout(() => setCopiado(false), 2000); }}
            style={{ width: '100%', backgroundColor: copiado ? '#047857' : '#f5f3ff', color: copiado ? '#fff' : '#7c3aed', border: '2px dashed #7c3aed', borderRadius: '8px', padding: '8px', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', letterSpacing: '1px', textAlign: 'center' }}>
            {copiado ? '✅ Copiado!' : p.cupom}
          </button>
        )}

        {/* Aviso */}
        <div style={{ backgroundColor: '#fffbeb', border: '1px solid #fbbf24', borderRadius: '8px', padding: '8px 12px', fontSize: '0.72rem', color: '#92400e' }}>
          ⚠️ Confira preço e condições no site antes de comprar.
        </div>

        {/* CTA */}
        <a href={p.link} target="_blank" rel="noopener noreferrer sponsored" style={{
          display: 'block', backgroundColor: '#dc2626', color: '#fff',
          padding: '12px', borderRadius: '10px', fontWeight: 800,
          fontSize: '1rem', textAlign: 'center', textDecoration: 'none',
        }}>
          Ver oferta →
        </a>

        <p style={{ fontSize: '0.65rem', color: '#9ca3af', margin: 0, textAlign: 'center' }}>
          Link de afiliado
        </p>
      </div>
    </div>
  );
}

export default function OfertasDoDiaPage() {
  const [ofertas, setOfertas] = useState<ProdutoPinado[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/produtos/save')
      .then(r => r.json())
      .then((pinados: ProdutoPinado[]) => {
        const filtradas = pinados.filter(p => p.destinos?.includes('oferta-do-dia'));
        setOfertas(filtradas);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <main style={{ maxWidth: '900px', margin: '0 auto', padding: '30px 20px', fontFamily: 'system-ui, sans-serif', backgroundColor: '#f9fafb', minHeight: '100vh' }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <a href="/ofertas" style={{ color: '#dc2626', fontWeight: 600, fontSize: '0.85rem', textDecoration: 'none' }}>← Voltar às ofertas</a>
        <span style={{ backgroundColor: '#dc2626', color: '#fff', fontSize: '0.78rem', fontWeight: 700, padding: '4px 14px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '1px' }}>
          🔥 Ofertas do Dia
        </span>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280' }}>⏳ Carregando ofertas...</div>
      ) : ofertas.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280' }}>
          <p>Nenhuma oferta do dia no momento.</p>
          <a href="/ofertas" style={{ color: '#dc2626', fontWeight: 600, textDecoration: 'none' }}>Ver todas as ofertas →</a>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '24px' }}>
          {ofertas.map(p => <CardOferta key={p.id} p={p} />)}
        </div>
      )}

      <footer style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #e5e7eb', textAlign: 'center' }}>
        <p style={{ fontSize: '0.72rem', color: '#9ca3af', margin: 0, lineHeight: 1.6 }}>
          Links de afiliado — ao comprar você apoia o IAIPSI Informa sem custo adicional.<br />
          Preços e condições são de responsabilidade do anunciante. Confira sempre no site e no carrinho.
        </p>
      </footer>

    </main>
  );
}

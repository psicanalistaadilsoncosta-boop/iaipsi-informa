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
  categoria?: string;
}

function Countdown({ endAt }: { endAt: string }) {
  const [tempo, setTempo] = useState({ h: '00', m: '00', s: '00' });

  useEffect(() => {
    function atualizar() {
      const diff = new Date(endAt).getTime() - Date.now();
      if (diff <= 0) return;
      setTempo({
        h: String(Math.floor(diff / 3600000)).padStart(2, '0'),
        m: String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0'),
        s: String(Math.floor((diff % 60000) / 1000)).padStart(2, '0'),
      });
    }
    atualizar();
    const iv = setInterval(atualizar, 1000);
    return () => clearInterval(iv);
  }, [endAt]);

  return (
    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
      <span style={{ fontSize: '0.75rem', color: '#6b7280', marginRight: '4px' }}>⏱ Termina em:</span>
      {[tempo.h, tempo.m, tempo.s].map((t, i) => (
        <div key={i} style={{ backgroundColor: '#dc2626', color: '#fff', borderRadius: '6px', padding: '4px 8px', textAlign: 'center', minWidth: '40px' }}>
          <div style={{ fontSize: '1rem', fontWeight: 800, lineHeight: 1 }}>{t}</div>
          <div style={{ fontSize: '0.5rem', opacity: 0.8 }}>{['H', 'M', 'S'][i]}</div>
        </div>
      ))}
    </div>
  );
}

function formatarPreco(valor: number) {
  return valor.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export default function OfertaDestaque() {
  const [oferta, setOferta] = useState<ProdutoPinado | null>(null);
  const [fraseIA, setFraseIA] = useState('');
  const [imagemAtiva, setImagemAtiva] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Busca o destaque da home
       fetch('/api/produtos/save?tipo=destaque-home')
      .then(r => r.json())
      .then(async ({ id, frase }) => {
        if (!id) return;
        const pinados = await fetch('/api/produtos/save').then(r => r.json());
        const prod = pinados.find((p: ProdutoPinado) => p.id === id);
        if (!prod) return;
        setOferta(prod);
        setFraseIA(frase || '');
      })
      .finally(() => setLoading(false));
  }, []);

  const [vistoHoje, setVistoHoje] = useState(0);
  const [vendoAgora, setVendoAgora] = useState(0);

  useEffect(() => {
    const hora = new Date().getHours();
    const minuto = new Date().getMinutes();

    // Curva realista por horário
    const basePorHora: Record<number, number> = {
      0: 15, 1: 10, 2: 8, 3: 6, 4: 8, 5: 12,
      6: 35, 7: 80, 8: 140, 9: 180, 10: 220, 11: 260,
      12: 300, 13: 320, 14: 340, 15: 360, 16: 350, 17: 330,
      18: 310, 19: 290, 20: 260, 21: 220, 22: 160, 23: 90,
    };

    const aoVivoPorHora: Record<number, number> = {
      0: 4, 1: 3, 2: 2, 3: 2, 4: 3, 5: 5,
      6: 10, 7: 18, 8: 28, 9: 35, 10: 42, 11: 48,
      12: 55, 13: 58, 14: 60, 15: 62, 16: 58, 17: 52,
      18: 48, 19: 44, 20: 38, 21: 32, 22: 24, 23: 15,
    };

    const base = basePorHora[hora] || 100;
    const totalHoje = base + minuto * 2 + Math.floor(Math.random() * 20);
    const aoVivo = aoVivoPorHora[hora] + Math.floor(Math.random() * 8);

    setVistoHoje(totalHoje);
    setVendoAgora(aoVivo);

    // Incrementa a cada minuto
    const interval = setInterval(() => {
      setVistoHoje(v => v + Math.floor(Math.random() * 3) + 1);
      setVendoAgora(Math.floor(aoVivoPorHora[new Date().getHours()] + Math.random() * 8));
    }, 60000);

    return () => clearInterval(interval);
  }, []);


  if (loading || !oferta) return null;

  const todasImagens = [oferta.imagem, ...(oferta.imagens || [])].filter(Boolean);
  const desconto = oferta.precoOriginal > oferta.preco
    ? Math.round((1 - oferta.preco / oferta.precoOriginal) * 100)
    : oferta.desconto || 0;

  return (
    <section style={{ marginBottom: '32px' }}>
      {/* Cabeçalho da seção */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <div style={{ width: '4px', height: '28px', backgroundColor: '#dc2626', borderRadius: '2px' }} />
        <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#111827', margin: 0 }}>🔥 Oferta do Dia</h2>
        <a href="/oferta-do-dia" style={{ marginLeft: 'auto', fontSize: '0.8rem', color: '#dc2626', fontWeight: 600, textDecoration: 'none' }}>Ver todas →</a>
      </div>

      {/* Card principal estilo Groupon */}
      <div style={{ backgroundColor: '#fff', borderRadius: '16px', overflow: 'hidden', border: '1px solid #e5e7eb', boxShadow: '0 4px 20px rgba(220,38,38,0.08)' }}>
         <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '24px' }}>

          {/* Esquerda — imagem */}
          <div style={{ backgroundColor: '#f9fafb', padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', borderRight: '1px solid #f3f4f6', position: 'relative' }}>

            {/* Badge desconto */}
            {desconto > 0 && (
              <div style={{ position: 'absolute', top: '16px', left: '16px', backgroundColor: '#dc2626', color: '#fff', fontWeight: 800, fontSize: '1.1rem', padding: '6px 14px', borderRadius: '8px', zIndex: 1 }}>
                -{desconto}%
              </div>
            )}

            {/* Imagem principal */}
            <div style={{ width: '100%', height: '280px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden', padding: '16px' }}>
              {todasImagens[imagemAtiva] ? (
                <img src={todasImagens[imagemAtiva]} alt={oferta.nome}
                  style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
              ) : (
                <span style={{ fontSize: '4rem' }}>🛍</span>
              )}
            </div>

            {/* Miniaturas */}
            {todasImagens.length > 1 && (
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
                {todasImagens.map((img, i) => (
                  <button key={i} onClick={() => setImagemAtiva(i)} style={{
                    width: '52px', height: '52px', borderRadius: '8px',
                    border: `2px solid ${imagemAtiva === i ? '#dc2626' : '#e5e7eb'}`,
                    backgroundColor: '#fff', cursor: 'pointer', padding: '4px', flexShrink: 0, overflow: 'hidden',
                  }}>
                    <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Direita — dados */}
          <div style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '14px' }}>

            {/* Loja e categoria */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              {oferta.loja && <span style={{ fontSize: '0.82rem', color: '#6b7280', fontWeight: 500 }}>🏪 {oferta.loja}</span>}
              {oferta.categoria && (
                <span style={{ fontSize: '0.68rem', color: '#9ca3af', backgroundColor: '#f3f4f6', padding: '2px 8px', borderRadius: '20px' }}>
                  {oferta.categoria}
                </span>
              )}
            </div>

            {/* Título */}
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111827', margin: 0, lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {oferta.nome}
            </h3>

            {/* Visualizações */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.78rem', color: '#dc2626', fontWeight: 600, backgroundColor: '#fef2f2', padding: '4px 10px', borderRadius: '20px', border: '1px solid #fecaca' }}>
                🔴 {vendoAgora} vendo agora
              </span>
              <span style={{ fontSize: '0.78rem', color: '#6b7280', fontWeight: 600, backgroundColor: '#f9fafb', padding: '4px 10px', borderRadius: '20px', border: '1px solid #e5e7eb' }}>
                👁 {vistoHoje.toLocaleString('pt-BR')} viram hoje
              </span>
            </div>


            {/* Frase editorial IA */}
            {fraseIA && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', backgroundColor: '#eff6ff', borderRadius: '8px', padding: '10px 14px' }}>
                <span style={{ fontSize: '1rem', flexShrink: 0 }}>🔹</span>
                <p style={{ fontSize: '0.85rem', color: '#1e40af', fontStyle: 'italic', margin: 0, lineHeight: 1.5, fontWeight: 500 }}>
                  {fraseIA}
                </p>
              </div>
            )}

            {/* Preço */}
            <div>
              {oferta.precoOriginal > oferta.preco && (
                <div style={{ fontSize: '0.9rem', color: '#9ca3af', textDecoration: 'line-through' }}>
                  R$ {formatarPreco(oferta.precoOriginal)}
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '2.2rem', fontWeight: 800, color: '#dc2626' }}>
                  R$ {formatarPreco(oferta.preco)}
                </span>
                {desconto > 0 && (
                  <span style={{ backgroundColor: '#fef2f2', color: '#dc2626', fontSize: '0.9rem', fontWeight: 700, padding: '4px 10px', borderRadius: '6px', border: '1px solid #fecaca' }}>
                    Economize {desconto}%
                  </span>
                )}
              </div>
              {oferta.parcelas && oferta.valorParcela && (
                <div style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '4px' }}>
                  ou <strong style={{ color: '#111827' }}>{oferta.parcelas}x</strong> de{' '}
                  <strong style={{ color: '#111827' }}>R$ {formatarPreco(parseFloat(oferta.valorParcela))}</strong> sem juros
                </div>
              )}
            </div>

            {/* Countdown */}
            {(oferta as any).validade && (
              <Countdown endAt={(oferta as any).validade} />
            )}

            {/* Aviso */}
            <div style={{ fontSize: '0.72rem', color: '#9ca3af', lineHeight: 1.5 }}>
              ⚠️ Preço e condições sujeitos a alteração. Confira no site do anunciante.
            </div>

            {/* CTA */}
            <a href={oferta.link} target="_blank" rel="noopener noreferrer sponsored" style={{
              display: 'block', backgroundColor: '#dc2626', color: '#fff',
              padding: '14px 24px', borderRadius: '12px', fontWeight: 800,
              fontSize: '1.1rem', textAlign: 'center', textDecoration: 'none',
              boxShadow: '0 4px 12px rgba(220,38,38,0.3)',
            }}>
              Ver oferta completa →
            </a>

            <a href="/oferta-do-dia" style={{ textAlign: 'center', fontSize: '0.8rem', color: '#6b7280', textDecoration: 'none' }}>
              Ver todas as Ofertas do Dia →
            </a>

          </div>
        </div>
      </div>
    </section>
  );
}
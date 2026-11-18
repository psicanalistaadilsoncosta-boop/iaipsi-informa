'use client';

import { useState, useEffect } from 'react';
import Mascote from './Mascote';
import SeloLoja from './SeloLoja';
import BotaoWhatsApp from './BotaoWhatsApp';

// ─────────────────────────────────────────────────────────────
// Pose da mascote no card grande:
//   'apresenta' = em pé ao lado da foto (vídeo atual lupa-apresenta)
//   'sentada'   = sentada na borda de cima do card, pernas para fora
// Vídeos em public/mascote/ (lupa-sentada.webm, .webp e .png).
// Para voltar à pose em pé, troque a linha abaixo por:  { nome: 'lupa-apresenta', pose: 'apresenta' }
// ─────────────────────────────────────────────────────────────
const MASCOTE: { nome: string; pose: 'apresenta' | 'sentada' } = { nome: 'lupa-sentada', pose: 'sentada' };
const ALTURA_SENTADA = 200;          // computador
const ESCALA_CELULAR = 0.85;         // no celular ela fica 85% (≈170)
const FUNDO_VITRINE = '#F8EEDE';     // creme da marca
// Parte do vídeo abaixo do "assento" (pernas penduradas): 29% da altura
const PERNAS = Math.round(ALTURA_SENTADA * 0.29);
// Largura do vídeo da Lupa sentada (proporção 286 x 600)
const LARGURA_SENTADA = Math.round(ALTURA_SENTADA * 286 / 600);

export interface ProdutoPinado {
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
  destinos?: string[];
  moedaOriginal?: string;
  moedaUSD?: boolean;
  cotacaoUsada?: number;
  modaDestaque?: boolean; // ⭐ veio de loja marcada como Moda destaque
}

export function formatarPreco(valor: number) {
  return valor.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

// Desconto só quando a loja manda o preço "de" (nunca inventado)
export function descontoReal(p: ProdutoPinado) {
  return p.precoOriginal > p.preco ? Math.round((1 - p.preco / p.precoOriginal) * 100) : 0;
}

// "FogãoFogão de Piso5 Bocas" → "Fogão › Fogão de Piso › 5 Bocas"
function formatarCategoria(c: string) {
  return c.split(/(?<=[a-zà-ÿ])(?=[A-ZÀ-Ý0-9])/).map(s => s.trim()).filter(Boolean).join(' › ');
}

// Fala da Lupa no balão: a frase da IA, se houver; senão, uma frase feita com os dados da própria oferta
function falaDaLupa(p: ProdutoPinado, frase?: string) {
  if (frase) return frase;
  if (p.precoOriginal > p.preco) {
    return `Está R$ ${formatarPreco(p.precoOriginal - p.preco)} abaixo do preço de antes. Vale olhar de perto.`;
  }
  return 'A gente lupou. Você escolhe.';
}

function linkIr(p: ProdutoPinado) {
  return `/ir?url=${encodeURIComponent(p.link)}&nome=${encodeURIComponent(p.nome)}&imagem=${encodeURIComponent(p.imagem)}`;
}

// Escolhe as 4 ofertas da vitrine:
// 1ª = destaque da home (se houver); as outras 3 = ofertas "oferta-do-dia":
// primeiro as ⭐ Moda destaque (maior desconto, de lojas diferentes),
// depois uma por categoria diferente (maior desconto) e, por fim, completa com as melhores.
// Quando o Lupômetro existir, a ordenação passa a usar a nota dele.
export function montarVitrine(pinados: ProdutoPinado[], destaqueId?: string): ProdutoPinado[] {
  const destaque = destaqueId ? pinados.find(p => p.id === destaqueId) : undefined;
  const candidatas = pinados
    .filter(p => p.destinos?.includes('oferta-do-dia') && p.id !== destaque?.id)
    .sort((a, b) => descontoReal(b) - descontoReal(a));

  const principal = destaque || candidatas.shift();
  if (!principal) return [];

  const escolhidas: ProdutoPinado[] = [principal];
  const categorias = new Set([principal.categoria || '']);
  // ⭐ Moda destaque primeiro, sem repetir loja
  const lojasUsadas = new Set([principal.loja || '']);
  for (const p of candidatas) {
    if (escolhidas.length >= 4) break;
    if (p.modaDestaque && descontoReal(p) > 0 && !lojasUsadas.has(p.loja || '')) {
      escolhidas.push(p); lojasUsadas.add(p.loja || ''); categorias.add(p.categoria || '');
    }
  }
  for (const p of candidatas) {
    if (escolhidas.length >= 4) break;
    if (p.modaDestaque && descontoReal(p) > 0 && !escolhidas.includes(p)) escolhidas.push(p);
  }
  for (const p of candidatas) {
    if (escolhidas.length >= 4) break;
    const c = p.categoria || '';
    if (!categorias.has(c) && !escolhidas.includes(p)) { escolhidas.push(p); categorias.add(c); }
  }
  for (const p of candidatas) {
    if (escolhidas.length >= 4) break;
    if (!escolhidas.includes(p)) escolhidas.push(p);
  }
  return escolhidas;
}

function Countdown({ endAt }: { endAt: string }) {
  const [tempo, setTempo] = useState<string[] | null>(null);

  useEffect(() => {
    function atualizar() {
      const diff = new Date(endAt).getTime() - Date.now();
      if (diff <= 0) { setTempo(null); return; }
      setTempo([
        String(Math.floor(diff / 3600000)).padStart(2, '0'),
        String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0'),
        String(Math.floor((diff % 60000) / 1000)).padStart(2, '0'),
      ]);
    }
    atualizar();
    const iv = setInterval(atualizar, 1000);
    return () => clearInterval(iv);
  }, [endAt]);

  if (!tempo) return null;
  return (
    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
      <span style={{ fontSize: '0.75rem', color: '#6b7280', marginRight: '4px' }}>⏱ Termina em:</span>
      {tempo.map((t, i) => (
        <div key={i} style={{ backgroundColor: '#dc2626', color: '#fff', borderRadius: '6px', padding: '4px 8px', textAlign: 'center', minWidth: '40px' }}>
          <div style={{ fontSize: '1rem', fontWeight: 800, lineHeight: 1 }}>{t}</div>
          <div style={{ fontSize: '0.5rem', opacity: 0.8 }}>{['H', 'M', 'S'][i]}</div>
        </div>
      ))}
    </div>
  );
}

function CardGrande({ p, frase }: { p: ProdutoPinado; frase?: string }) {
  const [imagemAtiva, setImagemAtiva] = useState(0);
  const [copiado, setCopiado] = useState(false);
  const todasImagens = [p.imagem, ...(p.imagens || [])].filter(Boolean);
  const desconto = descontoReal(p);
  const apresenta = MASCOTE.pose === 'apresenta';
  const emUSD = p.moedaUSD || p.moedaOriginal === 'USD';

  return (
    <div className="vod-grande">
      {/* Mascote sentada na borda de cima */}
      {MASCOTE.pose === 'sentada' && (
        <>
          <div className="vod-mascote-sentada" style={{ bottom: `calc(100% - ${PERNAS}px)` }}>
            <Mascote nome={MASCOTE.nome} altura={ALTURA_SENTADA} />
          </div>
          {/* Balão de fala da Lupa, no espaço vazio à esquerda dela */}
          <div className="vod-balao" style={{ right: `${24 + LARGURA_SENTADA + 6}px` }}>
            <span className="vod-balao-txt">{falaDaLupa(p, frase)}</span>
          </div>
        </>
      )}

      {/* Esquerda — imagem */}
      <div className="vod-img" style={{ backgroundColor: '#f9fafb', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', position: 'relative' }}>
        {apresenta && (
          <div style={{ position: 'absolute', left: '8px', top: '110px', zIndex: 2 }}>
            <Mascote nome={MASCOTE.nome} altura={180} />
          </div>
        )}

        {desconto > 0 && (
          <div style={{ position: 'absolute', top: '16px', left: '16px', backgroundColor: '#dc2626', color: '#fff', fontWeight: 800, fontSize: '1.1rem', padding: '6px 14px', borderRadius: '8px', zIndex: 3 }}>
            -{desconto}%
          </div>
        )}

        <div className="vod-foto" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden', padding: '16px', ...(apresenta ? { paddingLeft: '115px' } : {}) }}>
          {todasImagens[imagemAtiva] ? (
            <img src={todasImagens[imagemAtiva]} alt={p.nome} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
          ) : (
            <span style={{ fontSize: '4rem' }}>🛍</span>
          )}
        </div>

        {todasImagens.length > 1 && (
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {todasImagens.map((img, i) => (
              <button key={i} onClick={() => setImagemAtiva(i)} style={{
                width: '48px', height: '48px', borderRadius: '8px',
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
      <div style={{ padding: '24px', paddingTop: MASCOTE.pose === 'sentada' ? '56px' : '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {p.loja && <span style={{ fontSize: '0.82rem', color: '#6b7280', fontWeight: 500 }}>🏪 {p.loja}</span>}
          <SeloLoja loja={p.loja} />
          {p.categoria && (
            <span style={{ fontSize: '0.68rem', color: '#9ca3af', backgroundColor: '#f3f4f6', padding: '2px 8px', borderRadius: '20px' }}>{formatarCategoria(p.categoria)}</span>
          )}
        </div>

        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111827', margin: 0, lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {p.nome}
        </h3>

        {frase && MASCOTE.pose !== 'sentada' && (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', backgroundColor: '#eff6ff', borderRadius: '8px', padding: '10px 14px' }}>
            <span style={{ fontSize: '1rem', flexShrink: 0 }}>🔹</span>
            <p style={{ fontSize: '0.85rem', color: '#1e40af', fontStyle: 'italic', margin: 0, lineHeight: 1.5, fontWeight: 500 }}>{frase}</p>
          </div>
        )}

        <div>
          {desconto > 0 && (
            <div style={{ fontSize: '0.9rem', color: '#9ca3af', textDecoration: 'line-through' }}>R$ {formatarPreco(p.precoOriginal)}</div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '2.1rem', fontWeight: 800, color: '#dc2626' }}>R$ {formatarPreco(p.preco)}</span>
            {desconto > 0 && (
              <span style={{ backgroundColor: '#fef2f2', color: '#dc2626', fontSize: '0.85rem', fontWeight: 700, padding: '4px 10px', borderRadius: '6px', border: '1px solid #fecaca' }}>
                Economize {desconto}%
              </span>
            )}
          </div>
          {p.parcelas && p.valorParcela && (
            <div style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '4px' }}>
              ou <strong style={{ color: '#111827' }}>{p.parcelas}x</strong> de{' '}
              <strong style={{ color: '#111827' }}>R$ {formatarPreco(parseFloat(p.valorParcela))}</strong> sem juros
            </div>
          )}
          {emUSD && (
            <div style={{ fontSize: '0.72rem', color: '#92400e', backgroundColor: '#fef3c7', padding: '4px 8px', borderRadius: '6px', display: 'inline-block', marginTop: '6px', fontWeight: 600 }}>
              💱 Preço convertido de USD para BRL{p.cotacaoUsada ? ` (cotação R$ ${Number(p.cotacaoUsada).toFixed(2).replace('.', ',')})` : ''}. Confira o valor final no site. (*sujeito a tributação)
            </div>
          )}
        </div>

        {p.validade && <Countdown endAt={p.validade} />}

        {p.cupom && (
          <button onClick={() => { navigator.clipboard.writeText(p.cupom!); setCopiado(true); setTimeout(() => setCopiado(false), 2000); }}
            style={{ width: '100%', backgroundColor: copiado ? '#047857' : '#f5f3ff', color: copiado ? '#fff' : '#7c3aed', border: '2px dashed #7c3aed', borderRadius: '8px', padding: '8px', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', letterSpacing: '1px' }}>
            {copiado ? '✅ Copiado!' : p.cupom}
          </button>
        )}

        <a href={linkIr(p)} style={{
          display: 'block', backgroundColor: '#dc2626', color: '#fff',
          padding: '14px 24px', borderRadius: '12px', fontWeight: 800,
          fontSize: '1.05rem', textAlign: 'center', textDecoration: 'none',
          boxShadow: '0 4px 12px rgba(220,38,38,0.3)',
        }}>
          Ver oferta →
        </a>
        <BotaoWhatsApp id={p.id} nome={p.nome} link={p.link} imagem={p.imagem} preco={p.preco} destaque />

        <div style={{ fontSize: '0.7rem', color: '#9ca3af', lineHeight: 1.5, textAlign: 'center' }}>
          ⚠️ Preço e condições sujeitos a alteração. Confira no site do anunciante. · Link de afiliado
        </div>
      </div>
    </div>
  );
}

function CardPequeno({ p, onClick }: { p: ProdutoPinado; onClick: () => void }) {
  const desconto = descontoReal(p);
  return (
    <button onClick={onClick} className="vod-pequeno" title="Ver em destaque">
      {desconto > 0 && (
        <span style={{ position: 'absolute', top: '6px', left: '6px', backgroundColor: '#dc2626', color: '#fff', fontSize: '0.7rem', fontWeight: 800, padding: '2px 6px', borderRadius: '6px', zIndex: 1 }}>
          -{desconto}%
        </span>
      )}
      <div style={{ width: '72px', height: '72px', flexShrink: 0, backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        {p.imagem ? <img src={p.imagem} alt="" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} /> : <span style={{ fontSize: '2rem' }}>🛍</span>}
      </div>
      <div style={{ minWidth: 0, textAlign: 'left' }}>
        {p.categoria && <div style={{ fontSize: '0.65rem', color: '#9ca3af', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{formatarCategoria(p.categoria)}</div>}
        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#111827', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.nome}</div>
        <div style={{ color: '#dc2626', fontWeight: 800, fontSize: '1rem' }}>R$ {formatarPreco(p.preco)}</div>
      </div>
    </button>
  );
}

// Vitrine: card grande + até 3 menores. Clicou num menor, ele troca de lugar com o grande.
export default function VitrineOfertaDia({ ofertas, destaqueId, frase, comCabecalho = false }: {
  ofertas: ProdutoPinado[];
  destaqueId?: string;
  frase?: string;
  comCabecalho?: boolean;
}) {
  const [ordem, setOrdem] = useState<ProdutoPinado[]>(ofertas);
  useEffect(() => { setOrdem(ofertas); }, [ofertas]);

  if (ordem.length === 0) return null;
  const [principal, ...outras] = ordem;

  function trocar(i: number) {
    setOrdem(atual => {
      const nova = [...atual];
      [nova[0], nova[i + 1]] = [nova[i + 1], nova[0]];
      return nova;
    });
  }

  return (
    <section style={{ marginBottom: '32px' }}>
      <style>{`
        .vod-grid { display: grid; grid-template-columns: minmax(0, 1fr) 260px; gap: 16px; align-items: start; }
        .vod-grid.vod-so { grid-template-columns: minmax(0, 1fr); }
        .vod-grande { position: relative; background: #fff; border: 2px solid #dc2626; border-radius: 16px; box-shadow: 0 4px 20px rgba(220,38,38,0.08);
                      display: grid; grid-template-columns: repeat(auto-fit, minmax(min(300px, 100%), 1fr)); }
        .vod-img { border-radius: 14px 0 0 14px; }
        .vod-foto { height: 300px; }
        .vod-mascote-sentada { position: absolute; right: 24px; z-index: 4; pointer-events: none; }
        .vod-balao { position: absolute; bottom: calc(100% + 28px); max-width: 380px; z-index: 4;
                     background: #fff; border: 2px solid #dc2626; border-radius: 16px; padding: 10px 14px;
                     font-size: 0.9rem; font-weight: 600; font-style: italic; color: #1f2937; line-height: 1.4;
                     box-shadow: 0 4px 14px rgba(0,0,0,0.08); animation: vod-pop .35s ease-out; }
        .vod-balao-txt { display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
        .vod-balao::after { content: ''; position: absolute; right: -9px; bottom: 14px; width: 14px; height: 14px; background: #fff;
                            border-right: 2px solid #dc2626; border-bottom: 2px solid #dc2626; transform: rotate(-45deg); }
        @keyframes vod-pop { from { opacity: 0; transform: translateY(6px) scale(.97); } to { opacity: 1; transform: none; } }
        .vod-lista { display: flex; flex-direction: column; gap: 12px; }
        .vod-pequeno { position: relative; display: flex; gap: 10px; align-items: center; background: #fff; border: 1px solid #e5e7eb; border-radius: 12px;
                       padding: 10px; cursor: pointer; font: inherit; width: 100%; transition: border-color .15s, transform .15s; }
        .vod-pequeno:hover { border-color: #dc2626; transform: translateY(-2px); }
        @media (max-width: 760px) {
          .vod-grid { grid-template-columns: minmax(0, 1fr); }
          .vod-img { border-radius: 14px 14px 0 0; }
          .vod-lista { flex-direction: row; overflow-x: auto; padding-bottom: 6px; scroll-snap-type: x mandatory; }
          .vod-pequeno { min-width: 230px; width: 230px; scroll-snap-align: start; }
          .vod-balao { left: 8px; font-size: 0.82rem; bottom: calc(100% + 16px); }
          .vod-foto { height: 200px; }
          .vod-mascote-sentada { transform: scale(${ESCALA_CELULAR}); transform-origin: 100% ${ALTURA_SENTADA - PERNAS}px; }
        }
      `}</style>

      {comCabecalho && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div style={{ width: '4px', height: '28px', backgroundColor: '#dc2626', borderRadius: '2px' }} />
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#111827', margin: 0 }}>
            🔍 Ofertas do Dia <span style={{ fontWeight: 500, color: '#6b7280', fontSize: '0.85rem' }}>· lupadas hoje</span>
          </h2>
          <a href="/oferta-do-dia" style={{ marginLeft: 'auto', fontSize: '0.8rem', color: '#dc2626', fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap' }}>Ver todas →</a>
        </div>
      )}

      {/* Espaço para a mascote sentada não cobrir o cabeçalho */}
      <div style={{
        backgroundColor: FUNDO_VITRINE, borderRadius: '20px',
        padding: `${MASCOTE.pose === 'sentada' ? ALTURA_SENTADA - PERNAS + 12 : 16}px 16px 16px`,
      }}>
        <div className={`vod-grid${outras.length === 0 ? ' vod-so' : ''}`}>
          <CardGrande key={principal.id} p={principal} frase={principal.id === destaqueId ? frase : undefined} />

          {outras.length > 0 && (
            <div>
              <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600, marginBottom: '8px' }}>Toque para ver em destaque</div>
              <div className="vod-lista">
                {outras.map((p, i) => <CardPequeno key={p.id} p={p} onClick={() => trocar(i)} />)}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

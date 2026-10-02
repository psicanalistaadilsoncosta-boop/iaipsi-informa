'use client';
// app/temas/VitrineTematica.tsx
// Molde único das vitrines temáticas. O visual vem da ficha em temas.ts;
// os produtos vêm da função "carregar" que cada página passa.

import { useEffect, useMemo, useState } from 'react';
import { Baloo_2 } from 'next/font/google';
import SeloLoja from '../SeloLoja';
import { TEMAS, FAIXAS_PRECO } from './temas';

const baloo = Baloo_2({ subsets: ['latin'], weight: ['700', '800'], display: 'swap' });

type Props = {
  temaId: keyof typeof TEMAS;
  carregar: () => Promise<Record<string, any[]>>; // { tipo: produtos[] }
  tiposOrdem?: string[];                           // ordem das abas no filtro por tipo
};

const num = (v: any) => parseFloat(String(v ?? '').replace(',', '.')) || 0;
const brl = (v: number) => 'R$ ' + v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function VitrineTematica({ temaId, carregar, tiposOrdem }: Props) {
  const T = TEMAS[temaId];
  const [dados, setDados] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState<string | null>(null);
  const [lista, setLista] = useState<any[]>([]);
  const [email, setEmail] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [enviado, setEnviado] = useState(false);

  useEffect(() => {
    carregar().then(d => { setDados(d || {}); setLoading(false); }).catch(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // grupos do filtro: por tipo (abas da vitrine) ou por faixa de preço (datas)
  const grupos = useMemo(() => {
    if (T.filtro === 'tipo') {
      const nomes = tiposOrdem?.length ? tiposOrdem.filter(t => dados[t]?.length) : Object.keys(dados).filter(t => dados[t]?.length);
      return nomes.map(n => ({ nome: n, itens: dados[n] }));
    }
    const vistos = new Set<string>();
    const todos = Object.values(dados).flat().filter(p => (vistos.has(p.id) ? false : (vistos.add(p.id), true)));
    return FAIXAS_PRECO.map(f => ({ nome: f.nome, itens: todos.filter(p => { const v = num(p.preco ?? p.price); return v >= f.min && v <= f.max; }) }))
      .filter(g => g.itens.length);
  }, [dados, T.filtro, tiposOrdem]);

  const todosUnicos = useMemo(() => {
    const vistos = new Set<string>();
    return grupos.flatMap(g => g.itens).filter(p => (vistos.has(p.id) ? false : (vistos.add(p.id), true)));
  }, [grupos]);

  // vitrines por tipo abrem na primeira aba; datas abrem em "Todos"
  const ativo = filtro ?? (T.filtro === 'tipo' ? grupos[0]?.nome ?? null : null);
  const produtos = ativo ? grupos.find(g => g.nome === ativo)?.itens || [] : todosUnicos;

  const naLista = (p: any) => lista.some(x => x.id === p.id);
  const alternar = (p: any) => setLista(prev => (prev.some(x => x.id === p.id) ? prev.filter(x => x.id !== p.id) : [...prev, p]));
  const total = lista.reduce((s, p) => s + num(p.preco ?? p.price), 0);

  async function enviarLista() {
    if (!email || lista.length === 0) return;
    await fetch('/api/vista-se/lead', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, tipo: T.leadTipo, itens: lista.map(p => p.nome || p.name) }),
    });
    await fetch('/api/ambientes/enviar', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        produtos: lista.map(p => ({
          nome: p.nome || p.name || '',
          preco: num(p.preco ?? p.price),
          precoOriginal: num(p.precoOriginal) || undefined,
          desconto: p.desconto || undefined,
          parcelas: p.parcelas || undefined,
          valorParcela: p.valorParcela || undefined,
          link: p.link || '',
          imagem: p.imagem || p.thumbnail || p.imageUrl || '',
          loja: p.loja || p.storeName || p.nomeLoja || '',
        })),
      }),
    });
    setEnviado(true);
  }

  const vars = {
    '--t-bg': T.cores[0], '--t-1': T.cores[1], '--t-2': T.cores[2],
    '--t-3': T.cores[3], '--t-soft': T.cores[4], '--t-ink': T.cores[5],
  } as React.CSSProperties;
  const display = baloo.style.fontFamily;

  return (
    <div className="vt" style={vars}>
      <style>{CSS}</style>

      <div className="vt-faixa">{T.faixa}</div>

      <section className="vt-banner">
        <div className="vt-deco a" aria-hidden="true">{T.deco[0]}</div>
        <div className="vt-deco b" aria-hidden="true">{T.deco[1]}</div>
        <div className="vt-banner-in">
          <div>
            <span className="vt-eyebrow">{T.eyebrow}</span>
            <h1 style={{ fontFamily: display }}>{T.titulo[0]}<em>{T.titulo[1]}</em>{T.titulo[2]}</h1>
            <p>{T.sub}</p>
            <a className="vt-cta" href="#vt-produtos">{T.cta}</a>
          </div>
          <div className="vt-lupa" aria-hidden="true">
            <div className="aro" /><div className="cabo" />
            <div className="dentro">{T.emoji}</div>
            {T.chapeu && <div className="chapeu">{T.chapeu}</div>}
          </div>
        </div>
      </section>

      <main className="vt-main" id="vt-produtos">
        <div className="vt-chips">
          {T.filtro === 'preco' && (
            <button type="button" className="vt-chip" aria-pressed={!ativo} onClick={() => setFiltro(null)}>Todos</button>
          )}
          {grupos.map(g => (
            <button key={g.nome} type="button" className="vt-chip" aria-pressed={ativo === g.nome} onClick={() => setFiltro(g.nome)}>
              {g.nome} ({g.itens.length})
            </button>
          ))}
        </div>

        <p className="vt-aviso">
          Preços, descontos, frete e disponibilidade são referenciais: valem as condições exibidas na loja no momento da compra.
          Lojas com 💵 ficam em outro país e a compra pode ter imposto de importação, que nem sempre aparece no carrinho.
        </p>

        {loading ? (
          <p className="vt-vazio">Carregando…</p>
        ) : produtos.length === 0 ? (
          <p className="vt-vazio">Nenhum produto nesta vitrine ainda.</p>
        ) : (
          <div className="vt-grade">
            {produtos.map((p: any) => {
              const nome = p.nome || p.name || '';
              const preco = num(p.preco ?? p.price);
              const antigo = num(p.precoOriginal);
              const off = antigo > preco && preco > 0 ? Math.round((1 - preco / antigo) * 100) : 0;
              const img = p.imagem || p.thumbnail || p.imageUrl || '';
              const loja = p.lojaNome || p.loja || p.storeName || p.nomeLoja || '';
              const sel = naLista(p);
              return (
                <article key={p.id} className={`vt-card${sel ? ' sel' : ''}`}>
                  <div className="vt-foto">
                    {img ? <img src={img} alt={nome} loading="lazy" /> : <span aria-hidden="true">{T.emoji}</span>}
                    {off > 0 && <span className="vt-off">-{off}%</span>}
                  </div>
                  <div className="vt-info">
                    <div className="vt-loja">{loja}</div>
                    <SeloLoja loja={p.loja} compacto />
                    <div className="vt-nome">{nome.length > 70 ? nome.slice(0, 67) + '…' : nome}</div>
                    {(p.moedaUSD || p.moedaOriginal === 'USD') && <div className="vt-usd">💵 Preço convertido de USD</div>}
                    {antigo > preco && <div className="vt-antigo">{brl(antigo)}</div>}
                    {preco > 0 && <div className="vt-preco" style={{ fontFamily: display }}>{brl(preco)}</div>}
                    <div className="vt-acoes">
                      <a className="vt-ver" href={p.link} target="_blank" rel="noopener noreferrer sponsored">Ver na loja ↗</a>
                      <button type="button" className="vt-pedir" aria-pressed={sel} onClick={() => alternar(p)}>
                        {T.data ? (sel ? '✓ Pedido' : '♡ Pedir') : (sel ? '✓ Na lista' : '+ Lista')}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>

      {lista.length > 0 && (
        <div className="vt-flutua">
          <b>{T.data ? '♡' : '🛒'} {lista.length} {lista.length === 1 ? 'item' : 'itens'}</b>
          {total > 0 && <span>Total aprox.: {brl(total)}</span>}
          <button type="button" onClick={() => setShowModal(true)}>Receber links por e-mail</button>
        </div>
      )}

      {showModal && (
        <div className="vt-modal" role="dialog" aria-modal="true">
          <div className="vt-modal-in">
            {!enviado ? (
              <>
                <div style={{ fontSize: '2rem' }}>{T.emoji}</div>
                <h2>Receber minha lista</h2>
                <p>{lista.length} {lista.length === 1 ? 'item selecionado' : 'itens selecionados'}</p>
                <input id="vt-email" type="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} />
                <button type="button" className="vt-ok" onClick={enviarLista}>Enviar links</button>
                <button type="button" className="vt-cancela" onClick={() => setShowModal(false)}>Cancelar</button>
              </>
            ) : (
              <>
                <div style={{ fontSize: '3rem' }}>✅</div>
                <h2>Enviado!</h2>
                <p>Verifique sua caixa de entrada.</p>
                <button type="button" className="vt-ok" onClick={() => { setShowModal(false); setEnviado(false); setLista([]); }}>Fechar</button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const CSS = `
.vt{background:var(--t-bg);color:#2B2635;min-height:100vh;font-family:"Segoe UI",system-ui,-apple-system,Roboto,Arial,sans-serif}
.vt-faixa{background:var(--t-1);color:#fff;text-align:center;font-weight:800;font-size:13px;padding:9px 16px}
.vt-banner{position:relative;overflow:hidden;background:linear-gradient(120deg,var(--t-1),var(--t-2));color:#fff}
.vt-banner-in{max-width:1180px;margin:0 auto;padding:32px 16px 36px;display:grid;grid-template-columns:1.3fr .7fr;gap:24px;align-items:center;position:relative;z-index:1}
.vt-eyebrow{display:inline-block;background:rgba(255,255,255,.2);border:1px solid rgba(255,255,255,.35);border-radius:999px;padding:4px 12px;font-size:12px;font-weight:800;letter-spacing:.06em;text-transform:uppercase}
.vt-banner h1{font-weight:800;font-size:clamp(30px,5vw,50px);line-height:1.05;margin:12px 0 10px;text-wrap:balance}
.vt-banner h1 em{font-style:normal;color:var(--t-3)}
.vt-banner p{font-size:17px;max-width:46ch;margin:0 0 18px;opacity:.95}
.vt-cta{display:inline-block;background:var(--t-3);color:var(--t-ink);border-radius:999px;padding:12px 24px;font-weight:800;text-decoration:none;box-shadow:0 8px 20px rgba(0,0,0,.18);transition:transform .2s}
.vt-cta:hover{transform:translateY(-3px)}
.vt-lupa{justify-self:center;position:relative;width:min(200px,100%);aspect-ratio:1;display:grid;place-items:center}
.vt-lupa .aro{position:absolute;inset:6%;border-radius:50%;background:rgba(255,255,255,.18);border:10px solid rgba(255,255,255,.9)}
.vt-lupa .cabo{position:absolute;width:16%;height:40%;background:var(--t-ink);border-radius:20px;right:4%;bottom:-8%;transform:rotate(-45deg);transform-origin:top}
.vt-lupa .dentro{position:relative;font-size:clamp(60px,9vw,96px);animation:vtboia 3.5s ease-in-out infinite}
.vt-lupa .chapeu{position:absolute;top:-4%;left:8%;font-size:clamp(38px,5vw,58px);transform:rotate(-18deg)}
.vt-deco{position:absolute;font-size:200px;opacity:.12;pointer-events:none}
.vt-deco.a{top:-50px;left:-40px;transform:rotate(-12deg)}
.vt-deco.b{bottom:-70px;right:28%;transform:rotate(14deg);font-size:170px}
@keyframes vtboia{0%,100%{transform:translateY(0) rotate(-4deg)}50%{transform:translateY(-10px) rotate(4deg)}}
.vt-main{max-width:1180px;margin:0 auto;padding:0 16px 120px}
.vt-chips{display:flex;gap:8px;flex-wrap:wrap;justify-content:center;padding:22px 0 8px}
.vt-chip{border:2px solid var(--t-soft);background:#fff;color:var(--t-ink);border-radius:999px;padding:8px 16px;font-weight:700;font-size:14px;cursor:pointer}
.vt-chip[aria-pressed="true"]{background:var(--t-1);border-color:var(--t-1);color:#fff}
.vt-aviso{text-align:center;color:#6E6680;font-size:11px;max-width:760px;margin:4px auto 0}
.vt-vazio{text-align:center;color:#9ca3af;padding:40px 0}
.vt-grade{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:18px;padding-top:20px}
.vt-card{background:#fff;border-radius:18px;overflow:hidden;display:flex;flex-direction:column;border:2px solid transparent;box-shadow:0 6px 22px rgba(43,38,53,.07);transition:transform .25s,border-color .25s}
.vt-card:hover{transform:translateY(-6px);border-color:var(--t-1)}
.vt-card.sel{border-color:var(--t-2)}
.vt-foto{position:relative;height:180px;overflow:hidden;display:grid;place-items:center;background:linear-gradient(135deg,var(--t-soft),#fff);font-size:64px}
.vt-foto img{position:absolute;inset:0;width:100%;height:100%;max-width:none;object-fit:contain;background:#fff}
.vt-off{position:absolute;z-index:1;top:10px;left:10px;background:var(--t-1);color:#fff;border-radius:999px;padding:3px 10px;font-size:12px;font-weight:800}
.vt-info{padding:12px 14px 14px;display:flex;flex-direction:column;gap:3px;flex:1;min-width:0}
.vt-loja{font-size:11px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:var(--t-2)}
.vt-nome{font-weight:700;font-size:14px;line-height:1.3;color:#2B2635;margin:2px 0}
.vt-usd{font-size:11px;color:#92400e;background:#fef3c7;padding:2px 6px;border-radius:4px;font-weight:700;align-self:flex-start}
.vt-antigo{font-size:12px;color:#6E6680;text-decoration:line-through;margin-top:4px}
.vt-preco{font-weight:800;font-size:22px;line-height:1.1;color:var(--t-1)}
.vt-acoes{margin-top:auto;padding-top:10px;display:flex;flex-direction:column;gap:7px}
.vt-ver{text-align:center;text-decoration:none;background:var(--t-1);color:#fff;border-radius:999px;padding:9px 12px;font-weight:800;font-size:13px}
.vt-pedir{border:2px solid var(--t-1);background:#fff;color:var(--t-1);border-radius:999px;padding:7px 12px;font-weight:800;font-size:13px;cursor:pointer}
.vt-pedir[aria-pressed="true"]{background:var(--t-2);border-color:var(--t-2);color:#fff}
.vt-flutua{position:fixed;right:16px;bottom:calc(16px + env(safe-area-inset-bottom,0px));z-index:100;background:var(--t-2);color:#fff;border-radius:16px;padding:14px 16px;box-shadow:0 6px 24px rgba(0,0,0,.25);display:flex;flex-direction:column;gap:6px;min-width:220px}
.vt-flutua span{font-size:13px;opacity:.9}
.vt-flutua button{background:#fff;color:var(--t-2);border:0;border-radius:10px;padding:8px;font-weight:800;cursor:pointer}
.vt-modal{position:fixed;inset:0;background:rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;z-index:200;padding:16px}
.vt-modal-in{background:#fff;border-radius:18px;padding:28px;width:100%;max-width:400px;text-align:center}
.vt-modal-in h2{margin:6px 0;color:#1f2937}
.vt-modal-in p{color:#6b7280;font-size:14px}
.vt-modal-in input{width:100%;padding:12px;border-radius:10px;border:1px solid #d1d5db;font-size:16px;box-sizing:border-box;margin:8px 0 10px}
.vt-ok{width:100%;padding:12px;background:var(--t-1);color:#fff;border:0;border-radius:10px;font-weight:800;cursor:pointer;font-size:15px;margin-bottom:6px}
.vt-cancela{background:none;border:0;color:#9ca3af;cursor:pointer}
@media (max-width:760px){
  .vt-banner-in{grid-template-columns:1fr;padding:22px 16px 26px}
  .vt-lupa{position:absolute;right:8px;top:6px;width:110px}
  .vt-banner h1{padding-right:96px}
  .vt-banner p{font-size:15px}
  .vt-grade{grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
  .vt-foto{height:130px}
  .vt-preco{font-size:19px}
  .vt-flutua{left:16px;right:16px;min-width:0}
}
@media (prefers-reduced-motion:reduce){.vt *{animation:none!important;transition:none!important}}
`;

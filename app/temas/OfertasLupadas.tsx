// app/temas/OfertasLupadas.tsx
// Faixa "Lupadas da semana" da home: as ofertas selecionadas mais recentes, rolando para o lado.

import { TEMAS } from './temas';

export type Lupada = {
  id: string;
  nome: string;
  imagem: string;
  link: string;
  preco: number;
  precoOriginal?: number;
  loja?: string;
  moedaUSD?: boolean;
};

const brl = (v: number) => 'R$ ' + v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function OfertasLupadas({ itens }: { itens: Lupada[] }) {
  if (!itens?.length) return null;
  const c = TEMAS.selecionadas.cores;

  return (
    <section className="ol" style={{ ['--t-1' as any]: c[1], ['--t-2' as any]: c[2], ['--t-3' as any]: c[3], ['--t-soft' as any]: c[4], ['--t-ink' as any]: c[5] }}>
      <style>{CSS}</style>
      <div className="ol-topo">
        <div className="ol-barra" />
        <h2>🔍 Lupadas da semana</h2>
        <span className="ol-sub">ofertas que passaram pela nossa lupa</span>
        <a href="/ofertas-selecionadas" className="ol-todas">Ver todas →</a>
      </div>

      <div className="ol-trilho">
        {itens.map(p => {
          const off = p.precoOriginal && p.precoOriginal > p.preco ? Math.round((1 - p.preco / p.precoOriginal) * 100) : 0;
         const href = `/ir?url=${encodeURIComponent(p.link)}&nome=${encodeURIComponent(p.nome)}&imagem=${encodeURIComponent(p.imagem || '')}&loja=${encodeURIComponent(p.loja || '')}`;
          return (
            <a key={p.id} href={href} className="ol-card">
              <div className="ol-foto">
                {p.imagem && <img src={p.imagem} alt={p.nome} loading="lazy" />}
                {off > 0 && <span className="ol-off">-{off}%</span>}
              </div>
              <div className="ol-info">
                {p.loja && <div className="ol-loja">{p.loja}</div>}
                <div className="ol-nome">{p.nome}</div>
                {p.moedaUSD && <div className="ol-usd">💵 Preço convertido de USD</div>}
                {off > 0 && <div className="ol-antigo">{brl(p.precoOriginal!)}</div>}
                <div className="ol-preco">{brl(p.preco)}</div>
                <span className="ol-ver">Ver oferta →</span>
              </div>
            </a>
          );
        })}
        <a href="/ofertas-selecionadas" className="ol-card ol-mais">
          <span>🔍</span>
          <b>Ver todas as lupadas</b>
        </a>
      </div>
    </section>
  );
}

const CSS = `
.ol{margin-bottom:28px}
.ol-topo{display:flex;align-items:center;gap:12px;margin-bottom:14px;flex-wrap:wrap}
.ol-barra{width:4px;height:28px;background:var(--t-1);border-radius:2px}
.ol-topo h2{font-size:1.2rem;font-weight:800;color:#111827;margin:0}
.ol-sub{font-size:.75rem;color:#9ca3af;font-weight:500}
.ol-todas{margin-left:auto;font-size:.8rem;color:var(--t-1);font-weight:700;text-decoration:none}
.ol-trilho{display:grid;grid-auto-flow:column;grid-auto-columns:minmax(200px,1fr);gap:14px;overflow-x:auto;scroll-snap-type:x mandatory;padding:4px 2px 14px}
.ol-trilho::-webkit-scrollbar{height:6px}
.ol-trilho::-webkit-scrollbar-button{display:none}
.ol-trilho::-webkit-scrollbar-track{background:transparent}
.ol-trilho::-webkit-scrollbar-thumb{background:var(--t-soft);border-radius:999px}
.ol-trilho:hover::-webkit-scrollbar-thumb{background:var(--t-1)}
@supports (-moz-appearance:none){.ol-trilho{scrollbar-width:thin;scrollbar-color:var(--t-soft) transparent}}
.ol-card{scroll-snap-align:start;background:#fff;border-radius:16px;overflow:hidden;text-decoration:none;color:inherit;display:flex;flex-direction:column;border:2px solid transparent;box-shadow:0 4px 16px rgba(0,0,0,.07);transition:transform .2s,border-color .2s}
.ol-card:hover{transform:translateY(-4px);border-color:var(--t-1)}
.ol-foto{position:relative;height:150px;background:#fff;overflow:hidden}
.ol-foto img{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;padding:8px;box-sizing:border-box}
.ol-off{position:absolute;z-index:1;top:8px;left:8px;background:#dc2626;color:#fff;font-size:.72rem;font-weight:800;padding:2px 8px;border-radius:999px}
.ol-info{padding:10px 12px 12px;display:flex;flex-direction:column;gap:2px;flex:1;min-width:0}
.ol-loja{font-size:.65rem;font-weight:800;letter-spacing:.05em;text-transform:uppercase;color:var(--t-2)}
.ol-nome{font-size:.82rem;font-weight:700;color:#111827;line-height:1.3;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;margin:2px 0}
.ol-usd{font-size:.65rem;color:#92400e;background:#fef3c7;padding:1px 6px;border-radius:4px;align-self:flex-start;font-weight:700}
.ol-antigo{font-size:.72rem;color:#9ca3af;text-decoration:line-through;margin-top:auto}
.ol-preco{font-size:1.1rem;font-weight:800;color:#dc2626}
.ol-ver{margin-top:8px;text-align:center;background:var(--t-1);color:#fff;border-radius:999px;padding:7px;font-size:.78rem;font-weight:800}
.ol-mais{align-items:center;justify-content:center;gap:8px;background:var(--t-soft);color:var(--t-ink);text-align:center;padding:16px;min-height:200px}
.ol-mais span{font-size:2.4rem}
@media (max-width:640px){.ol-trilho{grid-auto-columns:62%}.ol-foto{height:130px}}
`;

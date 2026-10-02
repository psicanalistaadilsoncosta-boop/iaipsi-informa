// app/temas/FiltrosLista.tsx
// Filtros por loja, categoria e faixa de preço para páginas de servidor (paginadas pela URL).
// Os filtros viram parâmetros na URL (?loja=&cat=&faixa=&pagina=), então o Google também enxerga cada página.

import { TEMAS, FAIXAS_PRECO, type Faixa } from './temas';

export type FiltrosAtivos = { loja?: string; cat?: string; faixa?: string };

const num = (v: any) => parseFloat(String(v ?? '').replace(',', '.')) || 0;

// Categoria do produto a partir do que foi marcado ao catalogar
export function categoriaDe(p: any): string {
  if (p.beleza) return 'Beleza';
  if (p.vistaSe) return ['Infantil', 'Bebê', 'Brinquedos'].includes(p.tipoVistaSe) ? 'Crianças' : 'Moda';
  if (p.ambiente) return p.ambiente === 'Quarto Infantil' ? 'Crianças' : 'Casa';
  if (p.momento) return 'Momentos';
  if (p.mercado) return 'Mercado';
  return 'Outros';
}

const ORDEM_CAT = ['Casa', 'Moda', 'Crianças', 'Beleza', 'Momentos', 'Mercado', 'Outros'];

function naFaixa(p: any, nome: string, faixas: Faixa[]) {
  const f = faixas.find(x => x.nome === nome);
  if (!f) return true;
  const v = num(p.preco);
  return v >= f.min && v <= f.max;
}

export function aplicarFiltros<T>(itens: T[], f: FiltrosAtivos, faixas: Faixa[] = FAIXAS_PRECO, ignorar?: keyof FiltrosAtivos): T[] {
  return itens.filter((p: any) =>
    (ignorar === 'loja' || !f.loja || p.loja === f.loja) &&
    (ignorar === 'cat' || !f.cat || categoriaDe(p) === f.cat) &&
    (ignorar === 'faixa' || !f.faixa || naFaixa(p, f.faixa, faixas))
  );
}

export function linkFiltros(f: FiltrosAtivos & { pagina?: number }) {
  const q = new URLSearchParams();
  if (f.loja) q.set('loja', f.loja);
  if (f.cat) q.set('cat', f.cat);
  if (f.faixa) q.set('faixa', f.faixa);
  q.set('pagina', String(f.pagina || 1));
  return '?' + q.toString();
}

type Props = {
  todos: any[];                 // todos os itens da página, sem filtro
  ativos: FiltrosAtivos;
  temaId: keyof typeof TEMAS;
  faixas?: Faixa[];
  comCategoria?: boolean;       // padrão: sim
};

export default function FiltrosLista({ todos, ativos, temaId, faixas = FAIXAS_PRECO, comCategoria = true }: Props) {
  const c = TEMAS[temaId].cores;

  // cada linha conta os itens considerando os OUTROS filtros já escolhidos
  const paraLoja = aplicarFiltros(todos, ativos, faixas, 'loja');
  const paraCat = aplicarFiltros(todos, ativos, faixas, 'cat');
  const paraFaixa = aplicarFiltros(todos, ativos, faixas, 'faixa');

  const lojas = Array.from(new Set(todos.map(p => p.loja).filter(Boolean))).sort() as string[];
  const cats = ORDEM_CAT.filter(n => todos.some(p => categoriaDe(p) === n));

  const linha = (rotulo: string, chave: keyof FiltrosAtivos, opcoes: { nome: string; n: number; icone?: string }[], totalTodos: number, rotTodos = 'Todas') => (
    <div className="fl-linha">
      <span className="fl-rot">{rotulo}</span>
      <a href={linkFiltros({ ...ativos, [chave]: undefined })} className="fl-chip" aria-current={!ativos[chave] ? 'true' : undefined}>
        {rotTodos} ({totalTodos})
      </a>
      {opcoes.filter(o => o.n > 0 || ativos[chave] === o.nome).map(o => (
        <a key={o.nome} href={linkFiltros({ ...ativos, [chave]: o.nome })} className="fl-chip" aria-current={ativos[chave] === o.nome ? 'true' : undefined}>
          {o.icone ? o.icone + ' ' : ''}{o.nome} ({o.n})
        </a>
      ))}
    </div>
  );

  return (
    <div className="fl" style={{ ['--t-1' as any]: c[1], ['--t-2' as any]: c[2], ['--t-soft' as any]: c[4], ['--t-ink' as any]: c[5] }}>
      <style>{CSS}</style>
      {comCategoria && cats.length > 1 &&
        linha('Categoria', 'cat', cats.map(n => ({ nome: n, n: paraCat.filter(p => categoriaDe(p) === n).length })), paraCat.length)}
      {linha('Preço', 'faixa', faixas.map(f => ({ nome: f.nome, n: paraFaixa.filter(p => naFaixa(p, f.nome, faixas)).length })), paraFaixa.length, 'Todos')}
      {lojas.length > 1 &&
        linha('Loja', 'loja', lojas.map(l => ({ nome: l, n: paraLoja.filter(p => p.loja === l).length, icone: '🏪' })), paraLoja.length)}
    </div>
  );
}

const CSS = `
.fl{display:flex;flex-direction:column;gap:10px;margin-bottom:22px}
.fl-linha{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
.fl-rot{font-weight:800;font-size:.8rem;color:var(--t-ink);min-width:74px}
.fl-chip{padding:6px 14px;border-radius:999px;border:2px solid var(--t-soft);background:#fff;color:var(--t-ink);font-weight:700;font-size:.82rem;text-decoration:none;white-space:nowrap}
.fl-chip:hover{border-color:var(--t-1)}
.fl-chip[aria-current="true"]{background:var(--t-1);border-color:var(--t-1);color:#fff}
@media (max-width:700px){
  .fl-linha{flex-wrap:nowrap;overflow-x:auto;padding-bottom:4px;scrollbar-width:none}
  .fl-linha::-webkit-scrollbar{display:none}
  .fl-rot{min-width:auto}
}
`;

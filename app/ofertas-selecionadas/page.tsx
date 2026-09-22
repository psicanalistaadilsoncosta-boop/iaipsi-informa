import fs from 'fs/promises';
import path from 'path';
import Link from 'next/link';
import { kv } from '@/lib/kv';

interface ProdutoPinado {
  id: string;
  nome: string;
  imagem: string;
  link: string;
  preco: number;
  precoOriginal: number;
  desconto: number;
  destinos: string[];
  pinedAt: string;
  loja?: string;
}

const POR_PAGINA = 30;

async function getTodos(): Promise<ProdutoPinado[]> {
  try {
    const data = await kv.get<ProdutoPinado[]>('produtos:pinados');
    return (data || []).filter(p => p.destinos?.includes('ofertas-selecionadas'));
  } catch {}
  try {
    const filePath = path.join(process.cwd(), 'public', 'produtos-pinados.json');
    const raw = await fs.readFile(filePath, 'utf-8');
    return (JSON.parse(raw) as ProdutoPinado[]).filter(p => p.destinos?.includes('ofertas-selecionadas'));
  } catch { return []; }
}

async function getProdutos(pagina = 1, loja = ''): Promise<{ produtos: ProdutoPinado[]; total: number; lojas: string[] }> {
  const todos = await getTodos();
  const lojas = Array.from(new Set(todos.map(p => p.loja || '').filter(Boolean))).sort();
  const filtrados = loja ? todos.filter(p => p.loja === loja) : todos;
  const total = filtrados.length;
  const produtos = filtrados.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);
  return { produtos, total, lojas };
}
export default async function OfertasSelecionadasPage({ searchParams }: { searchParams: Promise<{ pagina?: string; loja?: string }> }) {
  const params = await searchParams;
  const pagina = Math.max(1, parseInt(params.pagina || '1'));
  const lojaFiltro = params.loja || '';
  const { produtos, total, lojas } = await getProdutos(pagina, lojaFiltro);
  const totalPaginas = Math.ceil(total / POR_PAGINA);

  return (
    <main style={{ maxWidth: '1060px', margin: '0 auto', padding: '30px 20px', fontFamily: 'system-ui, sans-serif', backgroundColor: '#f9fafb', minHeight: '100vh' }}>

      <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#2563eb', fontWeight: 600, fontSize: '0.85rem', textDecoration: 'none', marginBottom: '24px' }}>
        ← Voltar ao site
      </Link>

      <header style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', marginBottom: '32px', borderTop: '6px solid #2563eb' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#111827', margin: '0 0 6px' }}>⭐ Ofertas Selecionadas</h1>
        <p style={{ color: '#6b7280', fontSize: '0.95rem', margin: 0 }}>
          Produtos escolhidos a dedo — qualidade e custo-benefício garantidos.
        </p>
      </header>
      <div style={{ backgroundColor: '#fffbeb', border: '1px solid #fbbf24', borderRadius: '10px', padding: '12px 20px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontSize: '1.2rem' }}>⚠️</span>
        <p style={{ fontSize: '0.82rem', color: '#92400e', margin: 0, lineHeight: 1.5 }}>
          <strong>Atenção:</strong> Preços, parcelas e disponibilidade são de responsabilidade do anunciante e podem ser alterados a qualquer momento. Confira sempre as condições atuais no site da loja antes de finalizar a compra.
        </p>
      </div>

      {lojas.length > 1 && (
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
          <a href="?pagina=1"
            style={{ padding: '6px 16px', borderRadius: '999px', border: `2px solid ${!lojaFiltro ? '#2563eb' : '#e5e7eb'}`, backgroundColor: !lojaFiltro ? '#2563eb' : '#fff', color: !lojaFiltro ? '#fff' : '#374151', fontWeight: 600, fontSize: '0.82rem', textDecoration: 'none', whiteSpace: 'nowrap' }}>
            Todas ({total || 0})
          </a>
          {lojas.map(l => {
            const ativa = lojaFiltro === l;
            return (
              <a key={l} href={`?loja=${encodeURIComponent(l)}&pagina=1`}
                style={{ padding: '6px 16px', borderRadius: '999px', border: `2px solid ${ativa ? '#2563eb' : '#e5e7eb'}`, backgroundColor: ativa ? '#2563eb' : '#fff', color: ativa ? '#fff' : '#374151', fontWeight: 600, fontSize: '0.82rem', textDecoration: 'none', whiteSpace: 'nowrap' }}>
                🏪 {l}
              </a>
            );
          })}
        </div>
      )}

      {produtos.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280' }}>
          Nenhuma oferta selecionada no momento. Volte em breve!
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {produtos.map(p => {
            const desconto = p.precoOriginal > p.preco
              ? Math.round((1 - p.preco / p.precoOriginal) * 100)
              : p.desconto || 0;

            return (
             <a key={p.id} href={`/ir?url=${encodeURIComponent(p.link)}&nome=${encodeURIComponent(p.nome)}&imagem=${encodeURIComponent(p.imagem)}`} style={{ textDecoration: 'none' }}>
                <article style={{ backgroundColor: '#fff', borderRadius: '14px', overflow: 'hidden', border: '1px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', height: '100%' }}>

                  <div style={{ height: '220px', backgroundColor: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', position: 'relative' }}>
                    {p.imagem && (
                      <img src={p.imagem} alt={p.nome} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                    )}
                    {desconto > 0 && (
                      <span style={{ position: 'absolute', top: '12px', left: '12px', backgroundColor: '#dc2626', color: '#fff', fontSize: '0.82rem', fontWeight: 800, padding: '4px 10px', borderRadius: '6px' }}>
                        -{desconto}%
                      </span>
                    )}
                    <span style={{ position: 'absolute', top: '12px', right: '12px', backgroundColor: '#2563eb', color: '#fff', fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px', borderRadius: '20px' }}>
                      ⭐ Selecionado
                    </span>
                  </div>

                  <div style={{ padding: '18px', display: 'flex', flexDirection: 'column', flexGrow: 1, gap: '10px' }}>
                    <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#111827', margin: 0, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {p.nome}
                    </h2>

                                        {p.loja && (
                      <div style={{ fontSize: '0.72rem', color: '#6b7280', fontWeight: 500 }}>🏪 {p.loja}</div>
                    )}
                    {(p as any).moedaOriginal === 'USD' && (
                      <div style={{ fontSize: '0.68rem', color: '#92400e', fontWeight: 600, backgroundColor: '#fef3c7', padding: '2px 6px', borderRadius: '4px', display: 'inline-block' }}>
                        💵 Preço convertido de USD para R$ · cotação do dia utilizada: R$ {((p as any).cotacaoUsada || 5.7).toFixed(2).replace('.', ',')}
                      </div>
                    )}

                    <div style={{ marginTop: 'auto' }}>
                      {p.precoOriginal > p.preco && (
                        <div style={{ fontSize: '0.8rem', color: '#9ca3af', textDecoration: 'line-through' }}>
                          R$ {p.precoOriginal.toFixed(2).replace('.', ',')}
                        </div>
                      )}
                      <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#dc2626' }}>
                        R$ {p.preco.toFixed(2).replace('.', ',')}
                      </div>
                      <div style={{ fontSize: '0.68rem', color: '#9ca3af', marginTop: '2px' }}>
                        Confira o valor no site e no carrinho
                      </div>
                    </div>

                    <div style={{ backgroundColor: '#2563eb', color: '#fff', padding: '10px', borderRadius: '8px', fontWeight: 700, fontSize: '0.88rem', textAlign: 'center' }}>
                      Ver oferta →
                    </div>
                  </div>
                </article>
              </a>
            );
          })}
        </div>
      )}
      {totalPaginas > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', marginTop: '32px' }}>
          {pagina > 1 && (
                       <a href={`?${lojaFiltro ? `loja=${encodeURIComponent(lojaFiltro)}&` : ''}pagina=${pagina - 1}`} style={{ padding: '8px 20px', borderRadius: '8px', border: '1px solid #e5e7eb', backgroundColor: '#fff', color: '#374151', fontWeight: 600, textDecoration: 'none', fontSize: '0.9rem' }}>
              ← Anterior
            </a>
          )}
          <span style={{ color: '#6b7280', fontSize: '0.88rem' }}>
            Página {pagina} de {totalPaginas} · {total} ofertas
          </span>
          {pagina < totalPaginas && (
            <a href={`?${lojaFiltro ? `loja=${encodeURIComponent(lojaFiltro)}&` : ''}pagina=${pagina + 1}`} style={{ padding: '8px 20px', borderRadius: '8px', border: '1px solid #e5e7eb', backgroundColor: '#fff', color: '#374151', fontWeight: 600, textDecoration: 'none', fontSize: '0.9rem' }}>
              Próxima →
            </a>
          )}
        </div>
      )}
      <footer style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #e5e7eb', textAlign: 'center' }}>
        <p style={{ fontSize: '0.72rem', color: '#9ca3af', margin: 0, lineHeight: 1.6 }}>
          Links de afiliado — ao comprar através deles você apoia o IAIPSI Informa sem custo adicional.<br />
          Preços e condições expressos nos respectivos sites dos anunciantes. Confira sempre o valor no site e no carrinho.
        </p>
      </footer>

    </main>
  );
}

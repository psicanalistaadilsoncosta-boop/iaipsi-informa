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

async function getProdutos(): Promise<ProdutoPinado[]> {
  try {
    const data = await kv.get<ProdutoPinado[]>('produtos:pinados');
    const all = data || [];
    return all.filter(p => p.destinos?.includes('selecionadas')).slice(0, 20);
  } catch {}
  try {
    const filePath = path.join(process.cwd(), 'public', 'produtos-pinados.json');
    const raw = await fs.readFile(filePath, 'utf-8');
    const all: ProdutoPinado[] = JSON.parse(raw);
    return all.filter(p => p.destinos?.includes('selecionadas')).slice(0, 20);
  } catch { return []; }
}

export default async function OfertasSelecionadasPage() {
  const produtos = await getProdutos();

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
              <a key={p.id} href={p.link} target="_blank" rel="noopener noreferrer sponsored" style={{ textDecoration: 'none' }}>
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

      <footer style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #e5e7eb', textAlign: 'center' }}>
        <p style={{ fontSize: '0.72rem', color: '#9ca3af', margin: 0, lineHeight: 1.6 }}>
          Links de afiliado — ao comprar através deles você apoia o IAIPSI Informa sem custo adicional.<br />
          Preços e condições expressos nos respectivos sites dos anunciantes. Confira sempre o valor no site e no carrinho.
        </p>
      </footer>

    </main>
  );
}

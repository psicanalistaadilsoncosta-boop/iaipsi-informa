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
  parcelas?: string;
  valorParcela?: string;
  pinedAt: string;
  loja?: string;
}

async function getProdutos(): Promise<ProdutoPinado[]> {
  try {
    const data = await kv.get<ProdutoPinado[]>('produtos:pinados');
    const all = data || [];
    return all.filter(p => p.destinos?.includes('parcelado')).slice(0, 20);
  } catch {}
  try {
    const filePath = path.join(process.cwd(), 'public', 'produtos-pinados.json');
    const raw = await fs.readFile(filePath, 'utf-8');
    const all: ProdutoPinado[] = JSON.parse(raw);
    return all.filter(p => p.destinos?.includes('parcelado')).slice(0, 20);
  } catch { return []; }
}

export default async function ParceladoPage() {
  const produtos = await getProdutos();

  return (
    <main style={{ maxWidth: '1060px', margin: '0 auto', padding: '30px 20px', fontFamily: 'system-ui, sans-serif', backgroundColor: '#f9fafb', minHeight: '100vh' }}>

      <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#047857', fontWeight: 600, fontSize: '0.85rem', textDecoration: 'none', marginBottom: '24px' }}>
        ← Voltar ao site
      </Link>

      <header style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', marginBottom: '32px', borderTop: '6px solid #047857' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#111827', margin: '0 0 6px' }}>💳 Parcelado sem Juros</h1>
        <p style={{ color: '#6b7280', fontSize: '0.95rem', margin: 0 }}>
          Produtos selecionados com parcelamento sem juros — facilite sua compra.
        </p>
      </header>
      <div style={{ backgroundColor: '#fffbeb', border: '1px solid #fbbf24', borderRadius: '10px', padding: '12px 20px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontSize: '1.2rem' }}>⚠️</span>
        <p style={{ fontSize: '0.82rem', color: '#92400e', margin: 0, lineHeight: 1.5 }}>
          <strong>Atenção:</strong> Condições de parcelamento, preços e disponibilidade são de responsabilidade do anunciante. As parcelas exibidas podem não refletir as condições atuais da loja. Confirme sempre no site e no carrinho antes de finalizar.
        </p>
      </div>
      {produtos.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280' }}>
          Nenhum produto disponível no momento. Volte em breve!
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {produtos.map(p => {
            const desconto = p.precoOriginal > p.preco
              ? Math.round((1 - p.preco / p.precoOriginal) * 100)
              : p.desconto || 0;
            const temParcela = p.parcelas && p.valorParcela;

            return (
              <a key={p.id} href={`/ir?url=${encodeURIComponent(p.link)}&nome=${encodeURIComponent(p.nome)}&imagem=${encodeURIComponent(p.imagem)}`} style={{ textDecoration: 'none' }}>
                <article style={{ backgroundColor: '#fff', borderRadius: '14px', overflow: 'hidden', border: '1px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', height: '100%' }}>

                  <div style={{ height: '200px', backgroundColor: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', position: 'relative' }}>
                    {p.imagem && (
                      <img src={p.imagem} alt={p.nome} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                    )}
                    {desconto > 0 && (
                      <span style={{ position: 'absolute', top: '12px', left: '12px', backgroundColor: '#dc2626', color: '#fff', fontSize: '0.82rem', fontWeight: 800, padding: '4px 10px', borderRadius: '6px' }}>
                        -{desconto}%
                      </span>
                    )}
                    <span style={{ position: 'absolute', top: '12px', right: '12px', backgroundColor: '#047857', color: '#fff', fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px', borderRadius: '20px' }}>
                      💳 Sem juros
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

                      {temParcela ? (
                        <div style={{ marginTop: '6px', backgroundColor: '#f0fdf4', borderRadius: '6px', padding: '8px 12px', border: '1px solid #bbf7d0' }}>
                          <span style={{ fontSize: '0.82rem', color: '#374151' }}>ou </span>
                          <span style={{ fontSize: '1rem', fontWeight: 800, color: '#047857' }}>
                            {p.parcelas}x de R$ {parseFloat(p.valorParcela!).toFixed(2).replace('.', ',')}
                          </span>
                          <span style={{ fontSize: '0.78rem', color: '#047857', fontWeight: 600 }}> sem juros</span>
                        </div>
                      ) : (
                        <div style={{ marginTop: '6px', fontSize: '0.78rem', color: '#047857', fontWeight: 600 }}>
                          💳 Parcelado sem juros
                        </div>
                      )}

                      <div style={{ fontSize: '0.68rem', color: '#9ca3af', marginTop: '4px' }}>
                        Confira o valor no site e no carrinho
                      </div>
                    </div>

                    <div style={{ backgroundColor: '#047857', color: '#fff', padding: '10px', borderRadius: '8px', fontWeight: 700, fontSize: '0.88rem', textAlign: 'center' }}>
                      Comprar parcelado →
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
          Condições de parcelamento sujeitas a confirmação no site do anunciante e no carrinho de compras.
        </p>
      </footer>

    </main>
  );
}

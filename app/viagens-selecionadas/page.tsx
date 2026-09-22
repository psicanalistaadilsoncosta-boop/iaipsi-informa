import { kv } from '@/lib/kv';
import Link from 'next/link';

interface PasseioPinado {
  id: string;
  slug: string;
  titulo: string;
  destino?: string;
  duracao?: string;
  imagem: string;
  precoBase: number;
  precoOriginal?: number;
  desconto?: number;
  affiliate_url: string;
  destinos: string[];
  pinedAt: string;
  precoData?: string;
  loja?: string;
  rating?: number;
  reviewCount?: number;
}

const POR_PAGINA = 30;

async function getTodos(): Promise<PasseioPinado[]> {
  try {
    const data = await kv.get<PasseioPinado[]>('artigos:viagens');
    return (data || []).filter(v => v.destinos?.includes('viagens-selecionadas'));
  } catch { return []; }
}

async function getViagens(pagina = 1, loja = ''): Promise<{ viagens: PasseioPinado[]; total: number; lojas: string[] }> {
  const todos = await getTodos();
  const lojas = Array.from(new Set(todos.map(v => v.loja || '').filter(Boolean))).sort();
  const filtrados = loja ? todos.filter(v => v.loja === loja) : todos;
  const total = filtrados.length;
  const viagens = filtrados.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);
  return { viagens, total, lojas };
}

export default async function ViagensSelecionadasPage({ searchParams }: { searchParams: Promise<{ pagina?: string; loja?: string }> }) {
  const params = await searchParams;
  const pagina = Math.max(1, parseInt(params.pagina || '1'));
  const lojaFiltro = params.loja || '';
  const { viagens, total, lojas } = await getViagens(pagina, lojaFiltro);
  const totalPaginas = Math.ceil(total / POR_PAGINA);

  return (
    <main style={{ maxWidth: '1060px', margin: '0 auto', padding: '30px 20px', fontFamily: 'system-ui, sans-serif', backgroundColor: '#f9fafb', minHeight: '100vh' }}>

      <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#0f766e', fontWeight: 600, fontSize: '0.85rem', textDecoration: 'none', marginBottom: '24px' }}>
        ← Voltar ao site
      </Link>

      <header style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', marginBottom: '32px', borderTop: '6px solid #0f766e' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#111827', margin: '0 0 6px' }}>🌍 Viagens Selecionadas</h1>
        <p style={{ color: '#6b7280', fontSize: '0.95rem', margin: 0 }}>
          Passeios e experiências escolhidos a dedo — com qualidade e custo-benefício garantidos.
        </p>
      </header>

      <div style={{ backgroundColor: '#f0fdfa', border: '1px solid #99f6e4', borderRadius: '10px', padding: '12px 20px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontSize: '1.2rem' }}>⚠️</span>
        <p style={{ fontSize: '0.82rem', color: '#134e4a', margin: 0, lineHeight: 1.5 }}>
          <strong>Atenção:</strong> Preços, disponibilidade e itinerários são de responsabilidade do operador e podem ser alterados a qualquer momento. Confira sempre as condições atuais na Viator antes de reservar.
        </p>
      </div>

           {lojas.length > 1 && (
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
          
            <a           
            href="./"
            style={{ padding: '6px 16px', borderRadius: '20px', fontSize: '0.82rem', fontWeight: 600, textDecoration: 'none', backgroundColor: !lojaFiltro ? '#0f766e' : '#fff', color: !lojaFiltro ? '#fff' : '#374151', border: '1px solid #e5e7eb' }}
          >
            Todas
          </a>
                   {lojas.map(l => (
            <a key={l} href={`?loja=${encodeURIComponent(l)}`} style={{ padding: '6px 16px', borderRadius: '20px', fontSize: '0.82rem', fontWeight: 600, textDecoration: 'none', backgroundColor: lojaFiltro === l ? '#0f766e' : '#fff', color: lojaFiltro === l ? '#fff' : '#374151', border: '1px solid #e5e7eb' }}>
              {l}
            </a>
          ))}
        </div>
      )}

      {viagens.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280' }}>
          Nenhuma viagem selecionada no momento. Volte em breve!
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {viagens.map(v => {
            const desconto = v.precoOriginal && v.precoOriginal > v.precoBase
              ? Math.round((1 - v.precoBase / v.precoOriginal) * 100)
              : v.desconto || 0;

            return (
              <a
                key={v.id}
                href={`/ir?url=${encodeURIComponent(v.affiliate_url)}&nome=${encodeURIComponent(v.titulo)}&imagem=${encodeURIComponent(v.imagem)}`}
                style={{ textDecoration: 'none' }}
              >
                <article style={{ backgroundColor: '#fff', borderRadius: '14px', overflow: 'hidden', border: '1px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', height: '100%' }}>

                  <div style={{ height: '220px', backgroundColor: '#f0fdfa', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0', position: 'relative', overflow: 'hidden' }}>
                    {v.imagem && (
                      <img src={v.imagem} alt={v.titulo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    )}
                    {desconto > 0 && (
                      <span style={{ position: 'absolute', top: '12px', left: '12px', backgroundColor: '#dc2626', color: '#fff', fontSize: '0.82rem', fontWeight: 800, padding: '4px 10px', borderRadius: '6px' }}>
                        -{desconto}%
                      </span>
                    )}
                    <span style={{ position: 'absolute', top: '12px', right: '12px', backgroundColor: '#0f766e', color: '#fff', fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px', borderRadius: '20px' }}>
                      ✈️ Selecionado
                    </span>
                    {v.duracao && (
                      <span style={{ position: 'absolute', bottom: '10px', left: '10px', backgroundColor: 'rgba(0,0,0,0.55)', color: '#fff', fontSize: '0.68rem', fontWeight: 600, padding: '3px 8px', borderRadius: '20px' }}>
                        ⏱ {v.duracao}
                      </span>
                    )}
                    {v.rating != null && v.rating > 0 && (
                      <span style={{ position: 'absolute', bottom: '10px', right: '10px', backgroundColor: 'rgba(0,0,0,0.55)', color: '#fbbf24', fontSize: '0.68rem', fontWeight: 700, padding: '3px 8px', borderRadius: '20px' }}>
                        ★ {v.rating.toFixed(1)}{v.reviewCount ? ` (${v.reviewCount.toLocaleString('pt-BR')})` : ''}
                      </span>
                    )}
                  </div>

                  <div style={{ padding: '18px', display: 'flex', flexDirection: 'column', flexGrow: 1, gap: '10px' }}>
                    {v.destino && (
                      <div style={{ fontSize: '0.72rem', color: '#6b7280', fontWeight: 600 }}>📍 {v.destino}</div>
                    )}

                    <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#111827', margin: 0, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {v.titulo}
                    </h2>

                    {v.loja && (
                      <div style={{ fontSize: '0.72rem', color: '#6b7280', fontWeight: 500 }}>🏪 {v.loja}</div>
                    )}

                    <div style={{ marginTop: 'auto' }}>
                      {v.precoOriginal && v.precoOriginal > v.precoBase && (
                        <div style={{ fontSize: '0.8rem', color: '#9ca3af', textDecoration: 'line-through' }}>
                          R$ {v.precoOriginal.toFixed(2).replace('.', ',')}
                        </div>
                      )}
                      {v.precoBase > 0 && (
                        <>
                          <div style={{ fontSize: '0.68rem', color: '#9ca3af' }}>A partir de</div>
                          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f766e' }}>
                            R$ {v.precoBase.toFixed(2).replace('.', ',')}
                          </div>
                        </>
                      )}
                      <div style={{ fontSize: '0.68rem', color: '#9ca3af', marginTop: '2px' }}>
                        Confira o valor no site antes de reservar
                      </div>
                    </div>

                    <div style={{ backgroundColor: '#0f766e', color: '#fff', padding: '10px', borderRadius: '8px', fontWeight: 700, fontSize: '0.88rem', textAlign: 'center' }}>
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
            Página {pagina} de {totalPaginas} · {total} viagens
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
          Links de afiliado Viator — ao reservar através deles você apoia o IAIPSI Informa sem custo adicional.<br />
          Preços e condições expressos nos respectivos sites dos operadores. Confira sempre o valor antes de reservar.
        </p>
      </footer>

    </main>
  );
}

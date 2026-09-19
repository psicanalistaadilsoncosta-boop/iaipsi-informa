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
}

async function getViagens(): Promise<PasseioPinado[]> {
  try {
    const data = await kv.get<PasseioPinado[]>('artigos:viagens');
    const all = data || [];
    return all.filter(v => v.destinos?.includes('viagens-selecionadas')).slice(0, 20);
  } catch { return []; }
}

export default async function ViagensSelecionadasPage() {
  const viagens = await getViagens();

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

      <footer style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #e5e7eb', textAlign: 'center' }}>
        <p style={{ fontSize: '0.72rem', color: '#9ca3af', margin: 0, lineHeight: 1.6 }}>
          Links de afiliado Viator — ao reservar através deles você apoia o IAIPSI Informa sem custo adicional.<br />
          Preços e condições expressos nos respectivos sites dos operadores. Confira sempre o valor antes de reservar.
        </p>
      </footer>

    </main>
  );
}

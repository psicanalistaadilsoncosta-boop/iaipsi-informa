import { kv } from '@/lib/kv';
import Link from 'next/link';

interface ArtigoViagem {
  id: string;
  slug: string;
  titulo: string;
  destino: string;
  duracao: string;
  imagem: string;
  descricaoCurta: string;
  precoBase: number;
  precoData: string;
  affiliateUrl: string;
  publicado: boolean;
  createdAt: string;
}

async function getViagens(): Promise<ArtigoViagem[]> {
  try {
    const data = await kv.get<ArtigoViagem[]>('artigos:viagens');
    return (data || []).filter(a => a.publicado).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch { return []; }
}

export default async function ViagensPage() {
  const viagens = await getViagens();

  return (
    <main style={{ maxWidth: '1060px', margin: '0 auto', padding: '30px 20px', fontFamily: 'system-ui, sans-serif', backgroundColor: '#f9fafb', minHeight: '100vh' }}>

      <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#0f766e', fontWeight: 600, fontSize: '0.85rem', textDecoration: 'none', marginBottom: '24px' }}>
        ← Voltar ao site
      </Link>

      <header style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', marginBottom: '32px', borderTop: '6px solid #0f766e' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#111827', margin: '0 0 6px' }}>🌍 Roteiros de Viagem</h1>
        <p style={{ color: '#6b7280', fontSize: '0.95rem', margin: 0 }}>
          Passeios e experiências selecionados — com análise editorial e dicas de quem pesquisou.
        </p>
      </header>

      <div style={{ backgroundColor: '#f0fdfa', border: '1px solid #99f6e4', borderRadius: '10px', padding: '12px 20px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontSize: '1.2rem' }}>ℹ️</span>
        <p style={{ fontSize: '0.82rem', color: '#134e4a', margin: 0, lineHeight: 1.5 }}>
          <strong>Atenção:</strong> Preços, disponibilidade e itinerários são de responsabilidade do operador e podem ser alterados a qualquer momento. Confira sempre as condições atuais na Viator antes de reservar.
        </p>
      </div>

      {viagens.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280' }}>
          Nenhum roteiro publicado no momento. Volte em breve!
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {viagens.map(v => (
            <Link key={v.id} href={`/viagem/${v.slug}`} style={{ textDecoration: 'none' }}>
              <article style={{ backgroundColor: '#fff', borderRadius: '14px', overflow: 'hidden', border: '1px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', height: '100%', transition: 'box-shadow 0.2s' }}>

                <div style={{ height: '200px', backgroundColor: '#f0fdfa', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0', position: 'relative', overflow: 'hidden' }}>
                  {v.imagem ? (
                    <img src={v.imagem} alt={v.titulo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontSize: '3rem' }}>🌍</span>
                  )}
                  <span style={{ position: 'absolute', top: '12px', right: '12px', backgroundColor: '#0f766e', color: '#fff', fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px', borderRadius: '20px' }}>
                    ✈️ Viagem
                  </span>
                  {v.duracao && (
                    <span style={{ position: 'absolute', bottom: '10px', left: '10px', backgroundColor: 'rgba(0,0,0,0.55)', color: '#fff', fontSize: '0.68rem', fontWeight: 600, padding: '3px 8px', borderRadius: '20px', backdropFilter: 'blur(4px)' }}>
                      ⏱ {v.duracao}
                    </span>
                  )}
                </div>

                <div style={{ padding: '18px', display: 'flex', flexDirection: 'column', flexGrow: 1, gap: '10px' }}>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600 }}>📍 {v.destino}</div>

                  <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#111827', margin: 0, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {v.titulo}
                  </h2>

                  <p style={{ fontSize: '0.82rem', color: '#6b7280', margin: 0, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {v.descricaoCurta}
                  </p>

                  <div style={{ marginTop: 'auto' }}>
                    {v.precoBase > 0 && (
                      <>
                        <div style={{ fontSize: '0.68rem', color: '#9ca3af' }}>A partir de</div>
                        <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f766e' }}>
                          R$ {v.precoBase.toFixed(2).replace('.', ',')}
                        </div>
                        <div style={{ fontSize: '0.65rem', color: '#9ca3af', marginTop: '1px' }}>
                          Consultado em {v.precoData} · sujeito a alteração
                        </div>
                      </>
                    )}
                  </div>

                  <div style={{ backgroundColor: '#0f766e', color: '#fff', padding: '10px', borderRadius: '8px', fontWeight: 700, fontSize: '0.88rem', textAlign: 'center' }}>
                    Ver roteiro →
                  </div>
                </div>

              </article>
            </Link>
          ))}
        </div>
      )}

      <footer style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #e5e7eb', textAlign: 'center' }}>
        <p style={{ fontSize: '0.72rem', color: '#9ca3af', margin: 0, lineHeight: 1.6 }}>
          Links de afiliado Viator — ao reservar através deles você apoia o IAIPSI Informa sem custo adicional.<br />
          Preços e condições expressos nos respectivos sites dos operadores. Confira sempre o valor no site antes de reservar.
        </p>
      </footer>

    </main>
  );
}

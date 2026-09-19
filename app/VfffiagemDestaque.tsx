import { kv } from '@/lib/kv';

interface PasseioDestaque {
  id: string;
  slug: string;
  titulo: string;
  destino?: string;
  duracao?: string;
  imagem: string;
  precoBase: number;
  affiliate_url: string;
  affiliateUrl?: string;
  destinos: string[];
  pinedAt: string;
  rating?: number;
  reviewCount?: number;
  descricaoCurta?: string;
}

export async function getViagemDestaque(): Promise<PasseioDestaque | null> {
  try {
    const data = await kv.get<PasseioDestaque[]>('artigos:viagens');
    const all = data || [];
    const destaques = all
      .filter(v => v.destinos?.includes('viagem-destaque'))
      .sort((a, b) => new Date(b.pinedAt).getTime() - new Date(a.pinedAt).getTime());
    return destaques[0] || null;
  } catch {
    return null;
  }
}

export default function ViagemDestaque({ viagem }: { viagem: PasseioDestaque }) {
  const url = viagem.affiliate_url || viagem.affiliateUrl || '';
  const irUrl = url
    ? `/ir?url=${encodeURIComponent(url)}&nome=${encodeURIComponent(viagem.titulo)}&imagem=${encodeURIComponent(viagem.imagem)}`
    : `/viagem/${viagem.slug}`;

  return (
    <section style={{ marginBottom: '32px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <div style={{ width: '4px', height: '28px', backgroundColor: '#0f766e', borderRadius: '2px' }} />
        <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#111827', margin: 0 }}>✈️ Viagem em Destaque</h2>
        <a href="/viagens" style={{ marginLeft: 'auto', fontSize: '0.8rem', color: '#0f766e', fontWeight: 600, textDecoration: 'none' }}>
          Ver todos os roteiros →
        </a>
      </div>

      <a href={irUrl} style={{ textDecoration: 'none', display: 'block' }}>
        <div style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid #e5e7eb', boxShadow: '0 4px 16px rgba(0,0,0,0.08)', position: 'relative', backgroundColor: '#fff' }}>
          <div style={{ height: '320px', overflow: 'hidden', backgroundColor: '#f0fdfa', position: 'relative' }}>
            {viagem.imagem ? (
              <img src={viagem.imagem} alt={viagem.titulo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #0f766e 0%, #047857 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '5rem' }}>🌍</span>
              </div>
            )}
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '65%', background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)' }} />

            <span style={{ position: 'absolute', top: '16px', left: '16px', backgroundColor: '#0f766e', color: '#fff', fontSize: '0.72rem', fontWeight: 700, padding: '4px 12px', borderRadius: '20px' }}>
              ✈️ Destaque Viator
            </span>

            {viagem.duracao && (
              <span style={{ position: 'absolute', top: '16px', right: '16px', backgroundColor: 'rgba(0,0,0,0.55)', color: '#fff', fontSize: '0.72rem', fontWeight: 600, padding: '4px 10px', borderRadius: '20px', backdropFilter: 'blur(4px)' }}>
                ⏱ {viagem.duracao}
              </span>
            )}

            {viagem.rating != null && viagem.rating > 0 && (
              <span style={{ position: 'absolute', bottom: '80px', right: '16px', backgroundColor: 'rgba(0,0,0,0.6)', color: '#fbbf24', fontSize: '0.78rem', fontWeight: 700, padding: '4px 10px', borderRadius: '20px' }}>
                ★ {viagem.rating.toFixed(1)}{viagem.reviewCount ? ` (${viagem.reviewCount.toLocaleString('pt-BR')})` : ''}
              </span>
            )}

            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '24px' }}>
              {viagem.destino && (
                <div style={{ fontSize: '0.72rem', color: '#6ee7b7', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '6px' }}>
                  📍 {viagem.destino}
                </div>
              )}
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', margin: '0 0 8px', lineHeight: 1.2 }}>
                {viagem.titulo}
              </h3>
              {viagem.descricaoCurta && (
                <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.9rem', margin: '0 0 14px', lineHeight: 1.5 }}>
                  {viagem.descricaoCurta}
                </p>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                {viagem.precoBase > 0 && (
                  <div>
                    <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.6)' }}>A partir de</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#6ee7b7' }}>
                      R$ {viagem.precoBase.toFixed(2).replace('.', ',')}
                    </div>
                  </div>
                )}
                <div style={{ backgroundColor: '#0f766e', color: '#fff', padding: '10px 24px', borderRadius: '8px', fontWeight: 700, fontSize: '0.9rem', marginLeft: 'auto' }}>
                  Ver roteiro →
                </div>
              </div>
            </div>
          </div>
        </div>
      </a>
    </section>
  );
}
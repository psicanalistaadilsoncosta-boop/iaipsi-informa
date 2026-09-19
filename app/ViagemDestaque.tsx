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
  destinos?: string[];
  createdAt: string;
}

export async function getViagemDestaque(): Promise<ArtigoViagem | null> {
  try {
    const data = await kv.get<ArtigoViagem[]>('artigos:viagens');
    if (!data?.length) return null;
    // Primeiro: artigo com destinos incluindo 'destaque'
    const destaque = data.find(a => a.publicado && a.destinos?.includes('destaque'));
    if (destaque) return destaque;
    // Fallback: mais recente publicado
    return data.filter(a => a.publicado).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0] || null;
  } catch { return null; }
}

export default function ViagemDestaque({ viagem }: { viagem: ArtigoViagem }) {
  return (
    <div style={{ backgroundColor: '#fff', borderRadius: '16px', overflow: 'hidden', border: '1px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', marginBottom: '24px' }}>

      {/* Cabeçalho da seção */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '4px', height: '24px', backgroundColor: '#0f766e', borderRadius: '2px' }} />
          <span style={{ fontSize: '1rem', fontWeight: 800, color: '#111827' }}>🌍 Viagem em Destaque</span>
        </div>
        <Link href="/viagens" style={{ fontSize: '0.78rem', color: '#0f766e', fontWeight: 600, textDecoration: 'none' }}>
          Ver todos →
        </Link>
      </div>

      {/* Card da viagem */}
      <Link href={`/viagem/${viagem.slug}`} style={{ textDecoration: 'none', display: 'block' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '0' }}>

          {/* Imagem */}
          <div style={{ height: '180px', overflow: 'hidden', position: 'relative' }}>
            {viagem.imagem ? (
              <img src={viagem.imagem} alt={viagem.titulo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '100%', height: '100%', backgroundColor: '#f0fdfa', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem' }}>🌍</div>
            )}
            {viagem.duracao && (
              <span style={{ position: 'absolute', bottom: '8px', left: '8px', backgroundColor: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: '0.65rem', fontWeight: 600, padding: '2px 7px', borderRadius: '20px' }}>
                ⏱ {viagem.duracao}
              </span>
            )}
          </div>

          {/* Conteúdo */}
          <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ fontSize: '0.72rem', color: '#6b7280', fontWeight: 600 }}>📍 {viagem.destino}</div>

            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#111827', margin: 0, lineHeight: 1.35, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {viagem.titulo}
            </h3>

            <p style={{ fontSize: '0.8rem', color: '#6b7280', margin: 0, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {viagem.descricaoCurta}
            </p>

            <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
              {viagem.precoBase > 0 && (
                <div>
                  <div style={{ fontSize: '0.65rem', color: '#9ca3af' }}>A partir de</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f766e' }}>
                    R$ {viagem.precoBase.toFixed(2).replace('.', ',')}
                  </div>
                </div>
              )}
              <span style={{ backgroundColor: '#0f766e', color: '#fff', padding: '8px 16px', borderRadius: '8px', fontWeight: 700, fontSize: '0.82rem' }}>
                Ver roteiro →
              </span>
            </div>
          </div>

        </div>
      </Link>

      <div style={{ padding: '8px 20px 12px', borderTop: '1px solid #f3f4f6', fontSize: '0.65rem', color: '#d1d5db', textAlign: 'right' }}>
        Link de afiliado Viator · Preço de {viagem.precoData} · sujeito a alteração
      </div>
    </div>
  );
}

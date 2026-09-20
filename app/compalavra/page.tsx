import { kv } from '@/lib/kv';
import Link from 'next/link';

interface ArtigoComPalavra {
  id: string; slug: string; titulo: string; conteudo: string;
  resumo: string; imagem?: string; publicado: boolean; destaque: boolean;
  createdAt: string; updatedAt: string;
}

async function getArtigos(): Promise<ArtigoComPalavra[]> {
  try {
    const data = await kv.get<ArtigoComPalavra[]>('artigos:compalavra');
    return (data || []).filter(a => a.publicado).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch { return []; }
}

export default async function ComAPalavraPage() {
  const artigos = await getArtigos();
  const destaque = artigos.find(a => a.destaque);
  const demais = artigos.filter(a => !a.destaque);

  return (
    <main style={{ maxWidth: '860px', margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px', borderBottom: '3px solid #0f766e', paddingBottom: '24px' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '3px', color: '#0f766e', textTransform: 'uppercase', marginBottom: '8px' }}>Coluna</div>
        <h1 style={{ fontSize: '2.8rem', fontWeight: 900, color: '#111827', margin: '0 0 4px', letterSpacing: '-1px' }}>
          Com<span style={{ color: '#0f766e', fontSize: '3.2rem' }}>A</span>Palavra
        </h1>
        <p style={{ color: '#6b7280', fontSize: '1rem', margin: '8px 0 0' }}>
          por <strong style={{ color: '#111827' }}>Adilson Costa</strong> · Psicanálise e vida
        </p>
      </div>

      {destaque && (
        <Link href={`/compalavra/${destaque.slug}`} style={{ textDecoration: 'none', display: 'block', marginBottom: '40px' }}>
          <div style={{ borderRadius: '16px', overflow: 'hidden', border: '2px solid #0f766e', boxShadow: '0 4px 20px rgba(15,118,110,0.15)' }}>
            {destaque.imagem && (
              <div style={{ height: '300px', overflow: 'hidden' }}>
                <img src={destaque.imagem} alt={destaque.titulo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}
            <div style={{ padding: '28px', backgroundColor: '#f0fdfa' }}>
              <span style={{ display: 'inline-block', backgroundColor: '#0f766e', color: '#fff', fontSize: '0.7rem', fontWeight: 700, padding: '3px 10px', borderRadius: '20px', marginBottom: '12px', letterSpacing: '1px' }}>✍️ EM DESTAQUE</span>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#111827', margin: '0 0 12px', lineHeight: 1.25 }}>{destaque.titulo}</h2>
              {destaque.resumo && <p style={{ color: '#374151', fontSize: '1rem', margin: '0 0 16px', lineHeight: 1.6 }}>{destaque.resumo}</p>}
              <span style={{ color: '#0f766e', fontWeight: 700, fontSize: '0.9rem' }}>Ler artigo →</span>
            </div>
          </div>
        </Link>
      )}

      {demais.length === 0 && !destaque && (
        <p style={{ textAlign: 'center', color: '#9ca3af', padding: '60px 0' }}>Nenhum artigo publicado ainda.</p>
      )}

      <div style={{ display: 'grid', gap: '20px' }}>
        {demais.map(artigo => (
          <Link key={artigo.id} href={`/compalavra/${artigo.slug}`} style={{ textDecoration: 'none' }}>
            <div style={{ display: 'flex', gap: '20px', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb', backgroundColor: '#fff', alignItems: 'flex-start' }}>
              {artigo.imagem && <img src={artigo.imagem} alt={artigo.titulo} style={{ width: '110px', height: '80px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0 }} />}
              <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#111827', margin: '0 0 6px', lineHeight: 1.3 }}>{artigo.titulo}</h2>
                {artigo.resumo && <p style={{ color: '#6b7280', fontSize: '0.875rem', margin: '0 0 10px', lineHeight: 1.5 }}>{artigo.resumo}</p>}
                <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                  {new Date(artigo.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}

import { kv } from '@/lib/kv';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import GaleriaFotos from './GaleriaFotos';

interface ArtigoViagem {
  id: string;
  slug: string;
  titulo: string;
  destino: string;
  duracao: string;
  imagem: string;
  gallery: string[];
  descricaoCurta: string;
  conteudo: string;
  precoBase: number;
  precoData: string;        // ex: "set/2026"
  affiliateUrl: string;
  publicado: boolean;
  createdAt: string;
}

async function getArtigo(slug: string): Promise<ArtigoViagem | null> {
  try {
    const artigos = await kv.get<ArtigoViagem[]>('artigos:viagens');
    return artigos?.find(a => a.slug === slug && a.publicado) || null;
  } catch { return null; }
}

function renderConteudo(texto: string) {
  return texto.split('\n').map((linha, i) => {
    if (!linha.trim()) return <br key={i} />;

    if (linha.startsWith('## ')) {
      return <h3 key={i} style={{ fontSize: '1.05rem', fontWeight: 800, color: '#111827', margin: '20px 0 8px' }}>{linha.replace('## ', '')}</h3>;
    }
    if (linha.startsWith('# ')) {
      return <h2 key={i} style={{ fontSize: '1.2rem', fontWeight: 800, color: '#111827', margin: '24px 0 10px' }}>{linha.replace('# ', '')}</h2>;
    }

    // Processa links Markdown [texto](url) e negrito **texto**
    const parsed = linha
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, text, url) => {
        // PLACEHOLDER_LINK não vira link clicável
        if (url === 'PLACEHOLDER_LINK') {
          return `<strong>${text}</strong>`;
        }
        return `<a href="${url}" target="_blank" rel="noopener noreferrer" style="color:#0f766e;text-decoration:underline">${text}</a>`;
      });

    return (
      <p key={i} style={{ margin: '0 0 12px', lineHeight: 1.7, fontSize: '0.95rem', color: '#374151' }}
        dangerouslySetInnerHTML={{ __html: parsed }} />
    );
  });
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const artigo = await getArtigo(slug);
  if (!artigo) return { title: 'Viagem não encontrada' };
  return {
    title: `${artigo.titulo} — IAIPSI Informa`,
    description: artigo.descricaoCurta,
    openGraph: {
      title: artigo.titulo,
      description: artigo.descricaoCurta,
      images: [artigo.imagem],
    },
  };
}

export default async function ArtigoViagemPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const artigo = await getArtigo(slug);
  if (!artigo) notFound();

  return (
    <main style={{ maxWidth: '860px', margin: '0 auto', padding: '30px 20px', fontFamily: 'system-ui, sans-serif', backgroundColor: '#f9fafb', minHeight: '100vh' }}>

      <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#0f766e', fontWeight: 600, fontSize: '0.85rem', textDecoration: 'none', marginBottom: '24px' }}>
        ← Voltar ao site
      </Link>

      {/* Header do passeio */}
      <div style={{ backgroundColor: '#fff', borderRadius: '16px', overflow: 'hidden', border: '1px solid #e5e7eb', boxShadow: '0 4px 16px rgba(0,0,0,0.06)', marginBottom: '24px' }}>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 0 }}>

          {/* Galeria */}
          <div style={{ backgroundColor: '#f1f5f9', padding: '32px', borderRight: '1px solid #f3f4f6' }}>
            <GaleriaFotos imagem={artigo.imagem} gallery={artigo.gallery || []} titulo={artigo.titulo} />
          </div>

          {/* Dados */}
          <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '14px' }}>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#6b7280' }}>📍 {artigo.destino}</span>
              {artigo.duracao && (
                <span style={{ fontSize: '0.68rem', color: '#9ca3af', backgroundColor: '#f3f4f6', padding: '2px 8px', borderRadius: '20px' }}>⏱ {artigo.duracao}</span>
              )}
            </div>

            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#111827', margin: 0, lineHeight: 1.3 }}>
              {artigo.titulo}
            </h1>

            <p style={{ fontSize: '0.88rem', color: '#6b7280', margin: 0, lineHeight: 1.6 }}>
              {artigo.descricaoCurta}
            </p>

            {/* Preço e CTA */}
            {artigo.precoBase > 0 && (
              <div style={{ backgroundColor: '#f0fdfa', borderRadius: '10px', padding: '14px 16px', border: '1px solid #99f6e4' }}>
                <div style={{ fontSize: '0.72rem', color: '#0f766e', fontWeight: 700, marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  🌍 Último preço pesquisado
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f766e' }}>
                  R$ {artigo.precoBase.toFixed(2).replace('.', ',')}
                </div>
                <div style={{ fontSize: '0.68rem', color: '#6b7280', marginTop: '2px' }}>
                  consultado em {artigo.precoData} · sujeito a alteração
                </div>
              </div>
            )}

            <a
              href={`/ir?url=${encodeURIComponent(artigo.affiliateUrl)}&nome=${encodeURIComponent(artigo.titulo)}&imagem=${encodeURIComponent(artigo.imagem)}`}
              style={{ display: 'block', backgroundColor: '#0f766e', color: '#fff', padding: '12px 20px', borderRadius: '10px', fontWeight: 800, fontSize: '0.95rem', textDecoration: 'none', textAlign: 'center' }}
            >
              👉 Ver disponibilidade e reservar
            </a>
            <p style={{ fontSize: '0.68rem', color: '#9ca3af', margin: 0 }}>
              Link de afiliado Viator · Preço sujeito a alteração
            </p>

          </div>
        </div>
      </div>

      {/* Artigo editorial */}
      <div style={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #e5e7eb', padding: '32px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <div style={{ width: '4px', height: '28px', backgroundColor: '#0f766e', borderRadius: '2px' }} />
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#111827', margin: 0 }}>Análise Editorial</h2>
          <span style={{ fontSize: '0.72rem', color: '#9ca3af', marginLeft: '4px' }}>por Adilson Costa</span>
        </div>
        <div>{renderConteudo(artigo.conteudo)}</div>
        <div style={{ backgroundColor: '#fffbeb', border: '1px solid #fbbf24', borderRadius: '8px', padding: '10px 14px', marginTop: '16px', fontSize: '0.78rem', color: '#92400e', lineHeight: 1.5 }}>
          🤖 Artigo elaborado com auxílio de inteligência artificial e revisado por Adilson Costa. Os dados do passeio são de referência; confira disponibilidade, preço e itinerário diretamente na Viator.
        </div>
        <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.72rem', color: '#9ca3af' }}>
            📅 Publicado em {new Date(artigo.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
          </span>
        </div>
      </div>

      {/* CTA final */}
      <div style={{ backgroundColor: '#f0fdfa', borderRadius: '16px', border: '1px solid #99f6e4', padding: '24px', textAlign: 'center' }}>
        <p style={{ fontSize: '1rem', fontWeight: 700, color: '#111827', margin: '0 0 16px' }}>
          Pronto para viver essa experiência em {artigo.destino}?
        </p>
        <a
          href={`/ir?url=${encodeURIComponent(artigo.affiliateUrl)}&nome=${encodeURIComponent(artigo.titulo)}&imagem=${encodeURIComponent(artigo.imagem)}`}
          style={{ display: 'inline-block', backgroundColor: '#0f766e', color: '#fff', padding: '14px 32px', borderRadius: '10px', fontWeight: 800, fontSize: '1rem', textDecoration: 'none' }}
        >
          🌍 Ver disponibilidade na Viator
        </a>
        <p style={{ fontSize: '0.68rem', color: '#9ca3af', margin: '12px 0 0' }}>
          Link de afiliado · Preço sujeito a alteração · Confira sempre no site da Viator
        </p>
      </div>

      <footer style={{ marginTop: '32px', textAlign: 'center' }}>
        <p style={{ fontSize: '0.72rem', color: '#9ca3af', margin: 0 }}>
          © {new Date().getFullYear()} IAIPSI Informa ·
          <Link href="/termos" style={{ color: '#9ca3af', marginLeft: '4px' }}>Termos e Privacidade</Link>
        </p>
      </footer>

    </main>
  );
}

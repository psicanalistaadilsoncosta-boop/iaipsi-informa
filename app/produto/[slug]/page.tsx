import { kv } from '@/lib/kv';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import GaleriaImagens from './GaleriaImagens';


interface ArtigoProduto {
  id: string;
  slug: string;
  titulo: string;
  marca: string;
  categoria: string;
  gtin: string;
  imagem: string;
  gallery: string[];
  descricaoCurta: string;
  conteudo: string;
  specs: Record<string, { grupo: string; itens: { nome: string; valor: string }[] }>;
  ofertas: { loja: string; preco: number; link: string }[];
  publicado: boolean;
  createdAt: string;
}

async function getArtigo(slug: string): Promise<ArtigoProduto | null> {
  try {
    const artigos = await kv.get<ArtigoProduto[]>('artigos:produtos');
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
    const parsed = linha.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    return (
      <p key={i} style={{ margin: '0 0 12px', lineHeight: 1.7, fontSize: '0.95rem', color: '#374151' }}
        dangerouslySetInnerHTML={{ __html: parsed }} />
    );
  });
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const artigo = await getArtigo(slug);
  if (!artigo) return { title: 'Produto não encontrado' };
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

export default async function ArtigoProdutoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const artigo = await getArtigo(slug);
  if (!artigo) notFound();

  const melhorPreco = artigo.ofertas?.length
    ? Math.min(...artigo.ofertas.map(o => o.preco))
    : null;

  return (
    <main style={{ maxWidth: '860px', margin: '0 auto', padding: '30px 20px', fontFamily: 'system-ui, sans-serif', backgroundColor: '#f9fafb', minHeight: '100vh' }}>

      <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#2563eb', fontWeight: 600, fontSize: '0.85rem', textDecoration: 'none', marginBottom: '24px' }}>
        ← Voltar ao site
      </Link>

      {/* Header do produto */}
      <div style={{ backgroundColor: '#fff', borderRadius: '16px', overflow: 'hidden', border: '1px solid #e5e7eb', boxShadow: '0 4px 16px rgba(0,0,0,0.06)', marginBottom: '24px' }}>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 0 }}>

                   {/* Imagem */}
          <div style={{ backgroundColor: '#f9fafb', padding: '32px', borderRight: '1px solid #f3f4f6' }}>
            <GaleriaImagens imagem={artigo.imagem} gallery={artigo.gallery || []} titulo={artigo.titulo} />
          </div>

          {/* Dados */}
          <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '14px' }}>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#6b7280' }}>{artigo.marca}</span>
              <span style={{ fontSize: '0.68rem', color: '#9ca3af', backgroundColor: '#f3f4f6', padding: '2px 8px', borderRadius: '20px' }}>{artigo.categoria}</span>
            </div>

            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#111827', margin: 0, lineHeight: 1.3 }}>
              {artigo.titulo}
            </h1>

            <p style={{ fontSize: '0.88rem', color: '#6b7280', margin: 0, lineHeight: 1.6 }}>
              {artigo.descricaoCurta}
            </p>

            {/* Preço destaque */}
            {melhorPreco && (
              <div style={{ backgroundColor: '#fef2f2', borderRadius: '10px', padding: '14px 16px', border: '1px solid #fecaca' }}>
                <div style={{ fontSize: '0.72rem', color: '#dc2626', fontWeight: 700, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  🔥 Melhor preço encontrado
                </div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#dc2626' }}>
                  R$ {melhorPreco.toFixed(2).replace('.', ',')}
                </div>
              </div>
            )}

            {/* Ofertas */}
            {artigo.ofertas?.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {artigo.ofertas
                  .sort((a, b) => a.preco - b.preco)
                  .map((o, i) => (
                    <a key={i} href={`/ir?url=${encodeURIComponent(o.link)}&nome=${encodeURIComponent(artigo.titulo)}&imagem=${encodeURIComponent(artigo.imagem)}`}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: i === 0 ? '#2563eb' : '#f9fafb', borderRadius: '8px', padding: '10px 14px', textDecoration: 'none', border: i === 0 ? 'none' : '1px solid #e5e7eb', gap: '10px' }}>
                      <span style={{ fontSize: '0.88rem', fontWeight: 600, color: i === 0 ? '#fff' : '#374151' }}>🏪 {o.loja}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '1rem', fontWeight: 800, color: i === 0 ? '#fff' : '#dc2626' }}>
                          R$ {o.preco.toFixed(2).replace('.', ',')}
                        </span>
                        <span style={{ fontSize: '0.78rem', color: i === 0 ? 'rgba(255,255,255,0.8)' : '#9ca3af' }}>Ver oferta →</span>
                      </div>
                    </a>
                  ))}
                <p style={{ fontSize: '0.68rem', color: '#9ca3af', margin: 0 }}>
                  ⚠️ Preços sujeitos a alteração. Confira no site do anunciante.
                </p>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Especificações técnicas */}
      <div style={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #e5e7eb', padding: '28px', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#111827', margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          📋 Especificações Técnicas
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
          {Object.values(artigo.specs).map(grupo => (
            <div key={grupo.grupo}>
              <h3 style={{ fontSize: '0.78rem', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 10px', paddingBottom: '6px', borderBottom: '2px solid #f3f4f6' }}>
                {grupo.grupo}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {grupo.itens.map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', padding: '4px 0', borderBottom: '1px solid #f9fafb' }}>
                    <span style={{ fontSize: '0.82rem', color: '#6b7280', flex: 1 }}>{item.nome}</span>
                    <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#111827', textAlign: 'right' }}>{item.valor}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Artigo editorial */}
      <div style={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #e5e7eb', padding: '32px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <div style={{ width: '4px', height: '28px', backgroundColor: '#be185d', borderRadius: '2px' }} />
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#111827', margin: 0 }}>Análise Editorial</h2>
          <span style={{ fontSize: '0.72rem', color: '#9ca3af', marginLeft: '4px' }}>por Adilson Costa</span>
        </div>
        <div>{renderConteudo(artigo.conteudo)}</div>
                <div style={{ backgroundColor: '#fffbeb', border: '1px solid #fbbf24', borderRadius: '8px', padding: '10px 14px', marginTop: '16px', fontSize: '0.78rem', color: '#92400e', lineHeight: 1.5 }}>
          🤖 Artigo elaborado com auxílio de inteligência artificial e revisado por Adilson Costa. As especificações técnicas são fornecidas pelo Icecat — confirme sempre os dados no site do fabricante ou anunciante antes da compra.
        </div>
        <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.72rem', color: '#9ca3af' }}>
            📅 Publicado em {new Date(artigo.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
          </span>
          {artigo.gtin && (
            <span style={{ fontSize: '0.72rem', color: '#9ca3af' }}>· EAN: {artigo.gtin}</span>
          )}
        </div>
      </div>

      {/* CTA final */}
      {artigo.ofertas?.length > 0 && (
        <div style={{ backgroundColor: '#fef2f2', borderRadius: '16px', border: '1px solid #fecaca', padding: '24px', textAlign: 'center' }}>
          <p style={{ fontSize: '1rem', fontWeight: 700, color: '#111827', margin: '0 0 16px' }}>
            Quer comprar o {artigo.marca} {artigo.titulo.replace(artigo.marca, '').trim()}?
          </p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {artigo.ofertas.sort((a, b) => a.preco - b.preco).slice(0, 2).map((o, i) => (
              <a key={i} href={`/ir?url=${encodeURIComponent(o.link)}&nome=${encodeURIComponent(artigo.titulo)}&imagem=${encodeURIComponent(artigo.imagem)}`}
                style={{ backgroundColor: i === 0 ? '#dc2626' : '#fff', color: i === 0 ? '#fff' : '#dc2626', border: '2px solid #dc2626', padding: '12px 24px', borderRadius: '10px', fontWeight: 800, fontSize: '0.95rem', textDecoration: 'none' }}>
                {i === 0 ? `🔥 Melhor preço — ${o.loja}` : `Ver em ${o.loja}`}
              </a>
            ))}
          </div>
          <p style={{ fontSize: '0.68rem', color: '#9ca3af', margin: '12px 0 0' }}>
            Link de afiliado · Preço sujeito a alteração · Confira sempre no site do anunciante
          </p>
        </div>
      )}

      <footer style={{ marginTop: '32px', textAlign: 'center' }}>
        <p style={{ fontSize: '0.72rem', color: '#9ca3af', margin: 0 }}>
          © {new Date().getFullYear()} IAIPSI Informa ·
          <Link href="/termos" style={{ color: '#9ca3af', marginLeft: '4px' }}>Termos e Privacidade</Link>
        </p>
      </footer>

    </main>
  );
}

import { kv } from '@/lib/kv';
import { notFound } from 'next/navigation';
import Link from 'next/link';

interface ArtigoComPalavra {
  id: string; slug: string; titulo: string; conteudo: string;
  resumo: string; imagem?: string; publicado: boolean; destaque: boolean;
  createdAt: string; updatedAt: string;
}

async function getArtigo(slug: string): Promise<ArtigoComPalavra | null> {
  try {
    const data = await kv.get<ArtigoComPalavra[]>('artigos:compalavra');
    return (data || []).find(a => a.slug === slug && a.publicado) || null;
  } catch { return null; }
}

function renderConteudo(texto: string) {
  return texto.split('\n').map((linha, i) => {
    if (!linha.trim() || linha.trim() === '---') return <br key={i} />;
    if (linha.startsWith('## ')) return <h2 key={i} style={{ fontSize: '1.3rem', fontWeight: 800, color: '#111827', margin: '28px 0 12px' }}>{linha.replace('## ', '')}</h2>;
    if (linha.startsWith('# ')) return <h1 key={i} style={{ fontSize: '1.6rem', fontWeight: 900, color: '#111827', margin: '32px 0 14px' }}>{linha.replace('# ', '')}</h1>;
      const html = linha
      .replace(/\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g, '<a href="$2" target="_blank" rel="noopener" style="color:#0f766e;font-weight:600;">$1</a>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    return <p key={i} style={{ margin: '0 0 16px', lineHeight: 1.8, color: '#1f2937', fontSize: '1.05rem' }} dangerouslySetInnerHTML={{ __html: html }} />;
  });
}

export default async function ArtigoComPalavraPage({ params }: { params: { slug: string } }) {
  const artigo = await getArtigo(params.slug);
  if (!artigo) notFound();

  return (
    <main style={{ maxWidth: '720px', margin: '0 auto', padding: '24px 16px' }}>
      <nav style={{ marginBottom: '24px', fontSize: '0.8rem', color: '#6b7280' }}>
        <Link href="/" style={{ color: '#0f766e', textDecoration: 'none' }}>Início</Link>
        {' / '}
        <Link href="/compalavra" style={{ color: '#0f766e', textDecoration: 'none' }}>ComAPalavra</Link>
        {' / '}
        <span>{artigo.titulo}</span>
      </nav>

      <div style={{ borderBottom: '2px solid #0f766e', marginBottom: '32px', paddingBottom: '20px' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '2px', color: '#0f766e', textTransform: 'uppercase', marginBottom: '10px' }}>✍️ ComAPalavra · Adilson Costa</div>
        <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#111827', margin: '0 0 14px', lineHeight: 1.2 }}>{artigo.titulo}</h1>
        {artigo.resumo && <p style={{ color: '#374151', fontSize: '1.1rem', margin: '0 0 16px', lineHeight: 1.6, fontStyle: 'italic' }}>{artigo.resumo}</p>}
        <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
          Publicado em {new Date(artigo.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
        </div>
      </div>

      {artigo.imagem && (
        <div style={{ marginBottom: '32px', borderRadius: '12px', overflow: 'hidden' }}>
          <img src={artigo.imagem} alt={artigo.titulo} style={{ width: '100%', maxHeight: '400px', objectFit: 'cover' }} />
        </div>
      )}

      <article>{renderConteudo(artigo.conteudo)}</article>

      <div style={{ marginTop: '48px', padding: '24px', backgroundColor: '#f0fdfa', borderRadius: '12px', border: '1px solid #a7f3d0', textAlign: 'center' }}>
        <div style={{ fontWeight: 800, color: '#065f46', fontSize: '1rem', marginBottom: '4px' }}>Adilson Costa</div>
        <div style={{ color: '#047857', fontSize: '0.875rem' }}>Psicanalista · Coluna ComAPalavra</div>
      </div>

      <div style={{ marginTop: '32px', textAlign: 'center' }}>
        <Link href="/compalavra" style={{ color: '#0f766e', fontWeight: 600, textDecoration: 'none', fontSize: '0.9rem' }}>← Ver todos os artigos</Link>
      </div>
    </main>
  );
}

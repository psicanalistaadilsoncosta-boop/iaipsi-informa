import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { kv } from '@/lib/kv';
import { lerUm } from '@/lib/pinados';
import Redireciona from './Redireciona';

// Link curto de oferta: comlupa.com.br/o/<id do produto pinado>
// Mostra foto e nome na prévia do WhatsApp e segue para /ir com o link de afiliado.

export const dynamic = 'force-dynamic';

async function buscarProduto(id: string): Promise<any | null> {
  try {
    return await lerUm(String(id));
  } catch {
    return null;
  }
}

function precoTexto(preco: any): string | null {
  const n = Number(preco);
  if (!n || isNaN(n) || n <= 0) return null;
  return `R$ ${n.toFixed(2).replace('.', ',')}`;
}

function imagemDe(p: any): string {
  return p?.imagem || p?.foto || p?.thumbnail || '';
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const p = await buscarProduto(decodeURIComponent(id));
  if (!p) return { title: 'Oferta', robots: { index: false } };

  const preco = precoTexto(p.preco);
  const titulo = preco ? `${p.nome} por ${preco}` : String(p.nome || 'Oferta');
  const loja = p.lojaNome || p.loja;
  const descricao = `Oferta selecionada pelo Com a Lupa${loja ? ` · ${loja}` : ''}. Confira preço e condições no site da loja.`;
  const imagem = imagemDe(p);

  return {
    title: titulo,
    description: descricao,
    robots: { index: false, follow: false },
    openGraph: {
      type: 'website',
      siteName: 'Com a Lupa',
      title: titulo,
      description: descricao,
      images: imagem ? [{ url: imagem, alt: String(p.nome || '') }] : ['/og-image.jpg'],
    },
    twitter: {
      card: 'summary_large_image',
      title: titulo,
      description: descricao,
      images: imagem ? [imagem] : ['/og-image.jpg'],
    },
  };
}

export default async function OfertaCurta({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = await buscarProduto(decodeURIComponent(id));

  // Produto saiu da curadoria: manda para as ofertas selecionadas
  if (!p || !p.link) redirect('/ofertas-selecionadas');

  const destino = `/ir?url=${encodeURIComponent(p.link)}&nome=${encodeURIComponent(p.nome || '')}&imagem=${encodeURIComponent(imagemDe(p))}`;

  return (
    <main style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', fontFamily: 'system-ui, -apple-system, sans-serif', padding: '24px', textAlign: 'center' }}>
      <Redireciona destino={destino} />
      <p style={{ color: '#5B3E96', fontWeight: 700, margin: 0 }}>🔍 Abrindo a oferta...</p>
      <a href={destino} style={{ color: '#6b7280', fontSize: '0.9rem' }}>Se não abrir sozinho, toque aqui</a>
    </main>
  );
}

import fs from 'fs/promises';
import path from 'path';
import Link from 'next/link';

interface SaboresItem {
  id: string;
  prato: string;
  destino: string;
  intro: string;
  cta: string;
  imageUrl: string | null;
  publishedAt: string;
}

async function getSabores(): Promise<SaboresItem[]> {
  try {
    const filePath = path.join(process.cwd(), 'public', 'sabores.json');
    const raw = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch { return []; }
}

export default async function ArquivoSaboresPage() {
  const items = await getSabores();

  return (
    <main style={{ maxWidth: '1060px', margin: '0 auto', padding: '30px 20px', fontFamily: 'system-ui, sans-serif', backgroundColor: '#f9fafb', minHeight: '100vh' }}>

      <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#b45309', fontWeight: 600, fontSize: '0.85rem', textDecoration: 'none', marginBottom: '24px' }}>
        ← Voltar ao site
      </Link>

      <header style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', marginBottom: '32px', borderTop: '6px solid #b45309' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#111827', margin: '0 0 6px' }}>Sabores & Destinos</h1>
        <p style={{ color: '#6b7280', fontSize: '0.95rem', margin: 0 }}>
          Gastronomia, viagem e uma lente sobre o prazer de viver — por Adilson Costa
        </p>
      </header>

      {items.length === 0 ? (
        <p style={{ color: '#6b7280', textAlign: 'center', padding: '40px' }}>Nenhum post publicado ainda.</p>
      ) : (
             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
          {items.map(item => (
            <Link key={item.id} href={`/sabores/${item.id}`} style={{ textDecoration: 'none' }}>
              <article style={{ backgroundColor: '#fff', borderRadius: '14px', overflow: 'hidden', border: '1px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', cursor: 'pointer' }}>
                <div style={{ height: '200px', overflow: 'hidden', backgroundColor: '#f3f4f6', position: 'relative' }}>
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.prato} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #b45309 0%, #92400e 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: '3rem' }}>🍽</span>
                    </div>
                  )}
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%', background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 100%)' }} />
                  <div style={{ position: 'absolute', bottom: '12px', left: '14px' }}>
                    <div style={{ fontSize: '0.65rem', color: '#fcd34d', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{item.destino}</div>
                  </div>
                </div>

                <div style={{ padding: '20px' }}>
                  <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#111827', margin: '0 0 8px', lineHeight: 1.3 }}>{item.prato}</h2>
                  <p style={{ fontSize: '0.85rem', color: '#6b7280', fontStyle: 'italic', margin: '0 0 12px', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {item.intro}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <small style={{ color: '#9ca3af', fontSize: '0.75rem' }}>
                      {new Date(item.publishedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </small>
                    <span style={{ color: '#b45309', fontWeight: 600, fontSize: '0.82rem' }}>
                      {item.cta} →
                    </span>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      )}

    </main>
  );
}
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

interface Oferta {
  tipo: string;
  titulo: string;
  link: string;
  imagem?: string;
  isCupom?: boolean;
  code?: string;
  preco?: number;
  precoOriginal?: number;
  desconto?: number;
}

function NoticiaContent() {
  const searchParams = useSearchParams();
  const url = searchParams.get('url') || '/';
  const titulo = searchParams.get('titulo') || 'Matéria completa';
  const categoria = searchParams.get('categoria') || '';
  const cor = searchParams.get('cor') ? `#${searchParams.get('cor')}` : '#2563eb';
  const snippet = searchParams.get('snippet') || '';

  const [contador, setContador] = useState(7);
  const [oferta, setOferta] = useState<Oferta | null>(null);
  const [copiado, setCopiado] = useState(false);

  // Busca oferta aleatória
  useEffect(() => {
    fetch('/api/ofertas-mix')
      .then(r => r.json())
      .then(d => {
        const items = d.items || [];
        if (items.length > 0) {
          const random = items[Math.floor(Math.random() * items.length)];
          setOferta(random);
        }
      })
      .catch(() => {});
  }, []);

  // Countdown e redirecionamento
  useEffect(() => {
    if (contador <= 0) {
      window.location.href = url;
      return;
    }
    const timer = setTimeout(() => setContador(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [contador, url]);

  function copiar(code: string) {
    navigator.clipboard.writeText(code);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  return (
    <main style={{ maxWidth: '700px', margin: '0 auto', padding: '24px 20px', fontFamily: 'system-ui, sans-serif', backgroundColor: '#f9fafb', minHeight: '100vh' }}>

      {/* Barra de progresso */}
      <div style={{ backgroundColor: '#e5e7eb', borderRadius: '999px', height: '6px', marginBottom: '24px', overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          backgroundColor: cor,
          borderRadius: '999px',
          width: `${((7 - contador) / 7) * 100}%`,
          transition: 'width 1s linear',
        }} />
      </div>

      {/* Aviso de redirecionamento */}
      <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '20px 24px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          {categoria && (
            <span style={{ backgroundColor: cor, color: '#fff', fontSize: '0.68rem', fontWeight: 700, padding: '2px 8px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.5px', marginRight: '8px' }}>
              {categoria}
            </span>
          )}
          <p style={{ fontSize: '0.88rem', color: '#374151', margin: '8px 0 4px', fontWeight: 600, lineHeight: 1.4 }}>
            {titulo}
          </p>
          {snippet && (
            <p style={{ fontSize: '0.78rem', color: '#9ca3af', margin: 0, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {snippet}
            </p>
          )}
        </div>
        <div style={{ textAlign: 'center', flexShrink: 0 }}>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: cor, lineHeight: 1 }}>{contador}</div>
          <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: '2px' }}>segundos</div>
        </div>
      </div>

      {/* Botão ir agora */}
      <a href={url} style={{ display: 'block', backgroundColor: cor, color: '#fff', padding: '12px', borderRadius: '10px', fontWeight: 700, fontSize: '0.95rem', textAlign: 'center', textDecoration: 'none', marginBottom: '24px' }}>
        Ir para a matéria agora →
      </a>

      {/* Oferta aleatória */}
      {oferta && (
        <div style={{ backgroundColor: '#fff', borderRadius: '14px', border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <div style={{ padding: '10px 16px', backgroundColor: '#fef2f2', borderBottom: '1px solid #fee2e2', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.7rem', color: '#dc2626', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              🔥 Enquanto você espera — oferta especial
            </span>
          </div>

          {oferta.tipo === 'campanha' && (
            <div style={{ padding: '20px' }}>
              {oferta.imagem && (
                <div style={{ height: '160px', overflow: 'hidden', borderRadius: '8px', marginBottom: '16px', backgroundColor: '#f3f4f6' }}>
                  <img src={oferta.imagem} alt={oferta.titulo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                </div>
              )}
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#111827', margin: '0 0 14px', lineHeight: 1.4 }}>
                {oferta.titulo}
              </h3>
              {oferta.isCupom && oferta.code && (
                <button onClick={() => copiar(oferta.code!)} style={{ width: '100%', backgroundColor: copiado ? '#047857' : '#f5f3ff', color: copiado ? '#fff' : '#7c3aed', border: '2px dashed #7c3aed', borderRadius: '8px', padding: '10px', fontWeight: 800, fontSize: '1.1rem', cursor: 'pointer', letterSpacing: '2px', marginBottom: '10px', textAlign: 'center' }}>
                  {copiado ? '✅ Copiado!' : oferta.code}
                </button>
              )}
              <a href={oferta.link} target="_blank" rel="noopener noreferrer sponsored" style={{ display: 'block', backgroundColor: '#dc2626', color: '#fff', padding: '10px', borderRadius: '8px', fontWeight: 700, textAlign: 'center', textDecoration: 'none' }}>
                {oferta.isCupom ? 'Usar cupom →' : 'Ver oferta →'}
              </a>
            </div>
          )}

          {oferta.tipo === 'marca' && (
            <a href={oferta.link} target="_blank" rel="noopener noreferrer sponsored" style={{ textDecoration: 'none', display: 'block', padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                {(oferta as any).logo && (
                  <img src={(oferta as any).logo} alt={oferta.titulo} style={{ width: '56px', height: '56px', objectFit: 'contain', borderRadius: '8px', border: '1px solid #f3f4f6' }} />
                )}
                <div>
                  <div style={{ fontWeight: 700, color: '#111827', fontSize: '1rem' }}>{oferta.titulo}</div>
                  <div style={{ fontSize: '0.78rem', color: '#6b7280', marginTop: '2px' }}>{(oferta as any).segment}</div>
                </div>
              </div>
              <div style={{ marginTop: '14px', backgroundColor: '#dc2626', color: '#fff', padding: '10px', borderRadius: '8px', fontWeight: 700, textAlign: 'center' }}>
                Visitar loja →
              </div>
            </a>
          )}

          {oferta.tipo === 'produto' && (
            <a href={oferta.link} target="_blank" rel="noopener noreferrer sponsored" style={{ textDecoration: 'none', display: 'block', padding: '20px' }}>
              {oferta.imagem && (
                <div style={{ height: '160px', overflow: 'hidden', borderRadius: '8px', marginBottom: '14px', backgroundColor: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px', position: 'relative' }}>
                  <img src={oferta.imagem} alt={oferta.titulo} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                  {oferta.desconto && oferta.desconto > 0 && (
                    <span style={{ position: 'absolute', top: '8px', left: '8px', backgroundColor: '#dc2626', color: '#fff', fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: '6px' }}>
                      -{oferta.desconto}%
                    </span>
                  )}
                </div>
              )}
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#111827', margin: '0 0 10px', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {oferta.titulo}
              </h3>
              {oferta.precoOriginal && oferta.preco && oferta.precoOriginal > oferta.preco && (
                <div style={{ fontSize: '0.8rem', color: '#9ca3af', textDecoration: 'line-through' }}>
                  R$ {oferta.precoOriginal.toFixed(2).replace('.', ',')}
                </div>
              )}
              {oferta.preco && (
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#dc2626', marginBottom: '12px' }}>
                  R$ {oferta.preco.toFixed(2).replace('.', ',')}
                </div>
              )}
              <div style={{ backgroundColor: '#dc2626', color: '#fff', padding: '10px', borderRadius: '8px', fontWeight: 700, textAlign: 'center' }}>
                Ver oferta →
              </div>
            </a>
          )}

          <p style={{ fontSize: '0.65rem', color: '#9ca3af', textAlign: 'center', padding: '8px', margin: 0 }}>
            Publicidade · Preços sujeitos a alteração
          </p>
        </div>
      )}

      <footer style={{ marginTop: '24px', textAlign: 'center' }}>
        <p style={{ fontSize: '0.7rem', color: '#9ca3af', margin: 0 }}>
          © {new Date().getFullYear()} IAIPSI Informa
        </p>
      </footer>

    </main>
  );
}

export default function NoticiaPage() {
  return (
    <Suspense fallback={
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui', backgroundColor: '#f9fafb' }}>
        <p style={{ color: '#9ca3af' }}>Carregando...</p>
      </main>
    }>
      <NoticiaContent />
    </Suspense>
  );
}
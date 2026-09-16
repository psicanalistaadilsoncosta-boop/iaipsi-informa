import { Suspense } from 'react';
import Script from 'next/script';

interface Props {
  searchParams: Promise<{ url?: string; titulo?: string; categoria?: string; cor?: string; snippet?: string }>;
}

export default async function NoticiaPage({ searchParams }: Props) {
  const params = await searchParams;
  const url = params.url || '/';
  const titulo = params.titulo || 'Matéria completa';
  const categoria = params.categoria || '';
  const cor = params.cor ? `#${params.cor}` : '#2563eb';
  const snippet = params.snippet || '';

  return (
    <main style={{ maxWidth: '780px', margin: '0 auto', padding: '20px', fontFamily: 'system-ui, sans-serif', backgroundColor: '#f9fafb', minHeight: '100vh' }}>

      {/* Script Travelpayouts contextual */}
      <Script
        id="travelpayouts-noticia"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (function () {
              var script = document.createElement("script");
              script.async = 1;
              script.src = 'https://emrldtp.com/NTc0NTU2.js?t=574556';
              document.head.appendChild(script);
            })();
          `,
        }}
      />

      {/* Voltar */}
      <a href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#6b7280', fontWeight: 600, fontSize: '0.82rem', textDecoration: 'none', marginBottom: '20px' }}>
        ← Voltar ao IAIPSI Informa
      </a>

      {/* Banner Travelpayouts — aparece no topo */}
      <div style={{ marginBottom: '24px', borderRadius: '10px', overflow: 'hidden', backgroundColor: '#fff', border: '1px solid #e5e7eb' }}>
        <div style={{ padding: '8px 12px', backgroundColor: '#f9fafb', borderBottom: '1px solid #f3f4f6' }}>
          <span style={{ fontSize: '0.65rem', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Publicidade</span>
        </div>
        {/* O script do Travelpayouts injeta os banners aqui automaticamente */}
        <div id="tp-banner" style={{ minHeight: '90px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px' }}>
          <span style={{ fontSize: '0.8rem', color: '#d1d5db' }}>Carregando oferta...</span>
        </div>
      </div>

      {/* Card da notícia */}
      <div style={{ backgroundColor: '#fff', borderRadius: '14px', border: '1px solid #e5e7eb', padding: '32px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', marginBottom: '24px', borderLeft: `5px solid ${cor}` }}>

        {categoria && (
          <div style={{ marginBottom: '14px' }}>
            <span style={{ backgroundColor: cor, color: '#fff', fontSize: '0.72rem', fontWeight: 700, padding: '3px 10px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {categoria}
            </span>
          </div>
        )}

        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#111827', margin: '0 0 16px', lineHeight: 1.3 }}>
          {titulo}
        </h1>

        {snippet && (
          <p style={{ fontSize: '0.95rem', color: '#6b7280', margin: '0 0 24px', lineHeight: 1.6 }}>
            {snippet}
          </p>
        )}

        <a href={url} target="_blank" rel="noopener noreferrer" style={{
          display: 'block',
          backgroundColor: cor,
          color: '#fff',
          padding: '14px 24px',
          borderRadius: '10px',
          fontWeight: 800,
          fontSize: '1.05rem',
          textAlign: 'center',
          textDecoration: 'none',
        }}>
          Ler matéria completa no site de origem →
        </a>

        <p style={{ fontSize: '0.72rem', color: '#9ca3af', textAlign: 'center', marginTop: '12px' }}>
          Você será redirecionado para o site de origem da notícia
        </p>
      </div>

      {/* Segunda área de banner abaixo da notícia */}
      <div style={{ borderRadius: '10px', overflow: 'hidden', backgroundColor: '#fff', border: '1px solid #e5e7eb' }}>
        <div style={{ padding: '8px 12px', backgroundColor: '#f9fafb', borderBottom: '1px solid #f3f4f6' }}>
          <span style={{ fontSize: '0.65rem', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Publicidade</span>
        </div>
        <div style={{ minHeight: '90px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px' }}>
          <span style={{ fontSize: '0.8rem', color: '#d1d5db' }}>Carregando oferta...</span>
        </div>
      </div>

      <footer style={{ marginTop: '32px', textAlign: 'center' }}>
        <p style={{ fontSize: '0.72rem', color: '#9ca3af', lineHeight: 1.6 }}>
          © {new Date().getFullYear()} IAIPSI Informa · O conteúdo da matéria é de responsabilidade do veículo de origem.
        </p>
      </footer>

    </main>
  );
}
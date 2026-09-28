import type { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL('https://informa.iaipsi.com'),
  title: {
    default: 'IAIPSI — Notícias, Análises e Sabores',
    template: '%s | IAIPSI Informa',
  },
  description: 'Notícias de política, economia, saúde mental e psicanálise com análises editoriais de Adilson Costa — psicanalista e consultor organizacional.',
  keywords: ['psicanálise', 'saúde mental', 'liderança', 'notícias', 'análise editorial', 'Adilson Costa', 'IAIPSI'],
  authors: [{ name: 'Adilson Costa', url: 'https://iaipsi.com' }],
  creator: 'Adilson Costa',
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://informa.iaipsi.com',
    siteName: 'IAIPSI Informa',
    title: 'IAIPSI — Notícias, Análises e Sabores',
    description: 'Notícias com análises editoriais de Adilson Costa — psicanalista e consultor organizacional.',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'IAIPSI Informa' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'IAIPSI — Notícias, Análises e Sabores',
    description: 'Notícias com análises editoriais de Adilson Costa.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  verification: {
    google: '1cHg7n-AwRyL02QBJbB24LjNz-GuZCMHsxsjYKC1U0Y',
    other: {
      'mitgo-verification': '184e98de-443a-47c6-8afa-e3317f0c1980',
      'lomadee': '2324685',
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
           <body>
                <div
          style={{
            background: '#5B3E96',
            color: '#FFFFFF',
            padding: '8px 16px',
            fontSize: '14px',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            letterSpacing: '0.3px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px 16px',
            flexWrap: 'wrap',
          }}
        >
          <span>🔍 Você está <strong>Com a Lupa</strong> · notícias e ofertas vistas de perto</span>
          <form action="/busca" method="get" style={{ display: 'flex', gap: '4px', margin: 0 }}>
            <input
              type="search"
              name="q"
              placeholder="Buscar ofertas..."
              aria-label="Buscar ofertas"
              style={{
                padding: '5px 10px',
                borderRadius: '6px',
                border: 'none',
                fontSize: '13px',
                width: '180px',
              }}
            />
            <button
              type="submit"
              style={{
                background: '#FFFFFF',
                color: '#5B3E96',
                border: 'none',
                borderRadius: '6px',
                padding: '5px 12px',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              Buscar
            </button>
          </form>
        </div>
        {children}
      </body>
    </html>
  );
}
import type { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL('https://comlupa.com.br'),
  title: {
    default: 'Com a Lupa — notícias e ofertas vistas de perto',
    template: '%s | Com a Lupa',
  },
  description: 'Notícias de política, economia, saúde mental e psicanálise com análises editoriais de Adilson Costa — psicanalista e consultor organizacional.',
  keywords: ['Com a Lupa', 'ofertas', 'cupons', 'notícias', 'análise editorial', 'psicanálise', 'saúde mental', 'liderança', 'Adilson Costa', 'IAIPSI'],
  authors: [{ name: 'Adilson Costa', url: 'https://iaipsi.com' }],
  creator: 'Adilson Costa',
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://comlupa.com.br',
    siteName: 'Com a Lupa',
    title: 'Com a Lupa — notícias e ofertas vistas de perto',
    description: 'Notícias com análises editoriais de Adilson Costa e ofertas selecionadas a dedo.',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Com a Lupa' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Com a Lupa — notícias e ofertas vistas de perto',
    description: 'Notícias com análises editoriais de Adilson Costa e ofertas selecionadas a dedo.',
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
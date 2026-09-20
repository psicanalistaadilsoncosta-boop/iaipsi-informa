import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/next';

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
        {children}
        <Analytics />
      </body>
    </html>
  );
}
// app/natal/layout.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Presentes de Natal por faixa de preço | Com a Lupa',
  description: 'Presentes de Natal para toda a família, organizados por faixa de preço. Monte a lista, combine com quem vai presentear e receba os links.',
  alternates: { canonical: '/natal' },
  openGraph: {
    title: 'Natal com a Lupa',
    description: 'Presentes por faixa de preço, para toda a família.',
    url: '/natal',
    type: 'website',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

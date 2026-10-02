// app/dia-das-criancas/layout.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Presentes de Dia das Crianças com desconto | Com a Lupa',
  description: 'Brinquedos, roupas e calçados infantis por faixa de preço, em lojas com reputação conferida. Monte a lista de presentes e receba os links.',
  alternates: { canonical: '/dia-das-criancas' },
  openGraph: {
    title: 'Dia das Crianças com a Lupa',
    description: 'Presentes por faixa de preço, garimpados de perto.',
    url: '/dia-das-criancas',
    type: 'website',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

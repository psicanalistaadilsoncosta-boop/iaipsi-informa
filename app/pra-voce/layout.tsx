// app/pra-voce/layout.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Lupa pra você: trabalho, treino e conexão | Com a Lupa',
  description: 'Notebook, tênis, celular e o que mais é seu no dia a dia. Ofertas lupadas para trabalhar e estudar, mexer o corpo e ficar conectado.',
  alternates: { canonical: '/pra-voce' },
  openGraph: { title: 'Lupa pra você', description: 'Trabalhar e estudar, mexer o corpo, ficar conectado.', url: '/pra-voce', type: 'website' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

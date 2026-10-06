// app/lupa-me-ajuda/layout.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Lupa, me ajuda? Sugestões de presente com o porquê | Com a Lupa',
  description: 'Responda 4 perguntas rápidas e a Lupa sugere presentes e compras que combinam com quem vai receber, explicando o porquê de cada escolha.',
  alternates: { canonical: '/lupa-me-ajuda' },
  openGraph: { title: 'Lupa, me ajuda?', description: 'Responda 4 perguntas e receba sugestões com o porquê.', url: '/lupa-me-ajuda', type: 'website' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

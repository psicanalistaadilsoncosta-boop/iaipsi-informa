// app/comunicacao-nao-violenta/page.tsx
import type { Metadata } from 'next';
import Cartelas from './Cartelas';
import { CARTELAS, TITULO, SUBTITULO } from './conteudo';
import { CALENDARIO } from '../temas/temas';

export const metadata: Metadata = {
  title: `${TITULO}: ${SUBTITULO.toLowerCase()} | Com a Lupa`,
  description: 'O que é a Comunicação Não Violenta (CNV) de Marshall Rosenberg, os quatro passos (observação, sentimento, necessidade e pedido) e muitos exemplos do dia a dia, em cartelas.',
  alternates: { canonical: '/comunicacao-nao-violenta' },
  openGraph: {
    title: 'Comunicação Não Violenta, em cartelas',
    description: 'Os quatro passos da CNV e exemplos do dia a dia.',
    url: '/comunicacao-nao-violenta',
    type: 'article',
  },
};

// O botão final leva à data festiva do momento (ou ao Natal, fora das datas)
function listaDoMomento() {
  const p = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', month: '2-digit', day: '2-digit' }).formatToParts(new Date());
  const hoje = `${p.find(x => x.type === 'month')!.value}-${p.find(x => x.type === 'day')!.value}`;
  const d = CALENDARIO.find(c => c.de <= hoje && hoje <= c.ate);
  return d ? { texto: 'Monte sua lista de pedidos', href: d.href } : { texto: 'Monte sua lista de pedidos', href: '/natal' };
}

export const revalidate = 3600;

export default function Page() {
  return <Cartelas cartelas={CARTELAS} cta={listaDoMomento()} mascote="/mascote/lupa-sentada.webp" />;
}

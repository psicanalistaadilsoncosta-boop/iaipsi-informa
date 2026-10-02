// app/temas/LogoComAPalavra.tsx
// Logo da coluna em texto (nítido em qualquer tamanho): "ComAPalavra" + assinatura "por Adilson Costa".
// fundo="claro" para usar sobre branco; fundo="escuro" sobre o azul da coluna.

import { Playfair_Display, Dancing_Script } from 'next/font/google';

const titulo = Playfair_Display({ subsets: ['latin'], weight: ['700', '900'], display: 'swap' });
const assinatura = Dancing_Script({ subsets: ['latin'], weight: ['600'], display: 'swap' });

type Props = { tamanho?: number; fundo?: 'claro' | 'escuro' };

export default function LogoComAPalavra({ tamanho = 24, fundo = 'claro' }: Props) {
  const escuro = fundo === 'escuro';
  const corTexto = escuro ? '#FFFFFF' : '#1E3A5F';
  const corA = escuro ? '#F5C518' : '#C99A06';
  const corAssina = escuro ? '#F5C518' : '#A87F05';

  return (
    <span
      aria-label="ComAPalavra, por Adilson Costa"
      style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-end', lineHeight: 1, fontSize: tamanho, whiteSpace: 'nowrap' }}
    >
      <span aria-hidden="true" style={{ fontFamily: titulo.style.fontFamily, fontWeight: 700, color: corTexto, display: 'inline-flex', alignItems: 'baseline' }}>
        Com<span style={{ color: corA, fontWeight: 900, fontSize: '1.45em', margin: '0 0.02em' }}>A</span>Palavra
      </span>
      <span aria-hidden="true" style={{ fontFamily: assinatura.style.fontFamily, fontWeight: 600, color: corAssina, fontSize: '0.62em', marginTop: '0.1em' }}>
        por Adilson Costa
      </span>
    </span>
  );
}

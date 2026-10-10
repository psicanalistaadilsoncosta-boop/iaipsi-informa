'use client';
// app/pra-voce/page.tsx — "Lupa pra você", usa o molde de temas (app/temas)

import VitrineTematica from '../temas/VitrineTematica';

const TIPOS = ['Trabalhar e estudar', 'Livros e leitura', 'Mexer o corpo', 'Ficar conectado'];

async function carregar() {
  return fetch('/api/pra-voce').then(r => r.json()).catch(() => ({}));
}

export default function PraVocePage() {
  return <VitrineTematica temaId="pravoce" carregar={carregar} tiposOrdem={TIPOS} />;
}

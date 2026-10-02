'use client';
// app/vista-se/page.tsx — usa o molde de temas (app/temas)

import VitrineTematica from '../temas/VitrineTematica';

const TIPOS = ['Roupas', 'Calçados', 'Acessórios', 'Infantil', 'Bebê'];

async function carregar() {
  const d = await fetch('/api/vista-se').then(r => r.json()).catch(() => ({}));
  return d.adulto || {};
}

export default function VistaSePage() {
  return <VitrineTematica temaId="vistase" carregar={carregar} tiposOrdem={TIPOS} />;
}

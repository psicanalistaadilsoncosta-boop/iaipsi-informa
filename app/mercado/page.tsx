'use client';
// app/mercado/page.tsx — usa o molde de temas (app/temas)

import VitrineTematica from '../temas/VitrineTematica';

const TIPOS = ['Bebidas', 'Alimentos', 'Café', 'Snacks', 'Hortifruti', 'Limpeza', 'Pet'];

async function carregar() {
  return fetch('/api/mercado').then(r => r.json()).catch(() => ({}));
}

// o Mercado não tinha registro de lead: só envia o e-mail
async function registrarLead() {}

export default function MercadoPage() {
  return <VitrineTematica temaId="mercado" carregar={carregar} tiposOrdem={TIPOS} registrarLead={registrarLead} />;
}

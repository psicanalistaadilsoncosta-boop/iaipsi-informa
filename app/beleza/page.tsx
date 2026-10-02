'use client';
// app/beleza/page.tsx — usa o molde de temas (app/temas)

import VitrineTematica from '../temas/VitrineTematica';

const TIPOS = ['Perfumes', 'Skincare', 'Maquiagem', 'Cabelos', 'Massagem', 'Solar', 'Cuidados'];

async function carregar() {
  return fetch('/api/beleza').then(r => r.json()).catch(() => ({}));
}

async function registrarLead(email: string, lista: any[]) {
  return fetch('/api/beleza/lead', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, itens: lista.map(p => p.nome || p.name) }),
  });
}

export default function BelezaPage() {
  return <VitrineTematica temaId="beleza" carregar={carregar} tiposOrdem={TIPOS} registrarLead={registrarLead} />;
}

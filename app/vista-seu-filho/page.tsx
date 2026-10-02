'use client';
// app/vista-seu-filho/page.tsx — usa o molde de temas (app/temas)

import VitrineTematica from '../temas/VitrineTematica';

const TIPOS = ['Infantil', 'Bebê', 'Brinquedos'];

async function carregar(): Promise<Record<string, any[]>> {
  const [vs, amb] = await Promise.all([
    fetch('/api/vista-se').then(r => r.json()).catch(() => ({})),
    fetch('/api/ambientes').then(r => r.json()).catch(() => ({})),
  ]);
  const dados: Record<string, any[]> = { ...(vs.filho || {}) };
  // junta os produtos do Quarto Infantil nas mesmas abas, sem repetir
  Object.entries(amb['Quarto Infantil'] || {}).forEach(([tipo, prods]) => {
    if (!dados[tipo]) dados[tipo] = [];
    const ids = new Set(dados[tipo].map((x: any) => x.id));
    (prods as any[]).forEach(p => { if (!ids.has(p.id)) dados[tipo].push(p); });
  });
  return dados;
}

export default function VistaSeuFilhoPage() {
  return <VitrineTematica temaId="filho" carregar={carregar} tiposOrdem={TIPOS} />;
}
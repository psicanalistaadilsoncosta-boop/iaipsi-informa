'use client';
// app/natal/page.tsx
// Presentes de Natal: junta os produtos de todas as vitrines e organiza por faixa de preço.

import VitrineTematica from '../temas/VitrineTematica';

// transforma { ambiente: { tipo: [] } } ou { tipo: [] } numa lista simples
const achatar = (o: any): any[] =>
  !o ? [] : Array.isArray(o) ? o : Object.values(o).flatMap(achatar);

async function carregar(): Promise<Record<string, any[]>> {
  const pegar = (url: string) => fetch(url).then(r => r.json()).catch(() => ({}));
  const [vs, beleza, ambientes, momentos] = await Promise.all([
    pegar('/api/vista-se'), pegar('/api/beleza'), pegar('/api/ambientes'), pegar('/api/momentos'),
  ]);
  return {
    'Moda': achatar(vs.adulto),
    'Crianças': achatar(vs.filho),
    'Beleza': achatar(beleza),
    'Casa': achatar(ambientes),
    'Momentos': achatar(momentos),
  };
}

export default function NatalPage() {
  return <VitrineTematica temaId="natal" carregar={carregar} />;
}

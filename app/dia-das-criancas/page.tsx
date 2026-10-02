'use client';
// app/dia-das-criancas/page.tsx
// Usa os mesmos produtos da Vista seu Filho (Infantil, Bebê, Brinquedos) + Quarto Infantil,
// agrupados por faixa de preço.

import VitrineTematica from '../temas/VitrineTematica';

async function carregar(): Promise<Record<string, any[]>> {
  const [vs, amb] = await Promise.all([
    fetch('/api/vista-se').then(r => r.json()).catch(() => ({})),
    fetch('/api/ambientes').then(r => r.json()).catch(() => ({})),
  ]);
  return { ...(vs.filho || {}), ...Object.fromEntries(
    Object.entries(amb['Quarto Infantil'] || {}).map(([t, p]) => [`Quarto ${t}`, p as any[]])
  ) };
}

export default function DiaDasCriancasPage() {
  return <VitrineTematica temaId="criancas" carregar={carregar} />;
}

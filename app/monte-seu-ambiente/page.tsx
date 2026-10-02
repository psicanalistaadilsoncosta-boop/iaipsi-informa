'use client';
// app/monte-seu-ambiente/page.tsx — usa o molde de temas (app/temas), com 2 níveis: ambiente → tipo

import VitrineTematica from '../temas/VitrineTematica';

const AMBIENTES = ['Sala', 'Quarto', 'Escritório', 'Cozinha', 'Banheiro', 'Área externa'];
const TIPOS_AMBIENTE = ['Iluminação', 'Climatização', 'Móveis', 'Decoração', 'Organização', 'Eletrônicos'];
const AMBIENTE_EMOJI: Record<string, string> = {
  'Sala': '🛋', 'Quarto': '🛏', 'Escritório': '💻', 'Cozinha': '🍳', 'Banheiro': '🚿', 'Área externa': '🌿',
};
const TIPO_EMOJI: Record<string, string> = {
  'Iluminação': '💡', 'Climatização': '❄️', 'Móveis': '🪑', 'Decoração': '🎨', 'Organização': '📦', 'Eletrônicos': '🔌',
};

async function carregar() {
  return fetch('/api/ambientes').then(r => r.json()).catch(() => ({}));
}

async function registrarLead(email: string, lista: any[]) {
  return fetch('/api/ambientes/lead', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, ambientes: [...new Set(lista.map(p => p.ambiente).filter(Boolean))] }),
  });
}

export default function MonteSeuAmbientePage() {
  return (
    <VitrineTematica
      temaId="ambiente"
      carregar={carregar}
      registrarLead={registrarLead}
      niveis={{ ordem: AMBIENTES, emoji: AMBIENTE_EMOJI, ordemTipos: TIPOS_AMBIENTE, emojiTipos: TIPO_EMOJI, pergunta: 'Qual ambiente você quer montar?' }}
    />
  );
}

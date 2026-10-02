'use client';
// app/monte-seu-momento/page.tsx — usa o molde de temas (app/temas), com 2 níveis: momento → tipo

import VitrineTematica from '../temas/VitrineTematica';

const MOMENTOS = ['Café da manhã', 'Vinho', 'Churrasco', 'Lareira', 'Domingo relaxado', 'Festa em casa'];
const TIPOS_MOMENTO = ['Eletro', 'Móveis', 'Acessórios', 'Alimentos', 'Bebidas', 'Vinhos'];
const MOMENTO_EMOJI: Record<string, string> = {
  'Café da manhã': '☕', 'Vinho': '🍷', 'Churrasco': '🥩', 'Lareira': '🔥', 'Domingo relaxado': '🌅', 'Festa em casa': '🎉',
};
const TIPO_EMOJI: Record<string, string> = {
  'Eletro': '🔌', 'Móveis': '🪑', 'Acessórios': '✨', 'Alimentos': '🛒', 'Bebidas': '🍷', 'Vinhos': '🍾',
};

async function carregar() {
  return fetch('/api/momentos').then(r => r.json()).catch(() => ({}));
}

async function registrarLead(email: string, lista: any[]) {
  return fetch('/api/momentos/lead', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, momentos: [...new Set(lista.map(p => p.momento).filter(Boolean))] }),
  });
}

export default function MonteSeuMomentoPage() {
  return (
    <VitrineTematica
      temaId="momento"
      carregar={carregar}
      registrarLead={registrarLead}
      niveis={{ ordem: MOMENTOS, emoji: MOMENTO_EMOJI, ordemTipos: TIPOS_MOMENTO, emojiTipos: TIPO_EMOJI, pergunta: 'Qual é o seu momento?' }}
    />
  );
}

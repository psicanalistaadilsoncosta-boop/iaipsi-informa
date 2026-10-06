// lib/lupa-perguntas.ts
// Perguntas do "Lupa, me ajuda?" (usadas na página e na API; sem nada de servidor aqui).

export const PERGUNTAS = {
  para: {
    titulo: 'Para quem é?',
    opcoes: { mim: '🙋 Para mim', mae: '👩 Mãe', pai: '👨 Pai', parceiro: '💞 Parceiro(a)', crianca: '🧒 Criança', amigo: '🤝 Amigo(a)' },
  },
  ocasiao: {
    titulo: 'Qual a ocasião?',
    opcoes: { aniversario: '🎂 Aniversário', natal: '🎄 Natal', porquesim: '💌 Só porque sim', casanova: '🏡 Casa nova', cuidar: '🌿 Cuidar de mim' },
  },
  orcamento: {
    titulo: 'Quanto quer gastar?',
    opcoes: { ate100: 'Até R$ 100', '100a300': 'R$ 100 a 300', '300mais': 'Acima de R$ 300' },
  },
  valoriza: {
    titulo: 'O que a pessoa valoriza?',
    opcoes: { conforto: '🛋️ Conforto', beleza: '💄 Beleza e autocuidado', experiencias: '🍷 Experiências', praticidade: '🧰 Praticidade', tecnologia: '💻 Tecnologia' },
  },
} as const;

export type Respostas = { para: string; ocasiao: string; orcamento: string; valoriza: string };

export function respostasValidas(r: any): r is Respostas {
  return !!r && (Object.keys(PERGUNTAS) as (keyof typeof PERGUNTAS)[])
    .every(k => typeof r[k] === 'string' && r[k] in PERGUNTAS[k].opcoes);
}

export const rotulo = (k: keyof typeof PERGUNTAS, v: string) =>
  String((PERGUNTAS[k].opcoes as Record<string, string>)[v] || v).replace(/^[^\p{L}\p{N}]+\s*/u, '');


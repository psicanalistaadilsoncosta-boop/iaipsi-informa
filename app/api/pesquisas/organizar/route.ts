import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { isAdmin } from '@/lib/adminAuth';

export const maxDuration = 60;

const anthropic = new Anthropic({ apiKey: process.env.comApalavra_ANTHROPIC });

type Angulo = {
  angulo: string;
  porque: string;
  buscas: string[];
  titulos: string[];
};

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'não autorizado' }, { status: 401 });
  try {
    const { semente, google, youtube } = await req.json();
    const g: string[] = Array.isArray(google) ? google.slice(0, 150) : [];
    const y: string[] = Array.isArray(youtube) ? youtube.slice(0, 150) : [];
    if (!g.length && !y.length) return NextResponse.json({ error: 'Nenhuma busca para organizar' }, { status: 400 });

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-5-5',
      max_tokens: 4000,
      messages: [
        {
          role: 'user',
          content: `Você ajuda Adilson Costa, psicanalista, a escolher ângulos para a coluna Com a Palavra (textos psicanalíticos para o público leigo adulto, com reflexão e não com receita pronta).

Abaixo estão buscas REAIS que pessoas digitaram no Google e no YouTube a partir do tema "${String(semente || '')}".

TAREFA:
Agrupe as buscas em 3 a 5 ângulos de artigo. Para cada ângulo:
- "angulo": nome curto do ângulo (até 6 palavras).
- "porque": uma frase dizendo qual angústia ou pergunta humana está por trás dessas buscas, numa leitura psicanalítica breve.
- "buscas": de 3 a 8 buscas da lista que sustentam o ângulo, copiadas EXATAMENTE como aparecem.
- "titulos": 3 títulos possíveis para o artigo, usando as palavras de quem busca, sem sensacionalismo e sem promessa de cura.

REGRAS:
- Ignore buscas que não têm relação com reflexão psicológica ou emocional (nomes de produtos, músicas, celebridades, lugares).
- Nunca use travessão (— ou –) nos títulos. Use vírgula, dois-pontos ou ponto de interrogação.
- Não invente buscas que não estão na lista.
- Responda APENAS com JSON válido, sem texto antes ou depois, no formato:
{"angulos":[{"angulo":"","porque":"","buscas":[""],"titulos":[""]}]}

BUSCAS NO GOOGLE:
${g.join('\n')}

BUSCAS NO YOUTUBE:
${y.join('\n')}`,
        },
      ],
    });

    const texto = message.content
      .filter((b) => b.type === 'text')
      .map((b) => (b as { text: string }).text)
      .join('')
      .trim();

    const inicio = texto.indexOf('{');
    const fim = texto.lastIndexOf('}');
    if (inicio < 0 || fim < 0) return NextResponse.json({ error: 'A IA não devolveu um resultado legível' }, { status: 502 });

    const dados = JSON.parse(texto.slice(inicio, fim + 1));
    const angulos: Angulo[] = Array.isArray(dados?.angulos) ? dados.angulos : [];
    return NextResponse.json({ angulos });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

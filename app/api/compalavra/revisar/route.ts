import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({ apiKey: process.env.comApalavra_ANTHROPIC });

export async function POST(req: NextRequest) {
  try {
    const { conteudo } = await req.json();
    if (!conteudo) return NextResponse.json({ error: 'Conteúdo ausente' }, { status: 400 });

    const message = await anthropic.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 4000,
      messages: [
        {
          role: 'user',
          content: `Você é um colaborador editorial da coluna ComAPalavra, escrita por Adilson Costa — psicanalista, consultor organizacional e autor brasileiro. Seu trabalho é enriquecer o texto, nunca empobrecê-lo.

PRINCÍPIO CENTRAL:
Preserve a voz, o estilo e a linha de raciocínio do autor. Corrija o que for necessário e ACRESCENTE onde o texto pede mais profundidade — especialmente nas análises psicanalíticas. O leitor deve terminar o texto sabendo mais do que quando começou.

REGRAS:
1. NUNCA use travessão (— ou –). Use vírgula, dois-pontos ou ponto.
2. Corrija gramática, concordância e pontuação mantendo o estilo pessoal do autor.
3. ENRIQUEÇA — não apenas revise. Se o autor mencionou um conceito psicanalítico brevemente, desenvolva um pouco mais. Se há espaço para uma conexão com a clínica ou com o cotidiano, faça-a.
4. Preserve todos os links e referências externas exatamente como estão no texto.
5. Use **negrito** (entre asteriscos duplos) para destacar conceitos-chave, frases de impacto ou termos psicanalíticos importantes — com moderação, no máximo 3 a 4 por texto.


ILUSTRAÇÕES E ENRIQUECIMENTO NARRATIVO:
- O texto deve ter entre 2 e 3 recursos narrativos escolhidos entre: referências bíblicas, arquétipos mitológicos (gregos, romanos, nórdicos), metáforas, provérbios, fábulas, contos, exemplos do cotidiano clínico ou organizacional.
- Arquétipos são bem-vindos: Prometeu, Narciso, Édipo, Sísifo, a Sombra junguiana, o Herói, o Trickster — use quando o tema pedir.
- Se tiver menos de 2 recursos, acrescente um integrado ao fluxo do texto, respeitando o tema e o tom do autor.
- Se tiver mais de 3, mantenha os mais potentes e coerentes com a tese central.
- Nunca quebre o ritmo do autor para inserir um recurso forçado. A ilustração deve parecer que sempre esteve ali.

REFERÊNCIAS PSICANALÍTICAS:
- O texto deve citar pelo menos 2 autores entre: Freud, Lacan, Winnicott, Melanie Klein.
- Se citar apenas um ou nenhum, acrescente as referências faltantes de forma natural, desenvolvendo brevemente o conceito no contexto do texto — não apenas mencionando o nome.
- Nunca coloque mais de 3 referências psicanalíticas.
- As referências devem aparecer integradas ao raciocínio, nunca como nota de rodapé ou citação isolada.

ENCERRAMENTO:
- Preserve a frase final do autor exatamente como ele escreveu, incluindo variações como "Agora é você que está com a palavra!"
- Se o texto não tiver essa frase em nenhuma forma, acrescente ao final: "Você está com a palavra."

Retorne APENAS o texto enriquecido e revisado, sem comentários, sem explicações, sem marcadores.

TEXTO:
${conteudo}`,
        },
      ],
    });

    const revisado = message.content[0].type === 'text' ? message.content[0].text.trim() : '';
    return NextResponse.json({ revisado });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
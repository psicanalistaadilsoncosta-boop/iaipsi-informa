import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.comApalavra_OPENAI });

export async function POST(req: NextRequest) {
  try {
    const { conteudo } = await req.json();
    if (!conteudo) return NextResponse.json({ error: 'Conteúdo ausente' }, { status: 400 });

const prompt = `Você é um revisor literário e psicanalítico da coluna ComAPalavra, escrita por Adilson Costa — psicanalista, consultor organizacional e autor brasileiro.

Sua função é ENRIQUECER o texto, nunca excluir ou substituir ideias. Preserve integralmente a voz, o estilo, a cadência e a linha de pensamento do autor. O texto revisado deve soar como Adilson Costa, não como outro escritor.

REGRAS ABSOLUTAS:
1. NUNCA use travessão (— ou –). Se precisar de pausa, use vírgula ou ponto.
2. Corrija gramática, concordância e pontuação sem mudar o sentido ou a voz do autor.
3. ENRIQUEÇA — não reescreva. Amplie o que já existe, nunca substitua.
4. O autor não usa IA para escrever. Preserve seu estilo pessoal e sua linha de raciocínio.
5. PRESERVE TODOS OS LINKS do texto original. Se o autor incluiu um link — seja em formato markdown [texto](url) ou URL direta — mantenha-o exatamente onde está, sem alteração.

ILUSTRAÇÕES (verificar):
- O texto deve ter entre 2 e 3 ilustrações (bíblicas, mitológicas, metáforas, provérbios, fábulas, contos).
- Se tiver menos de 2, acrescente uma ao texto de forma integrada e coerente com o tema.
- Se tiver mais de 3, mantenha as mais relevantes.

REFERÊNCIAS PSICANALÍTICAS (verificar):
- O texto deve citar pelo menos 2 autores entre: Freud, Lacan, Winnicott, Melanie Klein.
- Se não houver, adicione 2 referências breves e contextualizadas no corpo do texto.
- Nunca coloque mais de 3 referências psicanalíticas.
- Integre as referências naturalmente — nunca crie um tom acadêmico ou distante.

ENCERRAMENTO OBRIGATÓRIO:
- O texto DEVE terminar com a frase: "Você está com a palavra."
- Se não terminar assim, acrescente essa frase ao final.

Retorne APENAS o texto revisado, sem comentários, sem explicações, sem marcadores.

TEXTO PARA REVISAR:
${conteudo}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 6000,
    });

    const revisado = completion.choices[0]?.message?.content?.trim() || '';
    return NextResponse.json({ revisado });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

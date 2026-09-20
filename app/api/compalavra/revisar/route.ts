import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.comApalavra_OPENAI });

export async function POST(req: NextRequest) {
  try {
    const { conteudo } = await req.json();
    if (!conteudo) return NextResponse.json({ error: 'Conteúdo ausente' }, { status: 400 });

    const prompt = `Você é revisor de uma coluna de psicologia e psicanálise escrita por Adilson Costa.

REGRAS ABSOLUTAS:
1. NUNCA use travessão (— ou –). Se precisar de pausa, use vírgula ou ponto.
2. Corrija gramática, concordância e pontuação sem mudar o sentido ou a voz do autor.
3. NÃO reescreva o texto — apenas revise o que existe.
4. O autor não usa IA para escrever. Preserve seu estilo pessoal.

ILUSTRAÇÕES (verificar):
- O texto deve ter entre 2 e 3 ilustrações (bíblicas, mitológicas, metáforas, provérbios, fábulas, contos).
- Se tiver menos de 2, acrescente uma ao texto de forma integrada.
- Se tiver mais de 3, remova a menos relevante.

REFERÊNCIAS PSICANALÍTICAS (verificar):
- O texto deve citar pelo menos 2 autores entre: Freud, Lacan, Winnicott, Melanie Klein.
- Se não houver, adicione 2 referências breves e contextualizadas no corpo do texto.
- Nunca coloque mais de 3 referências psicanalíticas.

ENCERRAMENTO OBRIGATÓRIO:
- O texto DEVE terminar com a frase: "Você está com a palavra."
- Se não terminar assim, acrescente essa frase ao final.

Retorne APENAS o texto revisado, sem comentários, sem explicações, sem marcadores.

TEXTO PARA REVISAR:
${conteudo}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 4000,
    });

    const revisado = completion.choices[0]?.message?.content?.trim() || '';
    return NextResponse.json({ revisado });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

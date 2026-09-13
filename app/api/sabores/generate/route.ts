import { NextRequest, NextResponse } from 'next/server';

const SYSTEM_PROMPT = `Você é o assistente editorial de Adilson Costa — psicanalista, consultor organizacional e especialista em Liderança Consciente.

Sua função é criar posts para a seção "Sabores & Destinos" — uma seção que une gastronomia, viagem e uma lente psicanalítica leve sobre o escapismo saudável, a memória afetiva do alimento e a identidade cultural.

## Estrutura do texto:

Escreva em parágrafos corridos, sem títulos de seção, sem listas, sem bullets. O texto deve fluir naturalmente como uma crônica de viagem e gastronomia. Use negrito ocasionalmente para destacar o nome do prato, da cidade, ou do vinho — nunca para marcar seções.

O texto deve cobrir naturalmente, sem anunciar: a descrição sensorial do prato e sua origem, o destino e o que ele oferece, a bebida que harmoniza com breve explicação, uma reflexão psicanalítica leve sobre memória afetiva, escapismo saudável ou identidade cultural, e uma frase ou pergunta final que o leitor leva consigo.

4 a 5 parágrafos no total. Cada parágrafo com 3 a 5 linhas. Tom de crônica — não de guia turístico, não de receita, não de artigo acadêmico.
## Tom
- Caloroso, sensorial, culto mas acessível
- Evoca desejo de viajar e de sentar à mesa
- A psicanálise aparece como tempero, não como tema principal
- Nunca use "delicioso", "incrível", "imperdível"
- Escreva em português brasileiro

## Botão CTA
Ao final, gere também um texto curto para o botão de CTA — criativo, específico para aquele prato e destino. Exemplos: "Embarcar nessa mesa →", "Ir até Marselha pelo prato →", "Sentar à mesa romana →". Nunca use: ver mais, saiba mais, confira, clique aqui.

## Formato de resposta
Retorne APENAS um JSON válido, sem markdown, sem backticks, neste formato exato:
{
  "prato": "nome do prato",
  "destino": "cidade ou região",
  "imageQuery": "termo de busca em inglês para encontrar uma boa imagem do prato ou destino (3-4 palavras)",
  "intro": "frase de introdução curta e evocativa — aparece abaixo do título no card (máximo 20 palavras)",
  "cta": "texto do botão",
  "content": "texto completo do post com as seções em markdown bold (**O prato**, **O lugar**, **A taça**, **A lente**, **Para levar na bagagem**)"
}`;

export async function POST(req: NextRequest) {
  try {
    const { prato, destino, dificuldade } = await req.json();

    if (!prato || !destino) {
      return NextResponse.json({ error: 'Prato e destino são obrigatórios' }, { status: 400 });
    }

        const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY || '',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1500,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: `Crie um post para: Prato — ${prato} | Destino — ${destino}${dificuldade ? ` | Nível de preparo — ${dificuldade}` : ''}` }],
      }),
    });

    const data = await response.json();
    const text = data.content?.[0]?.text || '';

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      const match = text.match(/\{[\s\S]*\}/);
      parsed = match ? JSON.parse(match[0]) : null;
    }

    if (!parsed) {
      return NextResponse.json({ error: 'Erro ao processar resposta da IA' }, { status: 500 });
    }

    // Busca imagem via API de busca de imagens do Google
    const imageQuery = parsed.imageQuery || `${prato} ${destino} food travel`;
    const imageUrl = await searchImage(imageQuery);

    return NextResponse.json({ ...parsed, imageUrl, imageQuery });
  } catch (error) {
    console.error('Erro ao gerar post:', error);
    return NextResponse.json({ error: 'Erro ao gerar post' }, { status: 500 });
  }
}

async function searchImage(query: string): Promise<string | null> {
  try {
    const apiKey = process.env.GOOGLE_SEARCH_API_KEY;
    const cx = process.env.GOOGLE_SEARCH_CX;

    if (!apiKey || !cx) return null;

    const res = await fetch(
      `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${encodeURIComponent(query)}&searchType=image&num=1&safe=active`,
      { signal: AbortSignal.timeout(5000) }
    );
    const data = await res.json();
    return data.items?.[0]?.link || null;
  } catch {
    return null;
  }
}
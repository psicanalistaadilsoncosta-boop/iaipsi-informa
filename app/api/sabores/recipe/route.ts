import { NextRequest, NextResponse } from 'next/server';

async function fetchFromMealDB(prato: string): Promise<any | null> {
  try {
    const res = await fetch(
      `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(prato)}`,
      { signal: AbortSignal.timeout(5000) }
    );
    const data = await res.json();
    return data.meals?.[0] || null;
  } catch {
    return null;
  }
}

function extractIngredients(meal: any): string {
  const ingredients = [];
  for (let i = 1; i <= 20; i++) {
    const ingredient = meal[`strIngredient${i}`];
    const measure = meal[`strMeasure${i}`];
    if (ingredient && ingredient.trim()) {
      ingredients.push(`${measure?.trim() || ''} ${ingredient.trim()}`.trim());
    }
  }
  return ingredients.join('\n');
}

export async function POST(req: NextRequest) {
  try {
    const { prato, destino } = await req.json();

    // Tenta buscar na TheMealDB
    const meal = await fetchFromMealDB(prato);

    let prompt = '';
    let fonte = '';

    if (meal) {
      const ingredientes = extractIngredients(meal);
      const passos = meal.strInstructions || '';
      fonte = 'TheMealDB';

      prompt = `Traduza e adapte esta receita de "${prato}" para o português brasileiro de forma clara e acolhedora.

INGREDIENTES ORIGINAIS (em inglês):
${ingredientes}

MODO DE PREPARO ORIGINAL (em inglês):
${passos}

Retorne APENAS um JSON válido, sem markdown, sem backticks:
{
  "porcoes": "número de porções estimado",
  "tempo": "tempo total estimado de preparo",
  "dificuldade": "Simples, Médio ou Elaborado",
  "ingredientes": ["ingrediente 1 com quantidade em português", "ingrediente 2", ...],
  "passos": ["Passo 1 em português claro e direto", "Passo 2", ...],
  "dica": "uma dica do chef — algo que faz diferença no resultado final",
  "fonte": "TheMealDB (traduzido e adaptado)"
}`;
    } else {
      fonte = 'IA';

      prompt = `Crie uma receita autêntica de "${prato}" típico de ${destino} em português brasileiro.

A receita deve ser fiel à tradição culinária local — ingredientes reais, proporções corretas, técnica adequada. Não invente ingredientes incomuns. Se o prato tiver variações regionais, escolha a mais tradicional.

Retorne APENAS um JSON válido, sem markdown, sem backticks:
{
  "porcoes": "número de porções",
  "tempo": "tempo total de preparo",
  "dificuldade": "Simples, Médio ou Elaborado",
  "ingredientes": ["ingrediente 1 com quantidade", "ingrediente 2", ...],
  "passos": ["Passo 1 claro e direto", "Passo 2", ...],
  "dica": "uma dica que faz diferença no resultado final",
  "fonte": "Receita tradicional adaptada"
}`;
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
        messages: [{ role: 'user', content: prompt }],
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

    if (!parsed) return NextResponse.json({ error: 'Erro ao gerar receita' }, { status: 500 });

    return NextResponse.json({ ...parsed, fonte });
  } catch (error) {
    console.error('Erro ao buscar receita:', error);
    return NextResponse.json({ error: 'Erro ao buscar receita' }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { nome, categoria } = await req.json();
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY || '',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 100,
        messages: [{
          role: 'user',
          content: `Crie UMA frase editorial curta (máximo 15 palavras) justificando por que este produto merece atenção: "${nome}" - categoria: ${categoria || 'produto'}. Sem aspas, sem ponto final, sem explicações adicionais.`
        }]
      })
    });
    const data = await res.json();
    return NextResponse.json({ frase: data.content?.[0]?.text || '' });
  } catch {
    return NextResponse.json({ frase: '' });
  }
}
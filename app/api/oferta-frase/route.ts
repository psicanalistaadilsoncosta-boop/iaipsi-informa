import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/adminAuth';

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'não autorizado' }, { status: 401 });
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
        model: 'claude-sonnet-5-5',
        max_tokens: 150,
        thinking: { type: 'between_tools' },
        messages: [{
          role: 'user',
          content: `Crie UMA frase editorial curta (máximo 15 palavras) justificando por que este produto merece atenção: "${nome}" - categoria: ${categoria || 'produto'}. Sem aspas, sem ponto final, sem explicações adicionais.`
        }]
      })
    });
    const data = await res.json();
        const frase = (data.content || [])
      .filter((b: { type: string }) => b.type === 'text')
      .map((b: { text: string }) => b.text)
      .join('')
      .trim();
    return NextResponse.json({ frase });
  } catch {
    return NextResponse.json({ frase: '' });
  }
}
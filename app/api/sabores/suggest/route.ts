import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/adminAuth';

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'não autorizado' }, { status: 401 });
  try {
    const { usados } = await req.json();

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY || '',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-5-5',
        max_tokens: 550,
        thinking: { type: 'between_tools' },
        system: `Você sugere combinações criativas de prato típico + destino de viagem para uma seção editorial chamada "Sabores & Destinos". 
Evite combinações óbvias e batidas. Prefira pratos menos conhecidos do grande público, destinos surpreendentes, combinações que provoquem curiosidade.
${usados?.length ? `Já foram usados: ${usados.join(', ')}. Não repita nenhum desses.` : ''}
Retorne APENAS um JSON válido, sem markdown, sem backticks:
{
  "prato": "nome do prato",
  "destino": "cidade ou região, país",
  "dificuldade": "Simples" ou "Médio" ou "Elaborado",
  "porque": "uma linha explicando por que essa combinação é interessante"
}`,
        messages: [{ role: 'user', content: 'Sugira uma combinação surpreendente.' }],
      }),
    });

    const data = await response.json();
    const text = (data.content || [])
      .filter((b: { type: string }) => b.type === 'text')
      .map((b: { text: string }) => b.text)
      .join('')
      .trim();

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      const match = text.match(/\{[\s\S]*\}/);
      parsed = match ? JSON.parse(match[0]) : null;
    }

    if (!parsed) return NextResponse.json({ error: 'Erro ao gerar sugestão' }, { status: 500 });
    return NextResponse.json(parsed);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao gerar sugestão' }, { status: 500 });
  }
}
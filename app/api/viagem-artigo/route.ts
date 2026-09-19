import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const {
    titulo,
    destino,
    duracao,
    descricao,
    destaques,       // string[] — highlights do passeio
    precoBase,       // number — from_price em BRL
    precoData,       // string — "set/2026"
    affiliateUrl,    // string — link afiliado Viator
  } = await req.json();

  const destaquesTexto = Array.isArray(destaques) && destaques.length
    ? destaques.map((d: string) => `- ${d}`).join('\n')
    : 'Não informado';

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
        max_tokens: 4000,
        messages: [{
          role: 'user',
          content: `Você é um redator editorial de viagem com voz reflexiva, inteligente e acolhedora, alinhado com a marca Liderança Consciente / IAIPSI. Seu texto conecta experiências de viagem com autoconhecimento, presença e expansão de perspectiva. Escreva em português brasileiro.

Passeio: ${titulo}
Destino: ${destino}
Duração: ${duracao}
Descrição breve: ${descricao}

Destaques do passeio (use como briefing — não copie literalmente):
${destaquesTexto}

O artigo deve ter exatamente esta estrutura com **negrito** para os títulos de seção:

**A experiência**
2-3 parágrafos apresentando o destino e o passeio de forma cativante, conectando a experiência com presença, autoconhecimento ou desaceleração. Contextualiza historicamente ou culturalmente o lugar.

**O que você vai encontrar**
Descreva os pontos, atrações e momentos que compõem o passeio. Para cada lugar ou atração mencionada, use o formato de link Markdown: [Nome do lugar](PLACEHOLDER_LINK) — o link será substituído depois.

**Para quem é este passeio**
Descreva o perfil de viajante que mais vai se identificar com essa experiência.

**Como chegar lá preparado**
3-4 dicas práticas objetivas para aproveitar melhor (melhor horário, o que levar, como se vestir etc). Sem mencionar preços.

**Vale a experiência?**
Conclusão editorial reflexiva sobre o valor da experiência, sem mencionar preço.

**Como reservar**
Escreva exatamente este bloco (não altere):
Último preço pesquisado: **R$ ${precoBase?.toFixed(2).replace('.', ',')}** _(${precoData})_.
👉 [Ver disponibilidade e reservar](${affiliateUrl})
⚠️ Preços sujeitos a alteração; confira sempre no site da Viator antes de reservar.

Regras obrigatórias:
- Não copie literalmente a descrição ou destaques fornecidos; use como briefing.
- Não invente URLs; use apenas PLACEHOLDER_LINK onde indicado.
- Não mencione preços fora da seção "Como reservar".
- Evite travessão (—). Prefira dois-pontos (:) ou ponto e vírgula (;) para separar ideias.
- Tom: reflexivo, inteligente, acolhedor. Nunca comercial ou apelativo.`,
        }],
      }),
    });

    const data = await res.json();
    const conteudo = data.content?.[0]?.text || '';
    return NextResponse.json({ conteudo });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

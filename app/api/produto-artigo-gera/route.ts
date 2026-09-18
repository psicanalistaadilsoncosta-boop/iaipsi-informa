import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { titulo, marca, categoria, descricao, specs } = await req.json();

  const specsTexto = Object.values(specs as Record<string, any>)
    .map((g: any) => `**${g.grupo}:** ${g.itens.map((i: any) => `${i.nome}: ${i.valor}`).join(' | ')}`)
    .join('\n');

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
          content: `Você é um redator especialista em tecnologia e produtos de consumo. Escreva um artigo editorial completo em português brasileiro sobre o produto abaixo.

Produto: ${titulo}
Marca: ${marca}
Categoria: ${categoria}
Descrição: ${descricao}

Especificações técnicas:
${specsTexto}

O artigo deve ter exatamente esta estrutura com **negrito** para os títulos de seção:

**Introdução**
2-3 parágrafos apresentando o produto de forma cativante, contextualizando no mercado.

**Principais Características**
Destaque os diferenciais mais importantes de forma clara e acessível.

**Especificações em Destaque**
Explique as specs mais relevantes em linguagem simples para o consumidor.

**Para quem é indicado**
Descreva o perfil ideal do comprador deste produto.

**Vale a pena?**
Conclusão editorial com sua opinião sobre custo-benefício e posicionamento no mercado.

Escreva de forma informativa, clara e envolvente. Não mencione preços. Use linguagem acessível ao consumidor brasileiro.
Evite o uso de travessão (—). Prefira dois-pontos (:) ou ponto e vírgula (;) para separar ideias.`,
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
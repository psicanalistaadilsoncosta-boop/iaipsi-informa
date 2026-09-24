import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@/lib/kv';

export async function GET() {
  const produtos = (await kv.get<any[]>('produtos:pinados')) || [];
  const lojas = (await kv.get<any[]>('lojas:cadastradas')) || [];

  // Monta mapa domínio → loja
  const mapaLojas: Record<string, any> = {};
  for (const loja of lojas) {
    try {
      const dominio = new URL(loja.url).hostname.replace('www.', '');
      mapaLojas[dominio] = loja;
    } catch {}
  }

  // Enriquece produtos sem categoria com sugestão da loja
  const result = produtos.map(p => {
    const link = p.linkOriginal || p.link || '';
    let lojaMatch: any = null;
    try {
      const dominio = new URL(link).hostname.replace('www.', '');
      lojaMatch = mapaLojas[dominio] || null;
    } catch {}

    return {
      ...p,
      _sugestao: lojaMatch ? {
        ambiente: lojaMatch.ambiente,
        tipoAmbiente: lojaMatch.tipoAmbiente,
        momento: lojaMatch.momento,
        tipoMomento: lojaMatch.tipoMomento,
        lojaNome: lojaMatch.nome,
      } : null,
    };
  });

  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const { id, ambiente, tipoAmbiente, momento, tipoMomento, destinos } = await req.json();
  const produtos = (await kv.get<any[]>('produtos:pinados')) || [];

  const novos = produtos.map(p => {
    if (p.id !== id) return p;
    return {
      ...p,
      ambiente: ambiente || undefined,
      tipoAmbiente: tipoAmbiente || undefined,
      momento: momento || undefined,
      tipoMomento: tipoMomento || undefined,
      destinos: destinos || p.destinos,
    };
  });

  await kv.set('produtos:pinados', novos);
  return NextResponse.json({ ok: true });
}
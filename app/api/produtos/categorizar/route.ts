import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@/lib/kv';
import { isAdmin } from '@/lib/adminAuth';
import { lerTodos, lerUm, salvar } from '@/lib/pinados';

export async function GET() {
  const produtos = await lerTodos();
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
  if (!isAdmin(req)) return NextResponse.json({ error: 'não autorizado' }, { status: 401 });
  const { id, ambiente, tipoAmbiente, momento, tipoMomento, destinos } = await req.json();
  const p = await lerUm(String(id));
  if (!p) return NextResponse.json({ error: 'produto não encontrado' }, { status: 404 });

  // grava só este produto (JSON não guarda campos "undefined": eles somem, como antes)
  await salvar(JSON.parse(JSON.stringify({
    ...p,
    ambiente: ambiente || undefined,
    tipoAmbiente: tipoAmbiente || undefined,
    momento: momento || undefined,
    tipoMomento: tipoMomento || undefined,
    destinos: destinos || p.destinos,
  })));
  return NextResponse.json({ ok: true });
}
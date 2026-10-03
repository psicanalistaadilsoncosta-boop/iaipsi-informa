// app/api/admin/cliques/route.ts
// Soma os cliques de saída dos últimos N dias (7 ou 30). Só para o admin.
import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

const KV_URL = process.env.informa_KV_REST_API_URL || process.env.KV_REST_API_URL;
const KV_TOKEN = process.env.informa_KV_REST_API_TOKEN || process.env.KV_REST_API_TOKEN;
const DIMS = ['origem', 'loja', 'rede', 'produto', 'total'] as const;

function diasSP(n: number) {
  const fmt = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' });
  return Array.from({ length: n }, (_, i) => fmt.format(new Date(Date.now() - i * 86400000)));
}

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'não autorizado' }, { status: 401 });
  if (!KV_URL || !KV_TOKEN) return NextResponse.json({ error: 'KV não configurado' }, { status: 500 });

  const n = req.nextUrl.searchParams.get('dias') === '30' ? 30 : 7;
  const dias = diasSP(n);
  const cmds = dias.flatMap(d => DIMS.map(k => ['HGETALL', `cliques:${d}:${k}`]));

  const r = await fetch(`${KV_URL}/pipeline`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${KV_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(cmds),
    cache: 'no-store',
  });
  const res: { result?: string[] }[] = await r.json();

  const soma: Record<string, Record<string, number>> = { origem: {}, loja: {}, rede: {}, produto: {} };
  const porDia: Record<string, number> = {};
  let total = 0;
  res.forEach((item, i) => {
    const dia = dias[Math.floor(i / DIMS.length)];
    const dim = DIMS[i % DIMS.length];
    const arr = item.result || [];
    for (let j = 0; j < arr.length; j += 2) {
      const campo = arr[j], valor = Number(arr[j + 1]) || 0;
      if (dim === 'total') { total += valor; porDia[dia] = (porDia[dia] || 0) + valor; }
      else soma[dim][campo] = (soma[dim][campo] || 0) + valor;
    }
  });

  const ordena = (o: Record<string, number>, max = 50) =>
    Object.entries(o).sort((a, b) => b[1] - a[1]).slice(0, max).map(([nome, cliques]) => ({ nome, cliques }));

  return NextResponse.json({
    dias: n,
    total,
    porDia: dias.slice().reverse().map(d => ({ dia: d, cliques: porDia[d] || 0 })),
    origem: ordena(soma.origem),
    loja: ordena(soma.loja),
    rede: ordena(soma.rede),
    produto: ordena(soma.produto, 15),
  });
}

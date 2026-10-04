// app/api/admin/importar-categoria/route.ts
// POST { pagina1, pagina2?, paginas } -> lista os produtos encontrados (não grava nada)
import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/adminAuth';
import { lerCategoria } from '@/lib/importa-categoria';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'não autorizado' }, { status: 401 });
  const { pagina1, pagina2, paginas } = await req.json();
  try { new URL(String(pagina1)); } catch { return NextResponse.json({ status: 'erro', mensagem: 'Link da categoria inválido.', avisos: [] }); }
  const r = await lerCategoria(String(pagina1), String(pagina2 || ''), Number(paginas) || 1);
  return NextResponse.json(r);
}

import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@/lib/kv';
import { isAdmin } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

// Todas as listas de e-mails do Seu Universo
const LISTAS: { chave: string; origem: string }[] = [
  { chave: 'ambientes:leads', origem: 'Ambiente' },
  { chave: 'beleza:leads', origem: 'Beleza' },
  { chave: 'momentos:leads', origem: 'Momento' },
  { chave: 'vistase:leads', origem: 'Vista-se' },
];

function detalhe(lead: any): string {
  const lista = lead.ambientes || lead.momentos || lead.itens || [];
  const partes: string[] = [];
  if (lead.tipo === 'filho') partes.push('Vista seu Filho');
  if (Array.isArray(lista) && lista.length) partes.push(lista.filter(Boolean).join(', '));
  return partes.join(' · ');
}

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'não autorizado' }, { status: 401 });

  const resultados = await Promise.all(
    LISTAS.map(async ({ chave, origem }) => {
      try {
        const dados = (await kv.get<any[]>(chave)) || [];
        return dados.map(l => ({
          email: String(l.email || '').trim(),
          origem,
          detalhe: detalhe(l),
          criadoEm: l.criadoEm || null,
        }));
      } catch {
        return [];
      }
    })
  );

  const todos = resultados
    .flat()
    .filter(l => l.email)
    .sort((a, b) => new Date(b.criadoEm || 0).getTime() - new Date(a.criadoEm || 0).getTime());

  return NextResponse.json(todos);
}

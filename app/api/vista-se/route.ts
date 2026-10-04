import { NextResponse } from 'next/server';
import { lerGaveta } from '@/lib/pinados';

export const dynamic = 'force-dynamic';

export async function GET() {
  const produtos: any[] = await lerGaveta('vistaSe');

  const adulto: Record<string, any[]> = {};
  const filho: Record<string, any[]> = {};

  for (const p of produtos) {
    if (!p.vistaSe) continue;
    const tipo = p.tipoVistaSe || 'Roupas';
    const ehInfantil = tipo === 'Infantil' || tipo === 'Bebê' || tipo === 'Brinquedos';

    if (ehInfantil) {
      if (!filho[tipo]) filho[tipo] = [];
      filho[tipo].push(p);
    } else {
      if (!adulto[tipo]) adulto[tipo] = [];
      adulto[tipo].push(p);
    }
  }

  return NextResponse.json({ adulto, filho });
}

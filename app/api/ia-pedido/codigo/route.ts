// app/api/ia-pedido/codigo/route.ts
// Envia um código de 6 números para confirmar o e-mail.

import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@/lib/kv';
import { emailValido, normalizar, hash, enviarCodigo, CODIGO_MIN, estourou } from '@/lib/ia-pedido';

export async function POST(req: NextRequest) {
  try {
    const { email: bruto, site } = await req.json();
    if (site) return NextResponse.json({ ok: true }); // robô: finge que enviou
    const email = normalizar(bruto);
    if (!emailValido(email)) return NextResponse.json({ erro: 'Confira o e-mail digitado.' }, { status: 400 });

    // por aparelho/rede: no máximo 5 códigos por hora; no site inteiro: 300 por dia
    const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'sem-ip';
    if (await estourou(`ia:codigo:ip:${ip}`, 5, 60)) {
      return NextResponse.json({ erro: 'Muitos pedidos de código seguidos. Tente de novo daqui a pouco.' }, { status: 429 });
    }
    if (await estourou('ia:codigo:site', 300, 1440)) {
      return NextResponse.json({ erro: 'O rascunho com IA está muito procurado hoje. Tente amanhã, ou escreva à mão nos campos.' }, { status: 429 });
    }

    // no máximo 3 códigos por e-mail por hora
    const chave = `ia:codigo:${hash(email).slice(0, 24)}`;
    const atual = await kv.get<{ hash: string; expira: number; tentativas: number; envios: number[] }>(chave);
    const umaHora = Date.now() - 3600000;
    const envios = (atual?.envios || []).filter(t => t > umaHora);
    if (envios.length >= 3) {
      return NextResponse.json({ erro: 'Você pediu vários códigos seguidos. Espere alguns minutos e tente de novo.' }, { status: 429 });
    }

    const codigo = String(Math.floor(100000 + Math.random() * 900000));
    await kv.set(chave, {
      hash: hash(email + ':' + codigo),
      expira: Date.now() + CODIGO_MIN * 60000,
      tentativas: 0,
      envios: [...envios, Date.now()],
    });
    await enviarCodigo(email, codigo);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[ia-pedido/codigo]', e);
    return NextResponse.json({ erro: 'Não foi possível enviar o código agora. Tente de novo em instantes.' }, { status: 500 });
  }
}

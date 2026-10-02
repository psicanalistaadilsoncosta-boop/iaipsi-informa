// app/api/ia-pedido/verificar/route.ts
// Confere o código, libera o aparelho por 30 dias e registra (se a pessoa quiser) o aceite de novidades.

import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@/lib/kv';
import { normalizar, hash, criarSessao, lerNumero, chaveUsoMes, LIMITE_MES } from '@/lib/ia-pedido';

export async function POST(req: NextRequest) {
  try {
    const { email: bruto, codigo, novidades } = await req.json();
    const email = normalizar(bruto);
    const chave = `ia:codigo:${hash(email).slice(0, 24)}`;
    const atual = await kv.get<{ hash: string; expira: number; tentativas: number; envios: number[] }>(chave);

    if (!atual || atual.expira < Date.now()) {
      return NextResponse.json({ erro: 'O código expirou. Peça um novo.' }, { status: 400 });
    }
    if (atual.tentativas >= 5) {
      return NextResponse.json({ erro: 'Muitas tentativas. Peça um novo código.' }, { status: 429 });
    }
    if (hash(email + ':' + String(codigo || '').trim()) !== atual.hash) {
      await kv.set(chave, { ...atual, tentativas: atual.tentativas + 1 });
      return NextResponse.json({ erro: 'Código incorreto. Confira e tente de novo.' }, { status: 400 });
    }

    await kv.set(chave, { ...atual, expira: 0 }); // código usado
    const token = await criarSessao(email);

    // aceite de novidades: separado e opcional (LGPD)
    if (novidades === true) {
      await kv.set(`ia:optin:${hash(email).slice(0, 24)}`, { email, aceitouEm: new Date().toISOString(), origem: 'escrever-com-a-lupa' });
    }

    const usados = await lerNumero(chaveUsoMes(email));
    return NextResponse.json({ token, restantes: Math.max(LIMITE_MES - usados, 0) });
  } catch (e) {
    console.error('[ia-pedido/verificar]', e);
    return NextResponse.json({ erro: 'Não foi possível confirmar agora. Tente de novo.' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { lojaUrl, skuId } = await req.json();

  try {
    const res = await fetch(`${lojaUrl}/api/checkout/pub/orderForms/simulation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0',
      },
      body: JSON.stringify({
        items: [{ id: skuId, quantity: 1, seller: '1' }],
        country: 'BRA',
      }),
      signal: AbortSignal.timeout(8000),
    });

    const data = await res.json();
    const options = data?.paymentData?.installmentOptions || [];

       // Pega a opção com mais parcelas sem juros
    let melhor = { parcelas: '', valorParcela: 0, comJuros: false };

    for (const option of options) {
      const semJuros = (option.installments || []).filter((i: any) => i.interestRate === 0);
      if (semJuros.length > 0) {
        const ultimo = semJuros[semJuros.length - 1];
        if (parseInt(ultimo.count) > parseInt(melhor.parcelas || '0')) {
          melhor = { parcelas: String(ultimo.count), valorParcela: parseFloat((ultimo.value / 100).toFixed(2)), comJuros: false };
        }
      }
    }

    // Fallback: melhor opção com juros se não houver sem juros
    if (!melhor.parcelas) {
      for (const option of options) {
        const todas = (option.installments || []);
        if (todas.length > 0) {
          const ultimo = todas[todas.length - 1];
          if (parseInt(ultimo.count) > parseInt(melhor.parcelas || '0')) {
            melhor = { parcelas: String(ultimo.count), valorParcela: parseFloat((ultimo.value / 100).toFixed(2)), comJuros: true };
          }
        }
      }
    }

    return NextResponse.json(melhor);
  } catch (e) {
    return NextResponse.json({ parcelas: '', valorParcela: 0 });
  }
}
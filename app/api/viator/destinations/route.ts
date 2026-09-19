import { NextRequest, NextResponse } from 'next/server';

const VIATOR_API_KEY = process.env.VIATOR_API_KEY!;
const BASE_URL = process.env.VIATOR_API_BASE_URL ?? 'https://api.viator.com/partner';

const HEADERS = {
  'Accept': 'application/json;version=2.0',
  'Accept-Language': 'pt-BR',
  'exp-api-key': VIATOR_API_KEY,
};

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q') ?? '';

  try {
    const res = await fetch(`${BASE_URL}/destinations`, {
      headers: HEADERS,
      next: { revalidate: 86400 },
    });

    if (!res.ok) {
      const txt = await res.text();
      return NextResponse.json({ error: `Viator: ${res.status}`, detail: txt }, { status: 502 });
    }

    const data = await res.json();
    const todos: any[] = data.destinations ?? [];

    let cidades = todos
      .filter((d: any) => d.type === 'CITY')
      .map((d: any) => ({
        code: String(d.destinationId),
        nome: d.name ?? '',
      }))
      .filter((d: any) => d.code && d.nome)
      .sort((a: any, b: any) => a.nome.localeCompare(b.nome, 'pt-BR'));

    if (q) {
      const lower = q.toLowerCase();
      cidades = cidades.filter(d => d.nome.toLowerCase().includes(lower));
    }

    return NextResponse.json({ destinations: cidades.slice(0, 200) });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
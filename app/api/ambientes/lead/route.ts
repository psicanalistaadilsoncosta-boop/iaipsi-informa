import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@/lib/kv';

const KEY = 'ambientes:leads';

export async function POST(req: NextRequest) {
  try {
    const { email, ambientes } = await req.json();
    if (!email) return NextResponse.json({ error: 'E-mail obrigatório' }, { status: 400 });

    const existing = await kv.get<any[]>(KEY) || [];
    existing.unshift({
      email,
      ambientes,
      criadoEm: new Date().toISOString(),
    });

    await kv.set(KEY, existing.slice(0, 5000));
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function GET() {
  try {
    const data = await kv.get<any[]>(KEY) || [];
    return NextResponse.json(data);
  } catch {
    return NextResponse.json([]);
  }
}
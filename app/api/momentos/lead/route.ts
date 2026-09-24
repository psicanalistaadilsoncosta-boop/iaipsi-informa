import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

export async function POST(req: NextRequest) {
  try {
    const { email, momentos } = await req.json();
    if (!email) return NextResponse.json({ error: 'E-mail obrigatório' }, { status: 400 });

    const leads: any[] = (await kv.get('momentos:leads')) || [];
    leads.unshift({ email, momentos: momentos || [], criadoEm: new Date().toISOString() });
    await kv.set('momentos:leads', leads.slice(0, 5000));

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function GET() {
  try {
    const leads = (await kv.get('momentos:leads')) || [];
    return NextResponse.json(leads);
  } catch (e) {
    return NextResponse.json([], { status: 500 });
  }
}
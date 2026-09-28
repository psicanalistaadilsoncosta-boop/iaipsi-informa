import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@/lib/kv';
import { isAdmin } from '@/lib/adminAuth';

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

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'não autorizado' }, { status: 401 });
  try {
    const leads = (await kv.get('momentos:leads')) || [];
    return NextResponse.json(leads);
  } catch (e) {
    return NextResponse.json([], { status: 500 });
  }
}
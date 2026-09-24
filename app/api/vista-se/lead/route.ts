import { NextResponse } from 'next/server';
import { kv } from '@/lib/kv';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const { email, tipo, itens } = await req.json();
  if (!email) return NextResponse.json({ error: 'email required' }, { status: 400 });

  const leads: any[] = (await kv.get('vistase:leads')) || [];
  leads.unshift({ email, tipo, itens, criadoEm: new Date().toISOString() });
  await kv.set('vistase:leads', leads.slice(0, 5000));

  return NextResponse.json({ ok: true });
}

export async function GET() {
  const leads = (await kv.get('vistase:leads')) || [];
  return NextResponse.json(leads);
}

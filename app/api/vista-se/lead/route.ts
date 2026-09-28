import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@/lib/kv';
import { isAdmin } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const { email, tipo, itens } = await req.json();
  if (!email) return NextResponse.json({ error: 'email required' }, { status: 400 });

  const leads: any[] = (await kv.get('vistase:leads')) || [];
  leads.unshift({ email, tipo, itens, criadoEm: new Date().toISOString() });
  await kv.set('vistase:leads', leads.slice(0, 5000));

  return NextResponse.json({ ok: true });
}

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'não autorizado' }, { status: 401 });
  const leads = (await kv.get('vistase:leads')) || [];
  return NextResponse.json(leads);
}

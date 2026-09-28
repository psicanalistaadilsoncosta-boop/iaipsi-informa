import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@/lib/kv';
import { isAdmin } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const { email, itens } = await req.json();
  if (!email) return NextResponse.json({ error: 'email required' }, { status: 400 });

  const leads: any[] = (await kv.get('beleza:leads')) || [];
  leads.unshift({ email, itens, criadoEm: new Date().toISOString() });
  await kv.set('beleza:leads', leads.slice(0, 5000));

  return NextResponse.json({ ok: true });
}

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'não autorizado' }, { status: 401 });
  const leads = (await kv.get('beleza:leads')) || [];
  return NextResponse.json(leads);
}

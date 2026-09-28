import { NextResponse, NextRequest } from 'next/server';
import { kv } from '@/lib/kv';
import { isAdmin } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

function checkAuth(req: NextRequest) {
  return isAdmin(req);
}

// GET — retorna slides editoriais
export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'não autorizado' }, { status: 401 });
  const slides: any[] = (await kv.get('banner:slides')) || [];
  return NextResponse.json(slides);
}

// PUT — salva lista completa de slides
export async function PUT(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'não autorizado' }, { status: 401 });
  const slides = await req.json();
  if (!Array.isArray(slides)) return NextResponse.json({ error: 'array esperado' }, { status: 400 });
  await kv.set('banner:slides', slides);
  return NextResponse.json({ ok: true });
}

import { NextRequest, NextResponse } from 'next/server';
import { tokenAdmin } from '@/lib/adminAuth';

export async function POST(req: NextRequest) {
  const { password } = await req.json();
  if (process.env.ADMIN_PASSWORD && password === process.env.ADMIN_PASSWORD) {
    const res = NextResponse.json({ ok: true });
    res.cookies.set('editorial_auth', tokenAdmin(), {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 8, // 8 horas
      path: '/',
    });
    return res;
  }
  return NextResponse.json({ ok: false }, { status: 401 });
}
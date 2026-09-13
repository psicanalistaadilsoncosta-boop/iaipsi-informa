import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { password } = await req.json();
  if (password === process.env.ADMIN_PASSWORD) {
    const res = NextResponse.json({ ok: true });
    res.cookies.set('editorial_auth', 'true', {
      httpOnly: true,
      maxAge: 60 * 60 * 8, // 8 horas
      path: '/',
    });
    return res;
  }
  return NextResponse.json({ ok: false }, { status: 401 });
}
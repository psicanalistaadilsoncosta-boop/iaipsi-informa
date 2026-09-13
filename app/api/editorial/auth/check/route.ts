import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const cookie = req.cookies.get('editorial_auth');
  return NextResponse.json({ ok: cookie?.value === 'true' });
}
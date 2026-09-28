import { createHash } from 'crypto';

// Token do cookie de admin: derivado da ADMIN_PASSWORD, impossível de adivinhar
// sem conhecer a senha. Se a senha mudar, todos os logins antigos expiram.
export function tokenAdmin(): string {
  return createHash('sha256')
    .update(`comlupa-admin:${process.env.ADMIN_PASSWORD || ''}`)
    .digest('hex');
}

type ComCookies = { cookies: { get(nome: string): { value: string } | undefined } };

export function isAdmin(req: ComCookies): boolean {
  if (!process.env.ADMIN_PASSWORD) return false;
  return req.cookies.get('editorial_auth')?.value === tokenAdmin();
}

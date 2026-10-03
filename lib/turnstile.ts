// lib/turnstile.ts
// Confere com a Cloudflare se o comprovante (token) do Turnstile é válido.
// Sem chave secreta configurada, não bloqueia. Se a Cloudflare não responder, deixa passar
// (as outras proteções continuam valendo: limites, campo-armadilha, links de afiliado).

export async function turnstileOk(token: unknown, ip?: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;                          // não configurado: não bloqueia
  if (typeof token !== 'string' || !token) return false;

  try {
    const corpo = new URLSearchParams({ secret, response: token });
    if (ip) corpo.set('remoteip', ip);
    const r = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: corpo,
      signal: AbortSignal.timeout(5000),
    });
    const d = await r.json();
    if (!d.success) console.warn('[turnstile] recusado:', d['error-codes']);
    return !!d.success;
  } catch (e) {
    console.warn('[turnstile] Cloudflare sem resposta, deixando passar:', e);
    return true;
  }
}
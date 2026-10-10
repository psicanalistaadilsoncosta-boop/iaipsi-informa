// lib/lomadee.ts — link curto de afiliado da Lomadee, um por produto (mesmo pedido que a Curadoria faz ao pinar).
// Só roda no servidor. Usa a variável LOMADEE_API_KEY.

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// No campo de deeplink da tela de importar: "lomadee:<ID da loja>" (ou só o ID) = loja da Lomadee
export function orgLomadee(valor: string): string {
  const v = String(valor || '').trim();
  const m = v.match(/^lomadee:\s*(\S+)$/i);
  if (m) return m[1];
  return UUID.test(v) ? v : '';
}

export async function encurtarLomadee(organizationId: string, url: string): Promise<string | null> {
  const chave = process.env.LOMADEE_API_KEY;
  if (!chave) throw new Error('Falta a variável LOMADEE_API_KEY.');
  const r = await fetch('https://api-beta.lomadee.com.br/affiliate/shortener/url', {
    method: 'POST',
    signal: AbortSignal.timeout(10000),
    headers: { 'x-api-key': chave, 'Content-Type': 'application/json' },
    body: JSON.stringify({ organizationId, type: 'Custom', url }),
  });
  const d = await r.json().catch(() => null);
  return d?.[0]?.shortUrls?.[0] || null;
}

// Vários de uma vez, alguns por vez (para não sobrecarregar a Lomadee). Devolve url da loja -> link curto.
export async function encurtarVarios(organizationId: string, urls: string[], simultaneos = 4): Promise<Map<string, string>> {
  const saida = new Map<string, string>();
  const fila = [...new Set(urls.filter(Boolean))];
  async function trabalhador() {
    while (fila.length) {
      const u = fila.shift()!;
      try { const l = await encurtarLomadee(organizationId, u); if (l) saida.set(u, l); } catch { /* fica sem link: o produto é recusado */ }
    }
  }
  await Promise.all(Array.from({ length: Math.min(simultaneos, fila.length) }, trabalhador));
  return saida;
}

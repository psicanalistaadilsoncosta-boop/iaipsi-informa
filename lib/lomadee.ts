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

const espera = (ms: number) => new Promise(r => setTimeout(r, ms));

// Vários de uma vez, sem atropelar a Lomadee: ela nega quando recebe muitos pedidos seguidos.
// - pausa entre pedidos, que aumenta sozinha quando ela nega e volta a diminuir quando aceita
// - cada link tem até 3 tentativas
// - para em ~4 min (a rota de salvar tem 5): o que faltar volta como "recusado" e vai no próximo clique
// Devolve url da loja -> link curto.
export async function encurtarVarios(organizationId: string, urls: string[], simultaneos = 2, limiteMs = 240_000): Promise<Map<string, string>> {
  const saida = new Map<string, string>();
  const fila = [...new Set(urls.filter(Boolean))];
  const fim = Date.now() + limiteMs;
  let pausa = 300;
  async function trabalhador() {
    while (fila.length && Date.now() < fim) {
      const u = fila.shift()!;
      for (let tentativa = 0; tentativa < 3 && Date.now() < fim; tentativa++) {
        let l: string | null = null;
        try { l = await encurtarLomadee(organizationId, u); } catch { /* conta como falha */ }
        if (l) { saida.set(u, l); pausa = Math.max(300, Math.round(pausa * 0.8)); break; }
        pausa = Math.min(pausa * 2, 8000); // negou: vai mais devagar
        await espera(pausa);
      }
      await espera(pausa);
    }
  }
  await Promise.all(Array.from({ length: Math.min(simultaneos, fila.length) }, trabalhador));
  return saida;
}
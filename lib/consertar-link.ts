// lib/consertar-link.ts — conserta endereços de loja que abrem errado.
// VTEX: "secure.<loja>" é o carrinho/pagamento; a página de produto (termina em /p) tem que abrir em "www.<loja>".
// Para incluir outra regra, acrescente em consertarEnderecoLoja.

function consertarEnderecoLoja(u: string): string {
  try {
    const x = new URL(u);
    if (/^secure\./i.test(x.hostname) && /\/p\/?$/.test(x.pathname)) {
      x.hostname = x.hostname.replace(/^secure\./i, 'www.');
      return x.toString();
    }
  } catch {}
  return u;
}

// Link de afiliado: conserta o destino que vai dentro dele (ued=, murl=, url=). Link direto: conserta ele mesmo.
// O rastreio da rede (awinaffid, awc, lmdeeTracking...) não muda.
export function consertarLink(link: string): string {
  try {
    const x = new URL(link);
    for (const k of ['ued', 'murl', 'url']) {
      const destino = x.searchParams.get(k);
      if (destino && /^https?:\/\//i.test(destino)) {
        const novo = consertarEnderecoLoja(destino);
        if (novo !== destino) { x.searchParams.set(k, novo); return x.toString(); }
      }
    }
  } catch {}
  return consertarEnderecoLoja(link);
}
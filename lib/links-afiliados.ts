// lib/links-afiliados.ts
// Domínios de afiliado aceitos em links de produto (envio por e-mail e /ir).
export const HOSTS_AFILIADOS = [
  'lmdee.link', 'lomadee.com',   // Lomadee
  'awin1.com',                   // Awin
  'apretailer.com.br',           // Actionpay
  'linksynergy.com',             // Rakuten
  'viator.com',                  // Viator (viagens e passeios)
];

export function linkAfiliadoOk(u: string) {
  try {
    const url = new URL(u);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return false;
    const h = url.hostname.toLowerCase();
    return HOSTS_AFILIADOS.some(d => h === d || h.endsWith('.' + d));
  } catch { return false; }
}
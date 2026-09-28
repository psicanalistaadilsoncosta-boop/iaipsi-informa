// Cliente da API da Actionpay — documentação: https://actionpay.com.br/pt/apiDoc
// Chave na Vercel: ACTIONPAY_API_KEY

const BASE = 'https://actionpay.com.br/pt';

export class ActionpayErro extends Error {
  constructor(msg: string, public codigo?: number) {
    super(msg);
  }
}

// Chama um método da API (ex.: 'apiWmOffers') e devolve o JSON bruto
export async function chamarActionpay(metodo: string, params: Record<string, string | number | undefined> = {}) {
  const key = process.env.ACTIONPAY_API_KEY;
  if (!key) throw new ActionpayErro('ACTIONPAY_API_KEY não configurada na Vercel', 500);

  const qs = new URLSearchParams({ key, format: 'json' });
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== '') qs.set(k, String(v));
  }

  const res = await fetch(`${BASE}/${metodo}/?${qs}`, {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(15000),
    cache: 'no-store',
  });

  const texto = await res.text();
  let dados: any;
  try {
    dados = JSON.parse(texto);
  } catch {
    throw new ActionpayErro(`Resposta não é JSON (HTTP ${res.status}): ${texto.slice(0, 200)}`, res.status);
  }

  // A API devolve { error: { code, text } } quando algo dá errado
  const erro = dados?.error;
  if (erro) throw new ActionpayErro(erro.text || 'Erro da Actionpay', Number(erro.code) || res.status);
  if (!res.ok) throw new ActionpayErro(`HTTP ${res.status}`, res.status);

  return dados?.result ?? dados;
}

// Acha a primeira lista dentro da resposta (o formato exato do JSON será confirmado com a chave)
export function acharLista(dados: any, preferidas: string[]): any[] {
  if (Array.isArray(dados)) return dados;
  if (!dados || typeof dados !== 'object') return [];
  for (const chave of preferidas) {
    const v = dados[chave];
    if (Array.isArray(v)) return v;
    if (v && typeof v === 'object') {
      const interna = acharLista(v, preferidas);
      if (interna.length) return interna;
    }
  }
  for (const v of Object.values(dados)) {
    if (Array.isArray(v)) return v;
  }
  return [];
}

export interface OfertaActionpay {
  id: number;
  nome: string;
  logo: string | null;
  site: string | null;
  descricao: string;
  categorias: string[];
  aceitaDeeplink: boolean;
  temCatalogo: boolean;
  status: string | null;
  comissoes: { nome: string; valor: string }[];
}

export function normalizarOferta(o: any): OfertaActionpay {
  const categorias = acharLista(o?.categories, ['category']).map((c: any) => c?.name).filter(Boolean);
  const aims = acharLista(o?.aims, ['aim']).map((a: any) => ({
    nome: String(a?.name ?? ''),
    valor: String(a?.price ?? a?.tariff?.name ?? ''),
  }));
  return {
    id: Number(o?.id),
    nome: String(o?.name ?? ''),
    logo: o?.storedLogo || o?.logo || null,
    site: o?.link || o?.url || null,
    descricao: String(o?.description ?? '').replace(/<[^>]*>/g, '').trim(),
    categorias,
    aceitaDeeplink: o?.deeplink === true || o?.deeplink === 'true' || o?.deeplink === 1,
    temCatalogo: o?.hasYmls === true || o?.hasYmls === 'true' || o?.hasYmls === 1,
    status: o?.status?.name ?? null,
    comissoes: aims,
  };
}

export interface LinkActionpay {
  url: string;
  urlLimpa: string | null;
  landing: string | null;
  fonte: string | null;
}

export function normalizarLink(l: any): LinkActionpay {
  return {
    url: String(l?.url ?? ''),
    urlLimpa: l?.cleanUrl ?? null,
    landing: l?.landing?.name ?? null,
    fonte: l?.source?.name ?? null,
  };
}

// Deeplink para um produto específico.
// ATENÇÃO: a documentação não mostra o formato; o padrão mais comum da Actionpay é
// acrescentar ?url=<produto> ao link de clique. Confirmar no primeiro teste com a chave.
export function montarDeeplink(linkClique: string, urlProduto: string): string {
  const sep = linkClique.includes('?') ? '&' : '?';
  return `${linkClique}${sep}url=${encodeURIComponent(urlProduto)}`;
}

import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@/lib/kv';
import { linkAfiliadoOk } from '@/lib/links-afiliados';

// Remove parâmetros de rastreio de terceiros do endereço do produto (utm_, f=, gclid...)
function limparUrl(url: string): string {
  try {
    const u = new URL(url.trim());
    for (const k of [...u.searchParams.keys()]) {
      if (/^(utm_.*|gclid|fbclid|msclkid|f|aff.*|ref|src|source|campaign|mc_.*|ran.*)$/i.test(k)) u.searchParams.delete(k);
    }
    u.hash = '';
    return u.toString();
  } catch { return url; }
}

type ModelosActionpay = Record<string, { prefixo: string | null; semDeeplink?: boolean }>;

// Monta o link de afiliado Actionpay. Tenta, nesta ordem:
// 1. modelo já guardado em actionpay:deeplinks (por número da oferta)
// 2. deeplink colado na tela de importar categoria (importar:deeplinks, por site da loja)
// Sem nenhum dos dois: não gera link (a página de pinar avisa e não pina).
async function linkActionpay(oferta: string, url: string): Promise<{ link: string | null; erro?: string; semDeeplink?: boolean }> {
  const destino = encodeURIComponent(limparUrl(url));
  const modelos: ModelosActionpay = (await kv.get<ModelosActionpay>('actionpay:deeplinks')) || {};

  // 1
  const prefixo = modelos[oferta]?.prefixo;
  // semDeeplink: a loja não aceita link direto para o produto (o clique cai na página inicial)
  if (prefixo) return { link: `${prefixo}comlupa/url=${destino}`, semDeeplink: !!modelos[oferta]?.semDeeplink };

  // 2
  try {
    const host = new URL(url).hostname.replace(/^www\./, '');
    const importados: Record<string, string> = (await kv.get<Record<string, string>>('importar:deeplinks')) || {};
    const exemplo = importados[host];
    const m = exemplo ? String(exemplo).match(/^(https?:\/\/[^\s]*?(?:url=|ued=|murl=))/i) : null;
    if (m) return { link: m[1].replace('/subaccount/', '/comlupa/') + destino };
  } catch {}

  return { link: null, erro: `Oferta Actionpay ${oferta} sem deeplink: cole o código dela em actionpay:deeplinks no Upstash` };
}

const API_KEY = process.env.LOMADEE_API_KEY || '';
const AWIN_AFFID = process.env.AWIN_PUBLISHER_ID || '3093907';
const RAKUTEN_LINK_ID = process.env.RAKUTEN_LINK_ID || '';

const AWIN_ADVERTISERS: Record<string, string> = {
  'awin-arno': '108626',
  'awin-spicy': '30615', 
  // adicione outros anunciantes Awin aqui
};

export async function POST(req: NextRequest) {
  try {
    const { url, organizationId } = await req.json();

    // Link que já é de afiliado (ex.: busca de loja Awin já entrega o awin1.com pronto): usa como está
    if (linkAfiliadoOk(String(url || ''))) {
      return NextResponse.json({ shortUrl: url });
    }

    // Se for anunciante Awin, gera deeplink Awin (pelo apelido, ex. awin-arno, ou pelo número, como no app/api/scrape)
    const awinMid = AWIN_ADVERTISERS[organizationId] || (/^\d+$/.test(String(organizationId || '')) ? String(organizationId) : '');
    if (awinMid) {
      const awinLink = `https://www.awin1.com/cread.php?awinmid=${awinMid}&awinaffid=${AWIN_AFFID}&ued=${encodeURIComponent(url)}`;
        return NextResponse.json({ shortUrl: awinLink });
    }

    // Se for loja Rakuten (organizationId = "rakuten-<mid>"), gera deeplink Rakuten
    const rakutenMid = typeof organizationId === 'string' && organizationId.startsWith('rakuten-')
      ? organizationId.slice('rakuten-'.length) : '';
    if (rakutenMid) {
      if (!RAKUTEN_LINK_ID) {
        return NextResponse.json({ shortUrl: null, error: 'RAKUTEN_LINK_ID não configurado' }, { status: 500 });
      }
      const rakutenLink = `https://click.linksynergy.com/deeplink?id=${encodeURIComponent(RAKUTEN_LINK_ID)}&mid=${rakutenMid}&murl=${encodeURIComponent(url)}`;
           return NextResponse.json({ shortUrl: rakutenLink });
    }

    // Se for oferta Actionpay (organizationId = "actionpay-<oferta>"), usa o modelo guardado no KV
    const actionpayOferta = typeof organizationId === 'string' && organizationId.startsWith('actionpay-')
      ? organizationId.slice('actionpay-'.length) : '';
    if (actionpayOferta) {
      const r = await linkActionpay(actionpayOferta, url);
      if (!r.link) {
        return NextResponse.json({ shortUrl: null, error: r.erro || `Oferta Actionpay ${actionpayOferta} sem deeplink` }, { status: 502 });
      }
      return NextResponse.json({ shortUrl: r.link, semDeeplink: !!r.semDeeplink });
    }

    // Caso contrário usa Lomadee
        const res = await fetch('https://api-beta.lomadee.com.br/affiliate/shortener/url', {
      method: 'POST',
      signal: AbortSignal.timeout(10000),
      headers: {
        'x-api-key': API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        organizationId,
        type: 'Custom',
        url,
      }),
    });

    const data = await res.json();
        const shortUrl = data?.[0]?.shortUrls?.[0] || null;

    // Sem link de afiliado: avisa com erro, para ninguém gravar o link sem comissão
    if (!shortUrl) {
      return NextResponse.json({ shortUrl: null, error: 'Lomadee não gerou o link de afiliado', raw: data }, { status: 502 });
    }

    return NextResponse.json({ shortUrl, raw: data });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
// app/api/clique/route.ts
// Registra um clique de saída (/ir) em contadores por dia. Não guarda nada da pessoa (nem IP, nem e-mail).
// Chaves no KV (hash, apagam sozinhas em 120 dias):
//   cliques:AAAA-MM-DD:origem   página de onde veio (/beleza, /pra-voce, / ...)
//   cliques:AAAA-MM-DD:loja     nome da loja
//   cliques:AAAA-MM-DD:rede     Lomadee, Awin, Actionpay, Rakuten, Viator
//   cliques:AAAA-MM-DD:produto  nome do produto
//   cliques:AAAA-MM-DD:total    campo "total"

import { NextRequest, NextResponse } from 'next/server';
import { linkAfiliadoOk } from '@/lib/links-afiliados';

const KV_URL = process.env.informa_KV_REST_API_URL || process.env.KV_REST_API_URL;
const KV_TOKEN = process.env.informa_KV_REST_API_TOKEN || process.env.KV_REST_API_TOKEN;
const DIAS_GUARDAR = 120;

function hojeSP() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
}

function rede(host: string) {
  if (/lmdee\.link|lomadee\./.test(host)) return 'Lomadee';
  if (/awin1\.com/.test(host)) return 'Awin';
  if (/apretailer\.com\.br/.test(host)) return 'Actionpay';
  if (/linksynergy\.com/.test(host)) return 'Rakuten';
  if (/viator\.com/.test(host)) return 'Viator';
  return 'Outra';
}

// quando o link não traz a loja, tenta achar o site final dentro do link de afiliado
function lojaPeloLink(u: URL) {
  if (/viator\.com/.test(u.hostname)) return 'Viator';
  const destino = u.searchParams.get('ued') || u.searchParams.get('murl') || decodeURIComponent(u.pathname.split('url=')[1] || '');
  try { return new URL(destino).hostname.replace(/^www\./, ''); } catch { return 'loja desconhecida'; }
}

const limpa = (t: unknown, max = 80) => String(t || '').replace(/\s+/g, ' ').trim().slice(0, max);

export async function POST(req: NextRequest) {
  try {
    if (/bot|crawl|spider|preview|facebookexternalhit|whatsapp/i.test(req.headers.get('user-agent') || '')) {
      return NextResponse.json({ ok: true });
    }
    const b = JSON.parse(await req.text());
    const link = String(b.url || '');
    if (!linkAfiliadoOk(link) || !KV_URL || !KV_TOKEN) return NextResponse.json({ ok: true });

    const u = new URL(link);
    const dia = hojeSP();
    const base = `cliques:${dia}`;
    const origem = limpa(b.origem, 60) || '(direto)';
    const loja = limpa(b.loja, 60) || lojaPeloLink(u);
    const produto = limpa(b.nome) || '(sem nome)';
    const ttl = DIAS_GUARDAR * 86400;

    const cmds = [
      ['HINCRBY', `${base}:origem`, origem, 1],
      ['HINCRBY', `${base}:loja`, loja, 1],
      ['HINCRBY', `${base}:rede`, rede(u.hostname), 1],
      ['HINCRBY', `${base}:produto`, produto, 1],
      ['HINCRBY', `${base}:total`, 'total', 1],
      ...['origem', 'loja', 'rede', 'produto', 'total'].map(k => ['EXPIRE', `${base}:${k}`, ttl]),
    ];
    await fetch(`${KV_URL}/pipeline`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${KV_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(cmds),
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.warn('[clique]', e);
    return NextResponse.json({ ok: true }); // nunca atrapalha o redirecionamento
  }
}
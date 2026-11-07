import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// Prefixos de pergunta: mostram o que as pessoas querem entender ou resolver
const PREFIXOS = [
  'como',
  'por que',
  'o que fazer quando',
  'o que significa',
  'é normal',
  'como lidar com',
  'como parar de',
];

const LETRAS = 'abcdefghijklmnopqrstuvwxyz'.split('');

// Se a semente já começa com pergunta, não faz sentido pôr outro prefixo na frente
const COMECA_COM_PERGUNTA = /^(como|por que|porque|o que|qual|quais|quando|onde|quem|é normal)\b/i;

type Fonte = 'google' | 'youtube';

function normaliza(t: string): string {
  return t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ').trim();
}

async function autocompletar(consulta: string, fonte: Fonte): Promise<string[]> {
  const params = new URLSearchParams({
    client: 'firefox',
    hl: 'pt-BR',
    gl: 'br',
    ie: 'UTF-8',
    oe: 'UTF-8',
    q: consulta,
  });
  if (fonte === 'youtube') params.set('ds', 'yt');

  const controle = new AbortController();
  const timer = setTimeout(() => controle.abort(), 6000);
  try {
    const res = await fetch(`https://suggestqueries.google.com/complete/search?${params}`, {
      signal: controle.signal,
      headers: { 'User-Agent': 'Mozilla/5.0', 'Accept-Language': 'pt-BR,pt;q=0.9' },
      cache: 'no-store',
    });
    if (!res.ok) return [];

    // O Google às vezes responde em ISO-8859-1; decodifica pelo charset informado
    const tipo = res.headers.get('content-type') || '';
    const charset = /charset=([^;]+)/i.exec(tipo)?.[1]?.trim().toLowerCase() || 'utf-8';
    const buffer = await res.arrayBuffer();
    let texto: string;
    try {
      texto = new TextDecoder(charset).decode(buffer);
    } catch {
      texto = new TextDecoder('utf-8').decode(buffer);
    }

    const dados = JSON.parse(texto);
    const lista = Array.isArray(dados) && Array.isArray(dados[1]) ? dados[1] : [];
    return lista.map((s: unknown) => String(s)).filter(Boolean);
  } catch {
    return [];
  } finally {
    clearTimeout(timer);
  }
}

// Roda as consultas em pequenos lotes para não disparar tudo de uma vez
async function emLotes<T, R>(itens: T[], tamanho: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const saida: R[] = [];
  for (let i = 0; i < itens.length; i += tamanho) {
    const lote = itens.slice(i, i + tamanho);
    saida.push(...(await Promise.all(lote.map(fn))));
  }
  return saida;
}

async function coletar(semente: string, fonte: Fonte): Promise<string[]> {
  const consultas = [semente];
  if (!COMECA_COM_PERGUNTA.test(semente)) {
    consultas.push(...PREFIXOS.map(p => `${p} ${semente}`));
  }
  consultas.push(...LETRAS.map(l => `${semente} ${l}`));

  const resultados = await emLotes(consultas, 6, c => autocompletar(c, fonte));

  const vistos = new Set<string>([normaliza(semente)]);
  const unicos: string[] = [];
  for (const termo of resultados.flat()) {
    const chave = normaliza(termo);
    if (!chave || vistos.has(chave)) continue;
    vistos.add(chave);
    unicos.push(termo.trim());
  }
  return unicos;
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'não autorizado' }, { status: 401 });
  try {
    const { semente } = await req.json();
    const s = String(semente || '').trim();
    if (!s) return NextResponse.json({ error: 'Digite um tema' }, { status: 400 });
    if (s.length > 80) return NextResponse.json({ error: 'Tema muito longo (máx. 80 caracteres)' }, { status: 400 });

    const [google, youtube] = await Promise.all([coletar(s, 'google'), coletar(s, 'youtube')]);
    return NextResponse.json({ semente: s, google, youtube });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

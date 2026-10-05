// lib/pinados.ts
// Produtos pinados guardados "um a um" (gavetas), no lugar da lista única produtos:pinados.
//
//   pin:prod            hash  id -> produto (JSON)     (cada produto separado)
//   pin:cat:<categoria> set   ids de cada vitrine       (ambiente, momento, vistaSe, beleza, mercado, praVoce, aCatalogar)
//   pin:dest:<destino>  set   ids por destino           (oferta-do-dia, ofertas-selecionadas, parcelado...)
//
// Fala direto com a API REST do Upstash (sem conversões automáticas): ids e textos chegam exatamente como foram gravados.

const URL_KV = process.env.informa_KV_REST_API_URL || process.env.KV_REST_API_URL || '';
const TOKEN = process.env.informa_KV_REST_API_TOKEN || process.env.KV_REST_API_TOKEN || '';

export const H = 'pin:prod';
export type Categoria = 'ambiente' | 'momento' | 'vistaSe' | 'beleza' | 'mercado' | 'praVoce' | 'aCatalogar';

type Cmd = (string | number)[];

async function redis(cmds: Cmd[]): Promise<any[]> {
  if (!cmds.length) return [];
  const r = await fetch(`${URL_KV}/pipeline`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(cmds.map(c => c.map(String))),
    cache: 'no-store',
  });
  if (!r.ok) throw new Error(`KV: HTTP ${r.status}`);
  const res: { result?: any; error?: string }[] = await r.json();
  const erro = res.find(x => x.error);
  if (erro) throw new Error(`KV: ${erro.error}`);
  return res.map(x => x.result);
}

const ler = (v: any) => {
  if (v == null) return null;
  try { return typeof v === 'string' ? JSON.parse(v) : v; } catch { return null; }
};

// em quais gavetas o produto deve estar (pode estar em mais de uma)
export function gavetasDo(p: any): string[] {
  if (!p) return [];
  const g: string[] = [];
  if (p.ambiente || p.tipoAmbiente) g.push('pin:cat:ambiente');
  if (p.momento || p.tipoMomento) g.push('pin:cat:momento');
  if (p.vistaSe) g.push('pin:cat:vistaSe');
  if (p.beleza) g.push('pin:cat:beleza');
  if (p.mercado) g.push('pin:cat:mercado');
  if (p.praVoce) g.push('pin:cat:praVoce');
  if (p.aCatalogar === true) g.push('pin:cat:aCatalogar');
  for (const d of Array.isArray(p.destinos) ? p.destinos : []) if (d) g.push(`pin:dest:${d}`);
  return g;
}

// ---------- leitura ----------
export async function lerTodos(): Promise<any[]> {
  const [vals] = await redis([['HVALS', H]]);
  return ((vals || []) as any[]).map(ler).filter(Boolean);
}

export async function lerUm(id: string): Promise<any | null> {
  const [v] = await redis([['HGET', H, String(id)]]);
  return ler(v);
}

export async function lerIds(ids: string[]): Promise<any[]> {
  const out: any[] = [];
  for (let i = 0; i < ids.length; i += 300) {
    const parte = ids.slice(i, i + 300);
    const [vals] = await redis([['HMGET', H, ...parte]]);
    for (const v of (vals || []) as any[]) { const p = ler(v); if (p) out.push(p); }
  }
  return out;
}

export async function lerGaveta(cat: Categoria): Promise<any[]> {
  const [ids] = await redis([['SMEMBERS', `pin:cat:${cat}`]]);
  return lerIds((ids || []).map(String));
}

export async function lerDestino(destino: string): Promise<any[]> {
  const [ids] = await redis([['SMEMBERS', `pin:dest:${destino}`]]);
  return lerIds((ids || []).map(String));
}

// ---------- gravação (grava só os produtos informados) ----------
export async function salvarVarios(produtos: any[]): Promise<void> {
  const validos = produtos.filter(p => p && p.id != null);
  for (let i = 0; i < validos.length; i += 100) {
    const parte = validos.slice(i, i + 100);
    const ids = parte.map(p => String(p.id));
    const [antigos] = await redis([['HMGET', H, ...ids]]);
    const cmds: Cmd[] = [];
    parte.forEach((p, k) => {
      const id = ids[k];
      const antes = new Set(gavetasDo(ler((antigos || [])[k])));
      const depois = new Set(gavetasDo(p));
      for (const g of antes) if (!depois.has(g)) cmds.push(['SREM', g, id]);
      for (const g of depois) cmds.push(['SADD', g, id]);
      cmds.push(['HSET', H, id, JSON.stringify(p)]);
    });
    await redis(cmds);
  }
}

export async function salvar(produto: any): Promise<void> {
  await salvarVarios([produto]);
}

export async function remover(id: string): Promise<void> {
  const antigo = await lerUm(id);
  const cmds: Cmd[] = gavetasDo(antigo).map(g => ['SREM', g, String(id)]);
  cmds.push(['HDEL', H, String(id)]);
  await redis(cmds);
}

export async function removerVarios(ids: string[]): Promise<void> {
  for (const id of ids) await remover(id);
}

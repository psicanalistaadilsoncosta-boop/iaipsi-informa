// lib/importa-origens.ts
// Registro das páginas importadas pela tela "Importar categoria" (app/admin/importar).
// Guardado no KV em "importar:origens": { [id]: Origem }
// Só as páginas com ativo = true são atualizadas pela rotina diária (app/api/cron/atualiza-importados).
import crypto from 'crypto';
import { kv } from '@/lib/kv';

export const CHAVE_ORIGENS = 'importar:origens';

export type Origem = {
  id: string;
  loja: string;
  pag1: string;           // link da página 1 (também fica em cada produto como importadoDe)
  pag2: string;           // link da página 2 ('' = lê só a página 1)
  paginas: number;        // quantas páginas ler (1 a 5)
  ativo: boolean;         // atualizar todo dia?
  ids: string[];          // produtos desta página que estão pinados
  sumidos: Record<string, number>; // id -> dias seguidos sem aparecer na loja
  ignorados?: string[];   // ids que NÃO devem ser trazidos: você apagou, ou não marcou ao importar
  ultima?: string;        // data da última atualização
  erro?: string;          // último erro (vazio = deu certo)
  resumo?: string;        // ex.: "3 preços mudaram, 1 novo, 0 removidos"
};

export function idOrigem(pag1: string): string {
  return crypto.createHash('sha1').update(String(pag1).trim()).digest('hex').slice(0, 12);
}

export async function lerOrigens(): Promise<Record<string, Origem>> {
  return ((await kv.get<Record<string, Origem>>(CHAVE_ORIGENS)) || {}) as Record<string, Origem>;
}

export async function salvarOrigens(o: Record<string, Origem>): Promise<void> {
  await kv.set(CHAVE_ORIGENS, o);
}

// Campos de vitrine copiados para os produtos novos (iguais aos usados no admin e no pinar)
export const CAMPOS_VITRINE = [
  'ambiente', 'tipoAmbiente', 'momento', 'tipoMomento', 'vistaSe', 'tipoVistaSe',
  'beleza', 'tipoBeleza', 'mercado', 'tipoMercado', 'praVoce', 'tipoPraVoce', 'destinos',
];

// Se TODOS os irmãos já catalogados estão na mesma vitrine, devolve essa vitrine; senão null (vai para "A catalogar")
export function vitrineDosIrmaos(irmaos: any[]): Record<string, any> | null {
  const catalogados = irmaos.filter(p => p && p.aCatalogar !== true && (p.ambiente || p.momento || p.vistaSe || p.beleza || p.mercado || p.praVoce));
  if (!catalogados.length) return null;
  const assinatura = (p: any) => JSON.stringify(CAMPOS_VITRINE.map(c => p[c] ?? null));
  const primeira = assinatura(catalogados[0]);
  if (!catalogados.every(p => assinatura(p) === primeira)) return null;
  const v: Record<string, any> = {};
  for (const c of CAMPOS_VITRINE) if (catalogados[0][c] != null) v[c] = catalogados[0][c];
  return v;
}

// Mesmo id usado desde a primeira versão da importação
export function idImportado(urlLoja: string): string {
  return 'imp-' + crypto.createHash('sha1').update(urlLoja).digest('hex').slice(0, 16);
}

// "https://apretailer.com.br/click/XXX/360672/subaccount/url=https%3A..." -> ".../click/XXX/360672/comlupa/url="
export function baseDoDeeplink(exemplo: string): string | null {
  const m = String(exemplo || '').match(/^(https?:\/\/[^\s]*?(?:url=|ued=|murl=))/i);
  if (!m) return null;
  return m[1].replace('/subaccount/', '/comlupa/');
}

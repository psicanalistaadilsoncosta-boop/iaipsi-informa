// lib/revalidar.ts
// "Avisar que os produtos mudaram": joga fora as cópias guardadas (cache) das páginas e
// vitrines que mostram produtos. Assim elas ficam guardadas por até 24h SEM ler o banco,
// e só leem de novo quando algo muda (pinar, catalogar, excluir, importar, cron).
import { revalidatePath, revalidateTag } from 'next/cache';

const VITRINES = ['/api/ambientes', '/api/momentos', '/api/vista-se', '/api/beleza', '/api/mercado', '/api/pra-voce'];

// etiqueta dos dados de produtos guardados na home (banner e Lupadas) — app/page.tsx
export const TAG_PRODUTOS = 'produtos';

export function avisarMudanca() {
  try {
    // expira já (a próxima visita lê de novo); o "as any" cobre as duas formas da função no Next
    (revalidateTag as any)(TAG_PRODUTOS, { expire: 0 });
    revalidatePath('/');
    revalidatePath('/noticias');
    for (const r of VITRINES) revalidatePath(r);
    // páginas de cada loja/categoria: só renovam 1x por dia (são muitas e o Google visita todas)
    revalidatePath('/lojas');
    revalidatePath('/categorias');
  } catch (e) {
    console.warn('[revalidar] não consegui avisar a mudança:', e);
  }
}

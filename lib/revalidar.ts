// lib/revalidar.ts
// "Avisar que os produtos mudaram": joga fora as cópias guardadas (cache) das páginas e
// vitrines que mostram produtos. Assim elas ficam guardadas por até 24h SEM ler o banco,
// e só leem de novo quando algo muda (pinar, catalogar, excluir, importar, cron).
import { revalidatePath } from 'next/cache';

const VITRINES = ['/api/ambientes', '/api/momentos', '/api/vista-se', '/api/beleza', '/api/mercado', '/api/pra-voce'];

export function avisarMudanca() {
  try {
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

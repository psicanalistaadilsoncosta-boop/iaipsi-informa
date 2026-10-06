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
    revalidatePath('/lojas');
    revalidatePath('/lojas/[slug]', 'page');
    revalidatePath('/categorias');
    revalidatePath('/categorias/[slug]', 'page');
  } catch (e) {
    console.warn('[revalidar] não consegui avisar a mudança:', e);
  }
}

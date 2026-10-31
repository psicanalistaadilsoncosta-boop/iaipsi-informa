// lib/compalavra-no-ar.ts — regra única: o artigo do Com a Palavra está no ar?
// Publicado + (sem data, ou data já passou). Com data no futuro = agendado.
export function noAr(a: any, agora = Date.now()): boolean {
  if (!a?.publicado) return false;
  if (!a.publicarEm) return true;
  const t = new Date(a.publicarEm).getTime();
  return isNaN(t) || t <= agora;
}

export function programado(a: any, agora = Date.now()): boolean {
  return !!a?.publicado && !!a.publicarEm && !noAr(a, agora);
}

// data que o leitor vê: a do agendamento, se houver; senão, a de criação
export function dataPublicacao(a: any): string {
  return a?.publicarEm || a?.createdAt;
}

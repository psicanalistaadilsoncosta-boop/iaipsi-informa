// lib/compalavra-categorias.ts — categorias do Com a Palavra (pode ser usado no site e no admin)
// Para criar outra categoria, acrescente uma linha aqui.
export const CATEGORIAS_CP = [
  { id: 'reflexao', nome: 'Reflexão', emoji: '✍️' },
  { id: 'literatura', nome: 'Literatura', emoji: '📚' },
] as const;

// Artigos antigos (sem categoria) contam como Reflexão
export const categoriaCP = (id?: string) => CATEGORIAS_CP.find(c => c.id === id) || CATEGORIAS_CP[0];

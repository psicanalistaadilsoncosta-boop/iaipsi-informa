// lib/audio-fontes.ts — de onde vêm os textos que ganham áudio, e como cada um é lido.
// Para incluir outra seção no futuro, basta acrescentar uma entrada aqui.
import { textoParaFala, montarTexto } from '@/lib/audio-artigo';

export type Fonte = {
  nome: string;                         // rótulo no admin
  chave: string;                        // chave no KV (lista de itens)
  pasta: string;                        // pasta no Blob
  arquivo: (a: any) => string;          // nome do arquivo (sem extensão)
  titulo: (a: any) => string;
  publicado: (a: any) => boolean;
  texto: (a: any) => string;            // o que a voz vai ler
  caminhos: (a: any) => string[];       // páginas para renovar depois de gerar
};

const semAcento = (s: string) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);

// Receita do Sabores em forma de fala
function receitaFalada(r: any): string {
  if (!r || r.error) return '';
  const partes: string[] = ['Agora, a receita.'];
  if (r.porcoes) partes.push(`Rende ${String(r.porcoes).replace(/\.$/, '')}.`);
  if (r.tempo) partes.push(`Tempo de preparo: ${String(r.tempo).replace(/\.$/, '')}.`);
  if (Array.isArray(r.ingredientes) && r.ingredientes.length)
    partes.push('Ingredientes: ' + r.ingredientes.map((i: string) => String(i).replace(/\.$/, '')).join('; ') + '.');
  if (Array.isArray(r.passos) && r.passos.length)
    partes.push('Modo de preparo. ' + r.passos.map((p: string, i: number) => `Passo ${i + 1}: ${String(p).trim().replace(/([^.!?])$/, '$1.')}`).join(' '));
  if (r.dica) partes.push(`Dica do chef: ${String(r.dica).trim().replace(/([^.!?])$/, '$1.')}`);
  return partes.join('\n\n');
}

export const FONTES: Record<string, Fonte> = {
  compalavra: {
    nome: 'Com a Palavra',
    chave: 'artigos:compalavra',
    pasta: 'compalavra',
    arquivo: a => a.slug,
    titulo: a => a.titulo,
    publicado: a => !!a.publicado,
    texto: a => textoParaFala(a.titulo, a.resumo, a.conteudo, a.categoria),
    caminhos: a => [`/compalavra/${a.slug}`, '/compalavra'],
  },
  sabores: {
    nome: 'Sabores & Destinos',
    chave: 'sabores:items',
    pasta: 'sabores',
    arquivo: a => `${semAcento(a.prato)}-${a.id}`,
    titulo: a => `${a.prato} — ${a.destino}`,
    publicado: () => true,
    texto: a => montarTexto(a.prato, `Sabores e Destinos, ${a.destino}, por Adilson Costa`, a.intro, a.content, receitaFalada(a.recipe)),
    caminhos: a => [`/sabores/${a.id}`],
  },
  viagens: {
    nome: 'Viagens',
    chave: 'artigos:viagens',
    pasta: 'viagens',
    arquivo: a => a.slug || String(a.id),
    titulo: a => a.titulo,
    publicado: a => !!a.publicado && !!a.slug,
    texto: a => montarTexto(a.titulo, `Viagens, ${a.destino || a.destination_name || ''}, por Adilson Costa`.replace(', ,', ','), a.descricaoCurta, a.conteudo),
    caminhos: a => [`/viagem/${a.slug}`],
  },
};

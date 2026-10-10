// lib/audio-artigo.ts — transforma textos do site em áudio (Google Cloud Text-to-Speech) e guarda o MP3 no Vercel Blob.
// Só roda no servidor. Usa as variáveis GOOGLE_TTS_API_KEY e BLOB_READ_WRITE_TOKEN.
import { createHash } from 'crypto';
import { put, del } from '@vercel/blob';

export const VOZ = { languageCode: 'pt-BR', name: 'pt-BR-Chirp3-HD-Sadaltager' };
const LIMITE_BYTES = 4500; // o Google aceita até 5.000 bytes por pedido; deixamos folga

// Limpa a formatação do editor (## títulos, **negrito**, [links](url), ---) e devolve parágrafos falados
export function limparTexto(conteudo: string): string {
  return String(conteudo || '')
    .split('\n')
    .map(l => l.trim())
    .filter(l => l && l !== '---')
    .map(l => l
      .replace(/^#{1,6}\s+/, '')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1')
      .replace(/\*\*(.+?)\*\*/g, '$1')
      .replace(/https?:\/\/\S+/g, '')
      .replace(/\s+/g, ' ')
      .trim())
    .filter(Boolean)
    .map(l => (/[.!?…:;]$/.test(l) ? l : l + '.')) // título de seção vira frase, com pausa
    .join('\n\n');
}

const comPonto = (s: string) => String(s || '').trim().replace(/([^.!?…])$/, '$1.');

// Com a Palavra (mantido igual para não invalidar os áudios já gerados)
export function textoParaFala(titulo: string, resumo: string, conteudo: string, categoria?: string): string {
  const abertura = categoria === 'literatura' ? 'Com a Palavra, Literatura, por Adilson Costa.' : 'Com a Palavra, por Adilson Costa.';
  const partes = [`${String(titulo || '').trim()}.`, abertura];
  if (resumo && resumo.trim()) partes.push(comPonto(resumo));
  partes.push(limparTexto(conteudo));
  return partes.join('\n\n');
}

// Formato geral: título, abertura ("Sabores e Destinos, Lisboa, por Adilson Costa."), resumo e corpo
export function montarTexto(titulo: string, abertura: string, resumo: string, corpo: string, extra = ''): string {
  const partes = [comPonto(titulo), comPonto(abertura)];
  if (resumo && resumo.trim()) partes.push(comPonto(resumo));
  partes.push(limparTexto(corpo));
  if (extra.trim()) partes.push(extra.trim());
  return partes.filter(Boolean).join('\n\n');
}

// "Impressão digital" do texto + voz: se mudar, o áudio está desatualizado
export function hashAudio(texto: string): string {
  return createHash('sha1').update(VOZ.name + '|' + texto).digest('hex').slice(0, 12);
}

// Corta em pedaços de até LIMITE_BYTES, respeitando parágrafos e frases
export function dividir(texto: string): string[] {
  const bytes = (s: string) => Buffer.byteLength(s, 'utf8');
  const frases = texto.split(/\n\s*\n/).flatMap(par =>
    (par.match(/[^.!?…]+[.!?…]+["”']?|[^.!?…]+$/g) || [par]).map(f => f.trim()).filter(Boolean)
      .map((f, i, arr) => (i === arr.length - 1 ? f + '\n\n' : f + ' '))
  );
  const pedacos: string[] = [];
  let atual = '';
  for (let f of frases) {
    // frase gigante (sem pontuação): corta por palavras
    while (bytes(f) > LIMITE_BYTES) {
      let corte = f.slice(0, Math.floor(LIMITE_BYTES / 2));
      corte = corte.slice(0, corte.lastIndexOf(' ') > 0 ? corte.lastIndexOf(' ') : corte.length);
      if (atual) { pedacos.push(atual.trim()); atual = ''; }
      pedacos.push(corte.trim());
      f = f.slice(corte.length);
    }
    if (bytes(atual + f) > LIMITE_BYTES) { pedacos.push(atual.trim()); atual = ''; }
    atual += f;
  }
  if (atual.trim()) pedacos.push(atual.trim());
  return pedacos;
}

async function sintetizar(texto: string): Promise<Buffer> {
  const chave = process.env.GOOGLE_TTS_API_KEY;
  if (!chave) throw new Error('Falta a variável GOOGLE_TTS_API_KEY.');
  const r = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${encodeURIComponent(chave)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ input: { text: texto }, voice: VOZ, audioConfig: { audioEncoding: 'MP3' } }),
    signal: AbortSignal.timeout(60000),
  });
  const d = await r.json().catch(() => ({}));
  if (!r.ok || !d.audioContent) throw new Error(`Google TTS: ${d?.error?.message || r.status}`);
  return Buffer.from(d.audioContent, 'base64');
}

export type AudioGerado = { audioUrl: string; audioHash: string; audioSegundos: number; audioEm: string };

// Gera o MP3 de um texto pronto, grava no Blob e apaga o áudio antigo (se houver)
export async function gerarAudioDeTexto(pasta: string, nome: string, texto: string, urlAntiga?: string): Promise<AudioGerado> {
  const hash = hashAudio(texto);
  const partes: Buffer[] = [];
  for (const p of dividir(texto)) partes.push(await sintetizar(p)); // em ordem, um por vez
  const blob = await put(`audios/${pasta}/${nome}-${hash}.mp3`, Buffer.concat(partes), {
    access: 'public', contentType: 'audio/mpeg', addRandomSuffix: false, allowOverwrite: true,
  });
  if (urlAntiga && urlAntiga !== blob.url) { try { await del(urlAntiga); } catch { /* ignora */ } }
  const palavras = texto.split(/\s+/).filter(Boolean).length;
  return { audioUrl: blob.url, audioHash: hash, audioSegundos: Math.round(palavras / 2.4), audioEm: new Date().toISOString() };
}

// Atalho usado pela rota do Com a Palavra
export async function gerarAudio(pasta: string, slug: string, titulo: string, resumo: string, conteudo: string, urlAntiga?: string): Promise<AudioGerado> {
  return gerarAudioDeTexto(pasta, slug, textoParaFala(titulo, resumo, conteudo), urlAntiga);
}

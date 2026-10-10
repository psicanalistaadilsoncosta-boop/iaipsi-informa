// lib/audio-artigo.ts — transforma um artigo em áudio (Google Cloud Text-to-Speech) e guarda o MP3 no Vercel Blob.
// Só roda no servidor. Usa as variáveis GOOGLE_TTS_API_KEY e BLOB_READ_WRITE_TOKEN.
import { createHash } from 'crypto';
import { put, del } from '@vercel/blob';

export const VOZ = { languageCode: 'pt-BR', name: 'pt-BR-Chirp3-HD-Sadaltager' };
const LIMITE_BYTES = 4500; // o Google aceita até 5.000 bytes por pedido; deixamos folga

// Limpa a formatação usada no editor (## títulos, **negrito**, [links](url), ---) e monta o texto falado
export function textoParaFala(titulo: string, resumo: string, conteudo: string): string {
  const corpo = String(conteudo || '')
    .split('\n')
    .map(l => l.trim())
    .filter(l => l && l !== '---')
    .map(l => l
      .replace(/^#{1,6}\s+/, '')
      .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '$1')
      .replace(/\*\*(.+?)\*\*/g, '$1')
      .replace(/https?:\/\/\S+/g, '')
      .replace(/\s+/g, ' ')
      .trim())
    .filter(Boolean)
    .map(l => /[.!?…:;]$/.test(l) ? l : l + '.') // título de seção vira frase, com pausa
    .join('\n\n');
  const partes = [`${String(titulo || '').trim()}.`, 'Com a Palavra, por Adilson Costa.'];
  if (resumo && resumo.trim()) partes.push(resumo.trim().replace(/([^.!?…])$/, '$1.'));
  partes.push(corpo);
  return partes.join('\n\n');
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

// Gera o MP3 do artigo, grava no Blob e apaga o áudio antigo (se houver)
export async function gerarAudio(pasta: string, slug: string, titulo: string, resumo: string, conteudo: string, urlAntiga?: string): Promise<AudioGerado> {
  const texto = textoParaFala(titulo, resumo, conteudo);
  const hash = hashAudio(texto);
  const pedacos = dividir(texto);
  const partes: Buffer[] = [];
  for (const p of pedacos) partes.push(await sintetizar(p)); // em ordem, um por vez
  const mp3 = Buffer.concat(partes);
  const blob = await put(`audios/${pasta}/${slug}-${hash}.mp3`, mp3, {
    access: 'public', contentType: 'audio/mpeg', addRandomSuffix: false, allowOverwrite: true,
  });
  if (urlAntiga && urlAntiga !== blob.url) { try { await del(urlAntiga); } catch { /* ignora */ } }
  const palavras = texto.split(/\s+/).filter(Boolean).length;
  return { audioUrl: blob.url, audioHash: hash, audioSegundos: Math.round(palavras / 2.4), audioEm: new Date().toISOString() };
}

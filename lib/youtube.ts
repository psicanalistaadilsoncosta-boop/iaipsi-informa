// lib/youtube.ts — pega o ID de um link do YouTube (watch, youtu.be, shorts, embed, live). Link inválido = ''.
export function idYouTube(url?: string): string {
  const u = String(url || '').trim();
  if (!u) return '';
  const m = u.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : '';
}
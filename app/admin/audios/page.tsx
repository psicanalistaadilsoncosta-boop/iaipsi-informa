'use client';
// app/admin/audios/page.tsx — central de áudios: Com a Palavra, Sabores e Roteiros de viagem
// No Com a Palavra dá para enviar a sua própria gravação no lugar da voz da IA.

import { useEffect, useRef, useState } from 'react';
import { upload } from '@vercel/blob/client';
import AdminGate from '../../AdminGate';

type Item = { id: string; titulo: string; publicado: boolean; link: string; situacao: 'ok' | 'falta' | 'desatualizado'; tipo: '' | 'ia' | 'gravacao'; caracteres: number };
const NOMES: Record<string, string> = { compalavra: '✍️ Com a Palavra', sabores: '🍽 Sabores & Destinos', viagens: '🌍 Roteiros de viagem' };
const ACEITA_GRAVACAO = ['compalavra'];

function selo(i: Item) {
  if (i.situacao === 'falta') return { txt: 'sem áudio', bg: '#f3f4f6', cor: '#6b7280' };
  const quem = i.tipo === 'gravacao' ? '🎙 sua gravação' : '🎧 voz IA';
  if (i.situacao === 'desatualizado') return { txt: `${quem} · texto mudou`, bg: '#fef3c7', cor: '#92400e' };
  return i.tipo === 'gravacao' ? { txt: quem, bg: '#ede9fe', cor: '#5b21b6' } : { txt: quem, bg: '#dcfce7', cor: '#166534' };
}

// duração do arquivo, lida pelo próprio navegador
function duracaoDoArquivo(file: File): Promise<number> {
  return new Promise(res => {
    const a = new Audio(); const url = URL.createObjectURL(file);
    a.preload = 'metadata';
    a.onloadedmetadata = () => { res(isFinite(a.duration) ? Math.round(a.duration) : 0); URL.revokeObjectURL(url); };
    a.onerror = () => { res(0); URL.revokeObjectURL(url); };
    a.src = url;
  });
}

function Audios() {
  const [dados, setDados] = useState<Record<string, Item[]> | null>(null);
  const [aba, setAba] = useState('compalavra');
  const [ocupado, setOcupado] = useState('');      // "fonte:id" do item em andamento
  const [progresso, setProgresso] = useState('');
  const [msg, setMsg] = useState('');
  const arquivo = useRef<HTMLInputElement | null>(null);
  const alvo = useRef<{ fonte: string; id: string } | null>(null);

  async function carregar() {
    try { const r = await fetch('/api/audios'); setDados(await r.json()); } catch { setDados({}); }
  }
  useEffect(() => { carregar(); }, []);

  const marcar = (fonte: string, id: string, mud: Partial<Item>) =>
    setDados(x => x ? { ...x, [fonte]: x[fonte].map(i => i.id === id ? { ...i, ...mud } : i) } : x);

  async function gerar(fonte: string, id: string, forcar = false): Promise<boolean> {
    setOcupado(fonte + ':' + id); setMsg('');
    try {
      const r = await fetch('/api/audios', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fonte, id, forcar }) });
      const d = await r.json();
      if (d.codigo === 'gravacao') {
        setOcupado('');
        if (!window.confirm('Este texto tem a sua gravação. Trocar pela voz da IA? A gravação será apagada.')) return false;
        return gerar(fonte, id, true);
      }
      if (!d.ok) { setMsg('⚠️ ' + (d.error || 'Erro ao gerar.')); return false; }
      marcar(fonte, id, { situacao: 'ok', tipo: 'ia' });
      return true;
    } catch { setMsg('⚠️ Erro de conexão.'); return false; }
    finally { setOcupado(''); }
  }

  async function gerarFaltam(fonte: string) {
    // a sua gravação nunca é trocada automaticamente
    const fila = (dados?.[fonte] || []).filter(i => i.situacao !== 'ok' && i.tipo !== 'gravacao');
    if (!fila.length) { setMsg('✅ Nada faltando nesta seção.'); return; }
    let feitos = 0;
    for (const i of fila) {
      setProgresso(`⏳ ${feitos + 1} de ${fila.length}: ${i.titulo}`);
      if (!(await gerar(fonte, i.id))) break;
      feitos++;
    }
    setProgresso('');
    if (feitos === fila.length) setMsg(`✅ ${feitos} áudio(s) gerado(s).`);
  }

  function escolherGravacao(fonte: string, id: string) {
    alvo.current = { fonte, id };
    if (arquivo.current) { arquivo.current.value = ''; arquivo.current.click(); }
  }

  async function enviarGravacao(file: File) {
    const a = alvo.current; if (!a) return;
    if (!file.type.startsWith('audio/')) { setMsg('⚠️ Escolha um arquivo de áudio (MP3 ou M4A).'); return; }
    setOcupado(a.fonte + ':' + a.id); setMsg('');
    try {
      const segundos = await duracaoDoArquivo(file);
      const ext = (file.name.split('.').pop() || 'mp3').toLowerCase();
      setProgresso(`⏫ Enviando ${file.name} (${(file.size / 1048576).toFixed(1)} MB)...`);
      const blob = await upload(`audios/${a.fonte}/gravacao-${a.id}.${ext}`, file, {
        access: 'public', handleUploadUrl: '/api/audios/upload', contentType: file.type || 'audio/mpeg',
      });
      const r = await fetch('/api/audios', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fonte: a.fonte, id: a.id, gravacaoUrl: blob.url, segundos }) });
      const d = await r.json();
      if (!d.ok) { setMsg('⚠️ ' + (d.error || 'Erro ao salvar a gravação.')); return; }
      marcar(a.fonte, a.id, { situacao: 'ok', tipo: 'gravacao' });
      setMsg(`✅ Gravação enviada${segundos ? ` (${Math.floor(segundos / 60)}:${String(segundos % 60).padStart(2, '0')})` : ''}.`);
    } catch (e: any) {
      setMsg('⚠️ Não foi possível enviar: ' + (e?.message || 'erro'));
    } finally { setOcupado(''); setProgresso(''); }
  }

  const lista = dados?.[aba] || [];
  const conta = (f: string, s: string) => (dados?.[f] || []).filter(i => i.situacao === s).length;
  const caracteresFaltando = lista.filter(i => i.situacao !== 'ok' && i.tipo !== 'gravacao').reduce((t, i) => t + i.caracteres, 0);
  const travado = !!ocupado || !!progresso;
  const botao: React.CSSProperties = { padding: '6px 12px', borderRadius: 8, fontWeight: 700, fontSize: 12, cursor: travado ? 'wait' : 'pointer' };

  return (
    <main style={{ maxWidth: 900, margin: '0 auto', padding: '28px 16px', fontFamily: 'system-ui', background: '#f9fafb', minHeight: '100vh' }}>
      <h1 style={{ fontSize: 22, margin: '0 0 4px', color: '#111827' }}>🎧 Áudios dos artigos</h1>
      <p style={{ color: '#6b7280', fontSize: 14, margin: '0 0 16px' }}>
        Voz da IA: Google (Sadaltager), gerada uma vez e guardada. No Com a Palavra você também pode enviar a sua gravação (MP3 ou M4A do celular).
        Se o texto mudar, o áudio aparece como "texto mudou". Cota grátis da IA: 1 milhão de caracteres por mês.
      </p>

      <input ref={arquivo} type="file" accept="audio/*,.mp3,.m4a,.wav" hidden
        onChange={e => { const f = e.target.files?.[0]; if (f) enviarGravacao(f); }} />

      <div role="tablist" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
        {Object.keys(NOMES).map(f => (
          <button key={f} role="tab" aria-selected={aba === f} onClick={() => { setAba(f); setMsg(''); }}
            style={{ padding: '8px 14px', borderRadius: 999, border: '1px solid ' + (aba === f ? '#5B3E96' : '#e5e7eb'), background: aba === f ? '#5B3E96' : '#fff', color: aba === f ? '#fff' : '#374151', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
            {NOMES[f]} {dados ? `· ${conta(f, 'ok')}/${(dados[f] || []).length}` : ''}
          </button>
        ))}
      </div>

      <section style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
          <strong style={{ color: '#111827' }}>{NOMES[aba]}</strong>
          <span style={{ fontSize: 13, color: '#6b7280' }}>
            {conta(aba, 'falta')} sem áudio · {conta(aba, 'desatualizado')} com texto alterado
            {caracteresFaltando ? ` · ~${Math.round(caracteresFaltando / 1000)} mil caracteres para gerar` : ''}
          </span>
          <button onClick={() => gerarFaltam(aba)} disabled={travado}
            style={{ marginLeft: 'auto', padding: '8px 16px', borderRadius: 8, border: 0, background: '#047857', color: '#fff', fontWeight: 700, fontSize: 13, cursor: travado ? 'wait' : 'pointer', opacity: travado ? 0.6 : 1 }}>
            🎧 Gerar os que faltam (voz IA)
          </button>
        </div>
        {progresso && <p style={{ margin: '0 0 10px', padding: '8px 12px', borderRadius: 8, background: '#f0fdfa', color: '#065f46', fontWeight: 600, fontSize: 14 }}>{progresso}</p>}
        {msg && <p style={{ margin: '0 0 10px', fontSize: 14, fontWeight: 600, color: msg.startsWith('✅') ? '#166534' : '#9a3412' }}>{msg}</p>}

        {dados === null && <p style={{ color: '#6b7280' }}>Carregando...</p>}
        {dados && lista.length === 0 && <p style={{ color: '#6b7280' }}>Nenhum texto publicado nesta seção.</p>}
        {lista.map(i => {
          const s = selo(i);
          const este = ocupado === aba + ':' + i.id;
          return (
            <div key={i.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderTop: '1px solid #f3f4f6', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 220 }}>
                <a href={i.link} target="_blank" rel="noopener" style={{ color: '#111827', fontWeight: 600, fontSize: 14, textDecoration: 'none' }}>{i.titulo || '(sem título)'}</a>
                <div style={{ fontSize: 12, color: '#9ca3af' }}>{(i.caracteres / 1000).toFixed(1)} mil caracteres</div>
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 999, background: s.bg, color: s.cor }}>{s.txt}</span>
              {ACEITA_GRAVACAO.includes(aba) && (
                <button onClick={() => escolherGravacao(aba, i.id)} disabled={travado}
                  style={{ ...botao, border: '1px solid #ddd6fe', background: '#f5f3ff', color: '#5b21b6' }}>
                  🎙 {i.tipo === 'gravacao' ? 'Trocar gravação' : 'Enviar gravação'}
                </button>
              )}
              <button onClick={() => gerar(aba, i.id)} disabled={travado}
                style={{ ...botao, border: '1px solid #a7f3d0', background: '#f0fdfa', color: '#0f766e', minWidth: 92 }}>
                {este ? '⏳ aguarde' : i.tipo === 'ia' ? 'Refazer IA' : 'Gerar IA'}
              </button>
            </div>
          );
        })}
      </section>
    </main>
  );
}

export default function AudiosPage() {
  return <AdminGate titulo="Áudios dos artigos"><Audios /></AdminGate>;
}

'use client';

import { useState, useEffect } from 'react';
import { CATEGORIAS_CP } from '@/lib/compalavra-categorias';
import { idYouTube } from '@/lib/youtube';
import { programado } from '@/lib/compalavra-no-ar';

function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/editorial/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (res.ok) onLogin();
      else setError('Senha incorreta.');
    } catch { setError('Erro de conexão.'); }
    setLoading(false);
  }

  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9fafb' }}>
      <form onSubmit={handleSubmit} style={{ backgroundColor: '#fff', padding: '40px', borderRadius: '16px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', width: '100%', maxWidth: '360px' }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#111827', margin: '0 0 8px' }}>✍️ ComAPalavra</h1>
        <p style={{ color: '#6b7280', fontSize: '0.875rem', margin: '0 0 24px' }}>Acesso restrito</p>
        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.95rem', marginBottom: '12px', boxSizing: 'border-box' }}
        />
        {error && <p style={{ color: '#dc2626', fontSize: '0.8rem', margin: '0 0 10px', fontWeight: 600 }}>{error}</p>}
        <button type="submit" disabled={loading} style={{ width: '100%', backgroundColor: '#0f766e', color: '#fff', border: 'none', borderRadius: '8px', padding: '12px', fontWeight: 700, cursor: loading ? 'wait' : 'pointer', fontSize: '0.95rem' }}>
          {loading ? 'Verificando...' : 'Entrar'}
        </button>
      </form>
    </main>
  );
}

// ISO <-> campo de data e hora do navegador (no seu horário local)
function paraCampo(iso?: string) {
  if (!iso) return '';
  const d = new Date(iso); if (isNaN(d.getTime())) return '';
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}
function doCampo(v: string) { return v ? new Date(v).toISOString() : ''; }

interface ArtigoComPalavra {
  id: string; slug: string; titulo: string; conteudo: string;
  resumo: string; imagem?: string; publicado: boolean; destaque: boolean;
  createdAt: string; updatedAt: string;
  audioUrl?: string; audioHash?: string; audioSegundos?: number; categoria?: string;
  videoLupa?: string; videoNarrado?: string; publicarEm?: string;
}

export default function GerenciarComPalavraPage() {
  const [auth, setAuth] = useState<boolean | null>(null);
  const [artigos, setArtigos] = useState<ArtigoComPalavra[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [editando, setEditando] = useState<ArtigoComPalavra | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [msg, setMsg] = useState('');
  const [revisando, setRevisando] = useState(false);
  const [revisao, setRevisao] = useState('');
  const [audios, setAudios] = useState<Record<string, string>>({});
  const [gerandoAudio, setGerandoAudio] = useState('');
  const [progresso, setProgresso] = useState('');

  useEffect(() => {
  fetch('/api/editorial/auth/check').then(r => r.json()).then(d => {
      setAuth(d.ok);
      if (d.ok) carregar();
    }).catch(() => setAuth(false));
  }, []);

  if (auth === null) return <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>Carregando...</main>;
  if (!auth) return <LoginScreen onLogin={() => { setAuth(true); carregar(); }} />;

  async function carregar() {
    setCarregando(true);
    const res = await fetch('/api/compalavra/save');
    const data = await res.json();
    setArtigos(Array.isArray(data) ? data.sort((a: ArtigoComPalavra, b: ArtigoComPalavra) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) : []);
    setCarregando(false);
    carregarAudios();
  }

  async function carregarAudios() {
    try { const r = await fetch('/api/compalavra/audio'); if (r.ok) setAudios(await r.json()); } catch {}
  }

  async function gerarAudio(id: string): Promise<boolean> {
    setGerandoAudio(id); setMsg('');
    try {
      const r = await fetch('/api/compalavra/audio', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
      const d = await r.json();
      if (!d.ok) { setMsg('Erro no áudio: ' + (d.error || r.status)); return false; }
      setAudios(a => ({ ...a, [id]: 'ok' }));
      setArtigos(l => l.map(x => x.id === id ? { ...x, audioUrl: d.audioUrl, audioHash: d.audioHash, audioSegundos: d.audioSegundos } : x));
      return true;
    } catch { setMsg('Erro de conexão ao gerar o áudio.'); return false; }
    finally { setGerandoAudio(''); }
  }

  async function gerarFaltam() {
    const fila = artigos.filter(a => a.publicado && audios[a.id] !== 'ok');
    if (!fila.length) { setMsg('✅ Todos os artigos publicados já têm áudio.'); return; }
    let feitos = 0;
    for (const a of fila) {
      setProgresso(`⏳ Gerando áudio ${feitos + 1} de ${fila.length}: ${a.titulo}`);
      if (!(await gerarAudio(a.id))) { setProgresso(''); return; }
      feitos++;
    }
    setProgresso('');
    setMsg(`✅ ${feitos} áudio(s) gerado(s).`);
  }

  async function salvar() {
    if (!editando) return;
    setSalvando(true); setMsg('');
    const res = await fetch('/api/compalavra/save', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editando) });
    const data = await res.json();
    if (data.id) { setMsg('✅ Salvo!'); setEditando(null); setRevisao(''); carregar(); }
    else setMsg('Erro: ' + (data.error || ''));
    setSalvando(false);
  }

  async function excluir(id: string) {
    if (!confirm('Excluir este artigo?')) return;
    await fetch('/api/compalavra/save', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    carregar();
  }

  async function revisar() {
    if (!editando?.conteudo.trim()) return;
    setRevisando(true); setMsg('');
    const res = await fetch('/api/compalavra/revisar', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ conteudo: editando.conteudo }) });
    const data = await res.json();
    if (data.revisado) { setRevisao(data.revisado); setMsg('✅ Revisão pronta!'); }
    else setMsg('Erro: ' + (data.error || ''));
    setRevisando(false);
  }

  const inp: React.CSSProperties = { width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.9rem', fontFamily: 'inherit', boxSizing: 'border-box' };

  if (carregando) return <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>Carregando...</div>;

  if (editando) return (
    <main style={{ maxWidth: '820px', margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <button onClick={() => { setEditando(null); setRevisao(''); setMsg(''); }} style={{ background: 'none', border: 'none', color: '#0f766e', cursor: 'pointer', fontWeight: 700, padding: 0 }}>← Voltar</button>
        <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 900, color: '#111827' }}>Editar artigo</h1>
      </div>
      <div style={{ display: 'grid', gap: '16px' }}>
        <div><label style={{ display: 'block', fontWeight: 700, color: '#374151', marginBottom: '4px', fontSize: '0.8rem' }}>Categoria</label>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {CATEGORIAS_CP.map(c => {
              const ativa = (editando.categoria || 'reflexao') === c.id;
              return (
                <button key={c.id} type="button" onClick={() => setEditando({ ...editando, categoria: c.id })}
                  style={{ padding: '6px 14px', borderRadius: '999px', border: '2px solid ' + (ativa ? '#0f766e' : '#e5e7eb'), backgroundColor: ativa ? '#f0fdfa' : '#fff', color: ativa ? '#0f766e' : '#374151', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}>
                  {c.emoji} {c.nome}</button>
              );
            })}
          </div></div>
        <div><label style={{ display: 'block', fontWeight: 700, color: '#374151', marginBottom: '4px', fontSize: '0.8rem' }}>Título</label>
          <input style={inp} value={editando.titulo} onChange={e => setEditando({ ...editando, titulo: e.target.value })} /></div>
        <div><label style={{ display: 'block', fontWeight: 700, color: '#374151', marginBottom: '4px', fontSize: '0.8rem' }}>Slug (endereço do artigo)</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input style={inp} value={editando.slug} onChange={e => setEditando({ ...editando, slug: e.target.value })} />
            <button type="button" onClick={() => setEditando({ ...editando, slug: editando.titulo.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').slice(0, 80) })}
              style={{ flexShrink: 0, backgroundColor: '#f0fdfa', color: '#0f766e', border: '1px solid #a7f3d0', borderRadius: '8px', padding: '0 12px', fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem' }}>Gerar do título</button>
          </div>
          <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>comlupa.com.br/compalavra/{editando.slug}</span></div>
        <div><label style={{ display: 'block', fontWeight: 700, color: '#374151', marginBottom: '4px', fontSize: '0.8rem' }}>Resumo</label>
          <textarea style={{ ...inp, minHeight: '70px', resize: 'vertical' }} value={editando.resumo} onChange={e => setEditando({ ...editando, resumo: e.target.value })} /></div>
        <div><label style={{ display: 'block', fontWeight: 700, color: '#374151', marginBottom: '4px', fontSize: '0.8rem' }}>URL da imagem</label>
                    <input style={inp} value={editando.imagem || ''} onChange={e => setEditando({ ...editando, imagem: e.target.value })} /></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
          <div><label style={{ display: 'block', fontWeight: 700, color: '#374151', marginBottom: '4px', fontSize: '0.8rem' }}>🔍 Vídeo com a Lupa (YouTube) — opcional</label>
            <input style={inp} value={editando.videoLupa || ''} onChange={e => setEditando({ ...editando, videoLupa: e.target.value })} placeholder="https://www.youtube.com/watch?v=..." />
            {editando.videoLupa && !idYouTube(editando.videoLupa) && <span style={{ fontSize: '0.75rem', color: '#dc2626', fontWeight: 600 }}>Link do YouTube não reconhecido</span>}</div>
          <div><label style={{ display: 'block', fontWeight: 700, color: '#374151', marginBottom: '4px', fontSize: '0.8rem' }}>🎙 Vídeo narrado (YouTube) — opcional</label>
            <input style={inp} value={editando.videoNarrado || ''} onChange={e => setEditando({ ...editando, videoNarrado: e.target.value })} placeholder="https://www.youtube.com/watch?v=..." />
            {editando.videoNarrado && !idYouTube(editando.videoNarrado) && <span style={{ fontSize: '0.75rem', color: '#dc2626', fontWeight: 600 }}>Link do YouTube não reconhecido</span>}</div>
        </div>
        <div>
          <label style={{ display: 'block', fontWeight: 700, color: '#374151', marginBottom: '4px', fontSize: '0.8rem' }}>Conteúdo</label>
          <textarea style={{ ...inp, minHeight: '300px', resize: 'vertical' }} value={editando.conteudo} onChange={e => setEditando({ ...editando, conteudo: e.target.value })} />
          <div style={{ marginTop: '8px' }}>
            <button onClick={revisar} disabled={revisando} style={{ backgroundColor: '#0f766e', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 16px', fontWeight: 700, cursor: revisando ? 'wait' : 'pointer', fontSize: '0.8rem' }}>
              {revisando ? '⏳ Revisando...' : '🤖 Revisar com IA'}</button>
          </div>
        </div>
        {revisao && (
          <div style={{ border: '2px solid #0f766e', borderRadius: '10px', overflow: 'hidden' }}>
            <div style={{ backgroundColor: '#0f766e', color: '#fff', padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>📝 Revisão da IA</span>
              <button onClick={() => { setEditando({ ...editando, conteudo: revisao }); setRevisao(''); setMsg('✅ Aplicado!'); }} style={{ backgroundColor: '#fff', color: '#0f766e', border: 'none', borderRadius: '6px', padding: '4px 12px', fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem' }}>✅ Aplicar</button>
            </div>
            <div style={{ padding: '16px', backgroundColor: '#f0fdfa', whiteSpace: 'pre-wrap', lineHeight: 1.7, fontSize: '0.9rem', maxHeight: '240px', overflowY: 'auto' }}>{revisao}</div>
          </div>
        )}
        <div style={{ display: 'flex', gap: '20px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600, color: '#374151', fontSize: '0.875rem' }}>
            <input type="checkbox" checked={editando.publicado} onChange={e => setEditando({ ...editando, publicado: e.target.checked })} /> Publicado</label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600, color: '#374151', fontSize: '0.875rem' }}>
            <input type="checkbox" checked={editando.destaque} onChange={e => setEditando({ ...editando, destaque: e.target.checked })} /> Destaque</label>
        </div>
        <div><label style={{ display: 'block', fontWeight: 700, color: '#374151', marginBottom: '4px', fontSize: '0.8rem' }}>🗓 Publicar em (opcional)</label>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <input type="datetime-local" style={{ ...inp, maxWidth: '240px' }} value={paraCampo(editando.publicarEm)} onChange={e => setEditando({ ...editando, publicarEm: doCampo(e.target.value) })} />
            {editando.publicarEm && <button type="button" onClick={() => setEditando({ ...editando, publicarEm: '' })} style={{ backgroundColor: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '8px', padding: '8px 12px', fontWeight: 600, cursor: 'pointer', fontSize: '0.8rem' }}>Limpar data</button>}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Com "Publicado" marcado e data no futuro, o artigo fica agendado e entra no ar sozinho nesse horário. Sem data, entra na hora.</span></div>
        {msg && <div style={{ padding: '10px 14px', borderRadius: '8px', backgroundColor: msg.startsWith('✅') ? '#dcfce7' : '#fee2e2', color: msg.startsWith('✅') ? '#166534' : '#991b1b', fontWeight: 600, fontSize: '0.875rem' }}>{msg}</div>}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={salvar} disabled={salvando} style={{ backgroundColor: '#111827', color: '#fff', border: 'none', borderRadius: '8px', padding: '12px 28px', fontWeight: 800, cursor: salvando ? 'wait' : 'pointer' }}>
            {salvando ? 'Salvando...' : '💾 Salvar'}</button>
          <button onClick={() => { setEditando(null); setRevisao(''); setMsg(''); }} style={{ backgroundColor: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '8px', padding: '12px 20px', fontWeight: 600, cursor: 'pointer' }}>Cancelar</button>
        </div>
      </div>
    </main>
  );

  return (
    <main style={{ maxWidth: '860px', margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
        <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 900, color: '#111827' }}>✍️ ComAPalavra — Gerenciar</h1>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button onClick={gerarFaltam} disabled={!!gerandoAudio || !!progresso} style={{ backgroundColor: '#f0fdfa', color: '#0f766e', border: '1px solid #a7f3d0', padding: '10px 16px', borderRadius: '8px', fontWeight: 700, fontSize: '0.875rem', cursor: gerandoAudio || progresso ? 'wait' : 'pointer' }}>🎧 Gerar áudios que faltam</button>
          <a href="/compalavra/criar" style={{ backgroundColor: '#0f766e', color: '#fff', textDecoration: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 700, fontSize: '0.875rem' }}>+ Novo artigo</a>
        </div>
      </div>
      {progresso && <div style={{ marginBottom: '16px', padding: '10px 14px', borderRadius: '8px', backgroundColor: '#f0fdfa', color: '#065f46', fontWeight: 600 }}>{progresso}</div>}
      {msg && <div style={{ marginBottom: '16px', padding: '10px 14px', borderRadius: '8px', backgroundColor: msg.startsWith('✅') ? '#dcfce7' : '#fee2e2', color: msg.startsWith('✅') ? '#166534' : '#991b1b', fontWeight: 600 }}>{msg}</div>}
      {artigos.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#9ca3af' }}>Nenhum artigo. <a href="/compalavra/criar" style={{ color: '#0f766e', fontWeight: 700 }}>Criar →</a></div>
      ) : (
        <div style={{ display: 'grid', gap: '12px' }}>
          {artigos.map(artigo => (
            <div key={artigo.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', padding: '16px 20px', borderRadius: '10px', border: '1px solid #e5e7eb', backgroundColor: '#fff' }}>
              {artigo.imagem && <img src={artigo.imagem} alt="" style={{ width: '70px', height: '52px', objectFit: 'cover', borderRadius: '6px', flexShrink: 0 }} />}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 700, color: '#111827', fontSize: '0.95rem' }}>{artigo.titulo || '(sem título)'}</span>
                  {artigo.categoria === 'literatura' && <span style={{ backgroundColor: '#ede9fe', color: '#5b21b6', fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px', borderRadius: '10px' }}>📚 LITERATURA</span>}
                  {artigo.destaque && <span style={{ backgroundColor: '#fef3c7', color: '#92400e', fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px', borderRadius: '10px' }}>DESTAQUE</span>}
                  {programado(artigo)
                    ? <span style={{ backgroundColor: '#e0e7ff', color: '#3730a3', fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px', borderRadius: '10px' }}>🗓 AGENDADO · {new Date(artigo.publicarEm!).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</span>
                    : artigo.publicado
                    ? <span style={{ backgroundColor: '#dcfce7', color: '#166534', fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px', borderRadius: '10px' }}>PUBLICADO</span>
                                       : <span style={{ backgroundColor: '#f3f4f6', color: '#6b7280', fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px', borderRadius: '10px' }}>RASCUNHO</span>}
                  {audios[artigo.id] === 'ok' && <span style={{ backgroundColor: '#e0f2fe', color: '#075985', fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px', borderRadius: '10px' }}>🎧 COM ÁUDIO</span>}
                  {audios[artigo.id] === 'desatualizado' && <span style={{ backgroundColor: '#fef3c7', color: '#92400e', fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px', borderRadius: '10px' }}>🎧 ÁUDIO DESATUALIZADO</span>}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#9ca3af' }}>
                  {new Date(artigo.createdAt).toLocaleDateString('pt-BR')} · /compalavra/{artigo.slug}
                </div>
              </div>
                            <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                <button onClick={() => gerarAudio(artigo.id)} disabled={!!gerandoAudio} title={audios[artigo.id] === 'ok' ? 'Refazer o áudio' : 'Gerar o áudio'} style={{ backgroundColor: '#f0fdfa', color: '#0f766e', border: '1px solid #a7f3d0', borderRadius: '6px', padding: '7px 12px', fontWeight: 700, cursor: gerandoAudio ? 'wait' : 'pointer', fontSize: '0.8rem' }}>
                  {gerandoAudio === artigo.id ? '⏳' : audios[artigo.id] === 'ok' ? '🎧 Refazer' : '🎧 Gerar'}</button>
                <button onClick={() => { setEditando(artigo); setRevisao(''); setMsg(''); }} style={{ backgroundColor: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '6px', padding: '7px 14px', fontWeight: 600, cursor: 'pointer', fontSize: '0.8rem' }}>Editar</button>
                <a href={`/compalavra/${artigo.slug}`} target="_blank" rel="noopener" style={{ backgroundColor: '#f0fdfa', color: '#0f766e', textDecoration: 'none', borderRadius: '6px', padding: '7px 12px', fontWeight: 600, fontSize: '0.8rem', border: '1px solid #a7f3d0' }}>Ver</a>
                <button onClick={() => excluir(artigo.id)} style={{ backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '6px', padding: '7px 12px', fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem' }}>✕</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

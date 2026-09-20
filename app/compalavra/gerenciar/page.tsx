'use client';
import { useState, useEffect } from 'react';

interface ArtigoComPalavra {
  id: string; slug: string; titulo: string; conteudo: string;
  resumo: string; imagem?: string; publicado: boolean; destaque: boolean;
  createdAt: string; updatedAt: string;
}

export default function GerenciarComPalavraPage() {
  const [artigos, setArtigos] = useState<ArtigoComPalavra[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [editando, setEditando] = useState<ArtigoComPalavra | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [msg, setMsg] = useState('');
  const [revisando, setRevisando] = useState(false);
  const [revisao, setRevisao] = useState('');

  useEffect(() => { carregar(); }, []);

  async function carregar() {
    setCarregando(true);
    const res = await fetch('/api/compalavra/save');
    const data = await res.json();
    setArtigos(Array.isArray(data) ? data.sort((a: ArtigoComPalavra, b: ArtigoComPalavra) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) : []);
    setCarregando(false);
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
        <div><label style={{ display: 'block', fontWeight: 700, color: '#374151', marginBottom: '4px', fontSize: '0.8rem' }}>Título</label>
          <input style={inp} value={editando.titulo} onChange={e => setEditando({ ...editando, titulo: e.target.value })} /></div>
        <div><label style={{ display: 'block', fontWeight: 700, color: '#374151', marginBottom: '4px', fontSize: '0.8rem' }}>Resumo</label>
          <textarea style={{ ...inp, minHeight: '70px', resize: 'vertical' }} value={editando.resumo} onChange={e => setEditando({ ...editando, resumo: e.target.value })} /></div>
        <div><label style={{ display: 'block', fontWeight: 700, color: '#374151', marginBottom: '4px', fontSize: '0.8rem' }}>URL da imagem</label>
          <input style={inp} value={editando.imagem || ''} onChange={e => setEditando({ ...editando, imagem: e.target.value })} /></div>
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
        <a href="/compalavra/criar" style={{ backgroundColor: '#0f766e', color: '#fff', textDecoration: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 700, fontSize: '0.875rem' }}>+ Novo artigo</a>
      </div>
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
                  {artigo.destaque && <span style={{ backgroundColor: '#fef3c7', color: '#92400e', fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px', borderRadius: '10px' }}>DESTAQUE</span>}
                  {artigo.publicado
                    ? <span style={{ backgroundColor: '#dcfce7', color: '#166534', fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px', borderRadius: '10px' }}>PUBLICADO</span>
                    : <span style={{ backgroundColor: '#f3f4f6', color: '#6b7280', fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px', borderRadius: '10px' }}>RASCUNHO</span>}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#9ca3af' }}>
                  {new Date(artigo.createdAt).toLocaleDateString('pt-BR')} · /compalavra/{artigo.slug}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
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

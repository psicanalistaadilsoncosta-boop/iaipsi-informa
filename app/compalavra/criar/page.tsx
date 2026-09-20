'use client';
import { useState } from 'react';

export default function CriarComPalavraPage() {
  const [titulo, setTitulo] = useState('');
  const [resumo, setResumo] = useState('');
  const [conteudo, setConteudo] = useState('');
  const [imagem, setImagem] = useState('');
  const [publicado, setPublicado] = useState(false);
  const [destaque, setDestaque] = useState(false);
  const [revisando, setRevisando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [revisao, setRevisao] = useState('');
  const [msg, setMsg] = useState('');

  async function revisar() {
    if (!conteudo.trim()) { setMsg('Escreva o conteúdo antes de revisar.'); return; }
    setRevisando(true); setMsg('');
    const res = await fetch('/api/compalavra/revisar', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ conteudo }) });
    const data = await res.json();
    if (data.revisado) { setRevisao(data.revisado); setMsg('✅ Revisão pronta!'); }
    else setMsg('Erro: ' + (data.error || ''));
    setRevisando(false);
  }

  async function salvar() {
    if (!titulo.trim() || !conteudo.trim()) { setMsg('Título e conteúdo são obrigatórios.'); return; }
    setSalvando(true); setMsg('');
    const res = await fetch('/api/compalavra/save', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ titulo, resumo, conteudo, imagem, publicado, destaque }) });
    const data = await res.json();
    if (data.id) { setMsg('✅ Artigo salvo!'); setTitulo(''); setResumo(''); setConteudo(''); setImagem(''); setPublicado(false); setDestaque(false); setRevisao(''); }
    else setMsg('Erro: ' + (data.error || ''));
    setSalvando(false);
  }

  const inp: React.CSSProperties = { width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.95rem', fontFamily: 'inherit', boxSizing: 'border-box' };

  return (
    <main style={{ maxWidth: '820px', margin: '0 auto', padding: '24px 16px' }}>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#111827', marginBottom: '24px' }}>✍️ Novo artigo — ComAPalavra</h1>
      <div style={{ display: 'grid', gap: '20px' }}>
        <div><label style={{ display: 'block', fontWeight: 700, color: '#374151', marginBottom: '6px', fontSize: '0.875rem' }}>Título</label>
          <input style={inp} value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Título do artigo" /></div>
        <div><label style={{ display: 'block', fontWeight: 700, color: '#374151', marginBottom: '6px', fontSize: '0.875rem' }}>Resumo</label>
          <textarea style={{ ...inp, minHeight: '80px', resize: 'vertical' }} value={resumo} onChange={e => setResumo(e.target.value)} /></div>
        <div><label style={{ display: 'block', fontWeight: 700, color: '#374151', marginBottom: '6px', fontSize: '0.875rem' }}>URL da imagem</label>
          <input style={inp} value={imagem} onChange={e => setImagem(e.target.value)} placeholder="https://..." />
          {imagem && <img src={imagem} alt="" style={{ marginTop: '8px', height: '80px', borderRadius: '8px', objectFit: 'cover' }} />}</div>
        <div>
          <label style={{ display: 'block', fontWeight: 700, color: '#374151', marginBottom: '6px', fontSize: '0.875rem' }}>Conteúdo</label>
          <textarea style={{ ...inp, minHeight: '340px', resize: 'vertical', lineHeight: 1.7 }} value={conteudo} onChange={e => setConteudo(e.target.value)} placeholder="Escreva aqui..." />
          <div style={{ marginTop: '10px', display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button onClick={revisar} disabled={revisando} style={{ backgroundColor: '#0f766e', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 20px', fontWeight: 700, cursor: revisando ? 'wait' : 'pointer' }}>
              {revisando ? '⏳ Revisando...' : '🤖 Revisar com IA'}</button>
            <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Gramática · ilustrações · referências psicanalíticas</span>
          </div>
        </div>
        {revisao && (
          <div style={{ border: '2px solid #0f766e', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ backgroundColor: '#0f766e', color: '#fff', padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700 }}>📝 Texto revisado pela IA</span>
              <button onClick={() => { setConteudo(revisao); setRevisao(''); setMsg('✅ Aplicado!'); }} style={{ backgroundColor: '#fff', color: '#0f766e', border: 'none', borderRadius: '6px', padding: '6px 14px', fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem' }}>✅ Aplicar</button>
            </div>
            <div style={{ padding: '20px', backgroundColor: '#f0fdfa', whiteSpace: 'pre-wrap', lineHeight: 1.8, fontSize: '0.9rem', color: '#1f2937', maxHeight: '300px', overflowY: 'auto' }}>{revisao}</div>
          </div>
        )}
        <div style={{ display: 'flex', gap: '24px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600, color: '#374151' }}>
            <input type="checkbox" checked={publicado} onChange={e => setPublicado(e.target.checked)} /> Publicado</label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600, color: '#374151' }}>
            <input type="checkbox" checked={destaque} onChange={e => setDestaque(e.target.checked)} /> Destaque</label>
        </div>
        {msg && <div style={{ padding: '12px 16px', borderRadius: '8px', backgroundColor: msg.startsWith('✅') ? '#dcfce7' : '#fee2e2', color: msg.startsWith('✅') ? '#166534' : '#991b1b', fontWeight: 600 }}>{msg}</div>}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={salvar} disabled={salvando} style={{ backgroundColor: '#111827', color: '#fff', border: 'none', borderRadius: '10px', padding: '14px 32px', fontWeight: 800, fontSize: '1rem', cursor: salvando ? 'wait' : 'pointer' }}>
            {salvando ? 'Salvando...' : '💾 Salvar artigo'}</button>
          <a href="/compalavra/gerenciar" style={{ display: 'inline-flex', alignItems: 'center', color: '#6b7280', fontWeight: 600, textDecoration: 'none' }}>Gerenciar →</a>
        </div>
      </div>
    </main>
  );
}

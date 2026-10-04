'use client';
// app/admin/importar/page.tsx — importar produtos de uma categoria de loja para "A catalogar"

import { useEffect, useState } from 'react';
import AdminGate from '../../AdminGate';

type Produto = { nome: string; preco: number; imagem: string; url: string; marca?: string; esgotado?: boolean };
type Res = { status: 'ok' | 'bloqueio' | 'sem-dados' | 'erro'; produtos?: Produto[]; paginasLidas?: number; mensagem?: string; avisos: string[] };

const brl = (v: number) => 'R$ ' + v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const host = (u: string) => { try { return new URL(u).hostname.replace(/^www\./, ''); } catch { return ''; } };
const campo: React.CSSProperties = { width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14, boxSizing: 'border-box' };
const rot: React.CSSProperties = { display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', margin: '12px 0 4px' };

function Importar() {
  const [loja, setLoja] = useState('');
  const [pag1, setPag1] = useState('');
  const [pag2, setPag2] = useState('');
  const [paginas, setPaginas] = useState(3);
  const [deeplink, setDeeplink] = useState('');
  const [salvos, setSalvos] = useState<Record<string, string>>({});
  const [res, setRes] = useState<Res | null>(null);
  const [marcados, setMarcados] = useState<Set<string>>(new Set());
  const [ocupado, setOcupado] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => { fetch('/api/admin/importar-categoria/salvar').then(r => r.json()).then(setSalvos).catch(() => {}); }, []);
  // deeplink já usado nesta loja aparece sozinho
  useEffect(() => { const h = host(pag1); if (h && salvos[h] && !deeplink) setDeeplink(salvos[h]); }, [pag1, salvos]); // eslint-disable-line

  async function buscar() {
    setOcupado(true); setRes(null); setMsg('');
    try {
      const r = await fetch('/api/admin/importar-categoria', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pagina1: pag1.trim(), pagina2: pag2.trim(), paginas }),
      });
      const d: Res = await r.json();
      setRes(d);
      setMarcados(new Set((d.produtos || []).filter(p => !p.esgotado).map(p => p.url)));
    } catch { setRes({ status: 'erro', mensagem: 'Não foi possível buscar agora.', avisos: [] }); }
    setOcupado(false);
  }

  async function mandar() {
    const lista = (res?.produtos || []).filter(p => marcados.has(p.url));
    setOcupado(true); setMsg('');
    try {
      const r = await fetch('/api/admin/importar-categoria/salvar', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ produtos: lista, deeplink: deeplink.trim(), loja: loja.trim(), origem: pag1.trim() }),
      });
      const d = await r.json();
      setMsg(d.error ? `⚠️ ${d.error}` : `✅ ${d.novos} produtos foram para "A catalogar".${d.repetidos ? ` ${d.repetidos} já estavam lá.` : ''}${d.recusados ? ` ${d.recusados} recusados (link inválido).` : ''}`);
    } catch { setMsg('⚠️ Não foi possível salvar agora.'); }
    setOcupado(false);
  }

  const alternar = (u: string) => setMarcados(s => { const n = new Set(s); n.has(u) ? n.delete(u) : n.add(u); return n; });
  const prods = res?.produtos || [];

  return (
    <main style={{ maxWidth: 1060, margin: '0 auto', padding: '28px 16px', fontFamily: 'system-ui', background: '#f9fafb', minHeight: '100vh' }}>
      <h1 style={{ fontSize: 22, margin: '0 0 4px', color: '#111827' }}>Importar categoria</h1>
      <p style={{ color: '#6b7280', fontSize: 14, margin: '0 0 16px' }}>Navegue na loja como cliente, copie o link da categoria (e o da página 2) e cole aqui. Os produtos vão para "A catalogar".</p>

      <section style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 16 }}>
        <label style={rot} htmlFor="imp-loja">Nome da loja</label>
        <input id="imp-loja" style={campo} value={loja} onChange={e => setLoja(e.target.value)} placeholder="Wine" />
        <label style={rot} htmlFor="imp-p1">Link da categoria (página 1)</label>
        <input id="imp-p1" style={campo} value={pag1} onChange={e => setPag1(e.target.value)} placeholder="https://www.wine.com.br/vinhos/tinto/cVINHOS-atTIPO_TINTO.html" />
        <label style={rot} htmlFor="imp-p2">Link da página 2 (opcional, para ler mais páginas)</label>
        <input id="imp-p2" style={campo} value={pag2} onChange={e => setPag2(e.target.value)} placeholder="https://www.wine.com.br/...-p2.html?...&pn=2" />
        <label style={rot} htmlFor="imp-n">Quantas páginas ler</label>
        <select id="imp-n" style={{ ...campo, width: 120 }} value={paginas} onChange={e => setPaginas(Number(e.target.value))}>
          {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
        </select>
        <div style={{ marginTop: 14 }}>
          <button onClick={buscar} disabled={ocupado || !pag1.trim()}
            style={{ padding: '10px 22px', borderRadius: 8, border: 0, background: '#5B3E96', color: '#fff', fontWeight: 700, cursor: 'pointer', opacity: ocupado || !pag1.trim() ? 0.5 : 1 }}>
            {ocupado && !prods.length ? 'Lendo a loja...' : 'Buscar produtos'}
          </button>
        </div>
      </section>

      {res && res.status !== 'ok' && (
        <p style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 10, padding: 12, color: '#9a3412', marginTop: 14 }}>
          {res.status === 'bloqueio' ? '⛔ ' : '⚠️ '}{res.mensagem}
        </p>
      )}
      {res?.avisos?.length ? <ul style={{ color: '#6b7280', fontSize: 13, marginTop: 10 }}>{res.avisos.map(a => <li key={a}>{a}</li>)}</ul> : null}

      {prods.length > 0 && (
        <section style={{ marginTop: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 10 }}>
            <strong>{prods.length} produtos em {res?.paginasLidas} página(s) · {marcados.size} marcados</strong>
            <button onClick={() => setMarcados(new Set(prods.map(p => p.url)))} style={{ fontSize: 13, background: 'none', border: 0, color: '#5B3E96', cursor: 'pointer', fontWeight: 700 }}>Marcar todos</button>
            <button onClick={() => setMarcados(new Set())} style={{ fontSize: 13, background: 'none', border: 0, color: '#6b7280', cursor: 'pointer' }}>Desmarcar</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 10 }}>
            {prods.map(p => {
              const on = marcados.has(p.url);
              return (
                <button key={p.url} onClick={() => alternar(p.url)}
                  style={{ textAlign: 'left', background: '#fff', border: `2px solid ${on ? '#5B3E96' : '#e5e7eb'}`, borderRadius: 10, padding: 8, cursor: 'pointer', opacity: on ? 1 : 0.55 }}>
                  <div style={{ height: 110, display: 'grid', placeItems: 'center', background: '#f9fafb', borderRadius: 6, overflow: 'hidden' }}>
                    {p.imagem ? <img src={p.imagem} alt="" style={{ maxWidth: '100%', maxHeight: 110, objectFit: 'contain' }} /> : <span style={{ color: '#9ca3af' }}>sem foto</span>}
                  </div>
                  <div style={{ fontSize: 12, color: '#111827', margin: '6px 0 2px', lineHeight: 1.3, height: 32, overflow: 'hidden' }}>{p.nome}</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#dc2626' }}>{brl(p.preco)}</div>
                  {p.esgotado && <div style={{ fontSize: 11, fontWeight: 700, color: '#9a3412' }}>esgotado na loja</div>}
                </button>
              );
            })}
          </div>

          <section style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 16, marginTop: 16 }}>
            <label style={{ ...rot, marginTop: 0 }} htmlFor="imp-dl">Deeplink de exemplo desta loja (da rede de afiliados)</label>
            <input id="imp-dl" style={campo} value={deeplink} onChange={e => setDeeplink(e.target.value)} placeholder="https://apretailer.com.br/click/.../360672/subaccount/url=https%3A%2F%2Fwww.wine.com.br%2F..." />
            <p style={{ fontSize: 12, color: '#6b7280', margin: '6px 0 0' }}>Gere um deeplink de qualquer página da loja no painel da rede e cole aqui. Ele fica guardado para as próximas importações desta loja.</p>
            <button onClick={mandar} disabled={ocupado || !marcados.size || !deeplink.trim() || !loja.trim()}
              style={{ marginTop: 12, padding: '10px 22px', borderRadius: 8, border: 0, background: '#047857', color: '#fff', fontWeight: 700, cursor: 'pointer', opacity: ocupado || !marcados.size || !deeplink.trim() || !loja.trim() ? 0.5 : 1 }}>
              Mandar {marcados.size} para "A catalogar"
            </button>
            {msg && <p style={{ marginTop: 10, fontSize: 14 }}>{msg}</p>}
          </section>
        </section>
      )}
    </main>
  );
}

export default function ImportarPage() {
  return <AdminGate titulo="Importar categoria"><Importar /></AdminGate>;
}

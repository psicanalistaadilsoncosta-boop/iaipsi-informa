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
  const [recarregarOrigens, setRecarregarOrigens] = useState(0);

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
        body: JSON.stringify({ produtos: lista, deeplink: deeplink.trim(), loja: loja.trim(), origem: pag1.trim(), pagina2: pag2.trim(), paginas }),
      });
      const d = await r.json();
      if (!d.error) setRecarregarOrigens(n => n + 1);
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

      <PaginasImportadas recarregar={recarregarOrigens} />
    </main>
  );
}

// ---------- Páginas já importadas: atualização diária liga/desliga ----------
type Origem = { id: string; loja: string; pag1: string; pag2: string; paginas: number; ativo: boolean; produtos: number; ultima: string | null; erro: string; resumo: string };

function PaginasImportadas({ recarregar }: { recarregar: number }) {
  const [lista, setLista] = useState<Origem[] | null>(null);
  const [editPag2, setEditPag2] = useState<Record<string, string>>({});
  const [aviso, setAviso] = useState('');

  async function carregar() {
    try { const r = await fetch('/api/admin/importar-categoria/origens'); setLista(await r.json()); }
    catch { setLista([]); }
  }
  useEffect(() => { carregar(); }, [recarregar]);

  async function mudar(id: string, dados: Partial<Origem>) {
    setAviso('');
    const r = await fetch('/api/admin/importar-categoria/origens', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, ...dados }),
    });
    const d = await r.json();
    if (d.error) setAviso(`⚠️ ${d.error}`);
    await carregar();
  }

  const data = (iso: string | null) => iso ? new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : 'nunca';
  const curto = (u: string) => { try { const x = new URL(u); return x.hostname.replace(/^www\./, '') + x.pathname; } catch { return u; } };

  return (
    <section style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 16, marginTop: 24 }}>
      <h2 style={{ fontSize: 17, margin: '0 0 4px', color: '#111827' }}>Páginas importadas</h2>
      <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 12px' }}>
        Ligue 🔄 para atualizar todo dia de madrugada: preço, foto e nome mudam sozinhos (a vitrine não muda); produto novo vai para a vitrine dos irmãos
        (ou "A catalogar" se eles estiverem em vitrines diferentes); produto que sumir da loja sai do ar depois de 2 dias. O que você apagou no admin não volta.
      </p>
      {aviso && <p style={{ color: '#9a3412', fontSize: 14 }}>{aviso}</p>}
      {lista === null && <p style={{ color: '#6b7280' }}>Carregando...</p>}
      {lista?.length === 0 && <p style={{ color: '#6b7280' }}>Nenhuma página importada ainda.</p>}
      {lista?.map(o => (
        <div key={o.id} style={{ borderTop: '1px solid #f3f4f6', padding: '12px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <strong style={{ color: '#111827' }}>{o.loja || '(sem nome)'}</strong>
            <span style={{ fontSize: 13, color: '#6b7280' }} title={o.pag1}>{curto(o.pag1)}</span>
            <span style={{ fontSize: 13, color: '#374151' }}>· {o.produtos} produtos</span>
            <button onClick={() => mudar(o.id, { ativo: !o.ativo })}
              style={{ marginLeft: 'auto', padding: '6px 14px', borderRadius: 20, border: 0, fontWeight: 700, fontSize: 13, cursor: 'pointer',
                background: o.ativo ? '#047857' : '#e5e7eb', color: o.ativo ? '#fff' : '#374151' }}>
              🔄 Atualizar todo dia: {o.ativo ? 'ligado' : 'desligado'}
            </button>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginTop: 8 }}>
            <input style={{ ...campo, flex: 1, minWidth: 220, fontSize: 13 }} placeholder="Link da página 2 (sem ele, lê só a página 1)"
              value={editPag2[o.id] ?? o.pag2} onChange={e => setEditPag2(m => ({ ...m, [o.id]: e.target.value }))} />
            <select style={{ ...campo, width: 110, fontSize: 13 }} value={o.paginas} onChange={e => mudar(o.id, { paginas: Number(e.target.value) })}>
              {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n} pág.</option>)}
            </select>
            {(editPag2[o.id] ?? o.pag2) !== o.pag2 && (
              <button onClick={() => mudar(o.id, { pag2: editPag2[o.id] })}
                style={{ padding: '8px 14px', borderRadius: 8, border: 0, background: '#5B3E96', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Salvar</button>
            )}
          </div>
          <div style={{ fontSize: 12, marginTop: 6, color: o.erro ? '#9a3412' : '#6b7280' }}>
            Última atualização: {data(o.ultima)}{o.erro ? ` · ⚠️ ${o.erro}` : o.resumo ? ` · ${o.resumo}` : ''}
          </div>
        </div>
      ))}
    </section>
  );
}

export default function ImportarPage() {
  return <AdminGate titulo="Importar categoria"><Importar /></AdminGate>;
}

'use client';
// app/admin/importar/page.tsx — importar produtos de uma categoria de loja para "A catalogar"

import { useEffect, useState } from 'react';
import AdminGate from '../../AdminGate';

type Produto = { nome: string; preco: number; imagem: string; url: string; marca?: string; esgotado?: boolean; jaNoSite?: boolean };
type Res = { status: 'ok' | 'bloqueio' | 'sem-dados' | 'erro'; produtos?: Produto[]; paginasLidas?: number; mensagem?: string; avisos: string[] };

const brl = (v: number) => 'R$ ' + v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
// feed XML: a chave é o próprio feed (cada loja tem o seu); página normal: o site da loja
const host = (u: string) => { try { const x = new URL(u); const h = x.hostname.replace(/^www\./, ''); return /\.xml$/i.test(x.pathname) ? h + x.pathname : h; } catch { return ''; } };
const campo: React.CSSProperties = { width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14, boxSizing: 'border-box' };
const rot: React.CSSProperties = { display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', margin: '12px 0 4px' };
const LOTE = 200; // o salvar aceita até 200 produtos por vez

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
  const [colado, setColado] = useState('');
  const [avisoColetor, setAvisoColetor] = useState('');

  useEffect(() => { fetch('/api/admin/importar-categoria/salvar').then(r => r.json()).then(setSalvos).catch(() => {}); }, []);
  // deeplink já usado nesta loja aparece sozinho
  useEffect(() => { const h = host(pag1); if (h && salvos[h] && !deeplink) setDeeplink(salvos[h]); }, [pag1, salvos]); // eslint-disable-line

   async function buscar(o?: { pag1: string; pag2: string; paginas: number; colado?: any }) {
    setOcupado(true); setRes(null); setMsg('');
    try {
      const r = await fetch('/api/admin/importar-categoria', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pagina1: (o?.pag1 ?? pag1).trim(), pagina2: (o?.pag2 ?? pag2).trim(), paginas: o?.paginas ?? paginas, colado: o?.colado }),
      });
      const d: Res = await r.json();
      setRes(d);
      // já no site e esgotados vêm desmarcados
      setMarcados(new Set((d.produtos || []).filter(p => !p.esgotado && !p.jaNoSite).map(p => p.url)));
    } catch { setRes({ status: 'erro', mensagem: 'Não foi possível buscar agora.', avisos: [] }); }
    setOcupado(false);
  }

  async function mandar() {
    const lista = (res?.produtos || []).filter(p => marcados.has(p.url)).slice(0, LOTE);
    setOcupado(true); setMsg('');
    try {
      const r = await fetch('/api/admin/importar-categoria/salvar', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ produtos: lista, deeplink: deeplink.trim(), loja: loja.trim(), origem: pag1.trim(), pagina2: pag2.trim(), paginas }),
      });
      const d = await r.json();
            if (!d.error) setRecarregarOrigens(n => n + 1);
      // tudo aceito: os enviados viram "já no site" e saem da seleção (o próximo clique manda o próximo lote)
      // houve recusados: a seleção fica como está; no próximo clique os que já entraram são pulados e os recusados tentam de novo
      if (!d.error && !d.recusados) {
        const enviados = new Set(lista.map(p => p.url));
        setRes(x => x ? { ...x, produtos: (x.produtos || []).map(p => enviados.has(p.url) ? { ...p, jaNoSite: true } : p) } : x);
        setMarcados(s => { const n = new Set(s); enviados.forEach(u => n.delete(u)); return n; });
      }
      const faltam = d.error || d.recusados ? 0 : marcados.size - lista.length;
      setMsg(d.error ? `⚠️ ${d.error}` : `✅ ${d.novos} produtos foram para "A catalogar".${d.repetidos ? ` ${d.repetidos} já estavam lá.` : ''}${d.recusados ? ` ${d.recusados} sem link da rede: clique em Mandar de novo para tentar outra vez.` : ''}${d.aviso ? ` ⚠️ ${d.aviso}` : ''}${faltam > 0 ? ` Faltam ${faltam} marcados: clique em Mandar de novo.` : ''}`);
    } catch { setMsg('⚠️ Não foi possível salvar agora.'); }
    setOcupado(false);
  }

  // Lista do coletor (loja que bloqueia o servidor): lê o texto colado e mostra igual a uma busca
  function usarColado() {
    let d: any = null;
    try { d = JSON.parse(colado.trim()); } catch {}
    if (d?.coletor !== 'comlupa' || !Array.isArray(d.produtos)) {
      setRes({ status: 'erro', mensagem: 'Isso não é a lista do coletor. Na loja, clique em "📋 Copiar lista" na caixa roxa e cole aqui.', avisos: [] });
      return;
    }
    const origem = String(d.origem || '');
    if (!loja.trim() && d.loja) setLoja(String(d.loja));
    setPag1(origem); setPag2(''); setPaginas(1);
    buscar({ pag1: origem, pag2: '', paginas: 1, colado: d });
  }

  async function copiarColetor() {
    try {
      const txt = await (await fetch('/coletor.js', { cache: 'no-store' })).text();
      await navigator.clipboard.writeText(txt);
      setAvisoColetor('✅ Coletor copiado.');
    } catch { setAvisoColetor('⚠️ Não consegui copiar. Abra comlupa.com.br/coletor.js e copie à mão.'); }
  }

  // "Buscar de novo" numa página importada: preenche o formulário e já busca
  function buscarDeNovo(o: { loja: string; pag1: string; pag2: string; paginas: number }) {
    setLoja(o.loja || ''); setPag1(o.pag1); setPag2(o.pag2 || ''); setPaginas(o.paginas || 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    buscar({ pag1: o.pag1, pag2: o.pag2 || '', paginas: o.paginas || 1 });
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
          <button onClick={() => buscar()} disabled={ocupado || !pag1.trim()}
            style={{ padding: '10px 22px', borderRadius: 8, border: 0, background: '#5B3E96', color: '#fff', fontWeight: 700, cursor: 'pointer', opacity: ocupado || !pag1.trim() ? 0.5 : 1 }}>
            {ocupado && !prods.length ? 'Lendo a loja...' : 'Buscar produtos'}
          </button>
        </div>
      </section>

      <details style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '12px 16px', marginTop: 12 }}>
        <summary style={{ cursor: 'pointer', fontWeight: 700, color: '#5B3E96', fontSize: 14 }}>🧲 A loja bloqueia (403)? Use o coletor no seu navegador</summary>
        <ol style={{ fontSize: 13, color: '#374151', margin: '10px 0', paddingLeft: 20, lineHeight: 1.7 }}>
          <li>Clique em <b>Copiar coletor</b>.</li>
          <li>Abra a categoria na loja (ex.: cristaiscadoro.com/vasos), aperte F12, aba <b>Console</b>, cole e aperte Enter.</li>
          <li>Na caixa roxa que aparece na loja, clique em <b>📋 Copiar lista</b> e cole aqui embaixo.</li>
        </ol>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <button onClick={copiarColetor}
            style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #c4b5fd', background: '#f5f3ff', color: '#5B3E96', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
            📋 Copiar coletor
          </button>
          {avisoColetor && <span style={{ fontSize: 13, color: avisoColetor.startsWith('✅') ? '#047857' : '#9a3412' }}>{avisoColetor}</span>}
        </div>
        <label style={rot} htmlFor="imp-colado">Lista copiada da loja</label>
        <textarea id="imp-colado" rows={3} value={colado} onChange={e => setColado(e.target.value)} placeholder='{"coletor":"comlupa", ...}'
          style={{ ...campo, fontFamily: 'monospace', fontSize: 12, resize: 'vertical' }} />
        <button onClick={usarColado} disabled={ocupado || !colado.trim()}
          style={{ marginTop: 10, padding: '10px 22px', borderRadius: 8, border: 0, background: '#5B3E96', color: '#fff', fontWeight: 700, cursor: 'pointer', opacity: ocupado || !colado.trim() ? 0.5 : 1 }}>
          Usar lista colada
        </button>
        <p style={{ fontSize: 12, color: '#6b7280', margin: '8px 0 0' }}>
          A atualização diária não alcança essas lojas. Para trazer produtos novos, rode o coletor de novo e cole aqui: os que já estão no site vêm desmarcados.
        </p>
      </details>

      {res && res.status !== 'ok' && (
        <p style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 10, padding: 12, color: '#9a3412', marginTop: 14 }}>
          {res.status === 'bloqueio' ? '⛔ ' : '⚠️ '}{res.mensagem}{res.status === 'bloqueio' && ' Use o coletor (logo acima).'}
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
                  {p.jaNoSite && <div style={{ fontSize: 11, fontWeight: 700, color: '#047857' }}>✓ já no site</div>}
                </button>
              );
            })}
          </div>

          <section style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 16, marginTop: 16 }}>
            <label style={{ ...rot, marginTop: 0 }} htmlFor="imp-dl">Deeplink de exemplo desta loja (da rede de afiliados)</label>
            <input id="imp-dl" style={campo} value={deeplink} onChange={e => setDeeplink(e.target.value)} placeholder="https://apretailer.com.br/click/.../360672/subaccount/url=https%3A%2F%2Fwww.wine.com.br%2F..." />
            <p style={{ fontSize: 12, color: '#6b7280', margin: '6px 0 0' }}>Gere um deeplink de qualquer página da loja no painel da rede e cole aqui. Loja da Lomadee: escreva lomadee: seguido do ID da loja (está em Marcas Lomadee); o site cria um link curto para cada produto. Fica guardado para as próximas importações desta loja.</p>
            <button onClick={mandar} disabled={ocupado || !marcados.size || !deeplink.trim() || !loja.trim()}
              style={{ marginTop: 12, padding: '10px 22px', borderRadius: 8, border: 0, background: '#047857', color: '#fff', fontWeight: 700, cursor: 'pointer', opacity: ocupado || !marcados.size || !deeplink.trim() || !loja.trim() ? 0.5 : 1 }}>
              Mandar {Math.min(marcados.size, LOTE)} para "A catalogar"{marcados.size > LOTE ? ` (de ${marcados.size})` : ''}
            </button>
            {msg && <p style={{ marginTop: 10, fontSize: 14 }}>{msg}</p>}
          </section>
        </section>
      )}

      <PaginasImportadas recarregar={recarregarOrigens} aoBuscar={buscarDeNovo} />
    </main>
  );
}

// ---------- Páginas já importadas: atualização diária liga/desliga ----------
type Origem = { id: string; loja: string; pag1: string; pag2: string; paginas: number; ativo: boolean; produtos: number; ultima: string | null; erro: string; resumo: string };

function PaginasImportadas({ recarregar, aoBuscar }: { recarregar: number; aoBuscar: (o: Origem) => void }) {
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

  async function remover(o: Origem, apagarProdutos: boolean) {
    const txt = apagarProdutos
      ? `Remover esta página E apagar do site os ${o.produtos} produtos dela? Não dá para desfazer.`
      : 'Tirar esta página da lista? A atualização diária para, mas os produtos continuam no site.';
    if (!window.confirm(txt)) return;
    setAviso('');
    const r = await fetch('/api/admin/importar-categoria/origens', {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: o.id, apagarProdutos }),
    });
    const d = await r.json();
    if (d.error) setAviso(`⚠️ ${d.error}`);
    else if (d.apagados) setAviso(`✅ Página removida e ${d.apagados} produtos apagados do site.`);
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
            <button onClick={() => aoBuscar(o)}
              style={{ padding: '6px 14px', borderRadius: 20, border: '1px solid #c4b5fd', background: '#f5f3ff', color: '#5B3E96', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
              🔍 Buscar de novo
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
          <div style={{ display: 'flex', gap: 14, marginTop: 6 }}>
            <button onClick={() => remover(o, false)} style={{ background: 'none', border: 0, padding: 0, color: '#6b7280', fontSize: 12, cursor: 'pointer', textDecoration: 'underline' }}>
              Tirar da lista
            </button>
            <button onClick={() => remover(o, true)} style={{ background: 'none', border: 0, padding: 0, color: '#b91c1c', fontSize: 12, fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}>
              🗑 Remover e apagar os {o.produtos} produtos
            </button>
          </div>
        </div>
      ))}
    </section>
  );
}

export default function ImportarPage() {
  return <AdminGate titulo="Importar categoria"><Importar /></AdminGate>;
}

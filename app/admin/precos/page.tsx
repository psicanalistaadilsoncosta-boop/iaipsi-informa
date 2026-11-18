'use client';
// app/admin/precos/page.tsx — Lupômetro: histórico de preços (só admin, dados do Neon)

import { useEffect, useState } from 'react';
import AdminGate from '../../AdminGate';

type Linha = Record<string, any>;

const brl = (v: any) => v == null || v === '' ? '—'
  : 'R$ ' + Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const quando = (iso: string) => new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
const pct = (de: any, por: any) => (Number(de) > Number(por) && Number(por) > 0 ? Math.round((1 - Number(por) / Number(de)) * 100) : 0);

const cartao: React.CSSProperties = { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 16, marginBottom: 18 };
const titulo: React.CSSProperties = { fontSize: 17, margin: '0 0 4px', color: '#111827' };
const sub: React.CSSProperties = { fontSize: 13, color: '#6b7280', margin: '0 0 12px' };

async function api(params: string) {
  const r = await fetch(`/api/admin/precos?${params}`);
  const d = await r.json();
  if (d?.error) throw new Error(d.error);
  return d;
}

// Linha do tempo de um produto (abre ao clicar no nome)
function LinhaDoTempo({ id }: { id: string }) {
  const [linhas, setLinhas] = useState<Linha[] | null>(null);
  useEffect(() => { api(`tipo=produto&id=${encodeURIComponent(id)}`).then(setLinhas).catch(() => setLinhas([])); }, [id]);
  if (!linhas) return <div style={{ fontSize: 13, color: '#6b7280', padding: '8px 0' }}>Carregando...</div>;
  const precos = linhas.map(l => Number(l.preco));
  const min = Math.min(...precos), max = Math.max(...precos);
  return (
    <div style={{ background: '#f9fafb', borderRadius: 8, padding: 10, margin: '6px 0 4px' }}>
      <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 6 }}>
        {linhas.length} anotação(ões) · menor {brl(min)} · maior {brl(max)}
        {linhas[0]?.link && <> · <a href={linhas[0].link} target="_blank" rel="noopener noreferrer" style={{ color: '#5B3E96' }}>ver na loja ↗</a></>}
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead><tr style={{ textAlign: 'left', color: '#6b7280' }}><th>Data</th><th>De</th><th>Por</th><th>Desconto</th><th></th></tr></thead>
        <tbody>
          {linhas.map((l, i) => {
            const ant = i > 0 ? Number(linhas[i - 1].preco) : null;
            const seta = ant == null ? '' : Number(l.preco) < ant ? '↓' : Number(l.preco) > ant ? '↑' : '';
            return (
              <tr key={i} style={{ borderTop: '1px solid #e5e7eb' }}>
                <td style={{ padding: '4px 0' }}>{quando(l.visto_em)}</td>
                <td>{brl(l.preco_de)}</td>
                <td style={{ fontWeight: 700, color: seta === '↓' ? '#047857' : seta === '↑' ? '#b91c1c' : '#111827' }}>{brl(l.preco)} {seta}</td>
                <td>{pct(l.preco_de, l.preco) ? `-${pct(l.preco_de, l.preco)}%` : ''}</td>
                <td style={{ color: '#9ca3af' }}>{l.tipo === 'novo' ? 'primeira vez' : ''}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// Uma linha de produto clicável (abre a linha do tempo)
function ItemProduto({ l, direita }: { l: Linha; direita: React.ReactNode }) {
  const [aberto, setAberto] = useState(false);
  return (
    <div style={{ borderTop: '1px solid #f3f4f6', padding: '8px 0' }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <button onClick={() => setAberto(a => !a)} style={{ background: 'none', border: 0, padding: 0, cursor: 'pointer', textAlign: 'left', flex: 1, minWidth: 220 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{aberto ? '▾' : '▸'} {l.nome || l.produto_id}</div>
          <div style={{ fontSize: 12, color: '#6b7280' }}>{l.loja || 'loja ?'} · {quando(l.visto_em)}</div>
        </button>
        <div style={{ fontSize: 14 }}>{direita}</div>
      </div>
      {aberto && <LinhaDoTempo id={l.produto_id} />}
    </div>
  );
}

function Lupometro() {
  const [resumo, setResumo] = useState<Linha | null>(null);
  const [mudancas, setMudancas] = useState<Linha[] | null>(null);
  const [alertas, setAlertas] = useState<{ descontoFixo: Linha[]; deInflado: Linha[]; menorPreco: Linha[] } | null>(null);
  const [busca, setBusca] = useState('');
  const [achados, setAchados] = useState<Linha[] | null>(null);
  const [erro, setErro] = useState('');

  useEffect(() => {
    api('tipo=resumo').then(setResumo).catch(e => setErro(String(e.message || e)));
    api('tipo=mudancas').then(setMudancas).catch(() => setMudancas([]));
    api('tipo=alertas').then(setAlertas).catch(() => setAlertas({ descontoFixo: [], deInflado: [], menorPreco: [] }));
  }, []);

  async function buscar() {
    if (busca.trim().length < 2) return;
    setAchados(null);
    try { setAchados(await api(`tipo=busca&q=${encodeURIComponent(busca.trim())}`)); } catch { setAchados([]); }
  }

  const vazio = (txt: string) => <p style={{ fontSize: 13, color: '#9ca3af', margin: 0 }}>{txt}</p>;

  return (
    <main style={{ maxWidth: 960, margin: '0 auto', padding: '28px 16px 60px', fontFamily: 'system-ui', background: '#f9fafb', minHeight: '100vh' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 24, margin: 0, color: '#111827' }}>🔍 Lupômetro</h1>
          <p style={{ color: '#6b7280', fontSize: 14, margin: '4px 0 0' }}>Histórico de preços: anota cada produto novo e cada mudança de preço. Só você vê.</p>
        </div>
        <a href="/admin" style={{ fontSize: 14, fontWeight: 700, color: '#5B3E96', textDecoration: 'none' }}>← Admin</a>
      </div>

      {erro && <p style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: 12, color: '#991b1b' }}>⚠️ {erro}</p>}

      {resumo && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10, marginBottom: 18 }}>
          {[
            ['Produtos acompanhados', resumo.produtos],
            ['Mudanças de preço', resumo.mudancas],
            ['Anotações', resumo.linhas],
            ['Desde', resumo.desde ? new Date(resumo.desde).toLocaleDateString('pt-BR') : '—'],
          ].map(([r, v]) => (
            <div key={String(r)} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '12px 14px' }}>
              <div style={{ fontSize: 12, color: '#6b7280' }}>{r}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#111827' }}>{v ?? 0}</div>
            </div>
          ))}
        </div>
      )}

      {/* Busca */}
      <section style={cartao}>
        <h2 style={titulo}>Buscar produto</h2>
        <p style={sub}>Digite parte do nome ou da loja (ex.: "calvin polo", "jeans calzedonia"). Clique no produto para ver a linha do tempo.</p>
        <div style={{ display: 'flex', gap: 8 }}>
          <input value={busca} onChange={e => setBusca(e.target.value)} onKeyDown={e => e.key === 'Enter' && buscar()}
            placeholder="Nome do produto ou loja" aria-label="Buscar produto"
            style={{ flex: 1, padding: '9px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14 }} />
          <button onClick={buscar} style={{ padding: '9px 20px', borderRadius: 8, border: 0, background: '#5B3E96', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Buscar</button>
        </div>
        {achados && (achados.length ? (
          <div style={{ marginTop: 10 }}>
            {achados.map(l => (
              <ItemProduto key={l.produto_id} l={l} direita={
                <span>
                  {Number(l.preco_de) > Number(l.preco) && <span style={{ color: '#9ca3af', textDecoration: 'line-through', marginRight: 6 }}>{brl(l.preco_de)}</span>}
                  <b>{brl(l.preco)}</b>
                  <span style={{ color: '#9ca3af', fontSize: 12, marginLeft: 6 }}>{l.registros}×</span>
                </span>
              } />
            ))}
          </div>
        ) : <div style={{ marginTop: 10 }}>{vazio('Nada encontrado no histórico.')}</div>)}
      </section>

      {/* Alertas */}
      <section style={cartao}>
        <h2 style={titulo}>Alertas</h2>
        <p style={sub}>O que o histórico já consegue apontar. Quanto mais dias de anotação, mais confiáveis ficam.</p>
        {!alertas ? vazio('Carregando...') : (
          <>
            <h3 style={{ fontSize: 14, margin: '6px 0', color: '#b91c1c' }}>🔴 Loja com o mesmo desconto em tudo</h3>
            {alertas.descontoFixo.length ? alertas.descontoFixo.map(a => (
              <div key={a.loja} style={{ fontSize: 14, padding: '4px 0' }}>
                <b>{a.loja}</b>: {a.produtos} produtos, todos com <b>-{a.desconto}%</b>. Provável preço "de" calculado, não promoção.
              </div>
            )) : vazio('Nenhuma loja assim por enquanto.')}

            <h3 style={{ fontSize: 14, margin: '16px 0 6px', color: '#b91c1c' }}>🔴 Preço "de" subiu (desconto maquiado)</h3>
            {alertas.deInflado.length ? alertas.deInflado.map((l, i) => (
              <ItemProduto key={l.produto_id + i} l={l} direita={
                <span>"de" {brl(l.de_ant ?? l.por_ant)} → <b style={{ color: '#b91c1c' }}>{brl(l.preco_de)}</b> · por {brl(l.preco)}</span>
              } />
            )) : vazio('Nenhum caso ainda.')}

            <h3 style={{ fontSize: 14, margin: '16px 0 6px', color: '#047857' }}>🟢 Menor preço já visto</h3>
            {alertas.menorPreco.length ? alertas.menorPreco.map(l => (
              <ItemProduto key={l.produto_id} l={l} direita={
                <span>era até {brl(l.maximo)} · agora <b style={{ color: '#047857' }}>{brl(l.preco)}</b></span>
              } />
            )) : vazio('Nenhum ainda: aparece quando um preço cai abaixo de tudo o que já foi visto.')}
          </>
        )}
      </section>

      {/* Últimas mudanças */}
      <section style={cartao}>
        <h2 style={titulo}>Últimas mudanças de preço</h2>
        <p style={sub}>Produtos já acompanhados cujo preço mudou (pelo cron, pelo importador ou num novo pin).</p>
        {!mudancas ? vazio('Carregando...') : mudancas.length ? mudancas.map((l, i) => {
          const caiu = Number(l.preco) < Number(l.preco_antes);
          return (
            <ItemProduto key={l.produto_id + i} l={l} direita={
              <span>{brl(l.preco_antes)} → <b style={{ color: caiu ? '#047857' : '#b91c1c' }}>{brl(l.preco)} {caiu ? '↓' : '↑'}</b></span>
            } />
          );
        }) : vazio('Nenhuma mudança ainda. Elas aparecem conforme os preços mudarem nos próximos dias.')}
      </section>
    </main>
  );
}

export default function PrecosPage() {
  return <AdminGate titulo="Lupômetro"><Lupometro /></AdminGate>;
}

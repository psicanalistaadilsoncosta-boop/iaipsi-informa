'use client';
// app/admin/precos/page.tsx — Lupômetro: histórico de preços (só admin, dados do Neon)
// Base em valores (R$): cada mudança é comparada com a anotação anterior do mesmo produto.
// Você decide: selo dourado "🏅 A Lupa conferiu" (produto ou loja) e tirar/devolver da Oferta do Dia.

import { useEffect, useState } from 'react';
import AdminGate from '../../AdminGate';

type Linha = Record<string, any>;
type Flags = Record<string, { noSite: boolean; ofertaDoDia: boolean; conferido: boolean; caiuEm: string | null }>;

const brl = (v: any) => v == null || v === '' ? '—'
  : 'R$ ' + Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const quando = (iso: string) => new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
const pct = (de: any, por: any) => (Number(de) > Number(por) && Number(por) > 0 ? Math.round((1 - Number(por) / Number(de)) * 100) : 0);

// O que cada mudança significa (comparando com a anotação anterior)
const CLASSES: Record<string, { rotulo: string; cor: string; fundo: string; explica: string }> = {
  caiu:          { rotulo: '🟢 Caiu o preço',                   cor: '#047857', fundo: '#ecfdf5', explica: 'preço pago menor e preço base igual: queda real' },
  de_subiu:      { rotulo: '🟡 Subiu só o preço base',          cor: '#a16207', fundo: '#fefce8', explica: 'você paga o mesmo, mas o desconto anunciado aumentou' },
  reajuste:      { rotulo: '🟡 Reajuste',                       cor: '#a16207', fundo: '#fefce8', explica: 'preço base e preço pago subiram juntos (dólar, matéria-prima...)' },
  subiu:         { rotulo: '🔴 Subiu o preço',                  cor: '#b91c1c', fundo: '#fef2f2', explica: 'o preço pago ficou mais caro' },
  fim_desconto:  { rotulo: '⚪ Fim do desconto',                cor: '#4b5563', fundo: '#f3f4f6', explica: 'voltou ao preço cheio, sem preço base riscado' },
  caiu_mudou_de: { rotulo: '🔵 Caiu, mas o preço base mudou',   cor: '#1d4ed8', fundo: '#eff6ff', explica: 'pagou menos, porém o preço base também mudou' },
  de_desceu:     { rotulo: '⚪ Preço base baixou',              cor: '#4b5563', fundo: '#f3f4f6', explica: 'preço pago igual, preço base menor' },
  outro:         { rotulo: '⚪ Outro',                          cor: '#4b5563', fundo: '#f3f4f6', explica: '' },
};
const ORDEM_CLASSES = ['caiu', 'de_subiu', 'reajuste', 'subiu', 'fim_desconto', 'caiu_mudou_de', 'de_desceu'];

const cartao: React.CSSProperties = { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 16, marginBottom: 18 };
const titulo: React.CSSProperties = { fontSize: 17, margin: '0 0 4px', color: '#111827' };
const sub: React.CSSProperties = { fontSize: 13, color: '#6b7280', margin: '0 0 12px' };
const botao = (cor: string, cheio = false): React.CSSProperties => ({
  padding: '4px 10px', borderRadius: 999, fontSize: 12, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap',
  border: `1px solid ${cor}`, background: cheio ? cor : '#fff', color: cheio ? '#fff' : cor,
});

async function api(params: string) {
  const r = await fetch(`/api/admin/precos?${params}`);
  const d = await r.json();
  if (d?.error) throw new Error(d.error);
  return d;
}
async function acao(body: Record<string, any>) {
  const r = await fetch('/api/admin/precos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const d = await r.json();
  if (d?.error) throw new Error(d.error);
  return d;
}

function Etiqueta({ classe }: { classe: string }) {
  const c = CLASSES[classe] || CLASSES.outro;
  return <span title={c.explica} style={{ fontSize: 11, fontWeight: 700, color: c.cor, background: c.fundo, padding: '2px 8px', borderRadius: 999, whiteSpace: 'nowrap' }}>{c.rotulo}</span>;
}

// Linha do tempo de um produto (abre ao clicar no nome)
function LinhaDoTempo({ id }: { id: string }) {
  const [linhas, setLinhas] = useState<Linha[] | null>(null);
  useEffect(() => { api(`tipo=produto&id=${encodeURIComponent(id)}`).then(setLinhas).catch(() => setLinhas([])); }, [id]);
  if (!linhas) return <div style={{ fontSize: 13, color: '#6b7280', padding: '8px 0' }}>Carregando...</div>;
  const precos = linhas.map(l => Number(l.preco));
  return (
    <div style={{ background: '#f9fafb', borderRadius: 8, padding: 10, margin: '6px 0 4px', overflowX: 'auto' }}>
      <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 6 }}>
        {linhas.length} anotação(ões) · menor {brl(Math.min(...precos))} · maior {brl(Math.max(...precos))}
        {linhas[0]?.link && <> · <a href={linhas[0].link} target="_blank" rel="noopener noreferrer" style={{ color: '#5B3E96' }}>ver na loja ↗</a></>}
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead><tr style={{ textAlign: 'left', color: '#6b7280' }}><th>Data</th><th>Preço base</th><th>Preço pago</th><th>Desconto</th></tr></thead>
        <tbody>
          {linhas.map((l, i) => {
            const ant = i > 0 ? linhas[i - 1] : null;
            const corPor = !ant ? '#111827' : Number(l.preco) < Number(ant.preco) ? '#047857' : Number(l.preco) > Number(ant.preco) ? '#b91c1c' : '#111827';
            const corDe = !ant ? '#6b7280' : Number(l.preco_de || 0) > Number(ant.preco_de || 0) ? '#a16207' : '#6b7280';
            return (
              <tr key={i} style={{ borderTop: '1px solid #e5e7eb' }}>
                <td style={{ padding: '4px 6px 4px 0' }}>{quando(l.visto_em)}{i === 0 ? ' · 1ª vez' : ''}</td>
                <td style={{ color: corDe }}>{brl(l.preco_de)}</td>
                <td style={{ fontWeight: 700, color: corPor }}>{brl(l.preco)}</td>
                <td>{pct(l.preco_de, l.preco) ? `-${pct(l.preco_de, l.preco)}%` : ''}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// Um produto: nome clicável (linha do tempo) + valores + botões de decisão
function ItemProduto({ l, direita, flags, aoMudar }: { l: Linha; direita: React.ReactNode; flags: Flags; aoMudar: () => void }) {
  const [aberto, setAberto] = useState(false);
  const [ocupado, setOcupado] = useState(false);
  const f = flags[String(l.produto_id)];

  async function fazer(a: string) {
    setOcupado(true);
    try { await acao({ acao: a, id: l.produto_id }); aoMudar(); } catch (e: any) { alert(e.message || e); }
    setOcupado(false);
  }

  return (
    <div style={{ borderTop: '1px solid #f3f4f6', padding: '8px 0' }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <button onClick={() => setAberto(a => !a)} style={{ background: 'none', border: 0, padding: 0, cursor: 'pointer', textAlign: 'left', flex: 1, minWidth: 220 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>
            {aberto ? '▾' : '▸'} {l.nome || l.produto_id}
            {f?.conferido && <span style={{ marginLeft: 6, fontSize: 11, color: '#92400e', background: '#fef3c7', padding: '1px 7px', borderRadius: 999 }}>🏅 conferido</span>}
            {f?.ofertaDoDia && <span style={{ marginLeft: 6, fontSize: 11, color: '#b91c1c', background: '#fef2f2', padding: '1px 7px', borderRadius: 999 }}>🔥 na Oferta do Dia</span>}
          </div>
          <div style={{ fontSize: 12, color: '#6b7280' }}>{l.loja || 'loja ?'} · {quando(l.visto_em)}</div>
        </button>
        <div style={{ fontSize: 14 }}>{direita}</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {!f ? (
            <span style={{ fontSize: 11, color: '#9ca3af' }}>não está mais no site</span>
          ) : (
            <>
              <button disabled={ocupado} onClick={() => fazer(f.conferido ? 'desconferir' : 'conferir')} style={botao('#b45309', f.conferido)}>
                {f.conferido ? '🏅 Tirar selo' : '🏅 Dar selo'}
              </button>
              <button disabled={ocupado} onClick={() => fazer(f.ofertaDoDia ? 'tirar' : 'devolver')} style={botao('#dc2626', !f.ofertaDoDia)}>
                {f.ofertaDoDia ? 'Tirar da Oferta do Dia' : 'Pôr na Oferta do Dia'}
              </button>
            </>
          )}
        </div>
      </div>
      {aberto && <LinhaDoTempo id={l.produto_id} />}
    </div>
  );
}

function Lupometro() {
  const [resumo, setResumo] = useState<Linha | null>(null);
  const [lojas, setLojas] = useState<Linha[] | null>(null);
  const [classeSel, setClasseSel] = useState('');
  const [mudancas, setMudancas] = useState<Linha[] | null>(null);
  const [alertas, setAlertas] = useState<{ descontoFixo: Linha[]; menorPreco: Linha[] } | null>(null);
  const [busca, setBusca] = useState('');
  const [achados, setAchados] = useState<Linha[] | null>(null);
  const [flags, setFlags] = useState<Flags>({});
  const [erro, setErro] = useState('');

  async function carregarFlags(listas: (Linha[] | null | undefined)[]) {
    const ids = [...new Set(listas.flatMap(l => (l || []).map(x => String(x.produto_id))))];
    if (!ids.length) return;
    try { const f = await api(`tipo=flags&ids=${encodeURIComponent(ids.join(','))}`); setFlags(old => ({ ...old, ...f })); } catch {}
  }

  function carregarLojas() { api('tipo=lojas').then(setLojas).catch(() => setLojas([])); }
  function carregarMudancas(c = classeSel) {
    setMudancas(null);
    api(`tipo=mudancas${c ? `&classe=${c}` : ''}`).then(m => { setMudancas(m); carregarFlags([m]); }).catch(() => setMudancas([]));
  }

  useEffect(() => {
    api('tipo=resumo').then(setResumo).catch(e => setErro(String(e.message || e)));
    carregarLojas();
    carregarMudancas('');
    api('tipo=alertas').then(a => { setAlertas(a); carregarFlags([a.menorPreco]); })
      .catch(() => setAlertas({ descontoFixo: [], menorPreco: [] }));
  }, []); // eslint-disable-line

  async function buscar() {
    if (busca.trim().length < 2) return;
    setAchados(null);
    try { const a = await api(`tipo=busca&q=${encodeURIComponent(busca.trim())}`); setAchados(a); carregarFlags([a]); } catch { setAchados([]); }
  }

  // depois de um botão: relê a situação dos produtos que estão na tela
  const atualizarFlags = () => carregarFlags([mudancas, achados, alertas?.menorPreco]);

  async function alternarLoja(l: Linha) {
    try { await acao({ acao: l.conferida ? 'lojaNaoConferida' : 'lojaConferida', loja: l.loja }); carregarLojas(); }
    catch (e: any) { alert(e.message || e); }
  }

  const vazio = (txt: string) => <p style={{ fontSize: 13, color: '#9ca3af', margin: 0 }}>{txt}</p>;
  const RA: Record<string, string> = { GOOD: 'Boa', GREAT: 'Ótima', RA1000: 'RA1000' };

  return (
    <main style={{ maxWidth: 1060, margin: '0 auto', padding: '28px 16px 60px', fontFamily: 'system-ui', background: '#f9fafb', minHeight: '100vh' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 24, margin: 0, color: '#111827' }}>🔍 Lupômetro</h1>
          <p style={{ color: '#6b7280', fontSize: 14, margin: '4px 0 0' }}>Histórico de preços em reais: cada mudança comparada com a anterior. <b>Preço base</b> = o "de" (riscado); <b>preço pago</b> = o "por". Só você vê; quem decide é você.</p>
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

      {/* Legenda */}
      <section style={cartao}>
        <h2 style={titulo}>Como ler as mudanças</h2>
        <div style={{ display: 'grid', gap: 6 }}>
          {ORDEM_CLASSES.map(c => (
            <div key={c} style={{ fontSize: 13, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <Etiqueta classe={c} /> <span style={{ color: '#4b5563' }}>{CLASSES[c].explica}</span>
            </div>
          ))}
        </div>
        <p style={{ ...sub, margin: '10px 0 0' }}>
          🏅 <b>Selo dourado</b>: você dá no produto ou na loja quando o desconto é de verdade. Ele aparece na Oferta do Dia como "A Lupa conferiu".
          📉 <b>Caiu o preço</b> aparece sozinho na Oferta do Dia por 7 dias quando o preço pago cai e o preço base fica igual.
        </p>
      </section>

      {/* Lojas */}
      <section style={cartao}>
        <h2 style={titulo}>Lojas</h2>
        <p style={sub}>Padrão de cada loja ao longo do tempo. Muitas vezes "subiu só o preço base" é tática; um reajuste isolado é pontual.</p>
        {!lojas ? vazio('Carregando...') : !lojas.length ? vazio('Nada ainda.') : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ textAlign: 'left', color: '#6b7280' }}>
                  <th style={{ padding: '6px 6px 6px 0' }}>Loja</th><th>Produtos</th><th>Desconto (mín–máx)</th>
                  <th title="Caiu o preço">🟢</th><th title="Subiu só o preço base">🟡 base</th><th title="Reajuste">🟡 reaj.</th>
                  <th title="Subiu o preço">🔴</th><th title="Fim do desconto">⚪ fim</th><th>Reclame AQUI</th><th></th>
                </tr>
              </thead>
              <tbody>
                {lojas.map(l => (
                  <tr key={l.loja} style={{ borderTop: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '6px 6px 6px 0', fontWeight: 600 }}>
                      {l.loja}{l.modaDestaque ? ' ⭐' : ''}{l.conferida ? ' 🏅' : ''}
                    </td>
                    <td>{l.produtos}</td>
                    <td>{l.com_desconto ? `${l.desconto_min}%–${l.desconto_max}% (méd. ${l.desconto_medio}%)` : 'sem preço base'}</td>
                    <td>{l.classes.caiu || ''}</td>
                    <td>{l.classes.de_subiu || ''}</td>
                    <td>{l.classes.reajuste || ''}</td>
                    <td>{l.classes.subiu || ''}</td>
                    <td>{l.classes.fim_desconto || ''}</td>
                    <td style={{ fontSize: 12 }}>
                      {l.reclameAqui
                        ? <a href={l.reclameAqui.url} target="_blank" rel="noopener noreferrer" style={{ color: '#047857' }}>{l.reclameAqui.campea2025 ? '🏆 Campeã 2025' : RA[l.reclameAqui.reputacao] || l.reclameAqui.reputacao}</a>
                        : <span style={{ color: '#9ca3af' }}>{l.cadastrada ? 'sem dados' : 'nome diferente do cadastro'}</span>}
                    </td>
                    <td>
                      {l.cadastrada && (
                        <button onClick={() => alternarLoja(l)} style={botao('#b45309', l.conferida)}>
                          {l.conferida ? '🏅 Loja conferida' : '🏅 Conferir loja'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Mudanças */}
      <section style={cartao}>
        <h2 style={titulo}>Mudanças de preço</h2>
        <p style={sub}>Cada mudança comparada com a anotação anterior do mesmo produto, em reais.</p>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
          <button onClick={() => { setClasseSel(''); carregarMudancas(''); }} style={botao('#5B3E96', classeSel === '')}>Todas</button>
          {ORDEM_CLASSES.map(c => (
            <button key={c} onClick={() => { setClasseSel(c); carregarMudancas(c); }} style={botao(CLASSES[c].cor, classeSel === c)}>{CLASSES[c].rotulo}</button>
          ))}
        </div>
        {!mudancas ? vazio('Carregando...') : mudancas.length ? mudancas.map((l, i) => (
          <ItemProduto key={l.produto_id + i} l={l} flags={flags} aoMudar={atualizarFlags} direita={
            <span style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <Etiqueta classe={l.classe} />
              <span style={{ fontSize: 13 }}>
                base {brl(l.de_ant)} → <b>{brl(l.preco_de)}</b> · pago {brl(l.por_ant)} → <b>{brl(l.preco)}</b>
              </span>
            </span>
          } />
        )) : vazio('Nenhuma mudança ainda. Elas aparecem conforme os preços mudarem nos próximos dias.')}
      </section>

      {/* Busca */}
      <section style={cartao}>
        <h2 style={titulo}>Buscar produto</h2>
        <p style={sub}>Parte do nome ou da loja (ex.: "calvin polo", "zinco"). Clique no produto para ver a linha do tempo.</p>
        <div style={{ display: 'flex', gap: 8 }}>
          <input value={busca} onChange={e => setBusca(e.target.value)} onKeyDown={e => e.key === 'Enter' && buscar()}
            placeholder="Nome do produto ou loja" aria-label="Buscar produto"
            style={{ flex: 1, padding: '9px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14 }} />
          <button onClick={buscar} style={{ padding: '9px 20px', borderRadius: 8, border: 0, background: '#5B3E96', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Buscar</button>
        </div>
        {achados && (achados.length ? (
          <div style={{ marginTop: 10 }}>
            {achados.map(l => (
              <ItemProduto key={l.produto_id} l={l} flags={flags} aoMudar={atualizarFlags} direita={
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
        <h2 style={titulo}>Sinais para acompanhar</h2>
        <p style={sub}>Não são provas: só indicam onde olhar. O tempo confirma ou desmente.</p>
        {!alertas ? vazio('Carregando...') : (
          <>
            <h3 style={{ fontSize: 14, margin: '6px 0', color: '#a16207' }}>🟡 Loja com o mesmo desconto em tudo</h3>
            {alertas.descontoFixo.length ? alertas.descontoFixo.map(a => (
              <div key={a.loja} style={{ fontSize: 14, padding: '4px 0' }}>
                <b>{a.loja}</b>: {a.produtos} produtos, todos com -{a.desconto}%. Pode ser campanha (Black Friday) ou preço base calculado: veja se continua assim nas próximas semanas.
              </div>
            )) : vazio('Nenhuma loja assim por enquanto.')}

            <h3 style={{ fontSize: 14, margin: '16px 0 6px', color: '#047857' }}>🟢 Menor preço já visto</h3>
            {alertas.menorPreco.length ? alertas.menorPreco.map(l => (
              <ItemProduto key={l.produto_id} l={l} flags={flags} aoMudar={atualizarFlags} direita={
                <span>era até {brl(l.maximo)} · agora <b style={{ color: '#047857' }}>{brl(l.preco)}</b></span>
              } />
            )) : vazio('Nenhum ainda: aparece quando um preço cai abaixo de tudo o que já foi visto.')}
          </>
        )}
      </section>
    </main>
  );
}

export default function PrecosPage() {
  return <AdminGate titulo="Lupômetro"><Lupometro /></AdminGate>;
}

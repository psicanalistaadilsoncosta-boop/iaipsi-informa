'use client';
// app/temas/VitrineTematica.tsx
// Molde único das vitrines temáticas. O visual vem da ficha em temas.ts;
// os produtos vêm da função "carregar" que cada página passa.
//
// Formatos aceitos em "carregar":
//   1 nível  -> { tipo: produtos[] }                      (vista-se, beleza, mercado, filho, datas)
//   2 níveis -> { ambiente: { tipo: produtos[] } }        (monte-seu-ambiente, monte-seu-momento) — use a prop "niveis"

import { useEffect, useMemo, useRef, useState } from 'react';
import { Baloo_2 } from 'next/font/google';
import SeloLoja from '../SeloLoja';
import { TEMAS, FAIXAS_PRECO } from './temas';

const baloo = Baloo_2({ subsets: ['latin'], weight: ['700', '800'], display: 'swap' });

type Niveis = {
  ordem: string[];                  // ex: ['Sala','Quarto',...]
  emoji?: Record<string, string>;   // emoji de cada ambiente/momento
  ordemTipos?: string[];            // ex: ['Iluminação','Móveis',...]
  emojiTipos?: Record<string, string>;
  pergunta?: string;                // ex: 'Qual ambiente você quer montar?'
};

type Props = {
  temaId: keyof typeof TEMAS;
  carregar: () => Promise<any>;
  tiposOrdem?: string[];
  niveis?: Niveis;
  registrarLead?: (email: string, lista: any[]) => Promise<any>; // sem isso, usa /api/vista-se/lead
};

// página que explica a CNV (você vai criar o conteúdo)
const LINK_CNV = '/comunicacao-nao-violenta';
const MAX_LISTA = 10; // igual ao MAX_PRODUTOS de app/api/ambientes/enviar/route.ts
const MAX_CAMPO = 250;  // igual ao MAX_CAMPO de lib/ia-pedido.ts
const MAX_RELATO = 300; // igual ao MAX_RELATO de lib/ia-pedido.ts

// exemplos dos campos do pedido; cada ficha pode trocar (temas.ts → exemplos)
const EXEMPLOS_PADRAO = {
  dica: 'Combine o presente com quem vai dividir ou presentear junto: em quatro passos, do jeito da Comunicação Não Violenta. Todos os campos são opcionais.',
  para: 'Ex.: Amor / Vó Lúcia / Dinda',
  obs: 'Ex.: Olha o que eu vi com a ajuda da Lupa: o Pedro anda montando cidades de blocos com os amigos da escola…',
  sent: 'Ex.: …e eu fiquei animada com a ideia de dar algo que ele já curte.',
  nec: 'Ex.: Quero um presente que estimule a criatividade dele e caiba no nosso orçamento.',
  ped: 'Ex.: Você topa a gente dar o kit de montar? Avaliamos juntos o nosso orçamento, e o de pintura também é ótimo.',
  nome: 'Ex.: Ana',
  lista: 'Nossas opções de presente:',
};

const num = (v: any) => parseFloat(String(v ?? '').replace(',', '.')) || 0;
const brl = (v: number) => 'R$ ' + v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const chave = (p: any) => String(p.id || p.link || p.nome);
const unicos = (arr: any[]) => { const v = new Set<string>(); return arr.filter(p => (v.has(chave(p)) ? false : (v.add(chave(p)), true))); };

export default function VitrineTematica({ temaId, carregar, tiposOrdem, niveis, registrarLead }: Props) {
  const T = TEMAS[temaId];
  const FAIXAS = T.faixas || FAIXAS_PRECO;
  const [bruto, setBruto] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [nivel1, setNivel1] = useState<string | null>(null);
  const [filtro, setFiltro] = useState<string | null>(null);
  const [faixa, setFaixa] = useState<string | null>(null);
  const [qtd, setQtd] = useState(24);
  const [lista, setLista] = useState<any[]>([]);
  const [email, setEmail] = useState('');
  const [hp, setHp] = useState(''); // campo-armadilha: só robô preenche
  const [tsToken, setTsToken] = useState('');           // comprovante do Turnstile
  const tsBox = useRef<HTMLDivElement | null>(null);
  const tsId = useRef<string | null>(null);
  const TS_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '';
  const [emailsExtra, setEmailsExtra] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState('');
  const [cnv, setCnv] = useState({ para: '', obs: '', sent: '', nec: '', ped: '', nome: '' });
  const [copiado, setCopiado] = useState(false);
  const temMim = !!T.exemplos?.mim;
  const temJuntos = !T.exemplos || !!T.exemplos.juntos;
  const [modo, setModo] = useState<'juntos' | 'mim'>(temJuntos ? 'juntos' : 'mim');
  const EX = { ...EXEMPLOS_PADRAO, ...(T.exemplos?.[modo] || {}) };

  // ✨ Escrever com a Lupa (rascunho com IA, liberado por e-mail confirmado)
  const [ia, setIa] = useState({ aberto: false, etapa: 'email' as 'email' | 'codigo' | 'pronto', email: '', codigo: '', novidades: false, token: '', restantes: -1, relato: '', carregando: false, erro: '', aviso: '' });
  const CHAVE_TOKEN = 'comlupa:ia:token';
  useEffect(() => {
    if (!T.data) return;
    let token = '';
    try { token = localStorage.getItem(CHAVE_TOKEN) || ''; } catch {}
    if (!token) return;
    fetch(`/api/ia-pedido?token=${encodeURIComponent(token)}`).then(r => r.json()).then(d => {
      if (d.sessao) setIa(v => ({ ...v, token, etapa: 'pronto', restantes: d.restantes }));
      else { try { localStorage.removeItem(CHAVE_TOKEN); } catch {} }
    }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function iaPost(url: string, corpo: any) {
    setIa(v => ({ ...v, carregando: true, erro: '', aviso: '' }));
    try {
      const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(corpo) });
      const d = await r.json().catch(() => ({}));
      setIa(v => ({ ...v, carregando: false }));
      return { ok: r.ok, d };
    } catch {
      setIa(v => ({ ...v, carregando: false, erro: 'Sem conexão. Tente de novo.' }));
      return { ok: false, d: {} as any };
    }
  }
  async function iaPedirCodigo() {
    if (TS_KEY && !tsToken) { setIa(v => ({ ...v, erro: 'Aguarde a verificação de segurança terminar e tente de novo.' })); return; }
    const { ok, d } = await iaPost('/api/ia-pedido/codigo', { email: ia.email, site: hp, turnstile: tsToken });
    renovarTs();
    if (ok) setIa(v => ({ ...v, etapa: 'codigo', aviso: `Enviamos um código para ${v.email}. Confira também o spam.` }));
    else setIa(v => ({ ...v, erro: d.erro || 'Não foi possível enviar o código.' }));
  }
  async function iaConfirmar() {
    const { ok, d } = await iaPost('/api/ia-pedido/verificar', { email: ia.email, codigo: ia.codigo, novidades: ia.novidades });
    if (ok && d.token) {
      try { localStorage.setItem(CHAVE_TOKEN, d.token); } catch {}
      setIa(v => ({ ...v, token: d.token, etapa: 'pronto', restantes: d.restantes, codigo: '', aviso: 'E-mail confirmado!' }));
    } else setIa(v => ({ ...v, erro: d.erro || 'Código incorreto.' }));
  }
  async function iaGerar() {
    const { ok, d } = await iaPost('/api/ia-pedido', {
      token: ia.token, modo, tema: T.eyebrow, para: cnv.para, relato: ia.relato,
      itens: lista.map(p => p.nome || p.name),
    });
    if (ok && d.campos) {
      setCnv(c => ({ ...c, ...d.campos }));
      setIa(v => ({ ...v, restantes: d.restantes, aviso: 'Rascunho pronto nos campos abaixo. Ajuste do seu jeito.' }));
    } else {
      if (d.sessao === false) { try { localStorage.removeItem(CHAVE_TOKEN); } catch {} setIa(v => ({ ...v, token: '', etapa: 'email' })); }
      setIa(v => ({ ...v, erro: d.erro || 'Não foi possível gerar agora.', restantes: typeof d.restantes === 'number' ? d.restantes : v.restantes }));
    }
  }
  const CHAVE_LISTA = `comlupa:lista:${String(temaId)}`;

  // nas datas, a lista fica guardada no aparelho da pessoa (dá para voltar depois e continuar)
  useEffect(() => {
    if (!T.data) return;
    try { const s = localStorage.getItem(CHAVE_LISTA); if (s) setLista(JSON.parse(s).slice(0, MAX_LISTA)); } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (!T.data) return;
    try { localStorage.setItem(CHAVE_LISTA, JSON.stringify(lista)); } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lista]);

  useEffect(() => {
    carregar().then(d => { setBruto(d || {}); setLoading(false); }).catch(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2 níveis: lista de ambientes/momentos com produtos
  const opcoesNivel1 = useMemo(() => {
    if (!niveis) return [];
    return niveis.ordem
      .map(n => ({ nome: n, total: unicos(Object.values(bruto[n] || {}).flat() as any[]).length }))
      .filter(o => o.total > 0);
  }, [bruto, niveis]);

  const n1 = niveis ? (nivel1 ?? opcoesNivel1[0]?.nome ?? null) : null;
  const dados: Record<string, any[]> = niveis ? (n1 ? bruto[n1] || {} : {}) : bruto;

  // grupos: por tipo (abas) ou por faixa de preço (datas)
  const grupos = useMemo(() => {
    if (T.filtro === 'tipo') {
      const ordem = niveis?.ordemTipos || tiposOrdem;
      const nomes = ordem?.length ? ordem.filter(t => dados[t]?.length) : Object.keys(dados).filter(t => dados[t]?.length);
      return nomes.map(n => ({ nome: n, itens: dados[n] }));
    }
    const todos = unicos(Object.values(dados).flat());
    return FAIXAS.map(f => ({ nome: f.nome, itens: todos.filter(p => { const v = num(p.preco ?? p.price); return v >= f.min && v <= f.max; }) }))
      .filter(g => g.itens.length);
  }, [dados, T.filtro, tiposOrdem, niveis, FAIXAS]);

  const todosUnicos = useMemo(() => unicos(grupos.flatMap(g => g.itens)), [grupos]);

  // abas por tipo abrem na primeira (exceto em 2 níveis, que abrem em "Todos"); datas abrem em "Todos"
  const comTodos = T.filtro === 'preco' || !!niveis || !!T.todos;
  const ativo = filtro ?? (comTodos ? null : grupos[0]?.nome ?? null);
  const base = ativo ? grupos.find(g => g.nome === ativo)?.itens || [] : todosUnicos;
  const naFaixa = (p: any, nome: string) => {
    const f = FAIXAS.find(x => x.nome === nome)!;
    const v = num(p.preco ?? p.price);
    return v >= f.min && v <= f.max;
  };
  const produtos = T.filtro === 'tipo' && faixa ? base.filter(p => naFaixa(p, faixa)) : base;
  useEffect(() => { setQtd(24); }, [n1, filtro, faixa]);

  const naLista = (p: any) => lista.some(x => chave(x) === chave(p));
  const [cheia, setCheia] = useState(false);
  const alternar = (p: any) => {
    const jaTem = lista.some(x => chave(x) === chave(p));
    if (!jaTem && lista.length >= MAX_LISTA) {
      setCheia(true);
      setTimeout(() => setCheia(false), 4000);
      return;
    }
    setLista(prev => (prev.some(x => chave(x) === chave(p)) ? prev.filter(x => chave(x) !== chave(p)) : [...prev, p]));
  };
  const total = lista.reduce((s, p) => s + num(p.preco ?? p.price), 0);

  // só o texto do pedido (sem a lista), para o topo do e-mail
  const corpoPedido = () => {
    const l = (t: string) => t.trim();
    return [
      l(cnv.para) ? `${l(cnv.para)},` : '',
      [l(cnv.obs), l(cnv.sent)].filter(Boolean).join(' '),
      l(cnv.nec),
      l(cnv.ped),
      l(cnv.nome) ? `Com carinho, ${l(cnv.nome)}` : '',
    ].filter(Boolean).join('\n');
  };

  const textoPedido = () => {
    const l = (t: string) => t.trim();
    const corpo = [
      l(cnv.para) ? `${l(cnv.para)},` : '',
      [l(cnv.obs), l(cnv.sent)].filter(Boolean).join(' '),
      l(cnv.nec),
      l(cnv.ped),
    ].filter(Boolean).join('\n');
    const itens = lista.map(p => `• ${p.nome || p.name} — ${brl(num(p.preco ?? p.price))}\n  ${p.link}`).join('\n');
    return [
      corpo,
      `${corpo ? '\n' : ''}${EX.lista}\n${itens}`,
      l(cnv.nome) ? `\nCom carinho, ${l(cnv.nome)}` : '',
      '\n(vi com a ajuda da Lupa · comlupa.com.br)',
    ].filter(Boolean).join('\n');
  };

  async function copiarPedido() {
    const t = textoPedido();
    try { await navigator.clipboard.writeText(t); setCopiado(true); setTimeout(() => setCopiado(false), 2500); }
    catch { window.prompt('Copie o texto do pedido:', t); }
  }

  // Turnstile (Cloudflare): verificação contra robôs, carregada quando a lista abre
  useEffect(() => {
    if (!showModal || !TS_KEY) return;
    let vivo = true;
    const montar = () => {
      const w = (window as any).turnstile;
      if (!vivo || !w || !tsBox.current || tsId.current) return;
      tsId.current = w.render(tsBox.current, {
        sitekey: TS_KEY,
        callback: (t: string) => setTsToken(t),
        'expired-callback': () => setTsToken(''),
        'error-callback': () => setTsToken(''),
      });
    };
    const existente = document.getElementById('cf-turnstile');
    if ((window as any).turnstile) montar();
    else if (existente) existente.addEventListener('load', montar);
    else {
      const s = document.createElement('script');
      s.id = 'cf-turnstile';
      s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      s.async = true;
      s.onload = montar;
      document.head.appendChild(s);
    }
    return () => {
      vivo = false;
      const w = (window as any).turnstile;
      if (w && tsId.current) w.remove(tsId.current);
      tsId.current = null;
      setTsToken('');
    };
  }, [showModal, TS_KEY]);
  const renovarTs = () => {
    const w = (window as any).turnstile;
    if (w && tsId.current) w.reset(tsId.current);
    setTsToken('');
  };

  async function enviarLista() {
    if (TS_KEY && !tsToken) { setErro('Aguarde a verificação de segurança terminar e tente de novo.'); return; }
    if (!email.trim() || lista.length === 0) return;
    setEnviando(true); setErro('');
    try {
      if (registrarLead) await registrarLead(email, lista).catch(() => {});
      else await fetch('/api/vista-se/lead', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, tipo: T.leadTipo, itens: lista.map(p => p.nome || p.name) }),
      }).catch(() => {});
      const res = await fetch('/api/ambientes/enviar', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email, emailsExtra, site: hp, turnstile: tsToken,
          mensagem: T.data ? corpoPedido() : undefined,
          produtos: lista.map(p => ({
            nome: p.nome || p.name || '',
            preco: num(p.preco ?? p.price),
            precoOriginal: num(p.precoOriginal) || undefined,
            desconto: p.desconto || undefined,
            parcelas: p.parcelas || undefined,
            valorParcela: p.valorParcela || undefined,
            link: p.link || '',
            imagem: p.imagem || p.thumbnail || p.imageUrl || '',
            loja: p.loja || p.storeName || p.nomeLoja || '',
          })),
        }),
      });
      renovarTs();
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setErro(res.status < 500 && d.error
          ? d.error
          : 'Não foi possível enviar agora. Confira o e-mail, o limite de 4 cópias e de 10 produtos, e tente de novo.');
        return;
      }
      setEnviado(true);
    } catch {
      setErro('Não foi possível enviar agora. Confira sua conexão e tente de novo.');
    } finally {
      setEnviando(false);
    }
  }

  const vars = {
    '--t-bg': T.cores[0], '--t-1': T.cores[1], '--t-2': T.cores[2],
    '--t-3': T.cores[3], '--t-soft': T.cores[4], '--t-ink': T.cores[5],
  } as React.CSSProperties;
  const display = baloo.style.fontFamily;

  return (
    <div className="vt" style={vars}>
      <style>{CSS}</style>

      <div className="vt-faixa">{T.faixa}</div>

      <section className={`vt-banner${T.mascote ? ' com-mascote' : ''}`}>
        <div className="vt-deco a" aria-hidden="true">{T.deco[0]}</div>
        <div className="vt-deco b" aria-hidden="true">{T.deco[1]}</div>
        <div className="vt-banner-in">
          <div>
            <span className="vt-eyebrow">{T.eyebrow}</span>
            <h1 style={{ fontFamily: display }}>{T.titulo[0]}<em>{T.titulo[1]}</em>{T.titulo[2]}</h1>
            <p>{T.sub}</p>
            <div className="vt-acoes">
              <a className="vt-cta" href="#vt-produtos">{T.cta}</a>
              {T.data && (
                <details className="vt-como">
                  <summary>ⓘ Como funciona o pedido</summary>
                  <ol>
                    <li>Toque em <b>♡ Pedir</b> nos presentes de que gostar. Eles vão para a sua lista.</li>
                    <li>Ao abrir a lista, você pode escrever um pedido para a pessoa com quem vai compartilhar, em quatro passos, do jeito da <a href={LINK_CNV}>Comunicação Não Violenta</a>.</li>
                    <li>Se quiser, a Lupa escreve um rascunho com IA: são <b>5 por mês</b>, com confirmação por e-mail.</li>
                    <li>Prefere só mandar os links? Deixe os campos em branco e compartilhe a lista por WhatsApp ou e-mail.</li>
                  </ol>
                </details>
              )}
            </div>
          </div>
          {T.mascote ? (
            <img className="vt-mascote" src={T.mascote} alt="" aria-hidden="true" />
          ) : (
            <div className="vt-lupa" aria-hidden="true">
              <div className="aro" /><div className="cabo" />
              <div className="dentro">{T.emoji}</div>
              {T.chapeu && <div className="chapeu">{T.chapeu}</div>}
            </div>
          )}
        </div>
      </section>

      <main className="vt-main" id="vt-produtos">
        {niveis && opcoesNivel1.length > 0 && (
          <>
            {niveis.pergunta && <h2 className="vt-pergunta" style={{ fontFamily: display }}>{niveis.pergunta}</h2>}
            <div className="vt-chips vt-nivel1">
              {opcoesNivel1.map(o => (
                <button key={o.nome} type="button" className="vt-chip vt-chip-n1" aria-pressed={n1 === o.nome}
                  onClick={() => { setNivel1(o.nome); setFiltro(null); setFaixa(null); }}>
                  {niveis.emoji?.[o.nome] || ''} {o.nome} ({o.total})
                </button>
              ))}
            </div>
          </>
        )}

        <div className="vt-chips">
          {comTodos && grupos.length > 0 && (
            <button type="button" className="vt-chip" aria-pressed={!ativo} onClick={() => { setFiltro(null); setFaixa(null); }}>Todos</button>
          )}
          {grupos.map(g => (
            <button key={g.nome} type="button" className="vt-chip" aria-pressed={ativo === g.nome} onClick={() => { setFiltro(g.nome); setFaixa(null); }}>
              {niveis?.emojiTipos?.[g.nome] ? niveis.emojiTipos[g.nome] + ' ' : ''}{g.nome} ({unicos(g.itens).length})
            </button>
          ))}
        </div>

        {T.filtro === 'tipo' && base.length > 0 && (
          <div className="vt-chips vt-faixas">
            <span className="vt-faixas-rot">Preço:</span>
            <button type="button" className="vt-chip vt-chip-p" aria-pressed={!faixa} onClick={() => setFaixa(null)}>Todos</button>
            {FAIXAS.map(f => {
              const n = base.filter(p => naFaixa(p, f.nome)).length;
              return n ? (
                <button key={f.nome} type="button" className="vt-chip vt-chip-p" aria-pressed={faixa === f.nome} onClick={() => setFaixa(f.nome)}>
                  {f.nome} ({n})
                </button>
              ) : null;
            })}
          </div>
        )}

        <p className="vt-aviso">
          Preços, descontos, frete e disponibilidade são referenciais: valem as condições exibidas na loja no momento da compra.
          Lojas com 💵 ficam em outro país e a compra pode ter imposto de importação, que nem sempre aparece no carrinho. Saiba que os valores sofrem alteração de acordo com a variação cambial no Brasil.
        </p>

        {loading ? (
          <p className="vt-vazio">Carregando…</p>
        ) : produtos.length === 0 ? (
          <p className="vt-vazio">Nenhum produto nesta vitrine ainda.</p>
        ) : (
          <div className="vt-grade">
            {produtos.slice(0, qtd).map((p: any) => {
              const nome = p.nome || p.name || '';
              const preco = num(p.preco ?? p.price);
              const antigo = num(p.precoOriginal);
              const off = antigo > preco && preco > 0 ? Math.round((1 - preco / antigo) * 100) : 0;
              const img = p.imagem || p.thumbnail || p.imageUrl || '';
              const loja = p.lojaNome || p.loja || p.storeName || p.nomeLoja || '';
              const sel = naLista(p);
              return (
                <article key={chave(p)} className={`vt-card${sel ? ' sel' : ''}`}>
                  <div className="vt-foto">
                    {img ? <img src={img} alt={nome} loading="lazy" /> : <span aria-hidden="true">{T.emoji}</span>}
                    {off > 0 && <span className="vt-off">-{off}%</span>}
                  </div>
                  <div className="vt-info">
                    <div className="vt-loja">{loja}</div>
                    <SeloLoja loja={p.loja} compacto />
                    <div className="vt-nome">{nome.length > 70 ? nome.slice(0, 67) + '…' : nome}</div>
                    {(p.moedaUSD || p.moedaOriginal === 'USD') && <div className="vt-usd">💵 Preço convertido de USD</div>}
                    {antigo > preco && <div className="vt-antigo">{brl(antigo)}</div>}
                    {preco > 0 && <div className="vt-preco" style={{ fontFamily: display }}>{brl(preco)}</div>}
                    <div className="vt-acoes">
                      <a className="vt-ver" href={p.link} target="_blank" rel="noopener noreferrer sponsored">Ver na loja ↗</a>
                      <button type="button" className="vt-pedir" aria-pressed={sel} onClick={() => alternar(p)}>
                        {T.data ? (sel ? '✓ Pedido' : '♡ Pedir') : (sel ? '✓ Na lista' : '+ Lista')}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
        {!loading && produtos.length > qtd && (
          <div className="vt-mais">
            <button type="button" onClick={() => setQtd(q => q + 24)}>
              Ver mais produtos ({produtos.length - qtd} restantes)
            </button>
          </div>
        )}
      </main>

      {lista.length > 0 && (
        <div className="vt-flutua">
          <b>{T.data ? '♡' : '🛒'} {lista.length} de {MAX_LISTA} {lista.length === 1 ? 'item' : 'itens'}</b>
          {cheia && <span className="vt-cheia">Sua lista chegou a {MAX_LISTA} itens. Tire um para colocar outro.</span>}
          {total > 0 && <span>Total aprox.: {brl(total)}</span>}
          <button type="button" onClick={() => setShowModal(true)}>{T.data ? '💌 Ver minha lista de pedidos' : 'Receber links por e-mail'}</button>
        </div>
      )}

      {showModal && (
        <div className="vt-modal" role="dialog" aria-modal="true">
          <div className={`vt-modal-in${T.data ? ' largo' : ''}`}>
            {T.data && !enviado && (
              <div className="vt-pedido">
                <div style={{ fontSize: '2rem' }}>💌</div>
                <h2>Minha lista de pedidos</h2>
                <ul className="vt-itens">
                  {lista.map(p => (
                    <li key={chave(p)}>
                      {(p.imagem || p.thumbnail) ? <img src={p.imagem || p.thumbnail} alt="" /> : <span>{T.emoji}</span>}
                      <div><b>{p.nome || p.name}</b><small>{brl(num(p.preco ?? p.price))}</small></div>
                      <button type="button" onClick={() => alternar(p)} aria-label="Tirar da lista">✕</button>
                    </li>
                  ))}
                </ul>
                <div className="vt-total"><span>Total da lista</span><b>{brl(total)}</b></div>

                <h3>Escreva seu pedido</h3>
                {temMim && temJuntos && (
                  <div className="vt-modos" role="group" aria-label="Tipo de pedido">
                    <button type="button" aria-pressed={modo === 'mim'} onClick={() => setModo('mim')}>🎁 Pedir para mim</button>
                    <button type="button" aria-pressed={modo === 'juntos'} onClick={() => setModo('juntos')}>🤝 Presentear alguém juntos</button>
                  </div>
                )}
                <p className="vt-dica">{EX.dica} <a className="vt-link-cnv" href={LINK_CNV} target="_blank" rel="noopener">O que é a Comunicação Não Violenta? →</a></p>

                <div className="vt-ia">
                  {!ia.aberto ? (
                    <button type="button" className="vt-ia-abrir" onClick={() => setIa(v => ({ ...v, aberto: true }))}>
                      ✨ Escrever com a Lupa <small>a IA faz um rascunho dos 4 passos</small>
                    </button>
                  ) : ia.etapa === 'pronto' ? (
                    <>
                      <label className="vt-campo" htmlFor="ia-relato"><i>✨ Conte do seu jeito</i>em poucas palavras, o que você quer pedir ou combinar
                       <textarea id="ia-relato" value={ia.relato} maxLength={MAX_RELATO} onChange={e => setIa(v => ({ ...v, relato: e.target.value }))}
                          placeholder={modo === 'mim' ? 'Ex.: quero pedir pro meu marido aquele perfume, mas sem parecer cobrança' : 'Ex.: quero combinar com minha irmã um presente pra vó, ela adora cozinhar'} />
                        <small className="vt-conta">{ia.relato.length}/{MAX_RELATO}</small></label>
                      <button type="button" className="vt-ia-gerar" onClick={iaGerar} disabled={ia.carregando || ia.restantes === 0}>
                        {ia.carregando ? 'Escrevendo…' : '✨ Gerar rascunho'}
                      </button>
                      {ia.restantes >= 0 && <small className="vt-ia-info">{ia.restantes} de {5} rascunhos disponíveis neste mês. O texto que você escreve não fica guardado.</small>}
                    </>
                  ) : (
                    <>
                      <p className="vt-ia-txt">Para usar o rascunho com IA, confirme seu e-mail. Usamos o e-mail só para controlar o limite de uso (5 por mês); o texto que você escreve não fica guardado.</p>
                      {ia.etapa === 'email' ? (
                        <>
                          <input id="ia-email" type="email" placeholder="seu@email.com" value={ia.email} onChange={e => setIa(v => ({ ...v, email: e.target.value }))} />
                          <label className="vt-ia-check" htmlFor="ia-novidades">
                            <input id="ia-novidades" type="checkbox" checked={ia.novidades} onChange={e => setIa(v => ({ ...v, novidades: e.target.checked }))} />
                            Quero receber ofertas e novidades do Com a Lupa (opcional)
                          </label>
                          <button type="button" className="vt-ia-gerar" onClick={iaPedirCodigo} disabled={ia.carregando}>{ia.carregando ? 'Enviando…' : 'Enviar código'}</button>
                        </>
                      ) : (
                        <>
                          <input id="ia-codigo" inputMode="numeric" autoComplete="one-time-code" placeholder="Código de 6 números" value={ia.codigo} onChange={e => setIa(v => ({ ...v, codigo: e.target.value.replace(/\D/g, '').slice(0, 6) }))} />
                          <button type="button" className="vt-ia-gerar" onClick={iaConfirmar} disabled={ia.carregando || ia.codigo.length < 6}>{ia.carregando ? 'Confirmando…' : 'Confirmar'}</button>
                          <button type="button" className="vt-ia-voltar" onClick={() => setIa(v => ({ ...v, etapa: 'email', codigo: '', aviso: '' }))}>Trocar e-mail ou reenviar código</button>
                        </>
                      )}
                    </>
                  )}
                  {ia.aviso && <p className="vt-ia-ok">{ia.aviso}</p>}
                  {ia.erro && <p className="vt-ia-erro">{ia.erro}</p>}
                </div>
                               <label className="vt-campo" htmlFor="cnv-para"><i>Para</i>quem vai receber o pedido
                  <input id="cnv-para" value={cnv.para} maxLength={40} onChange={e => setCnv({ ...cnv, para: e.target.value })} placeholder={EX.para} /></label>
                <label className="vt-campo" htmlFor="cnv-obs"><i>1 · Observação</i>o que eu vejo ou ouço
                  <textarea id="cnv-obs" value={cnv.obs} maxLength={MAX_CAMPO} onChange={e => setCnv({ ...cnv, obs: e.target.value })} placeholder={EX.obs} />
                  <small className="vt-conta">{cnv.obs.length}/{MAX_CAMPO}</small></label>
                <label className="vt-campo" htmlFor="cnv-sent"><i>2 · Sentimento</i>como eu me sinto
                  <textarea id="cnv-sent" value={cnv.sent} maxLength={MAX_CAMPO} onChange={e => setCnv({ ...cnv, sent: e.target.value })} placeholder={EX.sent} />
                  <small className="vt-conta">{cnv.sent.length}/{MAX_CAMPO}</small></label>
                <label className="vt-campo" htmlFor="cnv-nec"><i>3 · Necessidade</i>do que eu preciso, e por quê
                  <textarea id="cnv-nec" value={cnv.nec} maxLength={MAX_CAMPO} onChange={e => setCnv({ ...cnv, nec: e.target.value })} placeholder={EX.nec} />
                  <small className="vt-conta">{cnv.nec.length}/{MAX_CAMPO}</small></label>
                <label className="vt-campo" htmlFor="cnv-ped"><i>4 · Pedido</i>de um jeito que dá para dizer sim ou não
                  <textarea id="cnv-ped" value={cnv.ped} maxLength={MAX_CAMPO} onChange={e => setCnv({ ...cnv, ped: e.target.value })} placeholder={EX.ped} />
                  <small className="vt-conta">{cnv.ped.length}/{MAX_CAMPO}</small></label>
                <label className="vt-campo" htmlFor="cnv-nome"><i>Assinatura</i>seu nome
                  <input id="cnv-nome" value={cnv.nome} maxLength={40} onChange={e => setCnv({ ...cnv, nome: e.target.value })} placeholder={EX.nome} /></label>

                <div className="vt-previa">{textoPedido()}</div>
                <div className="vt-botoes">
                  <a className="vt-zap" href={`https://wa.me/?text=${encodeURIComponent(textoPedido())}`} target="_blank" rel="noopener noreferrer">Enviar no WhatsApp</a>
                  <button type="button" className="vt-copiar" onClick={copiarPedido}>{copiado ? '✓ Copiado' : '📋 Copiar mensagem'}</button>
                </div>
                <hr />
                <p className="vt-dica" style={{ margin: 0 }}>Ou receba só os links por e-mail:</p>
              </div>
            )}
            {!enviado ? (
              <>
                {!T.data && <div style={{ fontSize: '2rem' }}>{T.emoji}</div>}
                {!T.data && <h2>Receber minha lista</h2>}
                {!T.data && <p>{lista.length} {lista.length === 1 ? 'item selecionado' : 'itens selecionados'}</p>}
               <input className="vt-hp" name="hp_campo" tabIndex={-1} autoComplete="off" aria-hidden="true" value={hp} onChange={e => setHp(e.target.value)} />
                <input id="vt-email" type="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} />
                <label htmlFor="vt-extra" className="vt-extra-rot">Enviar uma cópia para alguém? (opcional, até 4 e-mails)</label>
                <input id="vt-extra" type="text" placeholder="amigo@email.com, familia@email.com" value={emailsExtra} onChange={e => setEmailsExtra(e.target.value)} />
                {erro && <p className="vt-erro">{erro}</p>}
                <button type="button" className="vt-ok" onClick={enviarLista} disabled={enviando}>{enviando ? 'Enviando…' : 'Enviar links'}</button>
                <button type="button" className="vt-cancela" onClick={() => setShowModal(false)}>Cancelar</button>
              </>
            ) : (
              <>
                <div style={{ fontSize: '3rem' }}>✅</div>
                <h2>Enviado!</h2>
                <p>Verifique sua caixa de entrada.</p>
                <button type="button" className="vt-ok" onClick={() => { setShowModal(false); setEnviado(false); if (!T.data) setLista([]); setEmailsExtra(''); }}>Fechar</button>
              </>
            )}
                     <div ref={tsBox} className="vt-ts" />
          </div>
        </div>
      )}
    </div>
  );
}

const CSS = `
.vt{background:var(--t-bg);color:#2B2635;min-height:100vh;font-family:"Segoe UI",system-ui,-apple-system,Roboto,Arial,sans-serif}
.vt-faixa{background:var(--t-1);color:#fff;text-align:center;font-weight:800;font-size:13px;padding:9px 16px}
.vt-banner{position:relative;overflow:hidden;background:linear-gradient(120deg,var(--t-1),var(--t-2));color:#fff}
.vt-banner-in{max-width:1180px;margin:0 auto;padding:32px 16px 36px;display:grid;grid-template-columns:1.3fr .7fr;gap:24px;align-items:center;position:relative;z-index:1}
.vt-eyebrow{display:inline-block;background:rgba(255,255,255,.2);border:1px solid rgba(255,255,255,.35);border-radius:999px;padding:4px 12px;font-size:12px;font-weight:800;letter-spacing:.06em;text-transform:uppercase}
.vt-banner h1{font-weight:800;font-size:clamp(30px,5vw,50px);line-height:1.05;margin:12px 0 10px;text-wrap:balance}
.vt-banner h1 em{font-style:normal;color:var(--t-3)}
.vt-banner p{font-size:17px;max-width:46ch;margin:0 0 18px;opacity:.95}
.vt-cta{display:inline-block;background:var(--t-3);color:var(--t-ink);border-radius:999px;padding:12px 24px;font-weight:800;text-decoration:none;box-shadow:0 8px 20px rgba(0,0,0,.18);transition:transform .2s}
.vt-cta:hover{transform:translateY(-3px)}
.vt-acoes{display:flex;flex-wrap:wrap;align-items:flex-start;gap:12px}
.vt-como{flex-basis:100%;max-width:520px}
.vt-como summary{display:inline-block;cursor:pointer;list-style:none;background:rgba(255,255,255,.18);border:1.5px solid rgba(255,255,255,.6);color:#fff;border-radius:999px;padding:8px 16px;font-weight:700;font-size:14px}
.vt-como summary::-webkit-details-marker{display:none}
.vt-como[open] summary{background:#fff;color:#2B2635}
.vt-como ol{margin:10px 0 0;background:#fff;color:#2B2635;border-radius:14px;padding:14px 16px 14px 34px;font-size:14.5px;line-height:1.5;display:flex;flex-direction:column;gap:6px;box-shadow:0 8px 20px rgba(0,0,0,.15)}
.vt-como ol a{color:var(--t-1);font-weight:700}
.vt-lupa{justify-self:center;position:relative;width:min(200px,100%);aspect-ratio:1;display:grid;place-items:center}
.vt-lupa .aro{position:absolute;inset:6%;border-radius:50%;background:rgba(255,255,255,.18);border:10px solid rgba(255,255,255,.9)}
.vt-lupa .cabo{position:absolute;width:16%;height:40%;background:var(--t-ink);border-radius:20px;right:4%;bottom:-8%;transform:rotate(-45deg);transform-origin:top}
.vt-lupa .dentro{position:relative;font-size:clamp(60px,9vw,96px);animation:vtboia 3.5s ease-in-out infinite}
.vt-lupa .chapeu{position:absolute;top:-4%;left:8%;font-size:clamp(38px,5vw,58px);transform:rotate(-18deg)}
.vt-mascote{justify-self:center;width:auto;max-width:min(360px,100%);max-height:280px;height:auto;filter:drop-shadow(0 12px 18px rgba(0,0,0,.25));animation:vtmasc 4s ease-in-out infinite}
@keyframes vtmasc{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
.vt-deco{position:absolute;font-size:200px;opacity:.12;pointer-events:none}
.vt-deco.a{top:-50px;left:-40px;transform:rotate(-12deg)}
.vt-deco.b{bottom:-70px;right:28%;transform:rotate(14deg);font-size:170px}
@keyframes vtboia{0%,100%{transform:translateY(0) rotate(-4deg)}50%{transform:translateY(-10px) rotate(4deg)}}
.vt-main{max-width:1180px;margin:0 auto;padding:0 16px 120px}
.vt-pergunta{text-align:center;color:var(--t-ink);font-size:22px;margin:24px 0 0}
.vt-chips{display:flex;gap:8px;flex-wrap:wrap;justify-content:center;padding:22px 0 8px}
.vt-nivel1{padding-top:12px}
.vt-chip{border:2px solid var(--t-soft);background:#fff;color:var(--t-ink);border-radius:999px;padding:8px 16px;font-weight:700;font-size:14px;cursor:pointer}
.vt-chip[aria-pressed="true"]{background:var(--t-1);border-color:var(--t-1);color:#fff}
.vt-chip-n1{padding:11px 20px;font-size:15px;border-radius:14px}
.vt-faixas{padding-top:0}
.vt-faixas-rot{align-self:center;font-weight:800;font-size:13px;color:var(--t-ink)}
.vt-chip-p{padding:5px 12px;font-size:13px}
.vt-chip-p[aria-pressed="true"]{background:var(--t-2);border-color:var(--t-2)}
.vt-aviso{text-align:center;color:#6E6680;font-size:11px;max-width:760px;margin:4px auto 0}
.vt-mais{display:flex;justify-content:center;padding-top:26px}
.vt-mais button{border:2px solid var(--t-1);background:#fff;color:var(--t-1);border-radius:999px;padding:12px 28px;font-weight:800;font-size:15px;cursor:pointer}
.vt-mais button:hover{background:var(--t-1);color:#fff}
.vt-vazio{text-align:center;color:#9ca3af;padding:40px 0}
.vt-grade{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:18px;padding-top:20px}
.vt-card{background:#fff;border-radius:18px;overflow:hidden;display:flex;flex-direction:column;border:2px solid transparent;box-shadow:0 6px 22px rgba(43,38,53,.07);transition:transform .25s,border-color .25s}
.vt-card:hover{transform:translateY(-6px);border-color:var(--t-1)}
.vt-card.sel{border-color:var(--t-2)}
.vt-foto{position:relative;height:180px;overflow:hidden;display:grid;place-items:center;background:linear-gradient(135deg,var(--t-soft),#fff);font-size:64px}
.vt-foto img{position:absolute;inset:0;width:100%;height:100%;max-width:none;object-fit:contain;background:#fff}
.vt-off{position:absolute;z-index:1;top:10px;left:10px;background:var(--t-1);color:#fff;border-radius:999px;padding:3px 10px;font-size:12px;font-weight:800}
.vt-info{padding:12px 14px 14px;display:flex;flex-direction:column;gap:3px;flex:1;min-width:0}
.vt-loja{font-size:11px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:var(--t-2)}
.vt-nome{font-weight:700;font-size:14px;line-height:1.3;color:#2B2635;margin:2px 0}
.vt-usd{font-size:11px;color:#92400e;background:#fef3c7;padding:2px 6px;border-radius:4px;font-weight:700;align-self:flex-start}
.vt-antigo{font-size:12px;color:#6E6680;text-decoration:line-through;margin-top:4px}
.vt-preco{font-weight:800;font-size:22px;line-height:1.1;color:var(--t-1)}
.vt-acoes{margin-top:auto;padding-top:10px;display:flex;flex-direction:column;gap:7px}
.vt-ver{text-align:center;text-decoration:none;background:var(--t-1);color:#fff;border-radius:999px;padding:9px 12px;font-weight:800;font-size:13px}
.vt-pedir{border:2px solid var(--t-1);background:#fff;color:var(--t-1);border-radius:999px;padding:7px 12px;font-weight:800;font-size:13px;cursor:pointer}
.vt-pedir[aria-pressed="true"]{background:var(--t-2);border-color:var(--t-2);color:#fff}
.vt-flutua{position:fixed;right:16px;bottom:calc(16px + env(safe-area-inset-bottom,0px));z-index:100;background:var(--t-2);color:#fff;border-radius:16px;padding:14px 16px;box-shadow:0 6px 24px rgba(0,0,0,.25);display:flex;flex-direction:column;gap:6px;min-width:220px}
.vt-flutua span{font-size:13px;opacity:.9}
.vt-flutua .vt-cheia{opacity:1;background:#fff;color:var(--t-2);border-radius:8px;padding:6px 8px;font-weight:700}
.vt-flutua button{background:#fff;color:var(--t-2);border:0;border-radius:10px;padding:8px;font-weight:800;cursor:pointer}
.vt-modal{position:fixed;inset:0;background:rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;z-index:200;padding:16px}
.vt-modal-in{background:#fff;border-radius:18px;padding:28px;width:100%;max-width:420px;text-align:center}
.vt-modal-in h2{margin:6px 0;color:#1f2937}
.vt-modal-in p{color:#6b7280;font-size:14px}
.vt-modal-in input{width:100%;padding:12px;border-radius:10px;border:1px solid #d1d5db;font-size:16px;box-sizing:border-box;margin:6px 0 10px}
.vt-hp{position:absolute;left:-9999px;width:1px;height:1px;opacity:0;pointer-events:none}
.vt-extra-rot{display:block;text-align:left;font-size:13px;color:#6b7280;margin-top:4px}
.vt-erro{color:#b91c1c!important;font-weight:700}
.vt-ok{width:100%;padding:12px;background:var(--t-1);color:#fff;border:0;border-radius:10px;font-weight:800;cursor:pointer;font-size:15px;margin-bottom:6px}
.vt-ok:disabled{opacity:.6;cursor:wait}
.vt-ts{display:flex;justify-content:center;margin-top:12px}
.vt-cancela{background:none;border:0;color:#9ca3af;cursor:pointer}
.vt-modal-in{max-height:92vh;overflow-y:auto}
.vt-modal-in.largo{max-width:560px;text-align:left}
.vt-modal-in.largo > div:first-child, .vt-pedido > div:first-child{text-align:center}
.vt-pedido h2{text-align:center}
.vt-pedido h3{margin:18px 0 2px;color:var(--t-ink);font-size:17px}
.vt-dica{font-size:13px!important;color:#6b7280}
.vt-itens{list-style:none;margin:10px 0 0;padding:0;display:flex;flex-direction:column;gap:8px}
.vt-itens li{display:grid;grid-template-columns:48px 1fr auto;gap:10px;align-items:center;border:1px solid var(--t-soft);border-radius:12px;padding:6px 8px}
.vt-itens img,.vt-itens li > span{width:48px;height:48px;object-fit:contain;border-radius:8px;background:#fff;display:grid;place-items:center;font-size:26px}
.vt-itens b{display:block;font-size:13px;line-height:1.25}
.vt-itens small{color:var(--t-1);font-weight:800}
.vt-itens button{border:0;background:none;color:#9ca3af;font-size:16px;cursor:pointer;padding:4px 8px}
.vt-total{display:flex;justify-content:space-between;padding:10px 4px 0;font-size:14px}
.vt-campo{display:block;font-size:12px;color:#6b7280;margin-top:10px}
.vt-campo i{font-style:normal;display:inline-block;background:var(--t-1);color:#fff;border-radius:999px;padding:1px 9px;font-size:11px;font-weight:800;margin-right:6px;letter-spacing:.03em}
.vt-campo input,.vt-campo textarea{display:block;width:100%;box-sizing:border-box;margin-top:4px;border:2px solid var(--t-soft);border-radius:10px;padding:9px 11px;font:inherit;font-size:15px;color:#2B2635}
.vt-campo textarea{min-height:56px;resize:vertical}
.vt-conta{display:block;text-align:right;font-size:11px;color:#9a93a8;margin-top:2px}
.vt-campo input:focus,.vt-campo textarea:focus{outline:none;border-color:var(--t-1)}
.vt-previa{margin-top:14px;background:var(--t-soft);border-radius:12px;padding:12px 14px;font-size:13px;white-space:pre-wrap;word-break:break-word;color:var(--t-ink);max-height:220px;overflow-y:auto}
.vt-botoes{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}
.vt-zap{flex:1;text-align:center;background:#16A34A;color:#fff;border-radius:10px;padding:11px;font-weight:800;text-decoration:none}
.vt-copiar{flex:1;background:#fff;border:2px solid var(--t-2);color:var(--t-2);border-radius:10px;padding:9px;font-weight:800;cursor:pointer}
.vt-modos{display:flex;gap:6px;margin:12px 0 4px;background:var(--t-soft);border-radius:999px;padding:4px}
.vt-modos button{flex:1;border:0;background:transparent;border-radius:999px;padding:8px 6px;font-weight:800;font-size:13px;color:var(--t-ink);cursor:pointer}
.vt-modos button[aria-pressed="true"]{background:#fff;color:var(--t-1);box-shadow:0 2px 8px rgba(0,0,0,.08)}
.vt-link-cnv{color:var(--t-1);font-weight:800;text-decoration:none;white-space:nowrap}
.vt-ia{margin-top:12px;border:2px dashed var(--t-1);border-radius:14px;padding:12px;background:#fff;display:flex;flex-direction:column;gap:8px}
.vt-ia-abrir{border:0;background:linear-gradient(120deg,var(--t-1),var(--t-2));color:#fff;border-radius:12px;padding:12px;font-weight:800;font-size:15px;cursor:pointer;display:flex;flex-direction:column;gap:2px;align-items:center}
.vt-ia-abrir small{font-weight:600;font-size:12px;opacity:.9}
.vt-ia input[type=email],.vt-ia #ia-codigo{width:100%;box-sizing:border-box;border:2px solid var(--t-soft);border-radius:10px;padding:10px 12px;font-size:16px}
.vt-ia-gerar{border:0;background:var(--t-1);color:#fff;border-radius:10px;padding:11px;font-weight:800;cursor:pointer}
.vt-ia-gerar:disabled{opacity:.6;cursor:wait}
.vt-ia-voltar{border:0;background:none;color:#6b7280;font-size:12px;text-decoration:underline;cursor:pointer}
.vt-ia-txt,.vt-ia-info{font-size:12px!important;color:#6b7280;margin:0}
.vt-ia-check{display:flex;gap:8px;align-items:flex-start;font-size:13px;color:#374151}
.vt-ia-ok{margin:0;color:#047857!important;font-size:13px!important;font-weight:700}
.vt-ia-erro{margin:0;color:#b91c1c!important;font-size:13px!important;font-weight:700}
.vt-pedido hr{border:0;border-top:1px dashed var(--t-soft);margin:18px 0 10px}
@media (max-width:760px){
  .vt-banner-in{grid-template-columns:1fr;padding:22px 16px 26px}
  .vt-lupa{position:absolute;right:8px;top:6px;width:110px}
  .vt-banner h1{padding-right:96px}
  .vt-banner.com-mascote h1{padding-right:0}
  .vt-mascote{width:auto;max-width:80%;max-height:200px;margin:4px auto -12px}
  .vt-banner p{font-size:15px}
  .vt-grade{grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
  .vt-foto{height:130px}
  .vt-preco{font-size:19px}
  .vt-flutua{left:16px;right:16px;min-width:0}
}
@media (prefers-reduced-motion:reduce){.vt *{animation:none!important;transition:none!important}}
`;

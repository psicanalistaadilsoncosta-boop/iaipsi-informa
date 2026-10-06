'use client';
// app/lupa-me-ajuda/page.tsx — "Lupa, me ajuda?": 4 perguntas, 1 por tela; a Lupa sugere até 5 produtos com o porquê.

import { useEffect, useRef, useState } from 'react';
import { PERGUNTAS, Respostas, rotulo } from '@/lib/lupa-perguntas';

type Chave = keyof typeof PERGUNTAS;
const ORDEM: Chave[] = ['para', 'ocasiao', 'orcamento', 'valoriza'];
type Sugestao = { id: string; nome: string; preco: number; precoOriginal: number; imagem: string; link: string; loja: string; porque: string };

const brl = (v: number) => 'R$ ' + v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const linkIr = (s: Sugestao) =>
  `/ir?url=${encodeURIComponent(s.link)}&nome=${encodeURIComponent(s.nome)}&imagem=${encodeURIComponent(s.imagem)}` +
  `&loja=${encodeURIComponent(s.loja)}&de=${encodeURIComponent('/lupa-me-ajuda')}`;

export default function LupaMeAjuda() {
  const [passo, setPasso] = useState(0);
  const [resp, setResp] = useState<Partial<Respostas>>({});
  const [carregando, setCarregando] = useState(false);
  const [sugestoes, setSugestoes] = useState<Sugestao[] | null>(null);
  const [aviso, setAviso] = useState('');
  const [erro, setErro] = useState('');
  const [hp, setHp] = useState('');

  // Turnstile (Cloudflare) contra robôs
  const TS_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '';
  const [tsToken, setTsToken] = useState('');
  const tsBox = useRef<HTMLDivElement | null>(null);
  const tsId = useRef<string | null>(null);
  useEffect(() => {
    if (!TS_KEY) return;
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
    return () => { vivo = false; };
  }, [TS_KEY]);
  const renovarTs = () => {
    const w = (window as any).turnstile;
    if (w && tsId.current) w.reset(tsId.current);
    setTsToken('');
  };

  const chaveAtual = ORDEM[passo];
  const completo = ORDEM.every(k => resp[k]);

  // Link compartilhado (?r=mae-aniversario-ate100-beleza): já abre com as sugestões
  const [auto, setAuto] = useState(false);
  useEffect(() => {
    const r = new URLSearchParams(window.location.search).get('r') || '';
    const partes = r.split('-');
    if (partes.length !== ORDEM.length) return;
    const lidas: Partial<Respostas> = {};
    for (let i = 0; i < ORDEM.length; i++) {
      if (!(partes[i] in PERGUNTAS[ORDEM[i]].opcoes)) return;
      (lidas as any)[ORDEM[i]] = partes[i];
    }
    setResp(lidas);
    setPasso(ORDEM.length - 1);
    setAuto(true);
  }, []);
  // 1ª tentativa na hora, sem esperar a verificação: se o resultado já está guardado, aparece direto.
  // Se não estiver (passou de 12h), o servidor pede a verificação e tentamos de novo quando ela terminar.
  const [esperaTs, setEsperaTs] = useState(false);
  useEffect(() => {
    if (auto && completo && !carregando && !sugestoes) { setAuto(false); consultar(true); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auto, completo]);
  useEffect(() => {
    if (esperaTs && tsToken && !carregando) { setEsperaTs(false); consultar(); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [esperaTs, tsToken]);
  const codigoR = () => ORDEM.map(k => resp[k]).join('-');

  function escolher(k: Chave, v: string) {
    setResp(r => ({ ...r, [k]: v }));
    if (passo < ORDEM.length - 1) setPasso(p => p + 1);
  }

  async function consultar(semEsperar = false) {
    if (!completo) return;
    if (TS_KEY && !tsToken && !semEsperar) { setErro('Aguarde a verificação de segurança terminar (um instante) e tente de novo.'); return; }
    setCarregando(true); setErro(''); setAviso('');
    try {
      const r = await fetch('/api/lupa-me-ajuda', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ respostas: resp, turnstile: tsToken, site: hp }),
      });
      const d = await r.json();
      // link compartilhado sem resultado guardado: espera a verificação e tenta de novo, sem mostrar erro
      if (semEsperar && r.status === 403 && TS_KEY) { setEsperaTs(true); return; }
      if (tsToken) renovarTs();
      if (d.erro) { setErro(d.erro); return; }
      setSugestoes(d.sugestoes || []);
      setAviso(d.aviso || '');
      // deixa o endereço com as respostas (dá para copiar e mandar)
      try { window.history.replaceState(null, '', `/lupa-me-ajuda?r=${ORDEM.map(k => resp[k]).join('-')}`); } catch {}
    } catch {
      setErro('Sem conexão. Tente de novo.');
    } finally { setCarregando(false); }
  }

  function recomecar() {
    setResp({}); setPasso(0); setSugestoes(null); setAviso(''); setErro('');
    try { window.history.replaceState(null, '', '/lupa-me-ajuda'); } catch {}
  }

  // mensagem curta: um link só, que abre a página já com as sugestões (fotos, preços e o porquê)
  const textoZap = () => {
    const n = (sugestoes || []).length;
    const resumo = ORDEM.map(k => rotulo(k, resp[k] as string)).join(' · ');
    return `🔍 A Lupa me ajudou a escolher um presente\n${resumo}\n\nVeja ${n === 1 ? 'a sugestão' : `as ${n} sugestões`}: ${location.origin}/lupa-me-ajuda?r=${codigoR()}`;
  };

  return (
    <main className="lma">
      <style>{CSS}</style>
      <section className="lma-topo">
        <a href="/" className="lma-voltar">← Com a Lupa</a>
        <h1>🔍 Lupa, me ajuda?</h1>
        <p>Responda 4 perguntas e receba sugestões com o porquê de cada uma.</p>
      </section>

      <input className="lma-hp" name="hp_campo" tabIndex={-1} autoComplete="off" aria-hidden="true" value={hp} onChange={e => setHp(e.target.value)} />

      {!sugestoes && (
        <section className="lma-caixa">
          <div className="lma-passos" aria-label={`Pergunta ${passo + 1} de ${ORDEM.length}`}>
            {ORDEM.map((k, i) => (
              <button key={k} type="button" className={`lma-ponto${i === passo ? ' atual' : ''}${resp[k] ? ' feito' : ''}`}
                onClick={() => (i === 0 || resp[ORDEM[i - 1]]) && setPasso(i)} aria-label={PERGUNTAS[k].titulo} />
            ))}
          </div>
          <h2>{PERGUNTAS[chaveAtual].titulo}</h2>
          <div className="lma-opcoes">
            {Object.entries(PERGUNTAS[chaveAtual].opcoes).map(([v, txt]) => (
              <button key={v} type="button" className="lma-opcao" aria-pressed={resp[chaveAtual] === v} onClick={() => escolher(chaveAtual, v)}>
                {txt as string}
              </button>
            ))}
          </div>
          <div className="lma-rodape">
            {passo > 0 && <button type="button" className="lma-link" onClick={() => setPasso(p => p - 1)}>← Voltar</button>}
            {completo && (
              <button type="button" className="lma-ok" onClick={() => consultar()} disabled={carregando || esperaTs}>
                {carregando || esperaTs ? 'A Lupa está pensando…' : '✨ Ver sugestões'}
              </button>
            )}
          </div>
          {erro && <p className="lma-erro">{erro}</p>}
        </section>
      )}

      {sugestoes && (
        <section className="lma-res">
          <p className="lma-resumo">
            {ORDEM.map(k => (PERGUNTAS[k].opcoes as Record<string, string>)[resp[k] as string]).join(' · ')}
          </p>
          {aviso && <p className="lma-aviso">{aviso}</p>}
          {sugestoes.length === 0 ? (
            <p className="lma-vazio">Nada por aqui ainda. Que tal mudar a faixa de preço?</p>
          ) : (
            <div className="lma-grade">
              {sugestoes.map(s => (
                <article key={s.id} className="lma-card">
                  <div className="lma-foto">{s.imagem && <img src={s.imagem} alt={s.nome} loading="lazy" />}</div>
                  <div className="lma-info">
                    <div className="lma-loja">{s.loja}</div>
                    <div className="lma-nome">{s.nome.length > 80 ? s.nome.slice(0, 77) + '…' : s.nome}</div>
                    {s.porque && <p className="lma-porque">🔍 {s.porque}</p>}
                    {s.precoOriginal > s.preco && <div className="lma-antigo">{brl(s.precoOriginal)}</div>}
                    <div className="lma-preco">{brl(s.preco)}</div>
                    <a className="lma-ver" href={linkIr(s)} target="_blank" rel="noopener">Ver na loja ↗</a>
                  </div>
                </article>
              ))}
            </div>
          )}
          <div className="lma-acoes">
            {sugestoes.length > 0 && (
              <a className="lma-zap" href={`https://wa.me/?text=${encodeURIComponent(textoZap())}`} target="_blank" rel="noopener noreferrer">Mandar no WhatsApp</a>
            )}
            <button type="button" className="lma-ok" onClick={recomecar}>↺ Perguntar de novo</button>
          </div>
          <p className="lma-nota">Preços e disponibilidade são referenciais: valem as condições da loja no momento da compra.</p>
        </section>
      )}

      <div ref={tsBox} className="lma-ts" />
    </main>
  );
}

const CSS = `
.lma{min-height:100vh;background:#F7F4FB;color:#2B2635;font-family:"Segoe UI",system-ui,-apple-system,Roboto,Arial,sans-serif;padding:0 16px 60px}
.lma-topo{max-width:760px;margin:0 auto;padding:22px 0 8px;text-align:center}
.lma-voltar{display:inline-block;color:#5B3E96;font-weight:700;text-decoration:none;font-size:14px;margin-bottom:10px}
.lma-topo h1{font-size:clamp(28px,5vw,40px);margin:0 0 6px;color:#3B2468}
.lma-topo p{margin:0;color:#6E6680;font-size:16px}
.lma-hp{position:absolute;left:-9999px;width:1px;height:1px;opacity:0}
.lma-caixa{max-width:640px;margin:22px auto 0;background:#fff;border-radius:20px;padding:24px 20px;box-shadow:0 8px 28px rgba(59,36,104,.08);text-align:center}
.lma-passos{display:flex;gap:8px;justify-content:center;margin-bottom:14px}
.lma-ponto{width:34px;height:8px;border-radius:999px;border:0;background:#E7E0F3;cursor:pointer;padding:0}
.lma-ponto.feito{background:#B9A6DF}
.lma-ponto.atual{background:#5B3E96}
.lma-caixa h2{margin:4px 0 16px;font-size:22px;color:#3B2468}
.lma-opcoes{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px}
.lma-opcao{border:2px solid #E7E0F3;background:#fff;border-radius:14px;padding:14px 12px;font-size:16px;font-weight:700;color:#2B2635;cursor:pointer;transition:transform .15s,border-color .15s}
.lma-opcao:hover{transform:translateY(-2px);border-color:#5B3E96}
.lma-opcao[aria-pressed="true"]{border-color:#5B3E96;background:#F3EEFB;color:#3B2468}
.lma-rodape{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-top:18px;flex-wrap:wrap}
.lma-link{border:0;background:none;color:#6E6680;cursor:pointer;font-size:14px}
.lma-ok{margin-left:auto;border:0;background:#5B3E96;color:#fff;border-radius:999px;padding:12px 22px;font-weight:800;font-size:15px;cursor:pointer}
.lma-ok:disabled{opacity:.6;cursor:wait}
.lma-erro{color:#b91c1c;font-weight:700;font-size:14px;margin:12px 0 0}
.lma-res{max-width:1080px;margin:18px auto 0}
.lma-resumo{text-align:center;color:#5B3E96;font-weight:700;font-size:14px;margin:0 0 6px}
.lma-aviso{text-align:center;color:#92400e;background:#FEF3C7;border-radius:10px;padding:8px 12px;font-size:14px;max-width:640px;margin:6px auto}
.lma-vazio{text-align:center;color:#6E6680;padding:30px 0}
.lma-grade{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:16px;margin-top:14px}
.lma-card{background:#fff;border-radius:18px;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 6px 22px rgba(43,38,53,.07)}
.lma-foto{position:relative;height:170px;background:#fff}
.lma-foto img{position:absolute;inset:0;width:100%;height:100%;object-fit:contain}
.lma-info{padding:12px 14px 14px;display:flex;flex-direction:column;gap:4px;flex:1}
.lma-loja{font-size:11px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:#7B5BB8}
.lma-nome{font-weight:700;font-size:14px;line-height:1.3}
.lma-porque{margin:4px 0;font-size:13px;line-height:1.4;color:#3B2468;background:#F3EEFB;border-radius:10px;padding:8px 10px}
.lma-antigo{font-size:12px;color:#6E6680;text-decoration:line-through}
.lma-preco{font-weight:800;font-size:20px;color:#5B3E96}
.lma-ver{margin-top:auto;text-align:center;text-decoration:none;background:#5B3E96;color:#fff;border-radius:999px;padding:9px 12px;font-weight:800;font-size:13px}
.lma-acoes{display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:22px}
.lma-acoes .lma-ok{margin-left:0}
.lma-zap{background:#16A34A;color:#fff;border-radius:999px;padding:12px 22px;font-weight:800;text-decoration:none;font-size:15px}
.lma-nota{text-align:center;color:#9a93a8;font-size:11px;margin-top:14px}
.lma-ts{display:flex;justify-content:center;margin-top:18px}
@media (max-width:560px){.lma-grade{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.lma-foto{height:130px}.lma-opcoes{grid-template-columns:1fr 1fr}}
`;

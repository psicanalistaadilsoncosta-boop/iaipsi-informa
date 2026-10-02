'use client';
// app/comunicacao-nao-violenta/Cartelas.tsx
// Molde de leitura em cartelas: uma de cada vez (arrastar / setas) ou "página corrida".
// Todo o texto vai no HTML desde o servidor, então o Google lê tudo.

import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { Baloo_2 } from 'next/font/google';
import type { Bloco, Cartela, Fala, Passo } from './conteudo';

const baloo = Baloo_2({ subsets: ['latin'], weight: ['700', '800'], display: 'swap' });
const NOMES: Record<Passo, string> = { o: 'Observação', s: 'Sentimento', n: 'Necessidade', p: 'Pedido' };

// **negrito**
function Txt({ t }: { t: string }) {
  const partes = t.split(/\*\*(.+?)\*\*/g);
  return <>{partes.map((x, k) => (k % 2 ? <strong key={k}>{x}</strong> : <Fragment key={k}>{x}</Fragment>))}</>;
}

function FalaCores({ f }: { f: Fala }) {
  return (
    <p className="cc-fala">
      <span className="cc-o">{f.o}</span> <span className="cc-s">{f.s}</span> <span className="cc-n">{f.n}</span> <span className="cc-p">{f.p}</span>
    </p>
  );
}
const Legenda = () => (
  <div className="cc-legenda">{(['o', 's', 'n', 'p'] as Passo[]).map(k => <span key={k} className={`cc-leg-${k}`}>{NOMES[k].toLowerCase()}</span>)}</div>
);

function BlocoView({ b, cta }: { b: Bloco; cta: { texto: string; href: string } }) {
  if ('p' in b) return <p><Txt t={b.p} /></p>;
  if ('lista' in b) return <ul>{b.lista.map((x, k) => <li key={k}><Txt t={x} /></li>)}</ul>;
  if ('chips' in b) return <div className="cc-chips">{b.chips.map(x => <span key={x}>{x}</span>)}</div>;
  if ('nao' in b) return <p className="cc-nao">{b.nao}</p>;
  if ('sim' in b) return <p className="cc-sim">{b.sim}</p>;
  if ('nota' in b) return <p className="cc-nota"><Txt t={b.nota} /></p>;
  if ('duas' in b) return (
    <div className="cc-duas">
      <div><b>Evite</b><ul>{b.duas.evite.map(x => <li key={x}>{x}</li>)}</ul></div>
      <div><b>Prefira</b><ul>{b.duas.prefira.map(x => <li key={x}>{x}</li>)}</ul></div>
    </div>
  );
  if ('formula' in b) return (
    <div className="cc-formula">
      {(['o', 's', 'n', 'p'] as Passo[]).map((k, n) => (
        <div key={k} className={`cc-passo-${k}`}>
          {b.formula === 'numeros' ? <>{n + 1}<span>{NOMES[k]}</span></> : (k === 'o' ? 'FATO' : NOMES[k].toUpperCase())}
        </div>
      ))}
    </div>
  );
  if ('perguntas' in b) return <ol className="cc-perg">{b.perguntas.map(x => <li key={x}>{x}</li>)}</ol>;
  if ('fala' in b) return <><FalaCores f={b.fala} /><Legenda /></>;
  if ('onde' in b) return <div className="cc-onde">{b.onde.map(x => <div key={x.t}><h3>{x.t}</h3><p>{x.d}</p></div>)}</div>;
  if ('cta' in b) return (
    <div className="cc-convite">
      <p><Txt t={b.cta} /></p>
      <a className="cc-cta" href={cta.href}>{cta.texto} →</a>
    </div>
  );
  if ('assina' in b) return <p className="cc-assina">Texto de {b.assina}</p>;
  return null;
}

export default function Cartelas({ cartelas, cta, mascote }: {
  cartelas: Cartela[];
  cta: { texto: string; href: string };
  mascote?: string;
}) {
  const [i, setI] = useState(0);
  const [pagina, setPagina] = useState(false);
  const [viradas, setViradas] = useState<Record<number, boolean>>({});
  const refs = useRef<(HTMLElement | null)[]>([]);
  const capsRef = useRef<HTMLDivElement>(null);
  const toque = useRef<{ x: number; y: number } | null>(null);
  const total = cartelas.length;

  const caps = useMemo(() => {
    const v: { nome: string; inicio: number }[] = [];
    cartelas.forEach((c, k) => { if (!v.find(x => x.nome === c.cap)) v.push({ nome: c.cap, inicio: k }); });
    return v;
  }, [cartelas]);
  const capAtual = cartelas[i]?.cap;

  const ir = (n: number) => { setI(Math.max(0, Math.min(total - 1, n))); setViradas({}); };
  const virar = (k: number) => setViradas(v => ({ ...v, [k]: !v[k] }));

  useEffect(() => {
    try { if (localStorage.getItem('comlupa:cnv:modo') === 'pagina') setPagina(true); } catch {}
  }, []);
  useEffect(() => {
    try { localStorage.setItem('comlupa:cnv:modo', pagina ? 'pagina' : 'cartelas'); } catch {}
  }, [pagina]);

  useEffect(() => {
    const tecla = (e: KeyboardEvent) => {
      if (pagina) return;
      const alvo = e.target as HTMLElement;
      if (alvo && ['INPUT', 'TEXTAREA'].includes(alvo.tagName)) return;
      if (e.key === 'ArrowRight') ir(i + 1);
      if (e.key === 'ArrowLeft') ir(i - 1);
    };
    window.addEventListener('keydown', tecla);
    return () => window.removeEventListener('keydown', tecla);
  });

  // mantém o capítulo atual visível na faixa de capítulos
  useEffect(() => {
    const b = capsRef.current?.querySelector('.cc-cap-ativo') as HTMLElement | null;
    b?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, [capAtual]);

  const irCap = (inicio: number) => {
    if (pagina) refs.current[inicio]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    else ir(inicio);
  };

  const onDown = (e: React.PointerEvent) => { if (!pagina) toque.current = { x: e.clientX, y: e.clientY }; };
  const onUp = (e: React.PointerEvent) => {
    const t = toque.current; toque.current = null;
    if (!t) return;
    const dx = e.clientX - t.x, dy = e.clientY - t.y;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) ir(i + (dx < 0 ? 1 : -1));
    else if (Math.abs(dx) < 8 && Math.abs(dy) < 8 && cartelas[i].tipo === 'exemplo' && !(e.target as HTMLElement).closest('a,button')) virar(i);
  };

  return (
    <main className={`cc ${pagina ? 'cc-pagina' : ''}`} style={{ ['--f-titulo' as any]: baloo.style.fontFamily, ['--f-texto' as any]: 'system-ui, -apple-system, "Segoe UI", sans-serif' }}>
      <style>{CSS}</style>
      <div className="cc-palco">
        <div className="cc-topo">
          <div className="cc-marca">Com a <b>Lupa</b> · CNV</div>
          <div className="cc-modos" role="group" aria-label="Modo de leitura">
            <button type="button" aria-pressed={!pagina} onClick={() => setPagina(false)}>Cartelas</button>
            <button type="button" aria-pressed={pagina} onClick={() => setPagina(true)}>Página corrida</button>
          </div>
        </div>

        <nav className="cc-caps" ref={capsRef} aria-label="Capítulos">
          {caps.map(c => (
            <button key={c.nome} type="button" className={c.nome === capAtual ? 'cc-cap-ativo' : ''} onClick={() => irCap(c.inicio)}>{c.nome}</button>
          ))}
        </nav>

        <div className="cc-progresso">
          <span>{i + 1} / {total}</span>
          <div className="cc-barra"><i style={{ width: `${((i + 1) / total) * 100}%` }} /></div>
        </div>

        <div className="cc-maco" onPointerDown={onDown} onPointerUp={onUp} onPointerCancel={() => (toque.current = null)}>
          {cartelas.map((c, k) => {
            const estado = k === i ? 'cc-ativa' : k < i ? 'cc-foi' : '';
            const inicioCap = caps.find(x => x.inicio === k);
            const comum = { ref: (el: HTMLElement | null) => { refs.current[k] = el; }, 'aria-hidden': !pagina && k !== i, 'data-cap': inicioCap ? c.cap : undefined };

            if (c.tipo === 'capa') return (
              <article key={k} {...comum} className={`cc-carta cc-capa ${estado}`}>
                {mascote && <img src={mascote} alt="A Lupa, mascote do Com a Lupa" width={150} height={178} />}
                <h1>{c.titulo}</h1>
                <p className="cc-sub">{c.sub}</p>
                <p className="cc-dica">{c.dica}</p>
              </article>
            );

            if (c.tipo === 'exemplo') return (
              <article key={k} {...comum} className={`cc-carta cc-vira ${estado} ${viradas[k] ? 'cc-virada' : ''}`}>
                <div className="cc-vira-int">
                  <div className="cc-face cc-frente">
                    <span className="cc-selo cc-selo-comum">Forma comum</span>
                    <p className="cc-situacao">{c.situacao}</p>
                    <p className="cc-grito">{c.comum}</p>
                    <button type="button" className="cc-btn-virar" onClick={() => virar(k)}>Virar a cartela ↻</button>
                  </div>
                  <div className="cc-face cc-verso">
                    <span className="cc-selo cc-selo-cnv">{c.seloCnv || 'Com CNV'}</span>
                    <FalaCores f={c.cnv} />
                    {c.nota && <p className="cc-nota">{c.nota}</p>}
                    <Legenda />
                    <button type="button" className="cc-btn-virar" onClick={() => virar(k)}>Ver de novo ↺</button>
                  </div>
                </div>
              </article>
            );

            return (
              <article key={k} {...comum} className={`cc-carta ${c.passo ? `cc-passo cc-passo-${c.passo}` : ''} ${estado}`}>
                {c.selo && <span className="cc-selo cc-selo-cnv">{c.selo}</span>}
                <h2>{c.rotulo && <small>{c.rotulo}</small>}{c.titulo}</h2>
                {c.blocos.map((b, n) => <BlocoView key={n} b={b} cta={cta} />)}
                {c.pergunta && <p className="cc-pergunta">{c.pergunta}</p>}
              </article>
            );
          })}
        </div>

        <div className="cc-controles">
          <button type="button" className="cc-ant" onClick={() => ir(i - 1)} disabled={i === 0}>← Anterior</button>
          <button type="button" onClick={() => ir(i + 1)} disabled={i === total - 1}>Próxima →</button>
        </div>
        <p className="cc-atalho">No celular, arraste a cartela para o lado. No computador, use as setas do teclado.</p>
      </div>
    </main>
  );
}

const CSS = `
.cc{
  --fundo:#f3effa; --carta:#ffffff; --tinta:#2e1065; --texto:#3d3550; --suave:#7a7090; --linha:#e4dcf3;
  --roxo:#7c3aed; --roxo-claro:#ede4fe;
  --obs:#0e7490; --obs-bg:#dff4f8; --sent:#c0266d; --sent-bg:#fde6f0;
  --nec:#b45309; --nec-bg:#fdf0dc; --ped:#15803d; --ped-bg:#e0f5e7;
  --erro:#b91c1c; --sombra:rgba(46,16,101,.14);
  background:var(--fundo);color:var(--texto);font-family:var(--f-texto),system-ui,sans-serif;font-size:16px;line-height:1.55;
  padding:20px 16px 48px;min-height:100vh
}
.cc *{box-sizing:border-box}
.cc-palco{max-width:560px;margin:0 auto;display:flex;flex-direction:column;gap:16px}
.cc-topo{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}
.cc-marca{font-family:var(--f-titulo),sans-serif;font-weight:800;color:var(--tinta);font-size:15px}
.cc-marca b{color:var(--roxo)}
.cc-modos{display:flex;background:var(--carta);border:1px solid var(--linha);border-radius:99px;padding:3px}
.cc-modos button{border:0;background:none;font:700 13px var(--f-texto),sans-serif;color:var(--suave);padding:6px 12px;border-radius:99px;cursor:pointer}
.cc-modos button[aria-pressed="true"]{background:var(--roxo);color:#fff}
.cc-caps{display:flex;gap:6px;overflow-x:auto;padding-bottom:4px;scrollbar-width:none}
.cc-caps::-webkit-scrollbar{display:none}
.cc-caps button{flex:none;border:1px solid var(--linha);background:var(--carta);color:var(--texto);font:600 13px var(--f-texto),sans-serif;padding:5px 11px;border-radius:99px;cursor:pointer;white-space:nowrap}
.cc-caps button.cc-cap-ativo{border-color:var(--roxo);color:var(--roxo);background:var(--roxo-claro)}
.cc-progresso{display:flex;align-items:center;gap:10px;font-size:13px;color:var(--suave);font-variant-numeric:tabular-nums}
.cc-barra{flex:1;height:5px;background:var(--linha);border-radius:9px;overflow:hidden}
.cc-barra i{display:block;height:100%;background:var(--roxo);border-radius:9px;transition:width .3s}

.cc-maco{position:relative;display:grid;touch-action:pan-y;user-select:none;margin:4px 0 12px}
.cc-maco::before,.cc-maco::after{content:"";grid-area:1/1;background:var(--carta);border:1px solid var(--linha);border-radius:22px;box-shadow:0 6px 18px var(--sombra)}
.cc-maco::before{transform:rotate(-3deg) translate(-6px,8px)}
.cc-maco::after{transform:rotate(2deg) translate(5px,5px)}
.cc-carta{grid-area:1/1;position:relative;z-index:1;background:var(--carta);border:1px solid var(--linha);border-radius:22px;box-shadow:0 10px 28px var(--sombra);
  padding:28px 26px 26px;display:flex;flex-direction:column;gap:12px;min-height:460px;
  opacity:0;visibility:hidden;transform:translateY(14px) scale(.96) rotate(1.5deg);transition:transform .35s ease,opacity .25s ease,visibility 0s .35s}
.cc-carta.cc-ativa{opacity:1;visibility:visible;transform:none;transition:transform .35s ease,opacity .25s ease}
.cc-carta.cc-foi{transform:translateY(-14px) scale(.96) rotate(-2.5deg)}
.cc-carta h1,.cc-carta h2{font-family:var(--f-titulo),sans-serif;font-weight:800;color:var(--tinta);font-size:27px;line-height:1.12;margin:0;text-wrap:balance}
.cc-carta h3{font-family:var(--f-titulo),sans-serif;font-weight:700;color:var(--tinta);font-size:17px;margin:0}
.cc-carta p{margin:0}
.cc-carta ul,.cc-carta ol{margin:0;padding-left:20px;display:flex;flex-direction:column;gap:4px}
.cc-pergunta{margin-top:auto !important;font-family:var(--f-titulo),sans-serif;font-weight:700;font-size:18px;color:var(--roxo);border-top:1px dashed var(--linha);padding-top:12px}

.cc-passo-o{--c:var(--obs);--cb:var(--obs-bg)} .cc-passo-s{--c:var(--sent);--cb:var(--sent-bg)}
.cc-passo-n{--c:var(--nec);--cb:var(--nec-bg)} .cc-passo-p{--c:var(--ped);--cb:var(--ped-bg)}
.cc-carta.cc-passo{border-top:8px solid var(--c)}
.cc-carta h2 small{display:block;font-size:15px;font-weight:700;color:var(--c);letter-spacing:.06em;text-transform:uppercase}
.cc-chips{display:flex;flex-wrap:wrap;gap:6px}
.cc-chips span{background:var(--cb,var(--roxo-claro));color:var(--c,var(--roxo));font-weight:700;font-size:14px;padding:3px 10px;border-radius:99px}
.cc-nao,.cc-sim{border-radius:12px;padding:10px 12px;font-size:15.5px}
.cc-nao{background:var(--fundo);color:var(--suave);text-decoration:line-through;text-decoration-color:var(--erro)}
.cc-nao::before{content:"✗ ";color:var(--erro);display:inline-block;text-decoration:none}
.cc-sim{background:var(--cb,var(--ped-bg));color:var(--tinta);font-weight:600}
.cc-sim::before{content:"✓ ";color:var(--c,var(--ped))}
.cc-nota{font-size:14px;color:var(--suave);font-style:italic}
.cc-duas{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.cc-duas div{min-width:0}
.cc-duas b{display:block;font-size:12px;text-transform:uppercase;letter-spacing:.08em;color:var(--suave);margin-bottom:4px}

.cc-o,.cc-s,.cc-n,.cc-p{border-radius:4px;padding:0 2px;-webkit-box-decoration-break:clone;box-decoration-break:clone}
.cc-o{background:var(--obs-bg);box-shadow:inset 0 -2px var(--obs)} .cc-s{background:var(--sent-bg);box-shadow:inset 0 -2px var(--sent)}
.cc-n{background:var(--nec-bg);box-shadow:inset 0 -2px var(--nec)} .cc-p{background:var(--ped-bg);box-shadow:inset 0 -2px var(--ped)}
.cc-fala{font-size:17px;line-height:1.75;color:var(--tinta)}
.cc-legenda{display:flex;flex-wrap:wrap;gap:4px 12px;font-size:12px;color:var(--suave);margin-top:auto}
.cc-legenda span::before{content:"";display:inline-block;width:9px;height:9px;border-radius:3px;margin-right:5px;vertical-align:-1px}
.cc-leg-o::before{background:var(--obs)} .cc-leg-s::before{background:var(--sent)} .cc-leg-n::before{background:var(--nec)} .cc-leg-p::before{background:var(--ped)}

.cc-formula{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;text-align:center}
.cc-formula div{border-radius:12px;padding:10px 4px;background:var(--cb);color:var(--c);font:800 13px var(--f-titulo),sans-serif;min-width:0}
.cc-formula div span{display:block;font:600 12px var(--f-texto),sans-serif;color:var(--texto);margin-top:2px}
.cc-perg{font-weight:600;color:var(--tinta)}

.cc-carta.cc-vira{padding:0;border:0;background:none;box-shadow:none;perspective:1400px}
.cc-vira-int{display:grid;flex:1;transition:transform .55s cubic-bezier(.3,.7,.3,1);transform-style:preserve-3d}
.cc-virada .cc-vira-int{transform:rotateY(180deg)}
.cc-face{grid-area:1/1;backface-visibility:hidden;-webkit-backface-visibility:hidden;border:1px solid var(--linha);border-radius:22px;box-shadow:0 10px 28px var(--sombra);
  padding:28px 26px 22px;display:flex;flex-direction:column;gap:12px;background:var(--carta)}
.cc-verso{transform:rotateY(180deg)}
.cc-situacao{font-size:14.5px;color:var(--suave)}
.cc-grito{font-family:var(--f-titulo),sans-serif;font-weight:700;font-size:24px;line-height:1.25;color:var(--erro);margin:auto 0 !important;text-wrap:balance}
.cc-grito::before{content:"“"} .cc-grito::after{content:"”"}
.cc-selo{align-self:flex-start;font:800 11px var(--f-texto),sans-serif;letter-spacing:.1em;text-transform:uppercase;padding:3px 9px;border-radius:99px}
.cc-selo-comum{background:var(--fundo);color:var(--erro)} .cc-selo-cnv{background:var(--ped-bg);color:var(--ped)}
.cc-btn-virar{align-self:center;border:2px solid var(--roxo);background:var(--carta);color:var(--roxo);font:700 14px var(--f-texto),sans-serif;padding:8px 18px;border-radius:99px;cursor:pointer}

.cc-capa{align-items:center;text-align:center;justify-content:center}
.cc-capa img{width:150px;height:auto}
.cc-capa h1{font-size:32px}
.cc-sub{font-size:17px}
.cc-dica{font-size:13px;color:var(--suave)}
.cc-onde{display:grid;gap:10px}
.cc-onde div{background:var(--fundo);border-radius:12px;padding:10px 12px}
.cc-onde p{font-size:14px;color:var(--suave)}
.cc-assina{font-size:14px;color:var(--suave);border-top:1px solid var(--linha);padding-top:10px}
.cc-convite{margin:auto 0;display:flex;flex-direction:column;align-items:center;gap:12px;text-align:center}
.cc-convite p{font-family:var(--f-titulo),sans-serif;font-weight:700;font-size:19px;color:var(--tinta);text-wrap:balance}
.cc-cta{background:var(--roxo);color:#fff;font:800 16px var(--f-titulo),sans-serif;padding:10px 20px;border-radius:99px;text-decoration:none}

.cc-controles{display:flex;justify-content:space-between;gap:12px}
.cc-controles button{border:0;background:var(--tinta);color:#fff;font:700 15px var(--f-texto),sans-serif;padding:11px 20px;border-radius:99px;cursor:pointer;min-width:120px}
.cc-controles button:disabled{opacity:.3;cursor:default}
.cc-controles .cc-ant{background:var(--carta);color:var(--tinta);border:1px solid var(--linha)}
.cc-atalho{font-size:12px;color:var(--suave);text-align:center;margin:0}
.cc button:focus-visible,.cc a:focus-visible{outline:3px solid var(--roxo);outline-offset:2px}

/* página corrida */
.cc-pagina .cc-maco{display:flex;flex-direction:column;gap:18px}
.cc-pagina .cc-maco::before,.cc-pagina .cc-maco::after{display:none}
.cc-pagina .cc-carta{opacity:1;visibility:visible;transform:none;min-height:0;transition:none;scroll-margin-top:16px}
.cc-pagina .cc-carta.cc-vira{perspective:none}
.cc-pagina .cc-vira-int{transform:none !important;display:flex;flex-direction:column;gap:10px}
.cc-pagina .cc-face{backface-visibility:visible;transform:none}
.cc-pagina .cc-btn-virar,.cc-pagina .cc-controles,.cc-pagina .cc-progresso,.cc-pagina .cc-atalho{display:none}
.cc-pagina .cc-carta[data-cap]::before{content:attr(data-cap);font:800 22px var(--f-titulo),sans-serif;color:var(--roxo)}

@media (max-width:420px){
  .cc-carta,.cc-face{padding:22px 18px 20px}
  .cc-carta h1,.cc-carta h2{font-size:24px}
  .cc-duas{grid-template-columns:1fr}
  .cc-formula div{font-size:11px}
  .cc-grito{font-size:21px}
}
@media (prefers-reduced-motion:reduce){.cc-carta,.cc-vira-int,.cc-barra i{transition:none !important}}
`;

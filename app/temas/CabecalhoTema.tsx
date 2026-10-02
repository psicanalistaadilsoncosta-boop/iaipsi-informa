// app/temas/CabecalhoTema.tsx
// Cabeçalho temático (faixa + banner + aviso) para páginas que não usam o molde completo:
// ofertas-selecionadas, parcelado, oferta-do-dia, viagens... Funciona em página de servidor e de cliente.

import { Baloo_2 } from 'next/font/google';
import { TEMAS } from './temas';

const baloo = Baloo_2({ subsets: ['latin'], weight: ['700', '800'], display: 'swap' });

type Props = {
  temaId: keyof typeof TEMAS;
  aviso?: string;     // texto do aviso de preços/condições (opcional)
  voltar?: boolean;   // mostra "← Voltar ao site" (padrão: sim)
};

export default function CabecalhoTema({ temaId, aviso, voltar = true }: Props) {
  const T = TEMAS[temaId];
  const c = T.cores;
  const display = baloo.style.fontFamily;

  return (
    <div className="ct" style={{ ['--t-1' as any]: c[1], ['--t-2' as any]: c[2], ['--t-3' as any]: c[3], ['--t-soft' as any]: c[4], ['--t-ink' as any]: c[5] }}>
      <style>{CSS}</style>

      {voltar && <a href="/" className="ct-voltar">← Voltar ao site</a>}

      <div className="ct-caixa">
        <div className="ct-faixa">{T.faixa}</div>
        <section className={`ct-banner${T.mascote ? ' com-mascote' : ''}`}>
          <div className="ct-deco a" aria-hidden="true">{T.deco[0]}</div>
          <div className="ct-deco b" aria-hidden="true">{T.deco[1]}</div>
          <div className="ct-in">
            <div>
              <span className="ct-eyebrow">{T.eyebrow}</span>
              <h1 style={{ fontFamily: display }}>{T.titulo[0]}<em>{T.titulo[1]}</em>{T.titulo[2]}</h1>
              <p>{T.sub}</p>
              <a className="ct-cta" href="#ct-conteudo">{T.cta}</a>
            </div>
            {T.mascote ? (
              <img className="ct-mascote" src={T.mascote} alt="" aria-hidden="true" />
            ) : (
              <div className="ct-lupa" aria-hidden="true">
                <div className="aro" /><div className="cabo" />
                <div className="dentro">{T.emoji}</div>
                {T.chapeu && <div className="chapeu">{T.chapeu}</div>}
              </div>
            )}
          </div>
        </section>
      </div>

      {aviso && <p className="ct-aviso"><strong>Atenção:</strong> {aviso}</p>}
      <div id="ct-conteudo" />
    </div>
  );
}

const CSS = `
.ct{margin-bottom:24px;font-family:"Segoe UI",system-ui,-apple-system,Roboto,Arial,sans-serif}
.ct-voltar{display:inline-flex;gap:6px;color:var(--t-1);font-weight:700;font-size:.85rem;text-decoration:none;margin-bottom:14px}
.ct-caixa{border-radius:20px;overflow:hidden;box-shadow:0 8px 26px rgba(0,0,0,.12)}
.ct-faixa{background:var(--t-1);color:#fff;text-align:center;font-weight:800;font-size:13px;padding:8px 16px;border-bottom:1px solid rgba(255,255,255,.25)}
.ct-banner{position:relative;overflow:hidden;background:linear-gradient(120deg,var(--t-1),var(--t-2));color:#fff}
.ct-in{padding:28px 28px 30px;display:grid;grid-template-columns:1.4fr .6fr;gap:20px;align-items:center;position:relative;z-index:1}
.ct-eyebrow{display:inline-block;background:rgba(255,255,255,.2);border:1px solid rgba(255,255,255,.35);border-radius:999px;padding:4px 12px;font-size:12px;font-weight:800;letter-spacing:.06em;text-transform:uppercase}
.ct-banner h1{font-weight:800;font-size:clamp(28px,4.4vw,44px);line-height:1.05;margin:12px 0 10px;text-wrap:balance}
.ct-banner h1 em{font-style:normal;color:var(--t-3)}
.ct-banner p{font-size:16px;max-width:48ch;margin:0 0 16px;opacity:.95}
.ct-cta{display:inline-block;background:var(--t-3);color:var(--t-ink);border-radius:999px;padding:11px 22px;font-weight:800;text-decoration:none;box-shadow:0 8px 20px rgba(0,0,0,.18);transition:transform .2s}
.ct-cta:hover{transform:translateY(-3px)}
.ct-lupa{justify-self:center;position:relative;width:min(170px,100%);aspect-ratio:1;display:grid;place-items:center}
.ct-lupa .aro{position:absolute;inset:6%;border-radius:50%;background:rgba(255,255,255,.18);border:9px solid rgba(255,255,255,.9)}
.ct-lupa .cabo{position:absolute;width:16%;height:40%;background:var(--t-ink);border-radius:20px;right:4%;bottom:-8%;transform:rotate(-45deg);transform-origin:top}
.ct-lupa .dentro{position:relative;font-size:clamp(54px,8vw,84px);animation:ctboia 3.5s ease-in-out infinite}
.ct-lupa .chapeu{position:absolute;top:-4%;left:8%;font-size:clamp(34px,5vw,52px);transform:rotate(-18deg)}
.ct-mascote{justify-self:center;width:min(300px,100%);height:auto;filter:drop-shadow(0 12px 18px rgba(0,0,0,.25))}
.ct-deco{position:absolute;font-size:180px;opacity:.12;pointer-events:none}
.ct-deco.a{top:-50px;left:-40px;transform:rotate(-12deg)}
.ct-deco.b{bottom:-60px;right:26%;transform:rotate(14deg);font-size:150px}
@keyframes ctboia{0%,100%{transform:translateY(0) rotate(-4deg)}50%{transform:translateY(-8px) rotate(4deg)}}
.ct-aviso{margin:14px 0 0;background:var(--t-soft);border-radius:12px;padding:10px 16px;font-size:.8rem;line-height:1.5;color:var(--t-ink)}
@media (max-width:700px){
  .ct-in{grid-template-columns:1fr;padding:22px 18px 24px}
  .ct-lupa{position:absolute;right:6px;top:4px;width:96px}
  .ct-banner h1{padding-right:84px}
  .ct-banner.com-mascote h1{padding-right:0}
  .ct-mascote{width:min(230px,80%);margin:0 auto -10px}
  .ct-banner p{font-size:15px}
}
@media (prefers-reduced-motion:reduce){.ct *{animation:none!important;transition:none!important}}
`;

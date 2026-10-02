// app/temas/FaixaSazonal.tsx
// Faixa da data festiva da vez, no topo da home. Escolhe sozinha pelo CALENDARIO (temas.ts).
// Fora das datas do calendário, não aparece nada.

import { TEMAS, CALENDARIO } from './temas';

function hojeSP() {
  // data de hoje no fuso de São Paulo, no formato MM-DD, e o ano
  const p = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' })
    .formatToParts(new Date());
  const v = (t: string) => p.find(x => x.type === t)!.value;
  return { md: `${v('month')}-${v('day')}`, ano: +v('year'), mes: +v('month'), dia: +v('day') };
}

export default function FaixaSazonal() {
  const h = hojeSP();
  const ev = CALENDARIO.find(c => h.md >= c.de && h.md <= c.ate);
  if (!ev) return null;
  const T = TEMAS[ev.tema];

  const [mes, dia] = ev.ate.split('-').map(Number);
  const faltam = Math.round((Date.UTC(h.ano, mes - 1, dia) - Date.UTC(h.ano, h.mes - 1, h.dia)) / 86400000);
  const quando = faltam <= 0 ? 'É hoje!' : faltam === 1 ? 'Falta 1 dia' : `Faltam ${faltam} dias`;

  return (
    <a href={ev.href} className="fs" style={{ background: `linear-gradient(110deg, ${T.cores[1]}, ${T.cores[2]})` }}>
      <style>{CSS}</style>
            {ev.mascote
        ? <img className="fs-mascote" src={ev.mascote} alt="" aria-hidden="true" />
        : <span className="fs-emoji" aria-hidden="true">{T.chapeu || T.emoji}</span>}
      <span className="fs-txt">
        <span className="fs-quando" style={{ color: T.cores[5], background: T.cores[3] }}>{quando}</span>
        <strong>{T.eyebrow}: {T.titulo[0]}{T.titulo[1]}{T.titulo[2]}</strong>
        <span className="fs-sub">{ev.chamada}</span>
      </span>
      <span className="fs-btn" style={{ color: T.cores[5], background: T.cores[3] }}>{T.cta} →</span>
    </a>
  );
}

const CSS = `
.fs{display:flex;align-items:center;gap:16px;width:calc(100% - 24px);max-width:1180px;margin:12px auto;box-sizing:border-box;padding:14px 20px;border-radius:18px;color:#fff;text-decoration:none;box-shadow:0 8px 24px rgba(0,0,0,.12);position:relative;overflow:hidden;font-family:"Segoe UI",system-ui,-apple-system,Roboto,Arial,sans-serif}
.fs:hover{filter:brightness(1.05)}
.fs-emoji{font-size:44px;line-height:1;flex:none;animation:fsboia 3s ease-in-out infinite}
.fs-mascote{height:112px;width:auto;flex:none;margin:-8px 0 -16px;filter:drop-shadow(0 6px 10px rgba(0,0,0,.25))}
.fs-txt{display:flex;flex-direction:column;gap:3px;min-width:0;flex:1}
.fs-txt strong{font-size:20px;line-height:1.2}
.fs-sub{font-size:14px;opacity:.95}
.fs-quando{align-self:flex-start;font-size:11px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;border-radius:999px;padding:2px 10px}
.fs-btn{flex:none;font-weight:800;font-size:15px;border-radius:999px;padding:11px 20px;white-space:nowrap}
@keyframes fsboia{0%,100%{transform:translateY(0) rotate(-6deg)}50%{transform:translateY(-6px) rotate(6deg)}}
@media (max-width:700px){
  .fs{margin:10px auto;flex-wrap:wrap;gap:10px;padding:14px 16px}
   .fs-emoji{font-size:34px}
  .fs-mascote{height:84px;margin:-4px 0 -10px}
  .fs-txt strong{font-size:17px}
  .fs-btn{width:100%;text-align:center}
}
@media (prefers-reduced-motion:reduce){.fs-emoji{animation:none}}
`;

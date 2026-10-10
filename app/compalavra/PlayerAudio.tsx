'use client';
// app/compalavra/PlayerAudio.tsx — player "Ouça este artigo" (play/pausa, barra, tempo e velocidade)

import { useEffect, useRef, useState } from 'react';

const VELOCIDADES = [1, 1.25, 1.5, 0.85];
const mmss = (s: number) => {
  if (!isFinite(s) || s < 0) s = 0;
  const m = Math.floor(s / 60), r = Math.floor(s % 60);
  return `${m}:${String(r).padStart(2, '0')}`;
};

export default function PlayerAudio({ src, segundos }: { src: string; segundos?: number }) {
  const audio = useRef<HTMLAudioElement | null>(null);
  const [tocando, setTocando] = useState(false);
  const [atual, setAtual] = useState(0);
  const [total, setTotal] = useState(segundos || 0);
  const [vel, setVel] = useState(1);
  const [erro, setErro] = useState(false);

  useEffect(() => { if (audio.current) audio.current.playbackRate = vel; }, [vel]);

  function alternar() {
    const a = audio.current; if (!a) return;
    if (a.paused) a.play().catch(() => setErro(true)); else a.pause();
  }
  function trocarVel() { setVel(v => VELOCIDADES[(VELOCIDADES.indexOf(v) + 1) % VELOCIDADES.length]); }

  const pct = total ? Math.min(100, (atual / total) * 100) : 0;

  return (
    <div className="pa" role="region" aria-label="Ouça este artigo">
      <style>{CSS}</style>
      <audio ref={audio} src={src} preload="metadata"
        onPlay={() => setTocando(true)} onPause={() => setTocando(false)} onEnded={() => setTocando(false)}
        onLoadedMetadata={e => { const d = e.currentTarget.duration; if (isFinite(d) && d > 0) setTotal(d); }}
        onTimeUpdate={e => setAtual(e.currentTarget.currentTime)}
        onError={() => setErro(true)} />
      <button type="button" className="pa-play" onClick={alternar} aria-label={tocando ? 'Pausar' : 'Ouvir o artigo'}>
        {tocando ? '❚❚' : '▶'}
      </button>
      <div className="pa-meio">
        <div className="pa-topo">
          <span className="pa-rot">🎧 Ouça este artigo</span>
          <span className="pa-tempo">{atual > 0 ? `${mmss(atual)} / ` : ''}{mmss(total)}</span>
        </div>
        <input type="range" className="pa-barra" min={0} max={total || 0} step={1} value={Math.min(atual, total || 0)}
          aria-label="Posição do áudio" style={{ ['--pct' as any]: `${pct}%` }}
          onChange={e => { const a = audio.current; if (a) { a.currentTime = Number(e.target.value); setAtual(a.currentTime); } }} />
        {erro && <span className="pa-erro">Não foi possível carregar o áudio agora.</span>}
      </div>
      <button type="button" className="pa-vel" onClick={trocarVel} aria-label="Velocidade">
        {String(vel).replace('.', ',')}x
      </button>
    </div>
  );
}

const CSS = `
.pa{display:flex;align-items:center;gap:14px;background:#f0fdfa;border:1px solid #a7f3d0;border-radius:14px;padding:12px 14px;margin:0 0 28px}
.pa-play{flex-shrink:0;width:46px;height:46px;border-radius:50%;border:0;background:#0f766e;color:#fff;font-size:16px;cursor:pointer;display:grid;place-items:center}
.pa-play:hover{background:#115e59}
.pa-play:focus-visible,.pa-vel:focus-visible,.pa-barra:focus-visible{outline:3px solid #5eead4;outline-offset:2px}
.pa-meio{flex:1;min-width:0;display:flex;flex-direction:column;gap:6px}
.pa-topo{display:flex;justify-content:space-between;gap:8px;font-size:.8rem}
.pa-rot{font-weight:800;color:#065f46}
.pa-tempo{color:#047857;font-variant-numeric:tabular-nums}
.pa-barra{-webkit-appearance:none;appearance:none;width:100%;height:6px;border-radius:999px;cursor:pointer;
  background:linear-gradient(to right,#0f766e var(--pct),#ccfbf1 var(--pct))}
.pa-barra::-webkit-slider-thumb{-webkit-appearance:none;width:14px;height:14px;border-radius:50%;background:#0f766e;border:2px solid #fff}
.pa-barra::-moz-range-thumb{width:12px;height:12px;border-radius:50%;background:#0f766e;border:2px solid #fff}
.pa-vel{flex-shrink:0;border:1px solid #a7f3d0;background:#fff;color:#065f46;font-weight:800;border-radius:999px;padding:6px 10px;font-size:.8rem;cursor:pointer;min-width:52px}
.pa-erro{font-size:.75rem;color:#b91c1c}
`;

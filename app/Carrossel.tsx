'use client';

import { ReactNode, useCallback, useEffect, useRef, useState } from 'react';

interface CarrosselProps<T> {
  itens: T[];
  renderItem: (item: T, index: number) => ReactNode;
  slidesVisiveis?: { mobile?: number; tablet?: number; desktop?: number };
  gap?: number;
  autoplay?: number | null;
  mostrarDots?: boolean;
  mostrarSetas?: boolean;
  ariaLabel?: string;
  className?: string;
}

export default function Carrossel<T>({
  itens,
  renderItem,
  slidesVisiveis = { mobile: 1, tablet: 2, desktop: 3 },
  gap = 16,
  autoplay = null,
  mostrarDots = true,
  mostrarSetas = true,
  ariaLabel,
  className = '',
}: CarrosselProps<T>) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [paginaAtual, setPaginaAtual] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [pausado, setPausado] = useState(false);
  const [menosMovimento, setMenosMovimento] = useState(false);
  const retomar = useRef<ReturnType<typeof setTimeout> | null>(null);

  // quem pediu "reduzir movimento" no aparelho não recebe autoplay
  useEffect(() => {
    try {
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      setMenosMovimento(mq.matches);
      const ouvir = () => setMenosMovimento(mq.matches);
      mq.addEventListener?.('change', ouvir);
      return () => mq.removeEventListener?.('change', ouvir);
    } catch {}
  }, []);

  // no celular: pausa enquanto a pessoa toca/arrasta e volta a girar 5s depois
  const pausarToque = () => { if (retomar.current) clearTimeout(retomar.current); setPausado(true); };
  const retomarToque = () => {
    if (retomar.current) clearTimeout(retomar.current);
    retomar.current = setTimeout(() => setPausado(false), 5000);
  };
  useEffect(() => () => { if (retomar.current) clearTimeout(retomar.current); }, []);

  const passo = useCallback(() => {
    const el = trackRef.current;
    if (!el) return 0;
    const first = el.firstElementChild as HTMLElement | null;
    if (!first) return 0;
    return first.offsetWidth + gap;
  }, [gap]);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const update = () => {
      const p = passo();
      if (p === 0) return;
      const maxScroll = el.scrollWidth - el.clientWidth;
      const total = Math.max(1, Math.round(maxScroll / p) + 1);
      setTotalPaginas(total);
      setPaginaAtual(Math.min(total - 1, Math.max(0, Math.round(el.scrollLeft / p))));
    };
    update();
    window.addEventListener('resize', update);
    el.addEventListener('scroll', update, { passive: true });
    return () => {
      window.removeEventListener('resize', update);
      el.removeEventListener('scroll', update);
    };
  }, [passo, slidesVisiveis.mobile, slidesVisiveis.tablet, slidesVisiveis.desktop, itens.length]);

  const irPara = (idx: number) => {
    const el = trackRef.current;
    if (!el) return;
    const p = passo();
    if (p === 0) return;
    el.scrollTo({ left: idx * p, behavior: 'smooth' });
  };

  useEffect(() => {
    if (!autoplay || pausado || menosMovimento || itens.length <= 1) return;
    const el = trackRef.current;
    if (!el) return;
    const t = setInterval(() => {
      const p = passo();
      if (p === 0) return;
      const maxScroll = el.scrollWidth - el.clientWidth;
      let proximo = el.scrollLeft + p;
      if (proximo > maxScroll + 4) proximo = 0;
      el.scrollTo({ left: proximo, behavior: 'smooth' });
    }, autoplay);
    return () => clearInterval(t);
  }, [autoplay, pausado, menosMovimento, passo, itens.length]);

  const wrapperStyle: React.CSSProperties & Record<string, string> = {
    '--gap': `${gap}px`,
    '--pv-mobile': String(slidesVisiveis.mobile ?? 1),
    '--pv-tablet': String(slidesVisiveis.tablet ?? 2),
    '--pv-desktop': String(slidesVisiveis.desktop ?? 3),
  };

  return (
    <div
      className={`carrossel-wrap ${className}`}
      style={wrapperStyle}
      onMouseEnter={() => setPausado(true)}
      onMouseLeave={() => setPausado(false)}
      onTouchStart={pausarToque}
      onTouchEnd={retomarToque}
      onFocus={() => setPausado(true)}
      onBlur={() => setPausado(false)}
      role="region"
      aria-label={ariaLabel}
    >
      <style>{`
        .carrossel-wrap { position: relative; --pv: var(--pv-desktop, 3); }
        @media (max-width: 960px) { .carrossel-wrap { --pv: var(--pv-tablet, 2); } }
        @media (max-width: 640px) { .carrossel-wrap { --pv: var(--pv-mobile, 1); } }

        .carrossel-track {
          display: flex;
          align-items: stretch;
          overflow-x: auto;
          scroll-snap-type: x mandatory;
          scrollbar-width: none;
          -ms-overflow-style: none;
          overscroll-behavior-x: contain;
          padding: 6px;
          margin: -6px;
        }
        .carrossel-track::-webkit-scrollbar { display: none; }

        .carrossel-item {
          flex: 0 0 auto;
          scroll-snap-align: start;
          scroll-snap-stop: always;
          width: calc((100% - (var(--pv) - 1) * var(--gap)) / var(--pv));
          margin-right: var(--gap);
          display: flex;
        }
        .carrossel-item > * { width: 100%; }
        .carrossel-item:last-child { margin-right: 0; }

        .carrossel-seta {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 42px; height: 42px;
          border-radius: 50%;
          border: none;
          background: rgba(255,255,255,0.96);
          box-shadow: 0 2px 10px rgba(0,0,0,0.18);
          cursor: pointer;
          display: grid; place-items: center;
          font-size: 1.5rem; font-weight: 800; line-height: 1;
          color: #111827;
          z-index: 3;
          transition: transform .15s, box-shadow .15s, opacity .2s;
        }
        .carrossel-seta:hover:not([disabled]) { transform: translateY(-50%) scale(1.08); box-shadow: 0 4px 14px rgba(0,0,0,0.24); }
        .carrossel-seta[disabled] { opacity: 0; pointer-events: none; }
        .carrossel-seta.esq { left: -6px; }
        .carrossel-seta.dir { right: -6px; }

        .carrossel-dots {
          display: flex; justify-content: center; gap: 6px;
          margin-top: 14px;
        }
        .carrossel-dot {
          width: 8px; height: 8px; border-radius: 50%;
          border: none; background: #d1d5db; cursor: pointer; padding: 0;
          transition: background .2s, width .2s;
        }
        .carrossel-dot.ativo { background: #111827; width: 24px; border-radius: 4px; }

        @media (max-width: 640px) {
          .carrossel-seta { display: none; }
        }
      `}</style>

      {mostrarSetas && totalPaginas > 1 && (
        <>
          <button
            type="button"
            className="carrossel-seta esq"
            onClick={() => irPara(Math.max(0, paginaAtual - 1))}
            disabled={paginaAtual === 0}
            aria-label="Anterior"
          >‹</button>
          <button
            type="button"
            className="carrossel-seta dir"
            onClick={() => irPara(Math.min(totalPaginas - 1, paginaAtual + 1))}
            disabled={paginaAtual >= totalPaginas - 1}
            aria-label="Próximo"
          >›</button>
        </>
      )}

      <div className="carrossel-track" ref={trackRef}>
        {itens.map((item, i) => (
          <div className="carrossel-item" key={i}>
            {renderItem(item, i)}
          </div>
        ))}
      </div>

      {mostrarDots && totalPaginas > 1 && (
        <div className="carrossel-dots">
          {Array.from({ length: totalPaginas }).map((_, i) => (
            <button
              key={i}
              type="button"
              className={`carrossel-dot${i === paginaAtual ? ' ativo' : ''}`}
              onClick={() => irPara(i)}
              aria-label={`Ir para slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
'use client';

import { useState, useEffect } from 'react';

// Mascote animada: WebM transparente (Chrome/Android), WebP no Safari/iPhone,
// imagem parada para quem prefere menos movimento
export default function Mascote({ nome = 'lupa-apresenta', altura = 160 }: { nome?: string; altura?: number }) {
  const [modo, setModo] = useState<'video' | 'webp' | 'png'>('png');

  useEffect(() => {
    const semMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ua = navigator.userAgent;
    const ehSafari = /iPhone|iPad|iPod/.test(ua) || (/Safari/.test(ua) && !/Chrome|Chromium|Android/.test(ua));
    setModo(semMovimento ? 'png' : ehSafari ? 'webp' : 'video');
  }, []);

  const estilo: React.CSSProperties = { height: `${altura}px`, width: 'auto', display: 'block', pointerEvents: 'none' };

  if (modo === 'video') {
    return (
      <video
        src={`/mascote/${nome}.webm`}
        poster={`/mascote/${nome}.png`}
        autoPlay loop muted playsInline
        aria-hidden="true"
        style={estilo}
      />
    );
  }
  return <img src={`/mascote/${nome}.${modo}`} alt="" aria-hidden="true" style={estilo} />;
}
"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type MonitorBannerProps = {
  /** Lista de imagens ou GIFs que vão rodar no painel */
  imagens?: string[];
  /** Moldura do monitor (PNG com a tela transparente) */
  monitorSrc?: string;
  /** Tempo de troca em ms */
  intervalo?: number;
};

export default function MonitorBanner({
  imagens = ["/banner1.jpg", "/banner2.jpg", "/banner3.jpg"],
  monitorSrc = "/essemonitor.png",
  intervalo = 1000,
}: MonitorBannerProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (imagens.length < 2) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % imagens.length);
    }, intervalo);
    return () => clearInterval(id);
  }, [imagens.length, intervalo]);

  return (
    // ⚠️ Esse aspect-ratio DEVE ser o mesmo do monitor.png
    <div className="relative w-full max-w-4xl mx-auto aspect-[2.5/1]">
      {/* ===== 1. TELA (fica atrás da moldura) ===== */}
      <div className="absolute inset-0 z-0 overflow-hidden bg-black">
        {imagens.map((src, i) => (
          <Image
            key={src}
            src={src}
            alt={`Slide ${i + 1}`}
            fill
            sizes="(max-width: 1024px) 100vw, 80vw"
            priority={i === 0}
            className={`object-cover transition-opacity duration-1000 ${
              i === index ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}

        {/* Grid de LED (linhas horizontais bem finas) */}
        <div className="absolute inset-0 z-20 pointer-events-none bg-[linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[length:100%_3px]" />
        {/* Tint azulado típico de painel de LED */}
        <div className="absolute inset-0 z-20 pointer-events-none bg-cyan-500/5 mix-blend-color" />
        {/* Vinheta pra dar profundidade */}
        <div className="absolute inset-0 z-20 pointer-events-none shadow-[inset_0_0_80px_rgba(0,0,0,0.9)]" />
      </div>

      {/* ===== 2. MOLDURA (por cima, com a tela transparente) ===== */}
      <Image
        src={monitorSrc}
        alt="Moldura do monitor"
        fill
        priority
        className="object-contain z-10 pointer-events-none select-none drop-shadow-2xl"
      />

      {/* ===== 3. TEXTOS NEON ===== */}
      <div className="absolute inset-0 z-30 p-4 md:p-6 flex flex-col justify-between pointer-events-none bg-gradient-to-t from-black/60 via-transparent to-black/20">
        <span className="self-start text-cyan-400 font-mono text-[10px] tracking-widest bg-black/60 px-2 py-0.5 rounded border border-cyan-500/30 uppercase animate-pulse">
          ● LIVE NYC
        </span>

        <h2 className="text-white text-lg md:text-3xl font-black uppercase tracking-tight drop-shadow-[0_2px_8px_rgba(6,182,212,0.7)]">
          Sua Vitrine{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
            Digital
          </span>
        </h2>
      </div>
    </div>
  );
}
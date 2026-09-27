"use client";

import { useState, useEffect } from "react";
import "./banner-destaque.css";

type BannerTipo = "outdoor" | "destaque" | "compacto";
type BannerPosicao = "topo" | "meio" | "final";
type BannerAltura = "compacta" | "media" | "grande";

interface BannerSlide {
  imagem: string;
  imagemMobile?: string;
  titulo: string;
  texto?: string;
  etiqueta?: string;
  botao?: string;
  link?: string;
  novaAba?: boolean;
}

interface BannerDestaqueProps {
  tipo?: BannerTipo;
  posicao?: BannerPosicao;
  altura?: BannerAltura;
  overlay?: "forte" | "medio" | "leve";

  // Modo carrossel — array de slides
  slides?: BannerSlide[];
  intervalMs?: number; // padrão 5000ms

  // Modo simples — props diretas (retrocompatível)
  imagem?: string;
  imagemMobile?: string;
  titulo?: string;
  texto?: string;
  etiqueta?: string;
  botao?: string;
  link?: string;
  novaAba?: boolean;
}

export default function BannerDestaque({
  tipo = "outdoor",
  posicao = "meio",
  altura = "grande",
  overlay = "medio",
  slides,
  intervalMs = 5000,
  // props simples
  imagem,
  imagemMobile,
  titulo,
  texto,
  etiqueta = "DESTAQUE",
  botao,
  link,
  novaAba = false,
}: BannerDestaqueProps) {

  // Normaliza: modo simples vira array de 1 slide
  const lista: BannerSlide[] = slides && slides.length > 0
    ? slides
    : [{
        imagem: imagem || "",
        imagemMobile,
        titulo: titulo || "",
        texto,
        etiqueta,
        botao,
        link,
        novaAba,
      }];

  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (lista.length <= 1) return;
    const timer = setInterval(() => {
      avancar((prev) => (prev + 1) % lista.length);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [lista.length, intervalMs]);

  function avancar(fn: (prev: number) => number) {
    setAnimating(true);
    setTimeout(() => {
      setCurrent(fn);
      setAnimating(false);
    }, 350);
  }

  function irPara(index: number) {
    if (index === current) return;
    avancar(() => index);
  }

  const slide = lista[current];

  const classes = [
    "banner-destaque",
    `banner-tipo-${tipo}`,
    `banner-posicao-${posicao}`,
    `banner-altura-${altura}`,
    `banner-overlay-${overlay}`,
  ].join(" ");

  return (
    <section className={classes} aria-label={slide.titulo}>
      <div className="banner-painel">

        {/* IMAGEM DESKTOP */}
        <div
          className="banner-imagem banner-imagem-desktop"
          style={{
            backgroundImage: `url("${slide.imagem}")`,
            opacity: animating ? 0 : 1,
            transition: "opacity 0.35s ease",
          }}
        />

        {/* IMAGEM MOBILE */}
        {(slide.imagemMobile || slide.imagem) && (
          <div
            className="banner-imagem banner-imagem-mobile"
            style={{
              backgroundImage: `url("${slide.imagemMobile || slide.imagem}")`,
              opacity: animating ? 0 : 1,
              transition: "opacity 0.35s ease",
            }}
          />
        )}

        {/* OVERLAY */}
        <div className="banner-overlay" />

        {/* EFEITOS */}
        <div className="banner-brilho" />
        <div className="banner-scanlines" />

        {/* CONTEÚDO */}
        <div
          className="banner-conteudo"
          style={{
            opacity: animating ? 0 : 1,
            transform: animating ? "translateY(8px)" : "translateY(0)",
            transition: "opacity 0.35s ease, transform 0.35s ease",
          }}
        >
          {slide.etiqueta && (
            <span className="banner-etiqueta">{slide.etiqueta}</span>
          )}

          <h2>{slide.titulo}</h2>

          {slide.texto && (
            <p className="banner-texto">{slide.texto}</p>
          )}

          {slide.botao && (
            <span className="banner-botao">
              {slide.botao}
              <span className="banner-seta">→</span>
            </span>
          )}
        </div>

        {/* MOLDURA */}
        <div className="banner-moldura" />

        {/* LINK */}
        {slide.link && (
          <a
            href={slide.link}
            className="banner-link"
            target={slide.novaAba ? "_blank" : undefined}
            rel={slide.novaAba ? "noopener noreferrer" : undefined}
            aria-label={slide.titulo}
          />
        )}

        {/* DOTS */}
        {lista.length > 1 && (
          <div style={{
            position: "absolute",
            bottom: "20px",
            left: "55px",
            zIndex: 30,
            display: "flex",
            gap: "8px",
            alignItems: "center",
          }}>
            {lista.map((_, i) => (
              <button
                key={i}
                onClick={() => irPara(i)}
                aria-label={`Slide ${i + 1}`}
                style={{
                  width: i === current ? "24px" : "8px",
                  height: "8px",
                  borderRadius: "4px",
                  border: "none",
                  backgroundColor: i === current
                    ? "rgba(255,255,255,0.95)"
                    : "rgba(255,255,255,0.40)",
                  cursor: "pointer",
                  padding: 0,
                  transition: "width 0.3s ease, background-color 0.3s ease",
                }}
              />
            ))}
          </div>
        )}

      </div>
    </section>
  );
}

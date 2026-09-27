"use client";

import { useState, useEffect } from "react";
import "./banner-destaque.css";

type BannerTipo = "outdoor" | "destaque" | "compacto";
type BannerPosicao = "topo" | "meio" | "final";
type BannerAltura = "compacta" | "media" | "grande";

/** Slide editorial — imagem de fundo com texto sobreposto */
interface SlideEditorial {
  tipo: "editorial";
  imagem: string;
  imagemMobile?: string;
  etiqueta?: string;
  titulo: string;
  texto?: string;
  botao?: string;
  link?: string;
  novaAba?: boolean;
}

/** Slide de oferta — foto do produto + dados de preço */
interface SlideOferta {
  tipo: "oferta";
  imagem: string;
  nome: string;
  loja?: string;
  precoTipo: "valor" | "parcela";
  preco?: number;           // preço cheio (usado quando precoTipo=valor)
  valorParcela?: number;    // valor da parcela (usado quando precoTipo=parcela)
  textoParcelamento?: "confira" | "a partir de";
  link?: string;
  novaAba?: boolean;
}

export type BannerSlide = SlideEditorial | SlideOferta;

interface BannerDestaqueProps {
  tipo?: BannerTipo;
  posicao?: BannerPosicao;
  altura?: BannerAltura;
  overlay?: "forte" | "medio" | "leve";

  slides?: BannerSlide[];
  intervalMs?: number;

  // Retrocompatível — modo simples (uma imagem, um texto)
  imagem?: string;
  imagemMobile?: string;
  titulo?: string;
  texto?: string;
  etiqueta?: string;
  botao?: string;
  link?: string;
  novaAba?: boolean;
}

function formatarPreco(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function BannerDestaque({
  tipo = "outdoor",
  posicao = "meio",
  altura = "grande",
  overlay = "medio",
  slides,
  intervalMs = 5000,
  imagem,
  imagemMobile,
  titulo,
  texto,
  etiqueta = "DESTAQUE",
  botao,
  link,
  novaAba = false,
}: BannerDestaqueProps) {

  // Normaliza modo simples → array de 1 slide editorial
  const lista: BannerSlide[] = slides && slides.length > 0
    ? slides
    : [{
        tipo: "editorial",
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

  // ── Slide de oferta ────────────────────────────────────────────────────────
  if (slide.tipo === "oferta") {
    const s = slide as SlideOferta;

       let textoPreco: string;
    if (s.precoTipo === "valor" && s.preco != null) {
      textoPreco = formatarPreco(s.preco);
    } else if (s.precoTipo === "parcela") {
      if (s.textoParcelamento === "confira") {
        textoPreco = "Confira";
      } else if (s.valorParcela != null) {
        textoPreco = `Parcelas a partir de ${formatarPreco(s.valorParcela)}`;
      } else {
        textoPreco = "Parcelas a partir de";
      }
    } else {
      textoPreco = "Ver oferta";
    }

    return (
      <section className={classes} aria-label={s.nome}>
        <div className="banner-painel banner-painel-oferta">

          {/* Imagem do produto — destaque visual */}
          <div
            className="banner-oferta-imagem"
            style={{
              opacity: animating ? 0 : 1,
              transition: "opacity 0.35s ease",
            }}
          >
            {s.imagem && (
              <img
                src={s.imagem}
                alt={s.nome}
                className="banner-oferta-img"
              />
            )}
          </div>

          {/* Overlay lateral para leitura */}
          <div className="banner-overlay banner-overlay-oferta" />

          {/* Efeitos visuais */}
          <div className="banner-brilho" />
          <div className="banner-scanlines" />

          {/* Conteúdo da oferta */}
          <div
            className="banner-conteudo banner-conteudo-oferta"
            style={{
              opacity: animating ? 0 : 1,
              transform: animating ? "translateY(8px)" : "translateY(0)",
              transition: "opacity 0.35s ease, transform 0.35s ease",
            }}
          >
            <span className="banner-etiqueta banner-etiqueta-oferta">
              🏷️ OFERTA
            </span>

            {s.loja && (
              <span className="banner-loja">{s.loja}</span>
            )}

            <h2 className="banner-oferta-nome">{s.nome}</h2>

            <div className="banner-oferta-preco">
              {s.precoTipo === "valor" && s.preco != null ? (
                <>
                  <span className="banner-preco-por">por apenas</span>
                  <span className="banner-preco-valor">{formatarPreco(s.preco)}</span>
                </>
              ) : (
                <span className="banner-preco-parcela">{textoPreco}</span>
              )}
            </div>

            <span className="banner-botao banner-botao-oferta">
              Ver oferta
              <span className="banner-seta">→</span>
            </span>
          </div>

          {/* Moldura */}
          <div className="banner-moldura" />

          {/* Link */}
          {s.link && (
            <a
              href={s.link}
              className="banner-link"
              target={s.novaAba ? "_blank" : undefined}
              rel={s.novaAba ? "noopener noreferrer" : undefined}
              aria-label={s.nome}
            />
          )}

                    {/* Dots de navegação */}
          {lista.length > 1 && (
            <Dots lista={lista} current={current} irPara={irPara} />
          )}

          <span className="banner-aviso">* Condições sujeitas a alteração</span>
        </div>
      </section>
    );
  }

  // ── Slide editorial (padrão) ───────────────────────────────────────────────
  const s = slide as SlideEditorial;

  return (
    <section className={classes} aria-label={s.titulo}>
      <div className="banner-painel">

        {/* IMAGEM DESKTOP */}
        <div
          className="banner-imagem banner-imagem-desktop"
          style={{
            backgroundImage: `url("${s.imagem}")`,
            opacity: animating ? 0 : 1,
            transition: "opacity 0.35s ease",
          }}
        />

        {/* IMAGEM MOBILE */}
        {(s.imagemMobile || s.imagem) && (
          <div
            className="banner-imagem banner-imagem-mobile"
            style={{
              backgroundImage: `url("${s.imagemMobile || s.imagem}")`,
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
          {s.etiqueta && (
            <span className="banner-etiqueta">{s.etiqueta}</span>
          )}

          <h2>{s.titulo}</h2>

          {s.texto && (
            <p className="banner-texto">{s.texto}</p>
          )}

          {s.botao && (
            <span className="banner-botao">
              {s.botao}
              <span className="banner-seta">→</span>
            </span>
          )}
        </div>

        {/* MOLDURA */}
        <div className="banner-moldura" />

        {/* LINK */}
        {s.link && (
          <a
            href={s.link}
            className="banner-link"
            target={s.novaAba ? "_blank" : undefined}
            rel={s.novaAba ? "noopener noreferrer" : undefined}
            aria-label={s.titulo}
          />
        )}

        {/* DOTS */}
        {lista.length > 1 && (
          <Dots lista={lista} current={current} irPara={irPara} />
        )}

      </div>
    </section>
  );
}

// ── Componente de dots compartilhado ──────────────────────────────────────────
function Dots({ lista, current, irPara }: {
  lista: BannerSlide[];
  current: number;
  irPara: (i: number) => void;
}) {
  return (
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
  );
}

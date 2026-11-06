import Image from "next/image";
import type { Dictionary } from "@/i18n/dictionaries/pt";
import { ArrowIcon, CheckIcon } from "../icons";

export function Hero({ t }: { t: Dictionary["hero"] }) {
  return (
    <section className="hero" id="inicio">
      <div className="hero-media">
        <Image
          src="/images/clara-limpezas.jpg"
          alt={t.imageAlt}
          fill
          sizes="100vw"
          preload
        />
        <div className="hero-chip">
          <span className="dot" />
          <span>{t.chip}</span>
        </div>
      </div>
      <div className="hero-fade" aria-hidden="true" />
      <div className="wrap hero-inner">
        <p className="eyebrow">{t.eyebrow}</p>
        <h1 className="head">
          {t.title.lead}
          <br />
          <em>{t.title.highlight}</em>
        </h1>
        <p className="hero-intro">{t.intro}</p>
        <div className="hero-ctas">
          <a className="btn btn-solid" href="#contacto">
            <span>{t.cta}</span>
            <ArrowIcon />
          </a>
          <a className="btn btn-ghost" href="#servicos">
            {t.services}
          </a>
        </div>
        <p className="hero-note">
          <CheckIcon />
          <span>{t.note}</span>
        </p>
      </div>
    </section>
  );
}

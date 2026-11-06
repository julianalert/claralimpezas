import Image from "next/image";
import type { Dictionary } from "@/i18n/dictionaries/pt";
import { ArrowIcon, CheckIcon } from "../icons";

export function Hero({ t }: { t: Dictionary["hero"] }) {
  return (
    <section className="hero" id="inicio">
      <div className="hero-media">
        <Image src="/images/clara-limpezas.jpg" alt={t.imageAlt} fill sizes="100vw" preload />
      </div>
      <div className="hero-wash" aria-hidden="true" />
      <div className="wrap hero-inner">
        <p className="eyebrow eyebrow-line">{t.eyebrow}</p>
        <h1>{t.title}</h1>
        <p className="hero-intro">{t.intro}</p>
        <div className="hero-ctas">
          <a className="btn btn-primary" href="#contacto">
            <span>{t.cta}</span>
            <ArrowIcon />
          </a>
          <a className="btn btn-outline" href="#servicos">
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

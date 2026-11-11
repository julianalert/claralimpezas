import Link from "next/link";
import { Fragment, type CSSProperties } from "react";
import type { Dictionary } from "@/i18n/dictionaries/pt";
import { ArrowIcon, CheckIcon, Spark } from "../icons";
import { HeroScrub } from "./HeroScrub";

const POSTERS = "/frames/hero/poster";
const REDUCED = "(prefers-reduced-motion: reduce)";
const MOBILE = "(max-width: 767px)";

/**
 * Home hero: a soapy window that a squeegee wipes clean as the visitor scrolls, revealing Lisbon.
 * `.hero` is taller than the screen and `.hero-stage` sticks inside it, so the page stays put
 * while the film plays (see HeroScrub for the film, globals.css for the choreography).
 */
export function Hero({ t, quoteHref }: { t: Dictionary["hero"]; quoteHref: string }) {
  return (
    <section className="hero" id="inicio">
      {/* Without JavaScript there is no film to scrub: drop the pin and show the clean window. */}
      <noscript>
        <style>{`.hero{height:auto}.hero-stage{position:relative;top:auto}.hero-cue{display:none}`}</style>
      </noscript>
      <div className="hero-stage">
        <picture className="hero-poster">
          <source media={`${REDUCED} and ${MOBILE}`} srcSet={`${POSTERS}-last-mobile.webp`} />
          <source media={REDUCED} srcSet={`${POSTERS}-last.webp`} />
          <source media={MOBILE} srcSet={`${POSTERS}-first-mobile.webp`} />
          <img src={`${POSTERS}-first.webp`} alt={t.imageAlt} fetchPriority="high" decoding="sync" />
        </picture>
        <noscript>
          <picture className="hero-poster">
            <source media={MOBILE} srcSet={`${POSTERS}-last-mobile.webp`} />
            <img src={`${POSTERS}-last.webp`} alt="" />
          </picture>
        </noscript>
        <HeroScrub />
        <div className="hero-wash" aria-hidden="true" />

        <div className="wrap hero-inner">
          <p className="eyebrow eyebrow-line hero-in">{t.eyebrow}</p>
          <h1>
            {t.title.split(" ").map((word, i) => (
              <Fragment key={i}>
                <span className="hero-word">
                  <span style={{ "--i": i } as CSSProperties}>{word}</span>
                </span>{" "}
              </Fragment>
            ))}
          </h1>
          <p className="hero-intro hero-in">{t.intro}</p>
          <div className="hero-ctas hero-in">
            <Link className="btn btn-primary" href={quoteHref}>
              <span>{t.cta}</span>
              <ArrowIcon />
            </Link>
            <a className="btn btn-outline" href="#servicos">
              {t.services}
            </a>
          </div>
          <p className="hero-note hero-in">
            <CheckIcon />
            <span>{t.note}</span>
          </p>
        </div>

        {/* Closing line, once the glass is clean */}
        <p className="wrap hero-outro" aria-hidden="true">
          <span>
            {t.outro}
            <Spark className="spark" />
          </span>
        </p>

        <p className="hero-cue" aria-hidden="true">
          <span>{t.cue}</span>
          <i />
        </p>
        <div className="hero-progress" aria-hidden="true" />
      </div>
    </section>
  );
}

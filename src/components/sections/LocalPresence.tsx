import Image from "next/image";
import Link from "next/link";
import type { Dictionary } from "@/i18n/dictionaries/pt";
import { ArrowIcon, Spark } from "../icons";
import { LisbonMap } from "./LisbonMap";

/**
 * Dark brand band: a local, established company. A map of Lisbon lights up neighbourhood by
 * neighbourhood, and the Clara van drives in from the right as the section scrolls into view
 * (`--sp` on `.local-van`, from PageMotion).
 */
export function LocalPresence({ t, quoteHref }: { t: Dictionary["local"]; quoteHref: string }) {
  return (
    <section className="sect local" aria-labelledby="local-title" data-hide-floating-cta>
      <div className="wrap local-inner">
        <Spark className="spark-small" />
        <div className="sect-head">
          <div>
            <p className="eyebrow">{t.eyebrow}</p>
            <h2 className="h2" id="local-title">
              {t.title}
            </h2>
            <p className="lead">{t.description}</p>
          </div>
          <Link className="btn btn-mint" href={quoteHref}>
            <span>{t.cta}</span>
            <ArrowIcon />
          </Link>
        </div>
        <div className="local-stage">
          <LisbonMap title={t.mapLabel} river={t.river} />
          <div className="local-van" data-progress="0.98,0.55">
            <Image
              src="/images/clara-van.webp"
              alt={t.imageAlt}
              width={1400}
              height={599}
              quality={90}
              sizes="(max-width: 860px) 100vw, 680px"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

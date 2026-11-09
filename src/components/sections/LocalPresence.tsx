import Image from "next/image";
import Link from "next/link";
import type { Dictionary } from "@/i18n/dictionaries/pt";
import { ArrowIcon, Spark } from "../icons";

/** Dark brand band with the Clara van on a Lisbon street: a local, established company. */
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
        <div className="local-media">
          <Image
            src="/images/clara-limpezas-lisbon.png"
            alt={t.imageAlt}
            fill
            quality={90}
            sizes="(max-width: 767px) 100vw, 1200px"
          />
        </div>
      </div>
    </section>
  );
}

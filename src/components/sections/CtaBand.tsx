import Link from "next/link";
import type { Dictionary } from "@/i18n/dictionaries/pt";
import { ArrowIcon, Spark } from "../icons";

export function CtaBand({ t, quoteHref }: { t: Dictionary["band"]; quoteHref: string }) {
  return (
    <section className="band" aria-label={t.label} data-hide-floating-cta>
      <div className="wrap band-row">
        {/* Background sparks, same as the "A experiência Clara" card */}
        <Spark className="spark-big" />
        <Spark className="spark-small" />
        <div>
          <p className="eyebrow">{t.eyebrow}</p>
          <h2>{t.title}</h2>
        </div>
        <Link className="btn btn-mint" href={quoteHref}>
          <span>{t.cta}</span>
          <ArrowIcon />
        </Link>
      </div>
    </section>
  );
}

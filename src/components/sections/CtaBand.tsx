import type { Dictionary } from "@/i18n/dictionaries/pt";
import { ArrowIcon, Spark } from "../icons";

export function CtaBand({ t }: { t: Dictionary["band"] }) {
  return (
    <section className="band" aria-label={t.label}>
      <Spark className="spk" />
      <div className="wrap band-row">
        <div>
          <p className="eyebrow">{t.eyebrow}</p>
          <h2>{t.title}</h2>
        </div>
        <a className="btn btn-mint" href="#contacto">
          <span>{t.cta}</span>
          <ArrowIcon />
        </a>
      </div>
    </section>
  );
}

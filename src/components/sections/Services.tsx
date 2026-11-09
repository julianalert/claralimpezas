import Image from "next/image";
import Link from "next/link";
import type { Dictionary } from "@/i18n/dictionaries/pt";
import { serviceIds } from "@/lib/services";
import { ArrowIcon } from "../icons";

export function Services({ t, quoteHref }: { t: Dictionary["services"]; quoteHref: string }) {
  return (
    <section className="sect sect-sand" id="servicos">
      <div className="wrap">
        <div className="sect-head">
          <div>
            <p className="eyebrow">{t.eyebrow}</p>
            <h2 className="h2">{t.title}</h2>
            <p className="lead">{t.description}</p>
          </div>
          <Link className="link" href={quoteHref}>
            <span>{t.all}</span>
            <ArrowIcon />
          </Link>
        </div>

        <div className="svc-grid">
          {serviceIds.map((id, i) => (
            <article className="svc" key={id}>
              <div className="svc-media">
                <Image
                  src={`/images/services/${id}.jpg`}
                  alt={t.items[id].imageAlt}
                  fill
                  quality={90}
                  sizes="(max-width: 767px) 100vw, (max-width: 860px) 50vw, 400px"
                />
              </div>
              <div className="svc-body">
                <p className="mono">{String(i + 1).padStart(2, "0")} / CLARA</p>
                <h3>{t.items[id].name}</h3>
                <p className="svc-desc">{t.items[id].description}</p>
                <div className="svc-foot">
                  <div>
                    {/* Opens the quiz with this service already chosen */}
                    <Link className="link" href={`${quoteHref}?service=${id}`}>
                      <span>{t.link}</span>
                      <ArrowIcon />
                    </Link>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

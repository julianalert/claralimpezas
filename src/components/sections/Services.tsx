import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import type { Dictionary } from "@/i18n/dictionaries/pt";
import { serviceIds } from "@/lib/services";
import { ArrowIcon } from "../icons";
import { ServicesRail } from "./ServicesRail";

/**
 * Services as a rail of large photo tiles. On large screens the section pins under the header
 * and scrolling the page moves the rail sideways (see ServicesRail); on small screens, with
 * reduced motion or without JavaScript it is a carousel to swipe or a plain grid (globals.css).
 */
export function Services({ t, quoteHref }: { t: Dictionary["services"]; quoteHref: string }) {
  return (
    <section className="svcs" id="servicos" style={{ "--n": serviceIds.length } as CSSProperties}>
      {/* Without JavaScript nothing moves the rail: drop the pin and let it scroll sideways. */}
      <noscript>
        <style>{`.svcs{height:auto}.svcs-stage{position:static;height:auto}.svcs-track{flex:none;overflow-x:auto;transform:none}.svc-slide{height:clamp(380px,56vh,560px)}.svcs-count{display:none}`}</style>
      </noscript>
      <div className="svcs-stage">
        <div className="wrap svcs-head">
          <div>
            <p className="eyebrow">{t.eyebrow}</p>
            <h2 className="h2">{t.title}</h2>
            <p className="lead">{t.description}</p>
          </div>
          <div className="svcs-aside">
            <ServicesRail count={serviceIds.length} />
            <Link className="link" href={quoteHref}>
              <span>{t.all}</span>
              <ArrowIcon />
            </Link>
          </div>
        </div>

        <div className="svcs-track">
          {serviceIds.map((id, i) => (
            <article className="svc-slide" key={id}>
              <div className="svc-slide-pan">
                <Image
                  src={`/images/services/${id}.jpg`}
                  alt={t.items[id].imageAlt}
                  fill
                  quality={90}
                  sizes="(max-width: 860px) 90vw, 900px"
                />
              </div>
              <div className="svc-slide-body">
                <p className="mono">{String(i + 1).padStart(2, "0")} / CLARA</p>
                <h3>{t.items[id].name}</h3>
                <p className="svc-slide-desc">{t.items[id].description}</p>
                {/* Opens the quiz with this service already chosen */}
                <Link className="link" href={`${quoteHref}?service=${id}`}>
                  <span>{t.link}</span>
                  <ArrowIcon />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

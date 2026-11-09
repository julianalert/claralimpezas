import Link from "next/link";
import { siteConfig } from "@/config/site";
import type { Dictionary } from "@/i18n/dictionaries/pt";
import { serviceIds } from "@/lib/services";
import { serviceIcons } from "../funnel/serviceIcons";
import {
  ArrowIcon,
  BuildingIcon,
  CheckIcon,
  ClockIcon,
  PinIcon,
  RepeatIcon,
  RoofIcon,
  type IconComponent,
} from "../icons";
import { Lines } from "../Lines";

type Point = Exclude<keyof Dictionary["contact"]["points"], "hours">;

const points: { key: Point; Icon: IconComponent }[] = [
  { key: "types", Icon: RoofIcon },
  { key: "frequency", Icon: RepeatIcon },
  { key: "area", Icon: PinIcon },
];

type Props = {
  t: Dictionary["contact"];
  starter: Dictionary["starter"];
  services: Dictionary["services"]["items"];
  /** The quote quiz; `?service=<id>` opens it with that service already chosen. */
  quoteHref: string;
};

export function Contact({ t, starter, services, quoteHref }: Props) {
  const { address, mapUrl } = siteConfig.business;

  return (
    <section className="sect sect-surface" id="contacto" data-hide-floating-cta>
      <div className="wrap contact-grid">
        <div className="contact-copy">
          <p className="eyebrow">{t.eyebrow}</p>
          <h2 className="h2">
            <Lines lines={t.title} />
          </h2>
          <p className="lead">{t.description}</p>
          <div className="points">
            {points.map(({ key, Icon }) => (
              <div key={key}>
                <span className="tile">
                  <Icon />
                </span>
                <span>{t.points[key]}</span>
              </div>
            ))}
            {/* Same address and hours as the Google Business Profile (and the structured data) */}
            <div>
              <span className="tile">
                <BuildingIcon />
              </span>
              <address>
                <a href={mapUrl} target="_blank" rel="noopener" title={t.mapLink}>
                  {address.streetAddress}, {address.postalCode} {address.addressLocality}
                </a>
              </address>
            </div>
            <div>
              <span className="tile">
                <ClockIcon />
              </span>
              <span>{t.points.hours}</span>
            </div>
          </div>
        </div>
        {/* Entry to the quote quiz: one click on a service starts it at the second step */}
        <div className="form starter">
          <h3>{starter.title}</h3>
          <p className="sub">{starter.description}</p>
          <div className="starter-grid">
            {serviceIds.map((id) => {
              const Icon = serviceIcons[id];
              return (
                <Link key={id} className="starter-item" href={`${quoteHref}?service=${id}`}>
                  <span className="tile">
                    <Icon />
                  </span>
                  <span>{services[id].name}</span>
                </Link>
              );
            })}
          </div>
          <Link className="btn btn-primary" href={quoteHref}>
            <span>{starter.cta}</span>
            <ArrowIcon />
          </Link>
          <p className="form-note">
            <CheckIcon />
            <span>{starter.note}</span>
          </p>
        </div>
      </div>
    </section>
  );
}

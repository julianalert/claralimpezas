import { siteConfig } from "@/config/site";
import type { Dictionary } from "@/i18n/dictionaries/pt";
import { serviceIds, type ServiceId } from "@/lib/services";
import {
  BuildingIcon,
  ClockIcon,
  PinIcon,
  RepeatIcon,
  RoofIcon,
  type IconComponent,
} from "../icons";
import { Lines } from "../Lines";
import { QuoteForm } from "../quote/QuoteForm";

type Point = Exclude<keyof Dictionary["contact"]["points"], "hours">;

const points: { key: Point; Icon: IconComponent }[] = [
  { key: "types", Icon: RoofIcon },
  { key: "frequency", Icon: RepeatIcon },
  { key: "area", Icon: PinIcon },
];

type Props = {
  t: Dictionary["contact"];
  form: Dictionary["form"];
  services: Dictionary["services"]["items"];
};

export function Contact({ t, form, services }: Props) {
  const serviceNames = Object.fromEntries(
    serviceIds.map((id) => [id, services[id].name]),
  ) as Record<ServiceId, string>;
  const { address, mapUrl } = siteConfig.business;

  return (
    <section className="sect sect-surface" id="contacto">
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
        <QuoteForm t={form} serviceNames={serviceNames} />
      </div>
    </section>
  );
}

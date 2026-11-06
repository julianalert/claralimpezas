import type { Dictionary } from "@/i18n/dictionaries/pt";
import { serviceIds, type ServiceId } from "@/lib/services";
import { PinIcon, RepeatIcon, RoofIcon, type IconComponent } from "../icons";
import { Lines } from "../Lines";
import { QuoteForm } from "../quote/QuoteForm";

type Point = keyof Dictionary["contact"]["points"];

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

  return (
    <section className="sect contact" id="contacto">
      <div className="wrap contact-grid">
        <div className="contact-copy">
          <p className="eyebrow">{t.eyebrow}</p>
          <h2 className="head h2">
            <Lines lines={t.title} />
          </h2>
          <p className="lead">{t.description}</p>
          <div className="points">
            {points.map(({ key, Icon }) => (
              <div key={key}>
                <span className="ic">
                  <Icon />
                </span>
                <span>{t.points[key]}</span>
              </div>
            ))}
          </div>
        </div>
        <QuoteForm t={form} serviceNames={serviceNames} />
      </div>
    </section>
  );
}

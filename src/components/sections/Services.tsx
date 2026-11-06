import Image from "next/image";
import type { Dictionary } from "@/i18n/dictionaries/pt";
import type { ServiceId } from "@/lib/services";
import {
  ArrowIcon,
  HouseIcon,
  KeyIcon,
  OfficeIcon,
  RenovationIcon,
  SofaIcon,
  WindowIcon,
  type IconComponent,
} from "../icons";
import { ServiceQuoteLink } from "../quote/ServiceQuoteLink";

const services: { id: ServiceId; Icon: IconComponent; tint?: "t2" | "t3" }[] = [
  { id: "domestica", Icon: HouseIcon },
  { id: "escritorios", Icon: OfficeIcon, tint: "t2" },
  { id: "posobra", Icon: RenovationIcon, tint: "t3" },
  { id: "vidros", Icon: WindowIcon, tint: "t2" },
  { id: "estofos", Icon: SofaIcon, tint: "t3" },
  { id: "alojamento", Icon: KeyIcon },
];

export function Services({ t }: { t: Dictionary["services"] }) {
  return (
    <section className="sect services" id="servicos">
      <div className="wrap">
        <div className="sect-head">
          <div>
            <p className="eyebrow">{t.eyebrow}</p>
            <h2 className="head h2">{t.title}</h2>
            <p className="lead">{t.description}</p>
          </div>
          <a className="link" href="#contacto">
            <span>{t.all}</span>
            <ArrowIcon />
          </a>
        </div>

        <div className="svc-grid">
          {services.map(({ id, Icon, tint }, i) => (
            <article className="svc" key={id}>
              <div className={`svc-visual${tint ? ` ${tint}` : ""}`}>
                <Image
                  src={`/images/services/${id}.jpg`}
                  alt=""
                  fill
                  quality={90}
                  sizes="(max-width: 560px) 100vw, (max-width: 860px) 50vw, 400px"
                />
                <span className="ic">
                  <Icon />
                </span>
              </div>
              <div className="svc-body">
                <span className="mono">{String(i + 1).padStart(2, "0")} / CLARA</span>
                <h3>{t.items[id].name}</h3>
                <p>{t.items[id].description}</p>
                <div className="svc-foot">
                  <ServiceQuoteLink service={id} label={t.link} />
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

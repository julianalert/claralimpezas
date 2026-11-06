import type { Dictionary } from "@/i18n/dictionaries/pt";
import {
  ArrowIcon,
  ChatLinesIcon,
  HeartIcon,
  SearchCheckIcon,
  Spark,
  type IconComponent,
} from "../icons";
import { Lines } from "../Lines";

type Feature = keyof Dictionary["why"]["features"];

const features: { key: Feature; Icon: IconComponent }[] = [
  { key: "simple", Icon: ChatLinesIcon },
  { key: "detail", Icon: SearchCheckIcon },
  { key: "calm", Icon: HeartIcon },
];

export function WhyClara({ t }: { t: Dictionary["why"] }) {
  return (
    <section className="sect why" id="porque">
      <div className="wrap why-grid">
        <div className="why-card">
          <Spark className="huge" />
          <Spark className="huge2" />
          <p className="eyebrow">{t.card.eyebrow}</p>
          <h2 className="head">
            <Lines lines={t.card.title} />
          </h2>
          <p>{t.card.description}</p>
          <a className="btn" href="#contacto">
            <span>{t.card.cta}</span>
            <ArrowIcon />
          </a>
        </div>

        <div className="why-copy">
          <p className="eyebrow">{t.eyebrow}</p>
          <h2 className="head h2">
            <Lines lines={t.title} />
          </h2>
          <p className="lead">{t.description}</p>
          <div className="features">
            {features.map(({ key, Icon }) => (
              <div className="feature" key={key}>
                <span className="ic">
                  <Icon />
                </span>
                <div>
                  <h3>{t.features[key].title}</h3>
                  <p>{t.features[key].text}</p>
                </div>
              </div>
            ))}
          </div>
          <a className="link" href="#como-funciona">
            <span>{t.how}</span>
            <ArrowIcon />
          </a>
        </div>
      </div>
    </section>
  );
}

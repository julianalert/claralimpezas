import type { Dictionary } from "@/i18n/dictionaries/pt";
import { DocumentIcon, PencilIcon, SparklesIcon, type IconComponent } from "../icons";

type Step = keyof Dictionary["how"]["steps"];

const steps: { key: Step; Icon: IconComponent }[] = [
  { key: "tell", Icon: PencilIcon },
  { key: "proposal", Icon: DocumentIcon },
  { key: "clean", Icon: SparklesIcon },
];

export function HowItWorks({ t }: { t: Dictionary["how"] }) {
  return (
    <section className="sect steps" id="como-funciona">
      <div className="wrap">
        <div className="sect-head">
          <div>
            <p className="eyebrow">{t.eyebrow}</p>
            <h2 className="head h2">{t.title}</h2>
          </div>
          <p className="lead steps-desc">{t.description}</p>
        </div>

        <div className="steps-grid">
          {steps.map(({ key, Icon }, i) => (
            <div className="step" key={key}>
              <div className="step-top">
                <span className="step-num">{String(i + 1).padStart(2, "0")}</span>
                <span className="ic">
                  <Icon />
                </span>
              </div>
              <h3>{t.steps[key].title}</h3>
              <p>{t.steps[key].text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

import type { CSSProperties } from "react";
import type { Dictionary } from "@/i18n/dictionaries/pt";
import { DocumentIcon, PencilIcon, Spark, SparklesIcon, type IconComponent } from "../icons";

type Step = keyof Dictionary["how"]["steps"];

const steps: { key: Step; Icon: IconComponent }[] = [
  { key: "tell", Icon: PencilIcon },
  { key: "proposal", Icon: DocumentIcon },
  { key: "clean", Icon: SparklesIcon },
];

/**
 * Three steps joined by a line that draws itself as the section scrolls by, with the Clara spark
 * at its tip; each step lights up when the line reaches it. PageMotion feeds `--sp` to `.steps`
 * and globals.css does the rest (`--at` is where along the line a step sits).
 */
export function HowItWorks({ t }: { t: Dictionary["how"] }) {
  return (
    <section className="sect sect-sand" id="como-funciona">
      <div className="wrap">
        <div className="sect-head">
          <div>
            <p className="eyebrow">{t.eyebrow}</p>
            <h2 className="h2">{t.title}</h2>
            <p className="lead">{t.description}</p>
          </div>
        </div>

        <div className="steps" data-progress="0.82,0.4" data-twinkle>
          <div className="steps-rail" aria-hidden="true">
            <i />
            <Spark className="spark" />
          </div>
          <ol className="steps-grid">
            {steps.map(({ key, Icon }, i) => (
              <li className="step" key={key} style={{ "--at": i / steps.length } as CSSProperties}>
                <span className="step-dot" aria-hidden="true" />
                <div className="step-top">
                  <span className="mono">{String(i + 1).padStart(2, "0")} / CLARA</span>
                  <span className="tile">
                    <Icon />
                  </span>
                </div>
                <h3>{t.steps[key].title}</h3>
                <p>{t.steps[key].text}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

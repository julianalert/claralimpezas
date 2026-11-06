import type { Dictionary } from "@/i18n/dictionaries/pt";
import {
  CalendarCheckIcon,
  ChatIcon,
  PinIcon,
  ShieldCheckIcon,
  type IconComponent,
} from "../icons";

type Item = keyof Dictionary["trust"]["items"];

const items: { key: Item; Icon: IconComponent }[] = [
  { key: "schedule", Icon: CalendarCheckIcon },
  { key: "trust", Icon: ShieldCheckIcon },
  { key: "area", Icon: PinIcon },
  { key: "language", Icon: ChatIcon },
];

export function TrustBar({ t }: { t: Dictionary["trust"] }) {
  return (
    <section className="trustbar" aria-label={t.label}>
      <div className="wrap trust-row">
        {items.map(({ key, Icon }) => (
          <div className="trust-cell" key={key}>
            <span className="ic">
              <Icon />
            </span>
            <div>
              <strong>{t.items[key].title}</strong>
              <span>{t.items[key].text}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

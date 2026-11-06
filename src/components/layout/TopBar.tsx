import type { Dictionary } from "@/i18n/dictionaries/pt";
import { ArrowIcon, CalendarCheckIcon, ClockIcon } from "../icons";

/** Strip above the header (scrolls away): customer-service hours, availability, link to the quote form. */
export function TopBar({ t }: { t: Dictionary["topbar"] }) {
  return (
    <aside className="topbar" aria-label={t.label}>
      <div className="wrap topbar-row">
        <ul className="topbar-info">
          <li>
            <ClockIcon />
            <span>{t.hours}</span>
          </li>
          <li>
            <CalendarCheckIcon />
            <span>{t.availability}</span>
          </li>
        </ul>
        <a className="topbar-cta" href="#contacto">
          <span>{t.cta}</span>
          <ArrowIcon />
        </a>
      </div>
    </aside>
  );
}

import { siteConfig } from "@/config/site";
import type { Locale } from "@/i18n/config";
import { LanguageSwitcher } from "../layout/LanguageSwitcher";

async function CurrentYear() {
  "use cache";
  return new Date().getFullYear();
}

type Props = {
  locale: Locale;
  t: { language: string; tagline: string };
  /** The current page in each language, so the language switcher stays on it. */
  hrefs: Record<Locale, string>;
};

/** Slim footer for the quiz and the client space: copyright and language switcher. */
export function FunnelFooter({ locale, t, hrefs }: Props) {
  return (
    <footer className="funnel-foot">
      <div className="wrap foot-base">
        <span>
          © <CurrentYear /> {siteConfig.name} — {siteConfig.domain} · {t.tagline}
        </span>
        <LanguageSwitcher locale={locale} label={t.language} hrefs={hrefs} />
      </div>
    </footer>
  );
}

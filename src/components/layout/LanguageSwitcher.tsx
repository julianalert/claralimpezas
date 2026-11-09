"use client";

import Link from "next/link";
import { htmlLang, LOCALE_COOKIE, localePath, locales, type Locale } from "@/i18n/config";
import { adminHref, CRM_LOCALE_COOKIE } from "@/lib/funnel/format";

function remember(cookie: string, locale: Locale) {
  document.cookie = `${cookie}=${locale}; path=/; max-age=31536000; samesite=lax`;
}

type Props = {
  locale: Locale;
  label: string;
  /** The current page in each language, to stay on it when switching; the home page when omitted. */
  hrefs?: Record<Locale, string>;
  /**
   * "site" remembers the choice for the whole site, so it wins over the browser language
   * (see src/proxy.ts). "crm" only remembers the language of the team space.
   */
  scope?: "site" | "crm";
};

export function LanguageSwitcher({ locale, label, hrefs, scope = "site" }: Props) {
  const href = (l: Locale) => (scope === "crm" ? adminHref(l) : (hrefs?.[l] ?? localePath(l)));
  return (
    <div className="lang" role="group" aria-label={label}>
      {locales.map((l) => (
        <Link
          key={l}
          href={href(l)}
          hrefLang={htmlLang[l]}
          scroll={false}
          className={l === locale ? "active" : undefined}
          aria-current={l === locale ? "true" : undefined}
          onClick={() => remember(scope === "crm" ? CRM_LOCALE_COOKIE : LOCALE_COOKIE, l)}
        >
          {l.toUpperCase()}
        </Link>
      ))}
    </div>
  );
}

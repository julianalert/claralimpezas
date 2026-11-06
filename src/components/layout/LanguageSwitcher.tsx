"use client";

import Link from "next/link";
import { LOCALE_COOKIE, locales, type Locale } from "@/i18n/config";

function rememberLocale(locale: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=31536000; samesite=lax`;
}

export function LanguageSwitcher({ locale, label }: { locale: Locale; label: string }) {
  return (
    <div className="lang" role="group" aria-label={label}>
      {locales.map((l) => (
        <Link
          key={l}
          href={`/${l}`}
          hrefLang={l}
          scroll={false}
          className={l === locale ? "active" : undefined}
          aria-current={l === locale ? "true" : undefined}
          onClick={() => rememberLocale(l)}
        >
          {l.toUpperCase()}
        </Link>
      ))}
    </div>
  );
}

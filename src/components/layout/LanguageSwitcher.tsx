"use client";

import Link from "next/link";
import { htmlLang, localePath, locales, type Locale } from "@/i18n/config";

export function LanguageSwitcher({ locale, label }: { locale: Locale; label: string }) {
  return (
    <div className="lang" role="group" aria-label={label}>
      {locales.map((l) => (
        <Link
          key={l}
          href={localePath(l)}
          hrefLang={htmlLang[l]}
          scroll={false}
          className={l === locale ? "active" : undefined}
          aria-current={l === locale ? "true" : undefined}
        >
          {l.toUpperCase()}
        </Link>
      ))}
    </div>
  );
}

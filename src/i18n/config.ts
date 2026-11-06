export const locales = ["pt", "en", "fr"] as const;
export type Locale = (typeof locales)[number];

/** Main language. Served at the site root (`/`); the others live under `/en`, `/fr`. */
export const defaultLocale: Locale = "pt";

/** Cookie set when the visitor picks a language; it wins over the browser language. */
export const LOCALE_COOKIE = "NEXT_LOCALE";

/** Value for the `<html lang>` attribute and hreflang alternates. */
export const htmlLang: Record<Locale, string> = {
  pt: "pt-PT",
  en: "en",
  fr: "fr",
};

/** Open Graph locale codes. */
export const ogLocale: Record<Locale, string> = {
  pt: "pt_PT",
  en: "en_GB",
  fr: "fr_FR",
};

/** Public URL path of a locale's home page: `/` for Portuguese, `/en`, `/fr`... */
export function localePath(locale: Locale): string {
  return locale === defaultLocale ? "/" : `/${locale}`;
}

export function hasLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

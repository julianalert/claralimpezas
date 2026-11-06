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

/**
 * hreflang map for the home page in every language, plus `x-default` (the root, which sends
 * visitors to their browser language). Used by the page metadata and the sitemap so they never
 * disagree. Pass `toUrl` to turn the paths into absolute URLs.
 */
export function languageAlternates(toUrl: (path: string) => string = (path) => path) {
  return {
    ...Object.fromEntries(locales.map((l) => [htmlLang[l], toUrl(localePath(l))])),
    "x-default": toUrl(localePath(defaultLocale)),
  };
}

export function hasLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

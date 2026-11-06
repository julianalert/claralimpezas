export const locales = ["pt", "en"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "pt";

/** Cookie that remembers the visitor's language choice (read by `src/proxy.ts`). */
export const LOCALE_COOKIE = "NEXT_LOCALE";

/** Value for the `<html lang>` attribute and hreflang alternates. */
export const htmlLang: Record<Locale, string> = {
  pt: "pt-PT",
  en: "en",
};

/** Open Graph locale codes. */
export const ogLocale: Record<Locale, string> = {
  pt: "pt_PT",
  en: "en_GB",
};

export function hasLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

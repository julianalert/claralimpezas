import { lang } from "next/root-params";
import { notFound } from "next/navigation";
import { hasLocale, type Locale } from "./config";
import type { Dictionary } from "./dictionaries/pt";

const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  pt: () => import("./dictionaries/pt").then((m) => m.pt),
  en: () => import("./dictionaries/en").then((m) => m.en),
  fr: () => import("./dictionaries/fr").then((m) => m.fr),
};

/**
 * Translations for a given locale. For code that gets the locale from `params` instead of
 * `next/root-params` (route handlers, metadata images).
 */
export function loadDictionary(locale: Locale): Promise<Dictionary> {
  return dictionaries[locale]();
}

/** Current locale, read from the `[lang]` root segment. Server Components only. */
export async function getLocale(): Promise<Locale> {
  const locale = await lang();
  if (!hasLocale(locale)) notFound();
  return locale;
}

/** Translations for the current locale. Server Components only. */
export async function getDictionary(): Promise<Dictionary> {
  return loadDictionary(await getLocale());
}

export type { Dictionary };

import type { Locale } from "../config";
import type { CrmDictionary } from "./en";

const dictionaries: Record<Locale, () => Promise<CrmDictionary>> = {
  en: () => import("./en").then((m) => m.en),
  pt: () => import("./pt").then((m) => m.pt),
  fr: () => import("./fr").then((m) => m.fr),
};

/** Copy for the CRM (team space) in a given language. */
export function loadCrmDictionary(locale: Locale): Promise<CrmDictionary> {
  return dictionaries[locale]();
}

export type { CrmDictionary };

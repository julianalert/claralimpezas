import type { Locale } from "../config";
import type { FunnelDictionary } from "./pt";

const dictionaries: Record<Locale, () => Promise<FunnelDictionary>> = {
  pt: () => import("./pt").then((m) => m.pt),
  en: () => import("./en").then((m) => m.en),
  fr: () => import("./fr").then((m) => m.fr),
};

/** Copy for the quiz, the client space and the client e-mails, in a given language. */
export function loadFunnelDictionary(locale: Locale): Promise<FunnelDictionary> {
  return dictionaries[locale]();
}

export type { FunnelDictionary };

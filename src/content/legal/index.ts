// Privacy policy and terms, shown in the footer modals (src/components/legal/LegalDialog.tsx).
// One file per language; the business details come from `siteConfig` so the texts never drift.
import { siteConfig } from "@/config/site";
import type { Locale } from "@/i18n/config";

/** A paragraph, or a bulleted list when it is an array. `www.…` and e-mail addresses become links. */
export type LegalBlock = string | string[];
export type LegalSection = { heading: string; blocks: LegalBlock[] };
export type LegalDoc = { title: string; updated: string; sections: LegalSection[] };
export type LegalTexts = { privacy: LegalDoc; terms: LegalDoc };

/** Business details quoted in the texts. Empty fields are simply left out. */
export type LegalFacts = {
  /** "Clara Limpezas, Rua Frei Manuel Cardoso 31, 1700-023 Lisboa, Portugal[, NIF …]" */
  identity: string;
  domain: string;
  email: string;
};

function legalFacts(): LegalFacts {
  const { entityName, nif } = siteConfig.legal;
  const { address, email } = siteConfig.business;
  const identity = [
    entityName,
    address.streetAddress,
    `${address.postalCode} ${address.addressLocality}`,
    "Portugal",
    nif && `NIF ${nif}`,
  ]
    .filter(Boolean)
    .join(", ");
  return { identity, domain: siteConfig.domain, email };
}

/** `withEmail(email)` when an e-mail address is configured, otherwise `fallback`. */
export function byEmail(facts: LegalFacts, withEmail: (email: string) => string, fallback: string) {
  return facts.email ? withEmail(facts.email) : fallback;
}

const texts: Record<Locale, () => Promise<(facts: LegalFacts) => LegalTexts>> = {
  pt: () => import("./pt").then((m) => m.legal),
  en: () => import("./en").then((m) => m.legal),
  fr: () => import("./fr").then((m) => m.legal),
};

export async function loadLegal(locale: Locale): Promise<LegalTexts> {
  return (await texts[locale]())(legalFacts());
}

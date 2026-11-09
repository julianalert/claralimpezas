// Formatting and URL helpers shared by the funnel pages, the CRM and the e-mails.
import { siteConfig } from "@/config/site";
import { defaultLocale, htmlLang, type Locale } from "@/i18n/config";

export const ADMIN_PATH = "/admin";
/** Language last picked in the CRM: where the bare `/admin` goes (see src/proxy.ts). */
export const CRM_LOCALE_COOKIE = "CRM_LOCALE";
/** Path of a page in a given language: unprefixed for Portuguese, `/en/...`, `/fr/...` otherwise. */
export function localeHref(locale: Locale, path: string): string {
  return locale === defaultLocale ? path : `/${locale}${path}`;
}

/**
 * URL segment of each funnel page, per language: /orcamento, /en/quote, /fr/devis and
 * /pedido/<token>, /en/request/<token>, /fr/demande/<token>. The route folders use the Portuguese
 * names; src/proxy.ts maps the other languages onto them.
 */
export const funnelSlugs = {
  quiz: { pt: "orcamento", en: "quote", fr: "devis" },
  space: { pt: "pedido", en: "request", fr: "demande" },
} as const satisfies Record<string, Record<Locale, string>>;

/** The funnel page a URL segment names in any language, if any. */
export function findFunnelPage(segment: string): Record<Locale, string> | undefined {
  return Object.values(funnelSlugs).find((slugs) => (Object.values(slugs) as string[]).includes(segment));
}

/** The quote quiz in a given language. */
export function quizHref(locale: Locale): string {
  return localeHref(locale, `/${funnelSlugs.quiz[locale]}`);
}

/** A client's private space in a given language. */
export function clientSpaceHref(locale: Locale, token: string): string {
  return localeHref(locale, `/${funnelSlugs.space[locale]}/${token}`);
}

/**
 * The CRM always carries its language in the URL (`/pt/admin`, `/en/admin`, `/fr/admin`): the bare
 * `/admin` opens in English unless another language was picked there (see src/proxy.ts).
 */
export function adminHref(locale: Locale): string {
  return `/${locale}${ADMIN_PATH}`;
}

export function absoluteUrl(path: string): string {
  return new URL(path, siteConfig.url).toString();
}

/** Replaces `{name}` placeholders in a translated string. */
export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
}

export function formatMoney(amount: number, locale: Locale): string {
  return new Intl.NumberFormat(htmlLang[locale], {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatRange(low: number, high: number, locale: Locale): string {
  return low === high
    ? formatMoney(low, locale)
    : `${formatMoney(low, locale)} – ${formatMoney(high, locale)}`;
}

/** A calendar date (`yyyy-mm-dd`), e.g. "20 de novembro de 2026". */
export function formatDay(date: string, locale: Locale): string {
  return new Intl.DateTimeFormat(htmlLang[locale], {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T12:00:00Z`));
}

const LISBON = "Europe/Lisbon";

/** A moment in time, shown in Lisbon time: "20 de novembro de 2026, 09:30". */
export function formatDateTime(iso: string, locale: Locale): string {
  return new Intl.DateTimeFormat(htmlLang[locale], {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: LISBON,
  }).format(new Date(iso));
}

/** Compact version for lists: "20 nov., 09:30". */
export function formatShortDateTime(iso: string, locale: Locale): string {
  return new Intl.DateTimeFormat(htmlLang[locale], {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: LISBON,
  }).format(new Date(iso));
}

function lisbonParts(date: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: LISBON,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "00";
  return { date: `${get("year")}-${get("month")}-${get("day")}`, time: `${get("hour")}:${get("minute")}` };
}

/** Value for an `<input type="datetime-local">`, in Lisbon time. */
export function toLisbonInput(iso: string): string {
  const { date, time } = lisbonParts(new Date(iso));
  return `${date}T${time}`;
}

/** The Lisbon calendar day of a moment in time, `yyyy-mm-dd`. */
export function lisbonDay(iso: string | Date): string {
  return lisbonParts(typeof iso === "string" ? new Date(iso) : iso).date;
}

/** Reads a `datetime-local` value ("2026-11-20T09:30") as Lisbon time. `null` when malformed. */
export function fromLisbonInput(value: string): string | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(value);
  if (!match) return null;
  const [, y, m, d, h, min] = match.map(Number);
  const asUtc = Date.UTC(y, m - 1, d, h, min);
  // Lisbon's offset at that moment = (wall clock read as UTC) − (real UTC).
  const wall = lisbonParts(new Date(asUtc));
  const wallAsUtc = Date.parse(`${wall.date}T${wall.time}:00Z`);
  const result = new Date(asUtc - (wallAsUtc - asUtc));
  return Number.isNaN(result.getTime()) ? null : result.toISOString();
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? name;
}

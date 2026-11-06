import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, hasLocale, LOCALE_COOKIE, locales, type Locale } from "@/i18n/config";

/** Language used when the browser asks only for languages we don't have (de, es, it...). */
const FALLBACK_FOR_OTHER_LANGUAGES: Locale = "en";

/** Picks pt / en / fr from an Accept-Language header, honouring q-values. */
function fromAcceptLanguage(header: string | null): Locale | null {
  if (!header) return null;
  const ranked = header
    .split(",")
    .map((part, index) => {
      const [tag, ...params] = part.trim().split(";");
      const q = params.map((p) => p.trim()).find((p) => p.startsWith("q="));
      return {
        base: tag.trim().toLowerCase().split("-")[0],
        q: q ? Number(q.slice(2)) || 0 : 1,
        index,
      };
    })
    .filter((entry) => entry.base && entry.base !== "*" && entry.q > 0)
    .sort((a, b) => b.q - a.q || a.index - b.index);

  if (ranked.length === 0) return null;
  for (const { base } of ranked) {
    if (hasLocale(base)) return base;
  }
  return FALLBACK_FOR_OTHER_LANGUAGES;
}

/**
 * Portuguese is the main site and lives at the root.
 *   /, /...      → language picked in the footer (cookie), else the browser language:
 *                  pt (or no language header, e.g. search engines) → served here,
 *                  en / fr → redirected to /en, /fr
 *   /pt, /pt/... → redirected to the unprefixed URL
 *   /en, /fr     → served as-is
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const prefix = `/${defaultLocale}`;

  if (pathname === prefix || pathname.startsWith(`${prefix}/`)) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.slice(prefix.length) || "/";
    return NextResponse.redirect(url, 308);
  }

  const hasLocalePrefix = locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );
  if (hasLocalePrefix) return;

  const saved = request.cookies.get(LOCALE_COOKIE)?.value;
  const locale =
    (saved && hasLocale(saved) ? saved : null) ??
    fromAcceptLanguage(request.headers.get("accept-language")) ??
    defaultLocale;

  const url = request.nextUrl.clone();
  const rest = pathname === "/" ? "" : pathname;
  let response: NextResponse;
  if (locale === defaultLocale) {
    url.pathname = `${prefix}${rest}`;
    response = NextResponse.rewrite(url);
  } else {
    url.pathname = `/${locale}${rest}`;
    response = NextResponse.redirect(url, 307);
  }
  response.headers.set("Vary", "Accept-Language, Cookie");
  return response;
}

export const config = {
  // Skip Next internals, API routes and any file with an extension (images, icon.svg, robots.txt...).
  matcher: ["/((?!api|_next/static|_next/image|.*\\..*).*)"],
};

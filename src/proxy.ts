import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, hasLocale, LOCALE_COOKIE, locales, type Locale } from "@/i18n/config";
import { ADMIN_PATH, CRM_LOCALE_COOKIE, findFunnelPage } from "@/lib/funnel/format";

/** The CRM opens in English, whatever the browser language, unless another one was picked there. */
const CRM_DEFAULT_LOCALE: Locale = "en";

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
 *
 * The quiz and the client spaces have a translated address (/orcamento, /en/quote, /fr/devis;
 * /pedido, /en/request, /fr/demande). The pages live under the Portuguese names:
 * the translated ones are rewritten onto them, and a name from another language is redirected to
 * the right one.
 *
 * The CRM is the exception: it always shows its language in the URL (/pt/admin, /en/admin,
 * /fr/admin), and the bare /admin goes to the language last picked there, English by default.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const prefix = `/${defaultLocale}`;

  if (pathname === ADMIN_PATH || pathname.startsWith(`${ADMIN_PATH}/`)) {
    const saved = request.cookies.get(CRM_LOCALE_COOKIE)?.value;
    const url = request.nextUrl.clone();
    url.pathname = `/${saved && hasLocale(saved) ? saved : CRM_DEFAULT_LOCALE}${pathname}`;
    return NextResponse.redirect(url, 307);
  }
  if (locales.some((l) => pathname === `/${l}${ADMIN_PATH}` || pathname.startsWith(`/${l}${ADMIN_PATH}/`))) {
    return;
  }

  if (pathname === prefix || pathname.startsWith(`${prefix}/`)) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.slice(prefix.length) || "/";
    return NextResponse.redirect(url, 308);
  }

  const prefixed = locales.find((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`));
  if (prefixed) {
    // /fr/devis → the page at /fr/orcamento; /fr/orcamento → redirected to /fr/devis.
    const [segment = "", ...tail] = pathname.split("/").slice(2);
    const page = findFunnelPage(segment);
    if (!page) return;
    const url = request.nextUrl.clone();
    if (segment !== page[prefixed]) {
      url.pathname = ["", prefixed, page[prefixed], ...tail].join("/");
      return NextResponse.redirect(url, 308);
    }
    if (segment === page[defaultLocale]) return;
    url.pathname = ["", prefixed, page[defaultLocale], ...tail].join("/");
    return NextResponse.rewrite(url);
  }

  // A translated page name without its language prefix (/devis): send it where it belongs.
  const [firstSegment = "", ...firstTail] = pathname.split("/").slice(1);
  const funnelPage = findFunnelPage(firstSegment);
  if (funnelPage && firstSegment !== funnelPage[defaultLocale]) {
    const owner = locales.find((l) => funnelPage[l] === firstSegment) ?? defaultLocale;
    const url = request.nextUrl.clone();
    url.pathname = ["", owner, firstSegment, ...firstTail].join("/");
    return NextResponse.redirect(url, 308);
  }

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
    // /orcamento for a French browser → /fr/devis
    url.pathname = funnelPage
      ? ["", locale, funnelPage[locale], ...firstTail].join("/")
      : `/${locale}${rest}`;
    response = NextResponse.redirect(url, 307);
  }
  response.headers.set("Vary", "Accept-Language, Cookie");
  return response;
}

export const config = {
  // Skip Next internals, API routes, any file with an extension (images, icon.svg, robots.txt...)
  // and the share images, whose URLs have no extension: /<lang>/opengraph-image/...
  // (the Portuguese one must stay at /pt/... and must not be redirected by browser language).
  matcher: ["/((?!api|_next/static|_next/image|.*opengraph-image|.*\\..*).*)"],
};

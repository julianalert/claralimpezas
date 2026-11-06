import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, locales } from "@/i18n/config";

/**
 * Portuguese is the main site and lives at the root:
 *   /            → served from app/[lang] with lang = "pt" (rewrite, URL stays "/")
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

  const url = request.nextUrl.clone();
  url.pathname = `${prefix}${pathname === "/" ? "" : pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  // Skip Next internals, API routes and any file with an extension (images, icon.svg, robots.txt...).
  matcher: ["/((?!api|_next/static|_next/image|.*\\..*).*)"],
};

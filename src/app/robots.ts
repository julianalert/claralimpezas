import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { locales } from "@/i18n/config";
import { clientSpaceHref } from "@/lib/funnel/format";

/** Client spaces and the CRM in every language: `/pedido/`, `/en/request/`, `/fr/demande/`, `/en/admin`... */
const privatePaths = [
  "/admin",
  ...locales.flatMap((l) => [`${clientSpaceHref(l, "")}`, `/${l}/admin`]),
];

export default function robots(): MetadataRoute.Robots {
  return {
    // Client spaces and the CRM are private (and also carry a noindex tag); /api has nothing to crawl.
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", ...privatePaths] },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}

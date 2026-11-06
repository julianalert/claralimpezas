// schema.org JSON-LD for the home page (rendered in src/app/[lang]/page.tsx).
// One business entity shared by every language (same @id), described in the page's language.
// Validate with https://search.google.com/test/rich-results or https://validator.schema.org.

import { siteConfig } from "@/config/site";
import { htmlLang, localePath, locales, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { serviceIds } from "@/lib/services";

const absolute = (path: string) => new URL(path, siteConfig.url).toString();

export function homeStructuredData(locale: Locale, t: Dictionary) {
  const site = absolute("/");
  const page = absolute(localePath(locale));
  const ids = {
    business: `${site}#business`,
    website: `${site}#website`,
    page: `${page}#webpage`,
  };
  const heroImage = absolute("/images/clara-limpezas.jpg");
  const { telephone, email, sameAs, languages, areaServed, address, geo, openingHours, mapUrl } =
    siteConfig.business;

  const business = {
    "@type": "LocalBusiness",
    "@id": ids.business,
    name: siteConfig.businessName,
    alternateName: siteConfig.name,
    description: t.meta.description,
    url: site,
    logo: absolute("/icon.svg"),
    image: [heroImage, ...serviceIds.map((id) => absolute(`/images/services/${id}.jpg`))],
    address: { "@type": "PostalAddress", ...address },
    geo: { "@type": "GeoCoordinates", ...geo },
    hasMap: mapUrl,
    openingHoursSpecification: openingHours.map(({ days, opens, closes }) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: days,
      opens,
      closes,
    })),
    areaServed,
    knowsLanguage: languages,
    ...(telephone && { telephone }),
    ...(email && { email }),
    ...(sameAs.length > 0 && { sameAs }),
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: t.services.title,
      itemListElement: serviceIds.map((id) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: t.services.items[id].name,
          description: t.services.items[id].description,
          image: absolute(`/images/services/${id}.jpg`),
          areaServed,
          provider: { "@id": ids.business },
        },
      })),
    },
  };

  const website = {
    "@type": "WebSite",
    "@id": ids.website,
    url: site,
    name: siteConfig.businessName,
    alternateName: siteConfig.name,
    inLanguage: locales.map((l) => htmlLang[l]),
    publisher: { "@id": ids.business },
  };

  const webpage = {
    "@type": "WebPage",
    "@id": ids.page,
    url: page,
    name: t.meta.title,
    description: t.meta.description,
    inLanguage: htmlLang[locale],
    isPartOf: { "@id": ids.website },
    about: { "@id": ids.business },
    primaryImageOfPage: { "@type": "ImageObject", url: heroImage, caption: t.hero.imageAlt },
  };

  return { "@context": "https://schema.org", "@graph": [business, website, webpage] };
}

/** Serialises JSON-LD for a <script> tag; escapes `<` so the content can't close the tag. */
export function jsonLd(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

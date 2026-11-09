import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { defaultLocale, htmlLang, languageAlternates, localePath, locales } from "@/i18n/config";
import { quizHref } from "@/lib/funnel/format";
import { serviceIds } from "@/lib/services";

export default function sitemap(): MetadataRoute.Sitemap {
  const url = (path: string) => new URL(path, siteConfig.url).toString();
  const languages = languageAlternates(url);
  // Photos shown on the home page, listed for Google Images.
  const images = [
    url("/images/clara-limpezas.jpg"),
    ...serviceIds.map((id) => url(`/images/services/${id}.jpg`)),
  ];

  const quizLanguages = {
    ...Object.fromEntries(locales.map((l) => [htmlLang[l], url(quizHref(l))])),
    "x-default": url(quizHref(defaultLocale)),
  };

  return [
    ...locales.map((l) => ({
      url: url(localePath(l)),
      alternates: { languages },
      images,
    })),
    // The quote quiz. Client spaces and the CRM are private and stay out of the sitemap.
    ...locales.map((l) => ({
      url: url(quizHref(l)),
      alternates: { languages: quizLanguages },
    })),
  ];
}

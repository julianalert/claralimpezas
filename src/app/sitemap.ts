import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { languageAlternates, localePath, locales } from "@/i18n/config";
import { serviceIds } from "@/lib/services";

export default function sitemap(): MetadataRoute.Sitemap {
  const url = (path: string) => new URL(path, siteConfig.url).toString();
  const languages = languageAlternates(url);
  // Photos shown on the home page, listed for Google Images.
  const images = [
    url("/images/clara-limpezas.jpg"),
    ...serviceIds.map((id) => url(`/images/services/${id}.jpg`)),
  ];

  return locales.map((l) => ({
    url: url(localePath(l)),
    alternates: { languages },
    images,
  }));
}

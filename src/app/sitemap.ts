import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { htmlLang, locales } from "@/i18n/config";

export default function sitemap(): MetadataRoute.Sitemap {
  const languages = Object.fromEntries(
    locales.map((l) => [htmlLang[l], `${siteConfig.url}/${l}`]),
  );
  return locales.map((l) => ({
    url: `${siteConfig.url}/${l}`,
    alternates: { languages },
  }));
}

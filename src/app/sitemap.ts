import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { htmlLang, localePath, locales } from "@/i18n/config";

export default function sitemap(): MetadataRoute.Sitemap {
  const url = (path: string) => new URL(path, siteConfig.url).toString();
  const languages = Object.fromEntries(
    locales.map((l) => [htmlLang[l], url(localePath(l))]),
  );
  return locales.map((l) => ({
    url: url(localePath(l)),
    alternates: { languages },
  }));
}

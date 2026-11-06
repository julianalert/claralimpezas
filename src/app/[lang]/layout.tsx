import type { Metadata } from "next";
import { Archivo, Inter, JetBrains_Mono } from "next/font/google";
import { siteConfig } from "@/config/site";
import { defaultLocale, htmlLang, localePath, locales, ogLocale } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import "../globals.css";

// Site font (variable, 400–900).
const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
});

// Only used for the "clara." wordmark, to keep the logo identical.
const inter = Inter({
  subsets: ["latin"],
  weight: ["800"],
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-jetbrains-mono",
});

export async function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getDictionary();

  return {
    metadataBase: new URL(siteConfig.url),
    title: t.meta.title,
    description: t.meta.description,
    alternates: {
      canonical: localePath(locale),
      languages: {
        ...Object.fromEntries(locales.map((l) => [htmlLang[l], localePath(l)])),
        "x-default": localePath(defaultLocale),
      },
    },
    openGraph: {
      type: "website",
      siteName: siteConfig.name,
      title: t.meta.title,
      description: t.meta.description,
      locale: ogLocale[locale],
      images: [{ url: "/images/clara-limpezas.jpg", width: 2688, height: 1520 }],
    },
  };
}

export default async function RootLayout({ children }: LayoutProps<"/[lang]">) {
  const locale = await getLocale();

  return (
    <html
      lang={htmlLang[locale]}
      data-scroll-behavior="smooth"
      className={`${archivo.variable} ${inter.variable} ${jetbrainsMono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}

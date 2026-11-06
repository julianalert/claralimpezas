import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Montserrat } from "next/font/google";
import { siteConfig } from "@/config/site";
import { defaultLocale, htmlLang, localePath, locales, ogLocale } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import "../globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-montserrat",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["500"],
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
      className={`${inter.variable} ${montserrat.variable} ${jetbrainsMono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
